// Widok meczu w 3D: postacie biegające za akcją, piłka po torze z łukami, bramkarze, sędzia i asystenci,
// realizacja jak w TV (kamera z boku / zza bramki / z góry / zbliżenie, automatyczny reżyser), powtórka gola w zwolnionym
// tempie, poświata reflektorów (bloom), głębia ostrości przy zbliżeniach, pogoda (deszcz, śnieg = pomarańczowa piłka, mgła),
// kibice reagujący na akcje i dźwięk przestrzenny.
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { FORMACJE_SLOTY, przydzielSloty } from "../../engine/mecz";
import type { MeczLive, PunktAkcji } from "../../engine/meczNaZywo";
import type { PozycjaSzczegolowa, StanGry } from "../../engine/types";
import type { StrojeMeczu } from "../strojeDane";
import { DL, SZ, swiatla, zbudujStadion } from "./stadion3d";
import { animuj, stworzPostac, type Postac } from "./zawodnik3d";
import { gwizdek, kopniecie, napiecie, reakcjaTrybun } from "./dzwiek";

export type Kamera = "auto" | "tv" | "bramka" | "gora" | "blisko";
export interface Ustawienia3D { noc: boolean; pogoda: "slonce" | "deszcz" | "snieg" | "mgla"; widzowie: number; lekka: boolean }

/** Ustawienie slotu: [głębokość od własnej bramki 0–100, pozycja boczna 0–100]. */
const SLOT_XY: Record<PozycjaSzczegolowa, [number, number]> = {
  BR: [3, 50], LO: [21, 14], SO: [19, 50], PO: [21, 86], LWA: [30, 10], PWA: [30, 90],
  DP: [34, 50], SP: [46, 50], LP: [48, 14], PP: [48, 86], OP: [60, 50], LS: [68, 14], PS: [68, 86], NAP: [76, 50], DN: [66, 50],
};
const WX = (x: number) => (x / 100 - 0.5) * DL, WZ = (y: number) => (y / 100 - 0.5) * SZ;
const odl = (a: THREE.Color, b: THREE.Color) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

interface Seg { a: THREE.Vector3; b: THREE.Vector3; h: number; t: number; dur: number; p: PunktAkcji }

export function Mecz3D({ s, m, wersja, predkosc, kamera, ust, stroje, onKoniecSekwencji, onPowtorka, onBlad }: {
  s: StanGry; m: MeczLive; wersja: number; predkosc: number; kamera: Kamera; ust: Ustawienia3D; stroje: StrojeMeczu;
  onKoniecSekwencji: () => void; onPowtorka: (p: boolean) => void; onBlad: () => void;
}) {
  const host = useRef<any>(null);
  const stan = useRef({ predkosc, kamera, wersja: -1, onKoniecSekwencji, onPowtorka });
  stan.current.predkosc = predkosc; stan.current.kamera = kamera; stan.current.onKoniecSekwencji = onKoniecSekwencji; stan.current.onPowtorka = onPowtorka;
  const sterowanie = useRef<{ nowaSekwencja: () => void } | null>(null);

  useEffect(() => {
    const el = host.current as unknown as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !ust.lekka, powerPreference: "high-performance" }); } catch { onBlad(); return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 220;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ust.lekka ? 1.25 : 2));
    renderer.setSize(W(), H());
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = ust.noc ? 1.05 : 1.0;
    renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%"; renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(34, W() / H(), 0.5, 900); cam.position.set(0, 30, SZ / 2 + 52); cam.lookAt(0, 0, 0);
    swiatla(scena, ust.noc, ust.pogoda === "mgla", ust.lekka);
    const kd = s.kluby[m.dom.klubId], kg = s.kluby[m.gosc.klubId];
    const stad = zbudujStadion(s, kd, { noc: ust.noc, snieg: ust.pogoda === "snieg", deszcz: ust.pogoda === "deszcz", widzowie: ust.widzowie, lekka: ust.lekka, budowy: m.dom.klubId === s.mojKlub ? s.budowy : undefined });
    scena.add(stad.grupa);
    // post-processing: bloom (reflektory, bandy LED), głębia ostrości przy zbliżeniach
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scena, cam));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W(), H()), ust.noc ? 0.75 : 0.18, 0.6, ust.noc ? 0.82 : 0.95);
    if (!ust.lekka) composer.addPass(bloom);
    const bokeh = new BokehPass(scena, cam, { focus: 30, aperture: 0.00012, maxblur: 0.006 }); bokeh.enabled = false;
    if (!ust.lekka) composer.addPass(bokeh);
    composer.addPass(new OutputPass());
    // pogoda
    let opady: THREE.Points | undefined;
    if (ust.pogoda === "deszcz" || ust.pogoda === "snieg") {
      const n = ust.lekka ? 1500 : 5000, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 160; pos[i * 3 + 1] = Math.random() * 50; pos[i * 3 + 2] = (Math.random() - 0.5) * 110; }
      const gm = new THREE.BufferGeometry(); gm.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      opady = new THREE.Points(gm, new THREE.PointsMaterial({ color: ust.pogoda === "snieg" ? 0xffffff : 0xaac4e0, size: ust.pogoda === "snieg" ? 0.35 : 0.12, transparent: true, opacity: 0.8 }));
      scena.add(opady);
    }
    // piłka (zimą pomarańczowa) + cień
    const pilka = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), new THREE.MeshStandardMaterial({ color: ust.pogoda === "snieg" ? 0xff6a1a : 0xffffff, roughness: 0.4 }));
    pilka.castShadow = true; scena.add(pilka);
    { const c = document.createElement("canvas"); c.width = 64; c.height = 32; const g = c.getContext("2d")!; g.fillStyle = ust.pogoda === "snieg" ? "#ff6a1a" : "#ffffff"; g.fillRect(0, 0, 64, 32); g.fillStyle = "#222"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(8 + i * 11, i % 2 ? 10 : 22, 4, 0, 7); g.fill(); }
      (pilka.material as THREE.MeshStandardMaterial).map = new THREE.CanvasTexture(c); }
    const cienP = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
    cienP.rotation.x = -Math.PI / 2; scena.add(cienP);
    // postacie
    const postacie = new Map<string, Postac>();
    const strona = new Map<string, "dom" | "gosc">();
    const postac = (id: string, sd: "dom" | "gosc") => {
      let p = postacie.get(id);
      if (!p) {
        const z = s.zawodnicy[id];
        const br = z?.poz === "BR";
        const k = br ? stroje[sd].br : stroje[sd].pole;
        p = stworzPostac({ koszulka: k.baza, dodatek: k.dodatek, wzor: k.wzor, spodenki: k.wzor === "jednolity" ? k.dodatek : k.dodatek, getry: k.baza, nr: z?.numer ?? 0, nazwisko: z?.nazwisko, seed: [...id].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) });
        const startX = sd === "dom" ? -6 : 6;
        p.g.position.set(startX, 0, 0); scena.add(p.g); postacie.set(id, p); strona.set(id, sd);
      }
      return p;
    };
    const kS = { koszulka: stroje.sedzia.baza, spodenki: "#111111", getry: "#111111" };
    const sedzia = stworzPostac({ ...kS, nr: 0, seed: 5, sedzia: true }); scena.add(sedzia.g);
    const asystenci = [stworzPostac({ ...kS, nr: 0, seed: 11 }), stworzPostac({ ...kS, nr: 0, seed: 17 })];
    asystenci.forEach((a, i) => { a.g.position.set(i ? 25 : -25, 0, i ? -SZ / 2 - 1 : SZ / 2 + 1); scena.add(a.g); });
    const predk = new Map<Postac, THREE.Vector3>();
    // stan odtwarzania
    let segs: Seg[] = [], si = 0, czekaNaKrok = false, koniecSeg = false;
    let celebracja = 0, strzelec: string | undefined, powtorka = 0;
    const nagranie: { b: [number, number, number]; p: [string, number, number, number][] }[] = [];
    let odtw = 0, emocje = 0, czas = 0, rezyser: Kamera = "tv", rezT = 0;
    const camPoz = new THREE.Vector3(0, 30, SZ / 2 + 50), camCel = new THREE.Vector3(), celKamery = new THREE.Vector3();

    const nowaSekwencja = () => {
      const pkt = m.sekwencja.length ? m.sekwencja : [{ x: 50, y: 50 }];
      segs = []; let a = pilka.position.clone();
      for (const p of pkt) {
        const b = new THREE.Vector3(WX(p.zdarzenie === "gol" ? (p.x > 50 ? 101.8 : -1.8) : p.x), 0, WZ(p.y));
        const d = a.distanceTo(b);
        const h = p.h !== undefined ? p.h : d > 32 ? d * 0.09 : d > 18 ? d * 0.03 : 0;
        segs.push({ a: a.clone(), b, h, t: 0, dur: Math.max(0.28, d / 30), p });
        a = b;
      }
      si = 0; czekaNaKrok = false; koniecSeg = false;
      const g = segs[segs.length - 1]?.p.zdarzenie;
      if (g === "gol" || g === "strzal" || g === "obrona" || g === "slupek") rezyser = "blisko";
    };
    sterowanie.current = { nowaSekwencja };
    const rozstawienie = () => {
      // wszyscy na pozycje wyjściowe (początek, przerwa, po golu)
      for (const [zz, sd] of [[m.dom, "dom"], [m.gosc, "gosc"]] as const) for (const r of przydzielSloty(s, zz.naBoisku, FORMACJE_SLOTY[zz.formacja] ? zz.formacja : "4-4-2")) {
        if (!r.id) continue; const [d, l] = SLOT_XY[r.slot] ?? [50, 50]; const p = postac(r.id, sd);
        const x = sd === "dom" ? d * 0.48 : 100 - d * 0.48, y = sd === "dom" ? l : 100 - l; p.g.position.set(WX(x), 0, WZ(y));
      }
      pilka.position.set(0, 0.22, 0);
    };
    rozstawienie();

    const sloty = () => {
      const out: { id: string; sd: "dom" | "gosc"; d: number; l: number; br: boolean }[] = [];
      for (const [zz, sd] of [[m.dom, "dom"], [m.gosc, "gosc"]] as const) for (const r of przydzielSloty(s, zz.naBoisku, FORMACJE_SLOTY[zz.formacja] ? zz.formacja : "4-4-2"))
        if (r.id) { const [d, l] = SLOT_XY[r.slot] ?? [50, 50]; out.push({ id: r.id, sd, d, l, br: r.slot === "BR" }); }
      return out;
    };
    let ukladCache = sloty(), ukladWersja = -1;

    const tmp = new THREE.Vector3();
    let ostatni = performance.now(), raf = 0, fpsAcc = 0, fpsN = 0;
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const teraz = performance.now(); const dtReal = Math.min(1, (teraz - ostatni) / 1000); let dt = Math.min(0.05, dtReal); ostatni = teraz; czas += dt;
      fpsAcc += dt; fpsN++;
      if (fpsN === 90) { const fps = fpsN / fpsAcc; if (fps < 26 && renderer.getPixelRatio() > 1) renderer.setPixelRatio(Math.max(1, renderer.getPixelRatio() - 0.25)); fpsAcc = 0; fpsN = 0; } // auto-jakość
      const sp = stan.current.predkosc;
      if (stan.current.wersja !== wersjaRef.current) { stan.current.wersja = wersjaRef.current; nowaSekwencja(); if (ukladWersja !== wersjaRef.current) { ukladCache = sloty(); ukladWersja = wersjaRef.current; } }
      const gra = sp > 0 && powtorka <= 0;
      const dtg = gra ? dt * sp : 0; // czas gry
      // ——— powtórka gola ———
      if (powtorka > 0) {
        powtorka -= dt;
        odtw = Math.min(nagranie.length - 1, odtw + dt * 60 * 0.4);
        const f = nagranie[Math.floor(odtw)];
        if (f) { pilka.position.set(...f.b); for (const [id, x, z, r] of f.p) { const p = postacie.get(id); if (p) { const v = Math.hypot(x - p.g.position.x, z - p.g.position.z) / Math.max(0.001, dt); p.g.position.x = x; p.g.position.z = z; p.g.rotation.y = r; animuj(p, v * 0.4, dt * 0.4); } } }
        if (powtorka <= 0) { stan.current.onPowtorka(false); rozstawienie(); czekaNaKrok = true; stan.current.onKoniecSekwencji(); }
      } else if (celebracja > 0) {
        celebracja -= dt;
        emocje = Math.max(emocje, 1);
        const sc = strzelec ? postacie.get(strzelec) : undefined;
        if (sc) { sc.poza = "radosc"; sc.pozaT = 0.3; const cel = new THREE.Vector3(Math.sign(pilka.position.x) * (DL / 2 - 4), 0, SZ / 2 - 2);
          sc.g.position.lerp(cel, dt * 0.5);
          for (const [id, p] of postacie) if (id !== strzelec && strona.get(id) === strona.get(strzelec!) && s.zawodnicy[id]?.poz !== "BR") { p.g.position.lerp(tmp.copy(sc.g.position).add(new THREE.Vector3(Math.sin(p.faza) * 1.5, 0, Math.cos(p.faza) * 1.5)), dt * 0.8); animuj(p, 5, dt); } }
        for (const n of stad.siatki) n.scale.x = 1 + Math.sin(czas * 30) * 0.08 * Math.max(0, celebracja - 2);
        if (celebracja <= 0) {
          if (!ust.lekka && nagranie.length > 30) { powtorka = 3.4; odtw = Math.max(0, nagranie.length - 200); stan.current.onPowtorka(true); rezyser = "bramka"; }
          else { rozstawienie(); czekaNaKrok = true; stan.current.onKoniecSekwencji(); }
        }
      } else if (gra && segs.length && !czekaNaKrok) {
        // ——— piłka po torze ———
        const sg = segs[si];
        if (sg) {
          if (sg.t === 0) { const n = sg.p.nosnik ? postacie.get(sg.p.nosnik) : undefined; kopniecie(sg.p.zdarzenie === "strzal" || sg.p.zdarzenie === "gol" ? 1 : 0.4);
            if (n && (sg.p.zdarzenie === "strzal" || sg.p.zdarzenie === "gol" || sg.p.zdarzenie === "spalony")) { n.poza = "strzal"; n.pozaT = 0.45; } }
          sg.t += dtg / sg.dur * 1.6;
          const t = Math.min(1, sg.t);
          pilka.position.lerpVectors(sg.a, sg.b, t); pilka.position.y = 0.22 + Math.sin(t * Math.PI) * sg.h + (sg.p.zdarzenie === "gol" && t > 0.9 ? 0 : 0);
          pilka.rotation.x += dtg * 12;
          if (t >= 1) {
            const z = sg.p.zdarzenie;
            if (z === "obrona") { const gk = [...postacie].find(([id]) => s.zawodnicy[id]?.poz === "BR" && Math.sign(postacie.get(id)!.g.position.x) === Math.sign(sg.b.x))?.[1]; if (gk) { gk.poza = "rzut"; gk.pozaT = 0.7; gk.faza = sg.b.z > gk.g.position.z ? 1 : -1; } reakcjaTrybun("ooo"); emocje = 0.6; }
            if (z === "slupek") { reakcjaTrybun("ooo"); emocje = 0.7; }
            if (z === "faul" || z === "spalony") gwizdek();
            if (z === "gol") {
              const domGol = sg.b.x > 0; strzelec = sg.p.nosnik; celebracja = 3.2; gwizdek();
              reakcjaTrybun(domGol ? "gol" : "zawod", domGol); // gospodarze mają większość na trybunach
              koniecSeg = true;
            }
            si++;
            if (si >= segs.length && !koniecSeg) { czekaNaKrok = true; stan.current.onKoniecSekwencji(); }
          }
        }
      }
      // ——— zawodnicy: cele i ruch ———
      if (powtorka <= 0 && celebracja <= 0) {
        const bx = pilka.position.x, bz = pilka.position.z;
        const xE = (bx / DL + 0.5) * 100, yE = (bz / SZ + 0.5) * 100;
        const atakuje = m.pilka.strona;
        const nosnik = segs[si]?.p.nosnik ?? segs[Math.max(0, si - 1)]?.p.nosnik;
        let najblizszyObr: Postac | undefined, nd = 1e9;
        for (const u of ukladCache) {
          const p = postac(u.id, u.sd);
          const prog = u.sd === "dom" ? xE : 100 - xE, lat = u.sd === "dom" ? yE : 100 - yE;
          let d = u.d * 0.8 + (atakuje === u.sd ? 12 : 0) + (prog - 50) * 0.32, l = u.l + (lat - 50) * 0.28;
          if (u.br) { d = 2 + Math.max(0, prog - 60) * 0.02; l = 50 + (lat - 50) * 0.16; }
          d = Math.max(1, Math.min(96, d)); l = Math.max(3, Math.min(97, l));
          let tx = WX(u.sd === "dom" ? d : 100 - d), tz = WZ(u.sd === "dom" ? l : 100 - l);
          if (u.id === nosnik) { tx = bx - (u.sd === "dom" ? 0.6 : -0.6); tz = bz; }
          if (atakuje !== u.sd && !u.br) { const dd = Math.hypot(p.g.position.x - bx, p.g.position.z - bz); if (dd < nd) { nd = dd; najblizszyObr = p; } }
          const v = predk.get(p) ?? new THREE.Vector3(); predk.set(p, v);
          const z = s.zawodnicy[u.id];
          const kond = (z?.kondycja ?? 80) / 100;
          const vmax = (5.2 + ((z?.atrybuty?.szy ?? z?.umiej ?? 50) / 100) * 3.5) * (0.75 + 0.25 * kond) * Math.max(1, sp) * 1.6;
          tmp.set(tx - p.g.position.x, 0, tz - p.g.position.z);
          const dist = tmp.length();
          if (dist > 0.05) { tmp.normalize().multiplyScalar(Math.min(dist, vmax * Math.max(dt, dtg) * (gra ? 1 : 0.15))); }
          p.g.position.add(tmp);
          const vr = tmp.length() / Math.max(0.001, dt) / Math.max(1, sp);
          if (tmp.lengthSq() > 1e-5) p.g.rotation.y = Math.atan2(tmp.x, tmp.z); else p.g.rotation.y = Math.atan2(bx - p.g.position.x, bz - p.g.position.z);
          animuj(p, vr, dt);
        }
        if (najblizszyObr && gra) { tmp.set(bx - najblizszyObr.g.position.x, 0, bz - najblizszyObr.g.position.z); const d = tmp.length(); if (d > 1.4) najblizszyObr.g.position.add(tmp.normalize().multiplyScalar(Math.min(d - 1.4, 9 * dtg))); }
        // zawodnicy, którzy zeszli z boiska, schodzą do ławki
        for (const [id, p] of postacie) if (!m.dom.naBoisku.includes(id) && !m.gosc.naBoisku.includes(id)) { p.g.position.lerp(tmp.set(strona.get(id) === "dom" ? -9 : 9, 0, SZ / 2 + 3), dt * 0.6); animuj(p, 2, dt); if (p.g.position.z > SZ / 2 + 2.5) p.g.visible = false; }
        // sędzia i asystenci
        tmp.set(bx - 7 - sedzia.g.position.x, 0, bz + 6 - sedzia.g.position.z); const ds = tmp.length();
        if (ds > 0.3) sedzia.g.position.add(tmp.normalize().multiplyScalar(Math.min(ds, 8 * Math.max(dt, dtg))));
        sedzia.g.rotation.y = Math.atan2(bx - sedzia.g.position.x, bz - sedzia.g.position.z); animuj(sedzia, ds > 1 ? 4 : 0, dt);
        asystenci[0].g.position.x += (Math.min(-2, Math.max(-DL / 2, bx - 6)) - asystenci[0].g.position.x) * dt * 2; asystenci[0].g.rotation.y = Math.PI; animuj(asystenci[0], 2, dt);
        asystenci[1].g.position.x += (Math.max(2, Math.min(DL / 2, bx + 6)) - asystenci[1].g.position.x) * dt * 2; asystenci[1].g.rotation.y = 0; animuj(asystenci[1], 2, dt);
        // nagrywanie do powtórki (ostatnie ~4 s)
        if (gra) { nagranie.push({ b: [pilka.position.x, pilka.position.y, pilka.position.z], p: [...postacie].map(([id, p]) => [id, p.g.position.x, p.g.position.z, p.g.rotation.y]) }); if (nagranie.length > 260) nagranie.shift(); }
        // emocje trybun i dźwięk: im bliżej bramki, tym głośniej
        const doBramki = Math.max(0, (Math.abs(bx) - 25) / 27);
        emocje = Math.max(emocje * (1 - dt * 0.8), doBramki * 0.35);
        napiecie(Math.min(1, doBramki + emocje * 0.5), bx / 52);
      }
      cienP.position.set(pilka.position.x, 0.02, pilka.position.z); cienP.scale.setScalar(1 + pilka.position.y * 0.15);
      stad.aktualizuj(czas, emocje);
      if (opady) { const a = opady.geometry.getAttribute("position") as THREE.BufferAttribute; const spd = ust.pogoda === "snieg" ? 2.5 : 22;
        for (let i = 0; i < a.count; i++) { let y = a.getY(i) - spd * dt; if (y < 0) y = 50; a.setY(i, y); if (ust.pogoda === "snieg") a.setX(i, a.getX(i) + Math.sin(czas + i) * dt * 0.4); } a.needsUpdate = true; }
      // ——— kamera (reżyser) ———
      rezT -= dt;
      let tryb = stan.current.kamera === "auto" ? rezyser : stan.current.kamera;
      if (stan.current.kamera === "auto" && rezT <= 0 && powtorka <= 0) { if (rezyser !== "tv" && celebracja <= 0) rezyser = "tv"; rezT = 4; }
      if (powtorka > 0) tryb = "bramka";
      const bx = pilka.position.x, bz = pilka.position.z;
      if (tryb === "tv" || tryb === "auto") { camPoz.set(bx * 0.78, 30, SZ / 2 + 52); camCel.set(bx * 0.86, 0, bz * 0.35); }
      else if (tryb === "bramka") { const sd = Math.sign(bx || 1); camPoz.set(sd * (DL / 2 + 22), 9, bz * 0.3 + 6); camCel.set(bx * 0.8, 1, bz * 0.6); }
      else if (tryb === "gora") { camPoz.set(bx * 0.4, 105, 18); camCel.set(bx * 0.4, 0, 0); }
      else { camPoz.set(bx - Math.sign(bx || 1) * 12, 10, bz + 19); camCel.set(bx, 1, bz); }
      // płynne prowadzenie kamery liczone z prawdziwego czasu (niezależne od liczby klatek)
      cam.position.lerp(camPoz, 1 - Math.exp(-dtReal * (tryb === "blisko" ? 3 : 2.2)));
      celKamery.lerp(camCel, 1 - Math.exp(-dtReal * 5));
      cam.lookAt(celKamery);
      bokeh.enabled = !ust.lekka && (tryb === "blisko" || powtorka > 0);
      if (bokeh.enabled) (bokeh.uniforms as any).focus.value = cam.position.distanceTo(pilka.position);
      composer.render(dt);
    };
    const wersjaRef = { current: wersja };
    (sterowanie.current as any).wersjaRef = wersjaRef;
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 50);
    gwizdek(false, 1);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); composer.dispose?.(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); scena.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);
  // nowa minuta z silnika → nowa sekwencja
  useEffect(() => { const w = (sterowanie.current as any)?.wersjaRef; if (w) w.current = wersja; }, [wersja]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: "#0b1226", borderRadius: 10, overflow: "hidden" }} />;
}
