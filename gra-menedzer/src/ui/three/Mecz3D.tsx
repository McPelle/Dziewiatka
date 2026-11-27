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
import type { Oprawa } from "../../engine/oprawy";
import { HERBY } from "../../data/herby";
import { kluczHerbu } from "../Herb";
import { uriObrazka } from "./Konferencja3D";
import type { PozycjaSzczegolowa, StanGry } from "../../engine/types";
import type { StrojeMeczu } from "../strojeDane";
import { DL, SZ, swiatla, uproscMaterialy, zbudujStadion } from "./stadion3d";
import { animuj, stworzPostac, wyglad3D, type Postac } from "./zawodnik3d";
import { gwizdek, kopniecie, napiecie, reakcjaTrybun } from "./dzwiek";

export type Kamera = "auto" | "tv" | "bramka" | "gora" | "blisko";
export interface Ustawienia3D { noc: boolean; pogoda: "slonce" | "deszcz" | "snieg" | "mgla"; widzowie: number; lekka: boolean; derby?: boolean; pusto?: boolean; godz?: string }

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
    renderer.shadowMap.enabled = !ust.lekka; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = ust.noc ? 1.05 : 1.0;
    renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%"; renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(34, W() / H(), 0.5, 900); cam.position.set(0, 30, SZ / 2 + 52); cam.lookAt(0, 0, 0);
    swiatla(scena, ust.noc, ust.pogoda === "mgla", ust.lekka);
    const kd = s.kluby[m.dom.klubId], kg = s.kluby[m.gosc.klubId];
    const stad = zbudujStadion(s, kd, { noc: ust.noc, snieg: ust.pogoda === "snieg", deszcz: ust.pogoda === "deszcz", widzowie: ust.widzowie, lekka: ust.lekka, budowy: m.dom.klubId === s.mojKlub ? s.budowy : undefined });
    if (ust.lekka) uproscMaterialy(stad.grupa);
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
    // race i dym (derby): świecące punkty nad trybuną + chmura dymu, zapalane na start i po golu gospodarzy
    let race: THREE.Points | undefined, dym: THREE.Mesh | undefined, raceT = ust.derby ? 8 : 0;
    if (!ust.pusto && ust.widzowie > 0) {
      const n = 60, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { pos[i * 3] = -30 + Math.random() * 60; pos[i * 3 + 1] = 3 + Math.random() * 6; pos[i * 3 + 2] = SZ / 2 + 9 + Math.random() * 10; }
      const gm = new THREE.BufferGeometry(); gm.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      race = new THREE.Points(gm, new THREE.PointsMaterial({ color: 0xff3010, size: 0.9, transparent: true, opacity: 1 })); scena.add(race);
      dym = new THREE.Mesh(new THREE.SphereGeometry(12, 12, 8), new THREE.MeshBasicMaterial({ color: 0xbfb6b0, transparent: true, opacity: 0.0, depthWrite: false }));
      dym.scale.set(2.6, 0.7, 0.9); dym.position.set(0, 12, SZ / 2 + 14); scena.add(dym);
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
        p = stworzPostac({ ...wyglad3D(z), koszulka: k.baza, dodatek: k.dodatek, wzor: k.wzor, spodenki: k.wzor === "jednolity" ? k.dodatek : k.dodatek, getry: k.baza, nr: z?.numer ?? 0, nazwisko: z?.nazwisko, seed: [...id].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) });
        if (ust.lekka) uproscMaterialy(p.g);
        const startX = sd === "dom" ? -6 : 6;
        p.g.position.set(startX, 0, 0); scena.add(p.g); postacie.set(id, p); strona.set(id, sd);
      }
      return p;
    };
    const kS = { koszulka: stroje.sedzia.baza, spodenki: "#111111", getry: "#111111" };
    const sedzia = stworzPostac({ ...kS, nr: 0, seed: 5, sedzia: true }); scena.add(sedzia.g);
    const asystenci = [stworzPostac({ ...kS, nr: 0, seed: 11 }), stworzPostac({ ...kS, nr: 0, seed: 17 })];
    asystenci.forEach((a, i) => { a.g.position.set(i ? 25 : -25, 0, i ? -SZ / 2 - 1 : SZ / 2 + 1); scena.add(a.g); });
    // chorągiewki asystentów (podnoszone przy spalonym)
    const choragiewki = asystenci.map((a) => {
      const g = new THREE.Group();
      const kij = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55), new THREE.MeshStandardMaterial({ color: 0x222222 })); kij.position.y = -0.3; g.add(kij);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshStandardMaterial({ color: 0xff3b1f, side: THREE.DoubleSide, emissive: new THREE.Color(0x441100) })); fl.position.set(0.14, -0.08, 0); g.add(fl);
      g.position.y = -0.45; a.ramiona[1].add(g); return g;
    });
    let flagaT = 0, kartkaT = 0, ostKartek = m.kartki.length;
    const kartka = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.13), new THREE.MeshBasicMaterial({ color: 0xffd600, side: THREE.DoubleSide }));
    kartka.position.set(0, -0.5, 0.05); kartka.visible = false; sedzia.ramiona[1].add(kartka);
    // ławki rezerwowych: rezerwowi siedzą, trenerzy stoją w strefie technicznej
    const lawkowi: Postac[] = [];
    for (const [zz, sd] of [[m.dom, "dom"], [m.gosc, "gosc"]] as const) {
      zz.lawka.slice(0, 7).forEach((id, i) => {
        const p = postac(id, sd);
        p.g.position.set((sd === "dom" ? -12 : 6) + i * 0.85, -0.38, SZ / 2 + 2.6); p.g.rotation.y = Math.PI;
        p.uda.forEach((u) => (u.rotation.x = -1.45)); p.lydki.forEach((l) => (l.rotation.x = 1.45)); lawkowi.push(p);
      });
    }
    const trenerzy = (["dom", "gosc"] as const).map((sd) => {
      const t = stworzPostac({ koszulka: "#1d2536", spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed: sd === "dom" ? 21 : 44 });
      t.g.position.set(sd === "dom" ? -9 : 9, 0, SZ / 2 + 1.2); t.g.rotation.y = Math.PI; scena.add(t.g); return { t, sd };
    });
    // sędzia techniczny przy linii środkowej z elektroniczną tablicą (doliczony czas, numery przy zmianach)
    const techniczny = stworzPostac({ koszulka: stroje.sedzia.baza, spodenki: "#111111", getry: "#111111", nr: 0, seed: 29 });
    techniczny.g.position.set(0, 0, SZ / 2 + 1.7); techniczny.g.rotation.y = Math.PI; scena.add(techniczny.g);
    const tabC = document.createElement("canvas"); tabC.width = 256; tabC.height = 128;
    const tabTex = new THREE.CanvasTexture(tabC); tabTex.colorSpace = THREE.SRGBColorSpace;
    const tablica = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.42, 0.05), new THREE.MeshBasicMaterial({ map: tabTex }));
    tablica.position.set(0, 2.25, 0); tablica.visible = false; techniczny.g.add(tablica);
    const rysujTab = (a: string, b?: string) => {
      const g = tabC.getContext("2d")!; g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#444"; g.lineWidth = 6; g.strokeRect(3, 3, 250, 122);
      g.textAlign = "center"; g.textBaseline = "middle";
      if (b === undefined) { g.fillStyle = "#ff2a2a"; g.font = "bold 96px Arial"; g.fillText(a, 128, 70); }
      else { g.font = "bold 72px Arial"; g.fillStyle = "#ff2a2a"; g.fillText(a, 68, 68); g.fillStyle = "#2aff5a"; g.fillText(b, 188, 68); g.fillStyle = "#666"; g.fillRect(126, 18, 4, 92); }
      tabTex.needsUpdate = true;
    };
    let tabT = 0, ostZmian = m.zmianyLog.length, tabDolicz = 0;
    // fizjoterapeuta z torbą — wbiega do kontuzjowanego
    const fizjo = stworzPostac({ koszulka: "#1f8f4a", spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed: 33 });
    const torba = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.18), new THREE.MeshLambertMaterial({ color: 0xc81818 })); torba.position.set(0, -0.6, 0.06); fizjo.ramiona[1].add(torba);
    fizjo.g.visible = false; scena.add(fizjo.g);
    let urazT = 0, urazId: string | undefined, ostUraz = m.urazy.length;
    // wyjście z tunelu (tylko na początku meczu), mur przy rzucie wolnym
    let wyjscie = m.min === 0 && !m.koniec ? 10 : 0;
    let trzymaj = 0, murPkt: THREE.Vector3 | null = null, murIds: string[] = [], murSi = -1;
    // ——— służby: stewardzi w kamizelkach wzdłuż trybun, policja przy sektorze gości, radiowozy przed stadionem ———
    const plan = m.bezp?.plan;
    const ileSteward = ust.widzowie <= 0 ? 0 : Math.max(6, Math.min(30, Math.round(Math.sqrt(plan?.ochroniarze ?? ust.widzowie / 30) * 2.6)));
    const stewardzi: { p: Postac; baza: THREE.Vector3 }[] = [];
    for (let i = 0; i < ileSteward; i++) {
      const p = stworzPostac({ koszulka: i % 2 ? "#ffd400" : "#ff8a00", spodenki: "#1b1b1b", getry: "#1b1b1b", nr: 0, seed: 300 + i });
      const strona = i % 4; let x = 0, z = 0, ry = 0;
      if (strona < 2) { x = -DL / 2 + 6 + ((i >> 2) / Math.max(1, ileSteward / 4)) * (DL - 12); z = (strona ? -1 : 1) * (SZ / 2 + 5.2); ry = strona ? Math.PI : 0; }
      else { z = -SZ / 2 + 6 + ((i >> 2) / Math.max(1, ileSteward / 4)) * (SZ - 12); x = (strona === 2 ? -1 : 1) * (DL / 2 + 5.5); ry = strona === 2 ? -Math.PI / 2 : Math.PI / 2; }
      p.g.position.set(x, 0, z); p.g.rotation.y = ry; scena.add(p.g); stewardzi.push({ p, baza: new THREE.Vector3(x, 0, z) });
    }
    const ilePolicji = ust.widzowie <= 0 ? 0 : Math.min(18, Math.round((plan?.policja ?? (ust.derby ? 60 : ust.widzowie > 1500 ? 8 : 0)) / 5));
    const policja: { p: Postac; baza: THREE.Vector3 }[] = [];
    const mKask = new THREE.MeshLambertMaterial({ color: 0x0f1c38 });
    for (let i = 0; i < ilePolicji; i++) {
      const p = stworzPostac({ koszulka: "#14264a", spodenki: "#14264a", getry: "#0d0d0d", nr: 0, seed: 500 + i });
      const kask = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mKask); kask.position.y = 0.93; p.tulow.add(kask);
      const tarcza = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.04), new THREE.MeshLambertMaterial({ color: 0xbfd4ff, transparent: true, opacity: 0.55 })); tarcza.position.set(0, -0.3, 0.2); if (ust.derby) p.ramiona[0].add(tarcza);
      const x = DL / 2 - 4 - (i % 6) * 1.1, z = -SZ / 2 - 5.2 - Math.floor(i / 6) * 1.1;
      p.g.position.set(x, 0, z); p.g.rotation.y = Math.PI; scena.add(p.g); policja.push({ p, baza: new THREE.Vector3(x, 0, z) });
    }
    if (ilePolicji) for (let i = 0; i < Math.min(4, Math.max(1, Math.round(ilePolicji / 4))); i++) { // radiowozy / suki policyjne za trybuną gości
      const v = new THREE.Group(); const kar = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2, 1.9), new THREE.MeshLambertMaterial({ color: 0xf2f2f2 })); kar.position.y = 1.1; v.add(kar);
      const pas = new THREE.Mesh(new THREE.BoxGeometry(4.62, 0.35, 1.92), new THREE.MeshLambertMaterial({ color: 0x1846b8 })); pas.position.y = 0.9; v.add(pas);
      const kog = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.3), new THREE.MeshBasicMaterial({ color: 0x3a7bff })); kog.position.y = 2.2; v.add(kog);
      v.position.set(DL / 2 + 16 + i * 5.5, 0, -SZ / 2 - 26); scena.add(v);
    }
    // armatka wodna („polewaczka") — tylko mecze podwyższonego ryzyka; użyta przy poważnej zadymie
    let armatka: THREE.Group | undefined, strumien: THREE.Mesh | undefined, armatkaT = 0;
    if (ust.derby && !ust.pusto && ust.widzowie > 0) {
      armatka = new THREE.Group();
      const mB = new THREE.MeshLambertMaterial({ color: 0xeef0f3 }), mN = new THREE.MeshLambertMaterial({ color: 0x1846b8 }), mC = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const kab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 2.5), mB); kab.position.set(3.4, 1.5, 0); armatka.add(kab);
      const zb = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.8, 2.5), mB); zb.position.set(-0.6, 1.6, 0); armatka.add(zb);
      const pas = new THREE.Mesh(new THREE.BoxGeometry(8.05, 0.4, 2.52), mN); pas.position.y = 1.2; armatka.add(pas);
      for (const [x, z] of [[3.4, 1.3], [3.4, -1.3], [-1.8, 1.3], [-1.8, -1.3], [0.2, 1.3], [0.2, -1.3]]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12), mC); k.rotation.x = Math.PI / 2; k.position.set(x, 0.55, z); armatka.add(k); }
      const wieza = new THREE.Group(); wieza.position.set(1.8, 3.1, 0); armatka.add(wieza);
      const lufa = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.4, 8), mC); lufa.rotation.z = Math.PI / 2; lufa.position.x = 0.6; wieza.add(lufa);
      const kog = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.4), new THREE.MeshBasicMaterial({ color: 0x3a7bff })); kog.position.set(3.4, 2.9, 0); armatka.add(kog);
      strumien = new THREE.Mesh(new THREE.ConeGeometry(0.6, 14, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.5, depthWrite: false }));
      strumien.rotation.z = Math.PI / 2; strumien.position.x = 8; strumien.visible = false; wieza.add(strumien);
      armatka.position.set(DL / 2 + 12, 0, -SZ / 2 - 17); armatka.rotation.y = Math.PI * 0.85; scena.add(armatka);
    }
    // „klatka" gości: sektor ogrodzony płotem 2,2 m (wymóg PZPN) w narożniku, kibice w barwach gości skaczą przy dopingu
    const gosciFani: THREE.InstancedMesh | undefined = (() => {
      if (ust.pusto || ust.widzowie <= 0 || !(m.komentarz.some((c) => c.tekst.startsWith("🧱")) || ust.derby)) return undefined;
      const x0 = DL / 2 - 14, z0 = -SZ / 2 - 5.5, szer = 14, gl = 9;
      const mPlot = new THREE.MeshBasicMaterial({ color: 0x9aa3ad, wireframe: true, transparent: true, opacity: 0.55 });
      for (const [px, pz, w, rot] of [[x0 + szer / 2, z0, szer, 0], [x0, z0 - gl / 2, gl, Math.PI / 2], [x0 + szer, z0 - gl / 2, gl, Math.PI / 2]] as [number, number, number, number][]) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.2, Math.round(w * 2), 5), mPlot); p.position.set(px, 1.1 + 1.5, pz); p.rotation.y = rot; scena.add(p);
        const szpic = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: 0x555b63 })); szpic.position.set(px, 3.7, pz); szpic.rotation.y = rot; scena.add(szpic);
      }
      const n = ust.derby ? 140 : 60;
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 1.05, 0.35), new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
      const c1 = new THREE.Color(stroje.gosc.pole.baza), c2 = new THREE.Color(stroje.gosc.pole.dodatek), mat = new THREE.Matrix4();
      const zg = (m.wsparcie?.gosc ?? []).map((w) => [new THREE.Color(w.kolory[0]), new THREE.Color(w.kolory[1])]);
      for (let i = 0; i < n; i++) { mat.setPosition(x0 + 0.6 + Math.random() * (szer - 1.2), 2.2 + Math.floor(i / 35) * 0.7, z0 - 0.8 - Math.floor(i / 35) * 1.6 - Math.random() * 0.8); im.setMatrixAt(i, mat);
        const zgoda = zg.length && i % 4 === 3 ? zg[i % zg.length] : null; // co czwarty kibic w barwach zgody (bluzy, koszulki z herbem)
        im.setColorAt(i, zgoda ? zgoda[i % 2] : i % 3 ? c1 : c2); }
      // szaliki nad głowami (pół na pół przy zgodach) — unoszone przy dopingu
      const sz = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.12, 0.04), new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
      for (let i = 0; i < n; i++) { mat.setPosition(x0 + 0.6 + (i * 0.37) % (szer - 1.2), 3.05 + Math.floor(i / 35) * 0.7, z0 - 0.8 - Math.floor(i / 35) * 1.6); sz.setMatrixAt(i, mat); sz.setColorAt(i, zg.length && i % 3 === 0 ? zg[i % zg.length][i % 2] : i % 2 ? c1 : c2); }
      sz.visible = false; scena.add(sz); (im as any).szaliki = sz;
      scena.add(im); return im;
    })();
    // oflagowanie: flagi dzielnic, fanklubów i grup — gospodarze za bramką i wzdłuż trybuny głównej, goście na płocie klatki
    const flagaMesh = (tekst: string, k1: string, k2: string, w: number, druga?: [string, string]) => {
      const c = document.createElement("canvas"); c.width = 384; c.height = 96; const g = c.getContext("2d")!;
      g.fillStyle = k1; g.fillRect(0, 0, 384, 96); g.fillStyle = k2; g.fillRect(0, 0, 384, 16); g.fillRect(0, 80, 384, 16);
      if (druga) { g.fillStyle = druga[0]; g.fillRect(192, 0, 192, 96); g.fillStyle = druga[1]; g.fillRect(192, 0, 192, 16); g.fillRect(192, 80, 192, 16); g.fillStyle = "#ffffff"; g.fillRect(189, 0, 6, 96); } // flaga zgody — pół na pół
      const jasny = new THREE.Color(k1); g.fillStyle = jasny.r * 0.3 + jasny.g * 0.59 + jasny.b * 0.11 > 0.55 ? "#111" : "#fff";
      g.font = `bold ${tekst.length > 16 ? 28 : 38}px Arial`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(tekst.slice(0, 24), 192, 50);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      return new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide }));
    };
    if (!ust.pusto && ust.widzowie > 0 && m.kultura) {
      const fd = m.kultura.dom.flagi;
      // płot młyna za bramką (2 rzędy po 15) + barierka trybuny głównej (2 rzędy po 20)
      fd.forEach((f, i) => {
        const fl = flagaMesh(f.tekst, f.kolory[0], f.kolory[1], 3.6, f.kolory2);
        const zaBramka = i % 3 !== 2, nr = zaBramka ? Math.floor(i / 3) * 2 + (i % 3) : Math.floor(i / 3);
        if (zaBramka) { const rz = Math.floor(nr / 15), poz = nr % 15; fl.position.set(-DL / 2 - 6.6 - rz * 0.6, 1.2 + rz * 1.15, -28 + poz * 4); fl.rotation.y = Math.PI / 2; }
        else { const rz = Math.floor(nr / 20), poz = nr % 20; fl.position.set(-42 + poz * 4.4, 1.15 + rz * 1.15, SZ / 2 + 6.3 + rz * 0.6); fl.rotation.y = Math.PI; }
        scena.add(fl);
      });
      // flagi zgód / układów obok flag klubów (klatka gości: na drugim rzędzie płotu; gospodarze: na barierce za bramką)
      (m.wsparcie?.gosc ?? []).slice(0, 4).forEach((w, i) => { const fl = flagaMesh(w.nazwa.toUpperCase(), w.kolory[0], w.kolory[1], 3); fl.position.set(DL / 2 - 12.5 + i * 3.3, 2.6, -SZ / 2 - 5.5); scena.add(fl); });
      (m.wsparcie?.dom ?? []).slice(0, 8).forEach((w, i) => { const fl = flagaMesh(w.nazwa.toUpperCase(), w.kolory[0], w.kolory[1], 3.4); fl.position.set(-DL / 2 - 6.9, 3.6, -14 + i * 4); fl.rotation.y = Math.PI / 2; scena.add(fl); });
      if (m.komentarz.some((c) => c.tekst.startsWith("🧱"))) [...m.kultura.gosc.flagi.filter((f) => f.typ === "ekipa"), ...m.kultura.gosc.flagi.filter((f) => f.typ !== "ekipa")].slice(0, 4).forEach((f, i) => {
        const fl = flagaMesh(f.tekst, f.kolory[0], f.kolory[1], 3, f.kolory2); fl.position.set(DL / 2 - 12.5 + i * 3.3, 1.5, -SZ / 2 - 5.4); scena.add(fl);
      });
    }
    // gniazdowi (prowadzący doping): na podeście przodem do młyna, plecami do boiska, z megafonem; drugi w klatce gości
    const gniazdowi: { p: Postac; baza: THREE.Vector3; gosc: boolean }[] = [];
    const megafon = () => { const g = new THREE.Group(); const lej = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0xf2f2f2, side: THREE.DoubleSide })); lej.rotation.x = Math.PI / 2; lej.position.z = 0.2; g.add(lej); return g; };
    if (!ust.pusto && ust.widzowie > 0 && (m.kultura?.dom.gniazdowy || ust.derby)) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), new THREE.MeshLambertMaterial({ color: 0x3a3f47 })); pod.position.set(-DL / 2 - 5.2, 0.4, 0); scena.add(pod);
      const p = stworzPostac({ koszulka: stroje.dom.pole.baza, dodatek: stroje.dom.pole.dodatek, spodenki: "#1b1b1b", getry: "#1b1b1b", nr: 0, seed: 401 });
      p.g.position.set(-DL / 2 - 5.2, 0.8, 0); p.g.rotation.y = -Math.PI / 2; const mg = megafon(); mg.position.set(0, -0.5, 0.1); mg.rotation.x = -1.4; p.ramiona[1].add(mg); scena.add(p.g); gniazdowi.push({ p, baza: p.g.position.clone(), gosc: false });
      if (m.komentarz.some((c) => c.tekst.startsWith("🧱"))) {
        const q = stworzPostac({ koszulka: stroje.gosc.pole.baza, dodatek: stroje.gosc.pole.dodatek, spodenki: "#1b1b1b", getry: "#1b1b1b", nr: 0, seed: 402 });
        q.g.position.set(DL / 2 - 7, 1.6, -SZ / 2 - 6.4); q.g.rotation.y = Math.PI; const mg2 = megafon(); mg2.position.set(0, -0.5, 0.1); mg2.rotation.x = -1.4; q.ramiona[1].add(mg2); scena.add(q.g); gniazdowi.push({ p: q, baza: q.g.position.clone(), gosc: true });
      }
    }
    let ostGniazdo = m.komentarz.length;
    // zamaskowani pirotechnicy: czarne peleryny, kominiarki, race w górze (pokazywani przy każdej pirotechnice)
    const pirotechnicy: { p: Postac; raca: THREE.Mesh }[] = [];
    if (race && !ust.pusto) for (let i = 0; i < 8; i++) {
      const p = stworzPostac({ koszulka: "#0d0d0f", spodenki: "#0d0d0f", getry: "#0d0d0f", nr: 0, seed: 700 + i, lysy: true } as any);
      const kaptur = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshLambertMaterial({ color: 0x121214 })); kaptur.position.y = 0.9; kaptur.scale.set(1.05, 1.15, 1.1); p.tulow.add(kaptur);
      const peleryna = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0x18181c, side: THREE.DoubleSide })); peleryna.position.y = 0.35; p.tulow.add(peleryna);
      const raca = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), new THREE.MeshBasicMaterial({ color: 0xff2a10 })); raca.position.set(0, -0.6, 0.05); p.ramiona[1].add(raca);
      const blask = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.9 })); blask.position.y = -0.2; raca.add(blask);
      p.g.visible = false; scena.add(p.g); pirotechnicy.push({ p, raca: blask });
    }
    // akcje specjalne kibiców: dach trybuny, dron z flagą, balony z transparentem, płonąca kukła
    const efekty: { obj: THREE.Object3D; t: number; typ: string }[] = [];
    let ostWiz = "";
    const pokazWizual = (typ: string, sektor: "gospodarzy" | "gosci") => {
      const kol = sektor === "gosci" ? stroje.gosc.pole : stroje.dom.pole;
      const zS = sektor === "gosci" ? -SZ / 2 - 10 : SZ / 2 + 12, xS = sektor === "gosci" ? DL / 2 - 8 : -6;
      const g = new THREE.Group();
      if (typ === "dach") { for (let i = 0; i < 6; i++) { const p = stworzPostac({ koszulka: kol.baza, spodenki: "#222", getry: "#222", nr: 0, seed: 900 + i }); p.g.position.set(xS - 5 + i * 1.6, 15, zS + Math.sign(zS) * 6); p.poza = "radosc"; p.pozaT = 999; g.add(p.g); efekty.push({ obj: p.g, t: 0, typ: "postac" }); } const fl = flagaMesh(sektor === "gosci" ? (m.kultura?.gosc.flagi[0]?.tekst ?? "") : (m.kultura?.dom.flagi[0]?.tekst ?? ""), kol.baza, kol.dodatek, 7); fl.position.set(xS, 17.6, zS + Math.sign(zS) * 6); g.add(fl); }
      if (typ === "dron") { const d = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.6), new THREE.MeshLambertMaterial({ color: 0x222222 })); d.add(b); for (const [x, z] of [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 12), new THREE.MeshBasicMaterial({ color: 0x999999, transparent: true, opacity: 0.5 })); r.position.set(x, 0.1, z); d.add(r); } const fl = flagaMesh(m.kultura?.[sektor === "gosci" ? "gosc" : "dom"].flagi[0]?.tekst ?? "", kol.baza, kol.dodatek, 3); fl.position.y = -1.2; d.add(fl); d.position.set(0, 9, 0); g.add(d); efekty.push({ obj: d, t: 0, typ: "dron" }); }
      if (typ === "balony") { for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshLambertMaterial({ color: i % 2 ? kol.baza : kol.dodatek })); b.position.set(xS - 6 + Math.random() * 12, 4 + Math.random() * 2, zS); g.add(b); efekty.push({ obj: b, t: Math.random(), typ: "balon" }); } }
      if (typ === "kukla") { const p = stworzPostac({ koszulka: sektor === "gosci" ? stroje.dom.pole.baza : stroje.gosc.pole.baza, spodenki: "#333", getry: "#333", nr: 0, seed: 950 }); p.g.position.set(xS, 4, zS); g.add(p.g); const ogien = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.6, 10), new THREE.MeshBasicMaterial({ color: 0xff6a00, transparent: true, opacity: 0.8 })); ogien.position.set(xS, 5, zS); g.add(ogien); efekty.push({ obj: ogien, t: 0, typ: "ogien" }); }
      if (typ === "pirotechnika" && race && dym) { raceT = 9; }
      scena.add(g); setTimeout(() => scena.remove(g), 30000);
    };
    // transparent kibiców (wieszany na trybunie danego sektora)
    let transparent: THREE.Mesh | undefined, transT = 0, ostTrans = "";
    const pokazTransparent = (tekst: string, sektor: "gospodarzy" | "gosci") => {
      if (transparent) { scena.remove(transparent); transparent.geometry.dispose(); }
      const c = document.createElement("canvas"); c.width = 1024; c.height = 128; const g = c.getContext("2d")!;
      g.fillStyle = "#f4f1e8"; g.fillRect(0, 0, 1024, 128); g.fillStyle = sektor === "gosci" ? stroje.gosc.pole.baza : stroje.dom.pole.baza; g.fillRect(0, 0, 1024, 14); g.fillRect(0, 114, 1024, 14);
      g.fillStyle = "#111"; g.font = "bold 58px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(tekst.slice(0, 32), 512, 66);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      transparent = new THREE.Mesh(new THREE.PlaneGeometry(sektor === "gosci" ? 13 : 30, sektor === "gosci" ? 1.6 : 3.6), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide }));
      if (sektor === "gosci") transparent.position.set(DL / 2 - 7, 3.0, -SZ / 2 - 5.45); else { transparent.position.set(-6, 4.2, SZ / 2 + 9); transparent.rotation.y = Math.PI; transparent.rotation.x = -0.4; }
      scena.add(transparent); transT = 25;
    };
    // intruz na murawie (wtargnięcie kibica) — biegnie, stewardzi gonią i wyprowadzają
    const intruz = stworzPostac({ koszulka: "#7a1f2b", spodenki: "#3a3a3a", getry: "#3a3a3a", nr: 0, seed: 777 }); intruz.g.visible = false; scena.add(intruz.g);
    let intruzT = 0, ostInc = (m.incydenty ?? []).length, interwencja: THREE.Vector3 | null = null, interwencjaT = 0;
    // sektorówka (oprawa) nad trybuną główną — na wyjście drużyn i pierwsze minuty
    // oprawa (każda inna) — sektorówka / kartoniada / folie… nad trybuną gospodarzy; oprawa gości na klatce
    const rysujOprawe = (o: Oprawa, klubO: typeof kd, w: number, h: number) => {
      const c = document.createElement("canvas"); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext("2d")!; const W2 = c.width, H2 = c.height;
      const [a, b] = o.kolory;
      const tlo = () => {
        if (o.uklad === "pasy_pion") for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * W2 / 16, 0, W2 / 16 + 1, H2); }
        else if (o.uklad === "pasy_poziom") for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(0, i * H2 / 6, W2, H2 / 6 + 1); }
        else if (o.uklad === "szachownica") for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) { g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x * W2 / 16, y * H2 / 4, W2 / 16 + 1, H2 / 4 + 1); }
        else if (o.uklad === "ukos") { g.fillStyle = a; g.fillRect(0, 0, W2, H2); g.fillStyle = b; for (let i = -4; i < 20; i += 2) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 64, 0); g.lineTo(i * 64 + 64 - H2, H2); g.lineTo(i * 64 - H2, H2); g.fill(); } }
        else if (o.uklad === "promienie") { g.fillStyle = a; g.fillRect(0, 0, W2, H2); g.fillStyle = b; for (let i = 0; i < 24; i += 2) { g.beginPath(); g.moveTo(W2 / 2, H2 / 2); g.arc(W2 / 2, H2 / 2, W2, (i / 24) * Math.PI * 2, ((i + 1) / 24) * Math.PI * 2); g.fill(); } }
        else if (o.uklad === "fale") { g.fillStyle = a; g.fillRect(0, 0, W2, H2); g.fillStyle = b; for (let y = 0; y < H2; y += 40) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W2; x += 32) g.lineTo(x, y + Math.sin(x / 60) * 12); g.lineTo(W2, y + 18); g.lineTo(0, y + 18); g.fill(); } }
        else { g.fillStyle = a; g.fillRect(0, 0, W2, H2); g.fillStyle = b; g.fillRect(0, H2 * 0.25, W2, H2 * 0.5); }
      };
      tlo();
      if (o.orly) { // „Do boju Polsko!" — orzeł w koronie na biało-czerwonej fladze
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, W2, H2 / 2); g.fillStyle = "#dc143c"; g.fillRect(0, H2 / 2, W2, H2 / 2);
        const cx = W2 / 2, cy = H2 * 0.5, R = H2 * 0.42;
        g.fillStyle = "#f4f4f4"; g.strokeStyle = "#8a8a8a"; g.lineWidth = 3;
        const skrzydlo = (str: number) => { g.beginPath(); g.moveTo(cx, cy - R * 0.25); for (let i = 0; i <= 5; i++) { const x = cx + str * R * (0.35 + i * 0.28), y = cy - R * (0.55 - i * 0.05) + (i % 2) * R * 0.18; g.lineTo(x, y); } g.lineTo(cx + str * R * 1.6, cy + R * 0.35); g.lineTo(cx + str * R * 0.3, cy + R * 0.2); g.closePath(); g.fill(); g.stroke(); };
        skrzydlo(1); skrzydlo(-1);
        g.beginPath(); g.ellipse(cx, cy, R * 0.32, R * 0.55, 0, 0, Math.PI * 2); g.fill(); g.stroke(); // tułów
        g.beginPath(); g.moveTo(cx - R * 0.3, cy + R * 0.45); g.lineTo(cx, cy + R * 0.95); g.lineTo(cx + R * 0.3, cy + R * 0.45); g.closePath(); g.fill(); g.stroke(); // ogon
        g.beginPath(); g.arc(cx + R * 0.08, cy - R * 0.62, R * 0.18, 0, Math.PI * 2); g.fill(); g.stroke(); // głowa
        g.fillStyle = "#f2b705"; g.beginPath(); g.moveTo(cx + R * 0.24, cy - R * 0.64); g.lineTo(cx + R * 0.42, cy - R * 0.56); g.lineTo(cx + R * 0.24, cy - R * 0.52); g.fill(); // dziób
        g.fillStyle = "#f2c200"; g.beginPath(); const ky = cy - R * 0.82; g.moveTo(cx - R * 0.16, ky); for (let i = 0; i <= 4; i++) { g.lineTo(cx - R * 0.16 + i * R * 0.08, ky - (i % 2 ? R * 0.08 : R * 0.2)); } g.lineTo(cx + R * 0.16, ky); g.closePath(); g.fill(); // korona
        g.fillStyle = "#ffffff"; g.font = `bold ${Math.round(H2 * 0.16)}px Arial`; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText("DO BOJU", W2 * 0.18, H2 * 0.78); g.fillText("POLSKO!", W2 * 0.82, H2 * 0.78);
        const t0 = new THREE.CanvasTexture(c); t0.colorSpace = THREE.SRGBColorSpace;
        return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t0, side: THREE.DoubleSide }));
      }
      // motyw (obrazek) — przy prowokacji w barwach rywala
      const emoji = o.motyw.split(" ")[0];
      if (o.obrazliwa && o.rywalKolory) { g.fillStyle = o.rywalKolory[0]; g.beginPath(); g.arc(W2 * 0.15, H2 * 0.5, H2 * 0.42, 0, 7); g.fill(); g.strokeStyle = o.rywalKolory[1]; g.lineWidth = 10; g.stroke(); }
      g.font = `${Math.round(H2 * 0.6)}px serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(emoji, W2 * 0.15, H2 * 0.52);
      if (o.rodzaj !== "kartoniada") { g.fillText(emoji, W2 * 0.85, H2 * 0.52); }
      // hasło — wulgaryzmy zamazane czarnym paskiem
      const czesci = o.haslo.toUpperCase().split(/(\{[^}]*\})/).filter(Boolean);
      let rozm = Math.round(H2 * 0.2); g.font = `bold ${rozm}px Arial`;
      const szer = () => czesci.reduce((acc, t) => acc + g.measureText(t.replace(/[{}]/g, "")).width, 0);
      while (szer() > W2 * 0.62 && rozm > 18) { rozm -= 2; g.font = `bold ${rozm}px Arial`; }
      let x = W2 / 2 - szer() / 2; const y = H2 * 0.5;
      g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(W2 * 0.18, y - rozm * 0.8, W2 * 0.64, rozm * 1.6);
      g.textAlign = "left";
      for (const t of czesci) { const czysty = t.replace(/[{}]/g, ""), wdt = g.measureText(czysty).width;
        g.fillStyle = "#ffffff"; g.fillText(czysty, x, y);
        if (t.startsWith("{")) { g.fillStyle = "#000"; g.fillRect(x - 3, y - rozm * 0.55, wdt + 6, rozm * 1.1); for (let k2 = 0; k2 < 14; k2++) { g.fillStyle = `rgba(60,60,60,${Math.random() * 0.8})`; g.fillRect(x + Math.random() * wdt, y - rozm * 0.5 + Math.random() * rozm, 8, 8); } }
        x += wdt; }
      if (o.rodzaj === "kartoniada" || o.rodzaj === "dwupoziomowa") { g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1; for (let xx = 0; xx < W2; xx += 16) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, H2); g.stroke(); } for (let yy = 0; yy < H2; yy += 16) { g.beginPath(); g.moveTo(0, yy); g.lineTo(W2, yy); g.stroke(); } }
      if (o.rodzaj === "folie") { g.fillStyle = "rgba(255,255,255,0.18)"; for (let k2 = 0; k2 < 60; k2++) g.fillRect(Math.random() * W2, Math.random() * H2, 30, 4); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      // herb klubu na środku sektorówki (gdy motyw = herb)
      if (o.herb) { const uri = uriObrazka(HERBY[kluczHerbu(klubO) ?? ""]); if (uri) { const im = new Image(); im.onload = () => { const r = H2 * 0.8; g.drawImage(im, W2 / 2 - r / 2, H2 / 2 - r / 2, r, r); t.needsUpdate = true; }; im.src = uri; } }
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide }));
      return mesh;
    };
    // wszystkie oprawy meczu (derby / zgody: kilka) — każda pokazywana w swojej minucie
    const oprawy3D = (ust.pusto ? [] : (m.oprawyPlan ?? [])).map((p) => {
      const mesh = p.sektor === "gospodarzy" ? rysujOprawe(p.o, kd, Math.min(70, DL * 0.65), p.o.rodzaj === "dwupoziomowa" ? 13 : 9) : rysujOprawe(p.o, kg, 14, 3.2);
      if (p.sektor === "gospodarzy") { mesh.position.set(0, 8.5, SZ / 2 + 15); mesh.rotation.x = -0.45; mesh.rotation.y = Math.PI; } else mesh.position.set(DL / 2 - 7, 3.4, -SZ / 2 - 5.6);
      mesh.visible = false; scena.add(mesh); return { p, mesh, pokazana: false };
    });
    let radoscTrenera: "dom" | "gosc" | null = null, radoscT = 0;
    const predk = new Map<Postac, THREE.Vector3>();
    // stan odtwarzania
    let segs: Seg[] = [], si = 0, czekaNaKrok = false, koniecSeg = false;
    let celebracja = 0, strzelec: string | undefined, powtorka = 0;
    const nagranie: { b: [number, number, number]; p: [string, number, number, number][] }[] = [];
    let odtw = 0, emocje = 0, czas = 0, rezyser: Kamera = "tv", rezT = 0;
    const camPoz = new THREE.Vector3(0, 30, SZ / 2 + 50), camCel = new THREE.Vector3(), celKamery = new THREE.Vector3();

    const nowaSekwencja = () => {
      const pkt = m.sekwencja.length ? m.sekwencja : [{ x: 50, y: 50 }];
      if (m.karne) pilka.position.set(WX(89), 0.22, 0);
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
        if (sc && m.karne) { sc.poza = "radosc"; sc.pozaT = 0.3; animuj(sc, 0, dt); }
        else if (sc) { sc.poza = "radosc"; sc.pozaT = 0.3; const cel = new THREE.Vector3(Math.sign(pilka.position.x) * (DL / 2 - 4), 0, SZ / 2 - 2);
          sc.g.position.lerp(cel, dt * 0.5);
          for (const [id, p] of postacie) if (id !== strzelec && strona.get(id) === strona.get(strzelec!) && s.zawodnicy[id]?.poz !== "BR") { p.g.position.lerp(tmp.copy(sc.g.position).add(new THREE.Vector3(Math.sin(p.faza) * 1.5, 0, Math.cos(p.faza) * 1.5)), dt * 0.8); animuj(p, 5, dt); } }
        for (const n of stad.siatki) n.scale.x = 1 + Math.sin(czas * 30) * 0.08 * Math.max(0, celebracja - 2);
        if (celebracja <= 0) {
          if (!ust.lekka && nagranie.length > 30 && !m.karne) { powtorka = 3.4; odtw = Math.max(0, nagranie.length - 200); stan.current.onPowtorka(true); rezyser = "bramka"; }
          else { if (!m.karne) rozstawienie(); czekaNaKrok = true; stan.current.onKoniecSekwencji(); }
        }
      } else if (wyjscie > 0) {
        // ——— wyjście z tunelu: sędziowie na czele, drużyny parami, ustawienie przy linii środkowej, potem na pozycje ———
        wyjscie -= dt; emocje = Math.max(emocje, 0.45);
        const fazaW = wyjscie > 6 ? 0 : wyjscie > 2.4 ? 1 : 2;
        const druz = [[m.dom.naBoisku, -1], [m.gosc.naBoisku, 1]] as const;
        for (const [ids, str] of druz) ids.forEach((id, i) => {
          const p = postac(id, str < 0 ? "dom" : "gosc");
          if (fazaW < 2) {
            const cel = fazaW === 0 ? tmp.set(str * 0.7, 0, SZ / 2 - 1 - (10 - wyjscie) * 3 + i * 1.1) : tmp.set(str * (1.6 + i * 0.95), 0, 5);
            if (wyjscie > 9.9) p.g.position.set(str * 0.7, 0, SZ / 2 + 3 + i * 1.1);
            const d = p.g.position.distanceTo(cel); p.g.position.lerp(cel, Math.min(1, dt * (fazaW === 0 ? 1.5 : 1.2)));
            p.g.rotation.y = fazaW === 1 && d < 0.6 ? 0 : Math.atan2(cel.x - p.g.position.x, cel.z - p.g.position.z);
            animuj(p, d > 0.4 ? 2.5 : 0, dt);
            if (fazaW === 1 && d < 0.6 && wyjscie < 4.5) { p.ramiona[0].rotation.x = -1.2; p.ramiona[0].rotation.z = -0.3 + Math.sin(czas * 3 + i) * 0.4; } // machanie do kibiców
          } else {
            const u = ukladCache.find((x) => x.id === id); if (!u) return;
            const x = u.sd === "dom" ? u.d * 0.48 : 100 - u.d * 0.48, y = u.sd === "dom" ? u.l : 100 - u.l;
            const cel = tmp.set(WX(x), 0, WZ(y)); const d = p.g.position.distanceTo(cel);
            p.g.position.lerp(cel, Math.min(1, dt * 1.4)); p.g.rotation.y = Math.atan2(cel.x - p.g.position.x, cel.z - p.g.position.z); animuj(p, d > 0.5 ? 6 : 0, dt);
          }
        });
        sedzia.g.position.lerp(fazaW < 2 ? tmp.set(0, 0, fazaW === 0 ? SZ / 2 - 2 - (10 - wyjscie) * 3 : 5) : tmp.set(-7, 0, 6), Math.min(1, dt * 1.5)); sedzia.g.rotation.y = fazaW === 1 ? 0 : Math.PI; animuj(sedzia, fazaW === 1 ? 0 : 2.5, dt);
        if (wyjscie <= 0) { rozstawienie(); reakcjaTrybun("gol", true); }
      } else if (trzymaj > 0) {
        trzymaj -= dtg; // ustawianie muru — sędzia odmierza 9,15 m
      } else if (intruzT > 0) {
        // wtargnięcie na murawę — gra stoi, aż stewardzi wyprowadzą kibica
      } else if (urazT > 0) {
        // przerwa na udzielenie pomocy — gra stoi
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
            if (z === "wolny" && !m.karne) { gwizdek(); trzymaj = 1.3; murPkt = sg.b.clone(); murSi = si + 1; murIds = [];
              const bramkaX = Math.sign(murPkt.x || 1) * DL / 2; const broni: "dom" | "gosc" = bramkaX > 0 ? "gosc" : "dom";
              murIds = ukladCache.filter((u) => u.sd === broni && !u.br).map((u) => ({ id: u.id, d: postac(u.id, u.sd).g.position.distanceTo(murPkt!) })).sort((a, b) => a.d - b.d).slice(0, 4).map((x) => x.id); }
            if (z === "spalony") flagaT = 2.2;
            if (z === "gol") {
              const domGol = m.karne ? m.pilka.strona === "dom" : sg.b.x > 0; strzelec = sg.p.nosnik; celebracja = m.karne ? 1.3 : 3.2; if (!m.karne) gwizdek();
              radoscTrenera = domGol ? "dom" : "gosc"; radoscT = 4; if (domGol && race) raceT = 7;
              reakcjaTrybun(domGol ? "gol" : "zawod", domGol); // gospodarze mają większość na trybunach
              koniecSeg = true;
            }
            si++;
            if (si >= segs.length && !koniecSeg) { czekaNaKrok = true; stan.current.onKoniecSekwencji(); }
          }
        }
      }
      // ——— zawodnicy: cele i ruch ———
      if (powtorka <= 0 && celebracja <= 0 && wyjscie <= 0) {
        const bx = pilka.position.x, bz = pilka.position.z;
        if (murPkt && si > murSi) { murPkt = null; murIds = []; }
        const murSrodek = murPkt ? murPkt.clone().add(tmp.set(Math.sign(murPkt.x || 1) * DL / 2 - murPkt.x, 0, -murPkt.z).normalize().multiplyScalar(9.15)) : null;
        const murKier = murPkt && murSrodek ? new THREE.Vector3().subVectors(murSrodek, murPkt).normalize() : null;
        // nowa kontuzja → leży, wbiega fizjoterapeuta, gra stoi
        if (m.urazy.length > ostUraz) { const u = m.urazy[m.urazy.length - 1]; ostUraz = m.urazy.length; urazId = u.id; urazT = 6; fizjo.g.visible = true; fizjo.g.position.set(u.klubId === m.dom.klubId ? -13 : 13, 0, SZ / 2 + 2.4); }
        if (urazT > 0) { urazT -= dt * Math.max(1, Math.min(3, sp * 0.6)); if (urazT <= 0) { const p = urazId ? postacie.get(urazId) : undefined; if (p) { p.poza = "stoi"; p.pozaT = 0; } } }
        const lezacy = urazT > 0 && urazId ? postacie.get(urazId) : undefined;
        if (fizjo.g.visible) {
          const cel = lezacy ? tmp.set(lezacy.g.position.x + 0.7, 0, lezacy.g.position.z + 0.3) : tmp.set(Math.sign(fizjo.g.position.x || 1) * 13, 0, SZ / 2 + 2.4);
          const d = fizjo.g.position.distanceTo(cel);
          if (d > 0.15) { fizjo.g.position.add(tmp.sub(fizjo.g.position).normalize().multiplyScalar(Math.min(d, 6.5 * dt))); fizjo.g.rotation.y = Math.atan2(cel.x - fizjo.g.position.x, cel.z - fizjo.g.position.z); }
          animuj(fizjo, d > 0.3 ? 6 : 0, dt);
          if (lezacy && d < 0.3) { fizjo.uda.forEach((u) => (u.rotation.x = -1.4)); fizjo.lydki.forEach((l) => (l.rotation.x = 2.2)); fizjo.g.position.y = -0.45; fizjo.ramiona.forEach((r) => (r.rotation.x = -0.9)); fizjo.g.rotation.y = -Math.PI / 2; }
          else fizjo.g.position.y = 0;
          if (!lezacy && d < 0.3) fizjo.g.visible = false;
        }
        const karneStr = m.karne ? m.pilka.strona : null; // kto strzela w serii karnych
        const ktoStrzela = m.karne ? segs[0]?.p.nosnik : undefined;
        let idxKoło = 0;
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
          if (murSrodek && murKier && murIds.includes(u.id)) { const k = murIds.indexOf(u.id) - 1.5; tx = murSrodek.x - murKier.z * k * 0.55; tz = murSrodek.z + murKier.x * k * 0.55; }
          if (m.karne && !m.koniec) {
            // seria karnych: strzelec na 11. metrze, bramkarz rywala na linii, reszta w kole środkowym
            if (u.id === ktoStrzela) { tx = WX(87.6); tz = -0.4; }
            else if (u.br && u.sd !== karneStr) { tx = WX(99.4); tz = 0; }
            else if (u.br) { tx = WX(84); tz = WZ(75); }
            else { const j = idxKoło++; tx = (u.sd === "dom" ? -0.7 : 0.7); tz = -6 + (j >> 1) * 1.3; }
          }
          if (m.koniec && celebracja <= 0) {
            // po meczu: podziękowania dla kibiców — gospodarze pod trybuną główną, goście pod sektorem gości
            const j = ukladCache.filter((x) => x.sd === u.sd).indexOf(u);
            if (u.sd === "dom") { tx = -14 + j * 2.6; tz = SZ / 2 - 1.6; } else { tx = DL / 2 - 4 - (j % 4) * 1.4; tz = -SZ / 2 + 1.6 + Math.floor(j / 4) * 1.2; }
          }
          if (lezacy === p) { p.poza = "lezy"; p.pozaT = 1; animuj(p, 0, dt); continue; }
          if (atakuje !== u.sd && !u.br) { const dd = Math.hypot(p.g.position.x - bx, p.g.position.z - bz); if (dd < nd) { nd = dd; najblizszyObr = p; } }
          const v = predk.get(p) ?? new THREE.Vector3(); predk.set(p, v);
          const z = s.zawodnicy[u.id];
          const kond = (z?.kondycja ?? 80) / 100;
          const vmax = (5.2 + ((z?.atrybuty?.szy ?? z?.umiej ?? 50) / 100) * 3.5) * (0.75 + 0.25 * kond) * Math.max(1, sp) * 1.6;
          tmp.set(tx - p.g.position.x, 0, tz - p.g.position.z);
          const dist = tmp.length();
          if (dist > 0.05) { tmp.normalize().multiplyScalar(Math.min(dist, m.koniec || m.karne || murIds.includes(u.id) ? 4 * dt : vmax * Math.max(dt, dtg) * (gra ? 1 : 0.15))); }
          p.g.position.add(tmp);
          const vr = tmp.length() / Math.max(0.001, dt) / Math.max(1, sp);
          if (tmp.lengthSq() > 1e-5) p.g.rotation.y = Math.atan2(tmp.x, tmp.z); else p.g.rotation.y = Math.atan2(bx - p.g.position.x, bz - p.g.position.z);
          animuj(p, vr, dt);
          if (murIds.includes(u.id) && murSrodek && dist < 0.6) { p.g.rotation.y = Math.atan2(bx - p.g.position.x, bz - p.g.position.z); p.ramiona[0].rotation.x = -0.5; p.ramiona[1].rotation.x = -0.5; p.ramiona[0].rotation.z = 0.5; p.ramiona[1].rotation.z = -0.5; }
          if (m.koniec && celebracja <= 0 && dist < 0.5) {
            p.g.rotation.y = u.sd === "dom" ? 0 : Math.PI;
            const wygrani = m.karne?.zwyciezca ? m.karne.zwyciezca === u.sd : (u.sd === "dom" ? m.gd > m.gg : m.gg > m.gd);
            if (wygrani && Math.sin(czas * 0.7 + p.faza) > 0.6) { p.poza = "radosc"; p.pozaT = 0.2; }
            else { p.ramiona[0].rotation.x = -1.35; p.ramiona[1].rotation.x = -1.35; const kl = Math.sin(czas * 13 + p.faza) * 0.28; p.ramiona[0].rotation.z = -0.32 + kl; p.ramiona[1].rotation.z = 0.32 - kl; }
          } else if (!m.koniec && vr < 0.4 && p.poza === "stoi" && (z?.kondycja ?? 100) < 48) {
            // zmęczenie: ręce na kolanach
            p.tulow.rotation.x = 0.55; p.ramiona[0].rotation.x = -0.7; p.ramiona[1].rotation.x = -0.7;
          }
        }
        if (najblizszyObr && gra) { tmp.set(bx - najblizszyObr.g.position.x, 0, bz - najblizszyObr.g.position.z); const d = tmp.length(); if (d > 1.4) najblizszyObr.g.position.add(tmp.normalize().multiplyScalar(Math.min(d - 1.4, 9 * dtg))); }
        // zawodnicy, którzy zeszli z boiska, schodzą do ławki
        for (const [id, p] of postacie) if (!m.dom.naBoisku.includes(id) && !m.gosc.naBoisku.includes(id) && !lawkowi.includes(p)) { p.g.position.lerp(tmp.set(strona.get(id) === "dom" ? -9 : 9, 0, SZ / 2 + 3), dt * 0.6); animuj(p, 2, dt); if (p.g.position.z > SZ / 2 + 2.5) p.g.visible = false; }
        // incydenty na trybunach: race (dym), interwencja stewardów / policji, wtargnięcie kibica
        if (m.zadyma && !m.zadyma.koniec) { const z = m.zadyma, zS = z.sektor === "gosci" ? -SZ / 2 - 8 : SZ / 2 + 8, xS = z.sektor === "gosci" ? DL / 2 - 10 : 0;
          if (["przepychanki", "starcie", "stewardzi", "policja", "opor", "wycofanie"].includes(z.faza)) { interwencja = new THREE.Vector3(xS, 0, Math.sign(zS) * (SZ / 2 + 5)); interwencjaT = Math.max(interwencjaT, 1.5); emocje = Math.max(emocje, 0.9); }
          if (z.armatka && (z.faza === "opor" || z.faza === "policja") && armatkaT <= 0) armatkaT = 6;
          if (z.faza === "opor" && race && dym && raceT <= 0) raceT = 5; }
        if ((m.incydenty ?? []).length > ostInc) {
          const inc = m.incydenty![m.incydenty!.length - 1]; ostInc = m.incydenty!.length;
          const zSek = inc.sektor === "gosci" ? -SZ / 2 - 8 : SZ / 2 + 8, xSek = inc.sektor === "gosci" ? DL / 2 - 10 : 0;
          if (inc.typ === "race" && race && dym) { raceT = 9; (race.geometry.getAttribute("position") as THREE.BufferAttribute).array.forEach((_, i, a) => { if (i % 3 === 0) (a as Float32Array)[i] = xSek - 12 + Math.random() * 24; if (i % 3 === 2) (a as Float32Array)[i] = zSek + Math.sign(zSek) * Math.random() * 8; }); race.geometry.getAttribute("position").needsUpdate = true; dym.position.set(xSek, 12, zSek + Math.sign(zSek) * 5); }
          if (inc.typ === "wtargniecie") { intruzT = inc.opanowany ? 5 : 8; intruz.g.visible = true; intruz.g.position.set(xSek, 0, Math.sign(zSek) * (SZ / 2 + 2)); }
          interwencja = new THREE.Vector3(xSek, 0, Math.sign(zSek) * (SZ / 2 + 5)); interwencjaT = inc.opanowany ? 6 : 10;
          if (armatka && !inc.opanowany && inc.typ === "bojka") armatkaT = 7;
        }
        if (intruzT > 0) {
          intruzT -= dt; const cel = tmp.set(Math.sin(czas * 0.8) * 8, 0, Math.cos(czas * 0.6) * 6);
          const z0 = intruz.g.position.clone(); intruz.g.position.lerp(cel, Math.min(1, dt * 0.9)); intruz.g.rotation.y = Math.atan2(cel.x - z0.x, cel.z - z0.z); animuj(intruz, 6, dt);
          stewardzi.slice(0, 3).forEach((st0, i) => { const t2 = tmp.copy(intruz.g.position).add(new THREE.Vector3(i - 1, 0, 0.9)); st0.p.g.position.lerp(t2, Math.min(1, dt * 1.1)); st0.p.g.rotation.y = Math.atan2(intruz.g.position.x - st0.p.g.position.x, intruz.g.position.z - st0.p.g.position.z); animuj(st0.p, 6, dt); });
          if (intruzT <= 0) intruz.g.visible = false;
        } else stewardzi.forEach((st0) => { const d = st0.p.g.position.distanceTo(st0.baza); if (d > 0.2) { st0.p.g.position.lerp(st0.baza, Math.min(1, dt * 0.8)); animuj(st0.p, 3, dt); } else animuj(st0.p, 0, dt); });
        if (interwencjaT > 0) {
          interwencjaT -= dt;
          const grupa = (interwencja!.z < 0 ? policja : stewardzi.slice(3, 9));
          grupa.forEach((x, i) => { const t2 = tmp.copy(interwencja!).add(new THREE.Vector3((i % 4) * 1.2 - 2, 0, Math.floor(i / 4) * 1.1)); x.p.g.position.lerp(t2, Math.min(1, dt * 0.9)); animuj(x.p, 4, dt); });
        } else policja.forEach((x) => { const d = x.p.g.position.distanceTo(x.baza); if (d > 0.2) { x.p.g.position.lerp(x.baza, Math.min(1, dt * 0.8)); animuj(x.p, 3, dt); } else animuj(x.p, 0, dt); });
        for (const x of oprawy3D) { const w = !m.koniec && m.min >= x.p.min && m.min <= x.p.min + 3; x.mesh.visible = w; if (w && !x.pokazana) { x.pokazana = true; emocje = Math.max(emocje, 0.8); if (x.p.o.pirotechnika && race && dym) raceT = 8; } }
        if (m.transparentTeraz && m.transparentTeraz.tekst + m.transparentTeraz.min !== ostTrans) { ostTrans = m.transparentTeraz.tekst + m.transparentTeraz.min; pokazTransparent(m.transparentTeraz.tekst, m.transparentTeraz.sektor); }
        if (transparent) { transT -= dt; transparent.visible = transT > 0; }
        if (m.wizualTeraz && m.wizualTeraz.typ + m.wizualTeraz.min !== ostWiz) { ostWiz = m.wizualTeraz.typ + m.wizualTeraz.min; pokazWizual(m.wizualTeraz.typ, m.wizualTeraz.sektor); }
        for (const e of efekty) { e.t += dt;
          if (e.typ === "dron") e.obj.position.set(Math.sin(e.t * 0.4) * 18, 9 + Math.sin(e.t * 2) * 0.3, Math.cos(e.t * 0.3) * 10);
          else if (e.typ === "balon") e.obj.position.y += dt * (0.8 + (e.t % 1) * 0.6);
          else if (e.typ === "ogien") e.obj.scale.set(1 + Math.sin(e.t * 20) * 0.15, 1 + Math.sin(e.t * 13) * 0.2, 1);
          else if (e.typ === "postac") e.obj.position.y = 15 + Math.abs(Math.sin(e.t * 6)) * 0.3; }
        if (gosciFani) { gosciFani.position.y = Math.abs(Math.sin(czas * 5)) * 0.18 * (0.4 + emocje); const sz = (gosciFani as any).szaliki as THREE.InstancedMesh | undefined; if (sz) { sz.visible = emocje > 0.55 || Math.sin(czas * 0.15) > 0.85; sz.position.y = gosciFani.position.y; } }
        if (strumien && armatka) { armatkaT = Math.max(0, armatkaT - dt); strumien.visible = armatkaT > 0; if (armatkaT > 0) { strumien.scale.set(1, 0.9 + Math.random() * 0.2, 1); (armatka.children[armatka.children.length - 2] as THREE.Object3D).rotation.y = Math.sin(czas * 1.5) * 0.3; } }
        // sędzia techniczny: tablica z doliczonym czasem i numerami przy zmianach
        if (m.zmianyLog.length > ostZmian) { const x = m.zmianyLog[m.zmianyLog.length - 1]; ostZmian = m.zmianyLog.length; rysujTab(String(s.zawodnicy[x.schodzi]?.numer ?? ""), String(s.zawodnicy[x.wchodzi]?.numer ?? "")); tabT = 4.5; }
        const klDol = m.polowa === 1 && m.min >= 45 ? 1 : m.polowa === 2 && m.min >= 90 ? 2 : 0;
        if (klDol && klDol !== tabDolicz && !m.koniec) { tabDolicz = klDol; rysujTab(`+${m.dolicz[klDol - 1]}`); tabT = 4.5; }
        tabT = Math.max(0, tabT - dt); tablica.visible = tabT > 0; animuj(techniczny, 0, dt);
        if (tabT > 0) { techniczny.ramiona[0].rotation.x = -2.95; techniczny.ramiona[1].rotation.x = -2.95; techniczny.ramiona[0].rotation.z = 0.25; techniczny.ramiona[1].rotation.z = -0.25; }
        // sędzia i asystenci
        tmp.set(bx - 7 - sedzia.g.position.x, 0, bz + 6 - sedzia.g.position.z); const ds = tmp.length();
        if (ds > 0.3) sedzia.g.position.add(tmp.normalize().multiplyScalar(Math.min(ds, 8 * Math.max(dt, dtg))));
        sedzia.g.rotation.y = Math.atan2(bx - sedzia.g.position.x, bz - sedzia.g.position.z); animuj(sedzia, ds > 1 ? 4 : 0, dt);
        // kartka: nowa w meczu → sędzia podnosi ją w górę
        if (m.kartki.length > ostKartek) { const k = m.kartki[m.kartki.length - 1]; (kartka.material as THREE.MeshBasicMaterial).color.set(k.typ === "czerwona" ? 0xe01010 : 0xffd600); kartkaT = 2.2; ostKartek = m.kartki.length; gwizdek(); }
        kartkaT = Math.max(0, kartkaT - dt); kartka.visible = kartkaT > 0;
        if (kartkaT > 0) { sedzia.ramiona[1].rotation.x = -2.9; sedzia.ramiona[1].rotation.z = 0.15; }
        flagaT = Math.max(0, flagaT - dt);
        asystenci.forEach((a) => { a.ramiona[1].rotation.x = flagaT > 0 ? -2.8 : -0.2; });
        choragiewki.forEach((c) => { c.rotation.z = flagaT > 0 ? Math.sin(czas * 18) * 0.25 : 0; });
        // trenerzy przy linii: gesty przez cały mecz, radość po golu, złapanie się za głowę po straconym
        radoscT = Math.max(0, radoscT - dt);
        for (const { t, sd } of trenerzy) {
          const cieszy = radoscT > 0 && radoscTrenera === sd, smutny = radoscT > 0 && radoscTrenera && radoscTrenera !== sd;
          if (cieszy) { t.poza = "radosc"; t.pozaT = 0.2; animuj(t, 0, dt); }
          else { t.poza = "stoi"; animuj(t, 0, dt); t.ramiona[0].rotation.x = smutny ? -2.9 : -0.6 - Math.max(0, Math.sin(czas * 1.3 + (sd === "dom" ? 0 : 2))) * 0.9; t.ramiona[1].rotation.x = smutny ? -2.9 : -0.3; }
          t.g.position.x = (sd === "dom" ? -9 : 9) + Math.sin(czas * 0.4 + (sd === "dom" ? 0 : 1)) * 1.5; t.g.rotation.y = Math.PI + Math.atan2(bx - t.g.position.x, 30) * 0.5;
        }
        for (const p of lawkowi) { if (m.dom.naBoisku.some((x) => postacie.get(x) === p) || m.gosc.naBoisku.some((x) => postacie.get(x) === p)) continue; p.tulow.rotation.x = 0.1 + Math.sin(czas + p.faza) * 0.03; }
        asystenci[0].g.position.x += (Math.min(-2, Math.max(-DL / 2, bx - 6)) - asystenci[0].g.position.x) * dt * 2; asystenci[0].g.rotation.y = Math.PI; animuj(asystenci[0], 2, dt);
        asystenci[1].g.position.x += (Math.max(2, Math.min(DL / 2, bx + 6)) - asystenci[1].g.position.x) * dt * 2; asystenci[1].g.rotation.y = 0; animuj(asystenci[1], 2, dt);
        // nagrywanie do powtórki (ostatnie ~4 s)
        if (gra) { nagranie.push({ b: [pilka.position.x, pilka.position.y, pilka.position.z], p: [...postacie].map(([id, p]) => [id, p.g.position.x, p.g.position.z, p.g.rotation.y]) }); if (nagranie.length > 260) nagranie.shift(); }
        // emocje trybun i dźwięk: im bliżej bramki, tym głośniej
        const doBramki = Math.max(0, (Math.abs(bx) - 25) / 27);
        emocje = Math.max(emocje * (1 - dt * 0.8), doBramki * 0.35);
        napiecie(Math.min(1, doBramki + emocje * 0.5), bx / 52);
      }
      if (race && dym) {
        raceT = Math.max(0, raceT - dt);
        (race.material as THREE.PointsMaterial).opacity = raceT > 0 ? 0.6 + Math.random() * 0.4 : 0;
        (dym.material as THREE.MeshBasicMaterial).opacity = Math.max(0, Math.min(0.45, raceT > 0 ? 0.45 : (dym.material as THREE.MeshBasicMaterial).opacity - dt * 0.03));
        dym.position.y = 12 + Math.sin(czas * 0.3) * 1.5;
        if (raceT > 0) emocje = Math.max(emocje, 0.5);
        if (gniazdowi.length) {
          const nowy = m.komentarz.length > ostGniazdo && m.komentarz.slice(0, m.komentarz.length - ostGniazdo).some((c) => c.tekst.startsWith("🎤") || c.tekst.startsWith("🎵") || c.tekst.startsWith("🥁"));
          ostGniazdo = m.komentarz.length; if (nowy) emocje = Math.max(emocje, 0.7);
          for (const gz of gniazdowi) { const zyw = 0.5 + emocje; gz.p.g.position.y = gz.baza.y + Math.abs(Math.sin(czas * 4 * zyw)) * 0.18 * zyw; gz.p.ramiona[1].rotation.x = -1.6 + Math.sin(czas * 3) * 0.2; gz.p.ramiona[0].rotation.x = -2.2 - Math.abs(Math.sin(czas * 6)) * 0.7 * zyw; }
        }
        if (pirotechnicy.length) {
          const pos = race.geometry.getAttribute("position") as THREE.BufferAttribute;
          pirotechnicy.forEach((x, i) => { x.p.g.visible = raceT > 0; if (raceT > 0) { x.p.g.position.set(pos.getX(i * 7), Math.max(1.2, pos.getY(i * 7) - 1.6), pos.getZ(i * 7)); x.p.g.rotation.y = pos.getZ(i * 7) > 0 ? Math.PI : 0; x.p.ramiona[1].rotation.x = -2.9 + Math.sin(czas * 6 + i) * 0.15; x.p.ramiona[0].rotation.x = -1.2; (x.raca.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.random() * 0.4; x.raca.scale.setScalar(0.8 + Math.random() * 0.6); } });
        }
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
      if (wyjscie > 0) { camPoz.set(wyjscie > 6 ? 6 : 0, wyjscie > 6 ? 5 : 7, SZ / 2 + (wyjscie > 6 ? 12 : 20)); camCel.set(0, 1.2, wyjscie > 6 ? SZ / 2 - 6 : 4); }
      else if (m.karne && !m.koniec && powtorka <= 0 && stan.current.kamera === "auto") { camPoz.set(WX(80), 3.2, 2.5); camCel.set(WX(100), 1, 0); }
      else if (m.koniec && celebracja <= 0 && stan.current.kamera === "auto") { camPoz.set(-4, 9, SZ / 2 + 22); camCel.set(0, 1, SZ / 2 - 6); }
      else if (tryb === "tv" || tryb === "auto") { camPoz.set(bx * 0.78, 30, SZ / 2 + 52); camCel.set(bx * 0.86, 0, bz * 0.35); }
      else if (tryb === "bramka") { const sd = Math.sign(bx || 1); camPoz.set(sd * (DL / 2 + 22), 9, bz * 0.3 + 6); camCel.set(bx * 0.8, 1, bz * 0.6); }
      else if (tryb === "gora") { camPoz.set(bx * 0.4, 105, 18); camCel.set(bx * 0.4, 0, 0); }
      else { camPoz.set(bx - Math.sign(bx || 1) * 12, 10, bz + 19); camCel.set(bx, 1, bz); }
      // płynne prowadzenie kamery liczone z prawdziwego czasu (niezależne od liczby klatek)
      cam.position.lerp(camPoz, 1 - Math.exp(-dtReal * (tryb === "blisko" ? 3 : 2.2)));
      celKamery.lerp(camCel, 1 - Math.exp(-dtReal * 5));
      cam.lookAt(celKamery);
      bokeh.enabled = !ust.lekka && (tryb === "blisko" || powtorka > 0);
      if (bokeh.enabled) (bokeh.uniforms as any).focus.value = cam.position.distanceTo(pilka.position);
      if (ust.lekka) renderer.render(scena, cam); else composer.render(dt);
    };
    const wersjaRef = { current: wersja };
    (sterowanie.current as any).wersjaRef = wersjaRef;
    if (ust.lekka) uproscMaterialy(scena); // sędziowie, ławki, piłka itd.
    // shadery kompilowane w tle (bez zamrażania ekranu przy otwieraniu meczu)
    const r2 = renderer as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> };
    let anul = false; const go = () => { if (!anul) raf = requestAnimationFrame(petla); };
    { let ruszyl = false; const raz = () => { if (!ruszyl) { ruszyl = true; go(); } };
      setTimeout(raz, 2000); // iPhone: gdy kompilacja w tle się nie kończy — startujemy i tak (jak dawniej)
      try { if (r2.compileAsync) r2.compileAsync(scena, cam).then(raz, raz); else raz(); } catch { raz(); } }
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 50);
    gwizdek(false, 1);
    return () => { anul = true; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); composer.dispose?.(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); scena.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);
  // nowa minuta z silnika → nowa sekwencja
  useEffect(() => { const w = (sterowanie.current as any)?.wersjaRef; if (w) w.current = wersja; }, [wersja]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: "#0b1226", borderRadius: 10, overflow: "hidden" }} />;
}
