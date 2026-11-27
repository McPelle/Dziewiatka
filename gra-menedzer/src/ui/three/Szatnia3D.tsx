// Szatnia w przerwie meczu (3D): szafki z koszulkami i numerami, ławki pod ścianami, zawodnicy w strojach meczowych
// (z twarzami i mimiką), trener na środku gestykuluje; reakcja drużyny na mowę (radość / spokój / zwieszone głowy).
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { uproscMaterialy } from "./stadion3d";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Klub, StanGry } from "../../engine/types";
import type { Kit } from "../strojeDane";
import { HERBY } from "../../data/herby";
import { kluczHerbu } from "../Herb";
import { minka, stworzPostac, wyglad3D, type Postac } from "./zawodnik3d";
import { lekkaGrafika } from "./Stadion3DWidok";
import { uriObrazka } from "./Konferencja3D";
import type { Mowa } from "../../engine/meczNaZywo";

// Rekwizyty szatni w przerwie — wspólne geometrie i materiały (tanio na telefonie)
const G_BUT = new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8), G_KOR = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6);
const G_KROPLA = new THREE.SphereGeometry(0.012, 5, 4), G_PLAMA = new THREE.CircleGeometry(0.1, 10);
const G_RECZ_SZYJA = new THREE.TorusGeometry(0.12, 0.035, 5, 12), G_RECZ_KON = new THREE.BoxGeometry(0.08, 0.26, 0.025), G_RECZ_LAWKA = new THREE.BoxGeometry(0.26, 0.05, 0.2);
const smooth = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** Ile trwa mowa trenera (ruch ust, kamera na trenerze) — w sekundach. */
const CZAS_MOWY = 4.2;

/** `przed` — szatnia przed meczem: zawodnicy przychodzą w dresach treningowych i po kolei przebierają się w stroje meczowe.
 *  `mowiId` — kto teraz mówi (rusza ustami, gestykuluje).
 *  `przerwa` — szatnia w przerwie: zmęczeni, spoceni zawodnicy (ręczniki, bidony), trener stoi i gestykuluje;
 *  `mowa` — wybrana mowa (pochwała / spokój / wiara / ochrzan) zmienia gesty trenera i reakcje drużyny
 *  (`nastroj` > 0 = mowa trafiła, < 0 = nie trafiła). */
export function Szatnia3D({ s, klub, zawodnicy, kit, kitBr, nastroj, mowi, przed, mowiId, przerwa, mowa }: { s: StanGry; klub: Klub; zawodnicy: string[]; kit: Kit; kitBr: Kit; nastroj: number; mowi: boolean; przed?: boolean; mowiId?: string | null; przerwa?: boolean; mowa?: Mowa | null }) {
  const host = useRef<any>(null);
  const stan = useRef({ nastroj, mowi, mowiId, mowa }); stan.current = { nastroj, mowi, mowiId, mowa };
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    const lekka = lekkaGrafika();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 200;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : 2)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = !lekka; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene(); scena.background = new THREE.Color(0x1b1f24);
    scena.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.7));
    for (const x of [-2.5, 2.5]) { const l = new THREE.PointLight(0xfff1dd, 4, 12); l.position.set(x, 3.2, 0); l.castShadow = !lekka; scena.add(l); }
    const pod = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ color: 0x5a636b, roughness: 0.6 })); pod.rotation.x = -Math.PI / 2; pod.receiveShadow = true; scena.add(pod);
    // dywan z herbem klubu na środku
    const herbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true });
    const uri = uriObrazka(HERBY[kluczHerbu(klub) ?? ""]);
    // tekstura trafia do materiału, którego mesh faktycznie używa (w lekkiej grafice materiały są podmieniane) — bez herbu: brak białego kwadratu
    if (uri) new THREE.TextureLoader().load(uri, (t) => { t.colorSpace = THREE.SRGBColorSpace; const mm = herb.material as THREE.MeshStandardMaterial; mm.map = t; mm.color.set(0xffffff); mm.needsUpdate = true; herb.visible = true; });
    const dywan = new THREE.Mesh(new THREE.CircleGeometry(1.4, 40), new THREE.MeshStandardMaterial({ color: kit.baza, roughness: 0.9 })); dywan.rotation.x = -Math.PI / 2; dywan.position.y = 0.01; scena.add(dywan);
    const herb = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), herbMat); herb.rotation.x = -Math.PI / 2; herb.position.y = 0.02; herb.visible = false; scena.add(herb);
    // ściany z szafkami (koszulki z numerami) i ławki
    const sciana = new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.95 });
    const tyl = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), sciana); tyl.position.set(0, 2, -4); scena.add(tyl);
    for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), sciana); b.position.set(sx * 5.5, 2, 0); b.rotation.y = -sx * Math.PI / 2; scena.add(b); }
    const drewno = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.6 });
    // przerwa: pot (błyszcząca skóra, krople, mokre plamy na koszulce), ręczniki i bidony
    const mKropla = new THREE.MeshStandardMaterial({ color: 0xe8f4ff, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.75 });
    const mBidon = [new THREE.MeshStandardMaterial({ color: kit.baza, roughness: 0.35 }), new THREE.MeshStandardMaterial({ color: 0x7fc4ff, roughness: 0.15, transparent: true, opacity: 0.8 })];
    const mKorek = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
    const mRecznik = [new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 1 }), new THREE.MeshStandardMaterial({ color: kit.dodatek, roughness: 1 })];
    const plamy = new Map<string, THREE.Material>();
    const bidon = () => { const b = new THREE.Group(); const c = new THREE.Mesh(G_BUT, mBidon[Math.random() < 0.5 ? 0 : 1]); b.add(c); const k = new THREE.Mesh(G_KOR, mKorek); k.position.y = 0.12; b.add(k); return b; };
    /** dodatki zawodnika w przerwie; zwraca, czy trzyma bidon w ręce i czy ma ręcznik na szyi */
    const rekw = new Map<Postac, { bidon: boolean; recznik: boolean }>();
    const rekwizyty = (p: Postac, i: number, m: { x: number; z: number; ry: number }, kolor: string) => {
      const sk = (p.twarz?.glowa as THREE.Mesh | undefined)?.material as THREE.MeshStandardMaterial | undefined;
      if (sk) { sk.roughness = 0.28; sk.metalness = 0.08; } // spocona, błyszcząca skóra (cała postać ma wspólny materiał skóry)
      for (const [x, y] of [[-0.06, 0.97], [0.05, 0.99], [0.01, 0.95]].slice(0, 1 + (i % 3))) { const kr = new THREE.Mesh(G_KROPLA, mKropla); kr.position.set(x, y, 0.118); kr.scale.y = 1.4; p.tulow.add(kr); }
      let pm = plamy.get(kolor); if (!pm) { pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(kolor).multiplyScalar(0.55), transparent: true, opacity: 0.45, depthWrite: false }); plamy.set(kolor, pm); }
      for (const z of [0.158, -0.159]) { const pl = new THREE.Mesh(G_PLAMA, pm); pl.position.set(0, 0.44, z); pl.scale.set(1, 1.5, 1); if (z < 0) pl.rotation.y = Math.PI; p.tulow.add(pl); }
      const recznik = i % 3 !== 1, wRece = i % 2 === 0;
      if (recznik) {
        const mr = mRecznik[i % 4 === 0 ? 1 : 0];
        const sz = new THREE.Mesh(G_RECZ_SZYJA, mr); sz.rotation.x = Math.PI / 2; sz.position.y = 0.67; sz.scale.set(1.15, 1, 1); p.tulow.add(sz);
        for (const x of [-0.1, 0.1]) { const kn = new THREE.Mesh(G_RECZ_KON, mr); kn.position.set(x, 0.52, 0.165); p.tulow.add(kn); }
      } else { const r = new THREE.Mesh(G_RECZ_LAWKA, mRecznik[0]); r.position.set(m.x + Math.cos(m.ry) * 0.34, 0.52, m.z - Math.sin(m.ry) * 0.34); r.rotation.y = m.ry; scena.add(r); }
      if (wRece) { const b = bidon(); b.position.set(0, -0.55, 0.04); p.ramiona[1].add(b); }
      else { const b = bidon(); b.position.set(m.x + Math.sin(m.ry) * 0.5 + Math.cos(m.ry) * 0.25, 0.1, m.z + Math.cos(m.ry) * 0.5); scena.add(b); }
      rekw.set(p, { bidon: wRece, recznik });
    };
    const ids = zawodnicy.slice(0, 16);
    // rozstaw: 8 przy tylnej ścianie, po 4 przy bocznych
    const miejsca: { x: number; z: number; ry: number }[] = [];
    for (let i = 0; i < 8; i++) miejsca.push({ x: -3.5 + i, z: -3.3, ry: 0 });
    for (let i = 0; i < 4; i++) miejsca.push({ x: -4.8, z: -1.8 + i * 1.1, ry: Math.PI / 2 });
    for (let i = 0; i < 4; i++) miejsca.push({ x: 4.8, z: -1.8 + i * 1.1, ry: -Math.PI / 2 });
    const postacie: Postac[] = [];
    const mapa = new Map<string, { p: Postac; dres?: Postac; kiedy: number }>();
    ids.forEach((id, i) => {
      const z = s.zawodnicy[id]; const m = miejsca[i]; if (!z || !m) return;
      const k = z.poz === "BR" ? kitBr : kit;
      // szafka z koszulką i numerem
      const szafka = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5 }));
      const back = new THREE.Vector3(m.x, 1.1, m.z).add(new THREE.Vector3(Math.sin(m.ry), 0, Math.cos(m.ry)).multiplyScalar(-0.55));
      szafka.position.copy(back); szafka.rotation.y = m.ry; scena.add(szafka);
      const c = document.createElement("canvas"); c.width = 64; c.height = 64; const g = c.getContext("2d")!;
      g.fillStyle = k.baza; g.fillRect(8, 10, 48, 50); g.fillStyle = k.dodatek; g.font = "bold 26px Arial"; g.textAlign = "center"; g.fillText(String(z.numer || ""), 32, 46);
      const kosz = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      kosz.position.copy(back).add(new THREE.Vector3(Math.sin(m.ry), 0, Math.cos(m.ry)).multiplyScalar(0.27)).setY(1.9); kosz.rotation.y = m.ry; scena.add(kosz); // na drzwiach szafki (nad głową siedzącego)
      const lawka = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.45), drewno); lawka.position.set(m.x, 0.46, m.z); lawka.rotation.y = m.ry; scena.add(lawka);
      const p = stworzPostac({ ...wyglad3D(z), twarz: true, koszulka: k.baza, dodatek: k.dodatek, wzor: k.wzor, spodenki: k.dodatek, getry: k.baza, nr: z.numer, nazwisko: z.nazwisko, seed: [...id].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0) });
      const posadz = (q: Postac) => { q.g.position.set(m.x, -0.4 + 0.3, m.z + (m.ry === 0 ? 0.12 : 0)); q.g.rotation.y = m.ry; q.uda.forEach((u) => (u.rotation.x = -1.45)); q.lydki.forEach((l) => (l.rotation.x = 1.45)); scena.add(q.g); postacie.push(q); };
      posadz(p);
      // przed meczem: dres treningowy (ciemny, z wykończeniem w barwach), przebranie po kolei
      let dres: Postac | undefined;
      if (przed) { dres = stworzPostac({ ...wyglad3D(z), twarz: true, koszulka: "#262b33", dodatek: kit.baza, wzor: "rekaw", spodenki: "#262b33", getry: "#262b33", nr: 0, seed: [...id].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0) }); posadz(dres); p.g.visible = false; }
      mapa.set(id, { p, dres, kiedy: 2 + i * 0.9 });
      if (przerwa) rekwizyty(p, i, m, k.baza);
    });
    // trener na środku
    const trener = stworzPostac({ twarz: true, koszulka: "#1d2536", spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed: 21 });
    trener.g.position.set(0, 0, 0.6); trener.g.rotation.y = Math.PI; scena.add(trener.g);
    // przerwa: tablica taktyczna na stojaku i bidon, który trener kopie przy ochrzanie
    let kopany: THREE.Group | null = null; const kopV = new THREE.Vector3(); let kopniety = false;
    if (przerwa) {
      const c = document.createElement("canvas"); c.width = 128; c.height = 96; const g = c.getContext("2d")!;
      g.fillStyle = "#2f7d3a"; g.fillRect(0, 0, 128, 96); g.strokeStyle = "#fff"; g.lineWidth = 2; g.strokeRect(6, 6, 116, 84); g.beginPath(); g.moveTo(64, 6); g.lineTo(64, 90); g.stroke(); g.beginPath(); g.arc(64, 48, 12, 0, Math.PI * 2); g.stroke();
      g.font = "bold 13px Arial"; g.fillStyle = "#ffeb3b"; for (const [x, y] of [[20, 48], [40, 24], [40, 72], [56, 40], [56, 58], [80, 48]]) g.fillText("o", x, y);
      g.fillStyle = "#ff5252"; for (const [x, y] of [[96, 30], [96, 66], [108, 48]]) g.fillText("x", x, y);
      g.strokeStyle = "#ffeb3b"; g.beginPath(); g.moveTo(58, 44); g.quadraticCurveTo(80, 20, 92, 30); g.stroke();
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const tab = new THREE.Group(); tab.position.set(2.7, 0, 0.4); tab.rotation.y = -2.5; scena.add(tab);
      const plansza = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })); plansza.position.y = 1.55; tab.add(plansza);
      const rama = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.98, 0.03), new THREE.MeshStandardMaterial({ color: 0xcfd4da, roughness: 0.4, metalness: 0.4 })); rama.position.set(0, 1.55, -0.02); tab.add(rama);
      const noga = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6), mKorek); noga.position.y = 0.55; tab.add(noga);
      kopany = bidon(); kopany.position.set(0.5, 0.1, 0.2); scena.add(kopany);
      // skrzynka z bidonami pod tablicą
      const skrz = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.35), new THREE.MeshStandardMaterial({ color: kit.baza, roughness: 0.6 })); skrz.position.set(-2.6, 0.125, 0.5); scena.add(skrz);
      for (let j = 0; j < 4; j++) { const b = bidon(); b.position.set(-2.75 + (j % 2) * 0.3, 0.35, 0.42 + Math.floor(j / 2) * 0.16); scena.add(b); }
    }
    const cam = new THREE.PerspectiveCamera(48, W() / H(), 0.1, 60);
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scena, cam)); composer.addPass(new OutputPass());
    if (lekka) { renderer.shadowMap.enabled = false; uproscMaterialy(scena); }
    let t = 0, ost = performance.now(), raf = 0, emo = 0;
    const camPoz = new THREE.Vector3(0, 2.6, 4.2), camCel = new THREE.Vector3(0, 1, -1.2), tmpV = new THREE.Vector3();
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dt = Math.min(0.05, (n - ost) / 1000); ost = n; t += dt;
      const { nastroj: e, mowi: m, mowiId } = stan.current;
      // przebieranie: zawodnik wstaje, zmienia koszulkę i siada
      for (const v of mapa.values()) if (v.dres && v.dres.g.visible && t > v.kiedy) {
        const dt2 = t - v.kiedy; v.dres.g.position.y = Math.min(0.4, dt2 * 1.2) - 0.1; v.dres.uda.forEach((u) => (u.rotation.x = -1.45 + Math.min(1.4, dt2 * 3)));
        v.dres.ramiona.forEach((r) => (r.rotation.x = -2.8)); if (dt2 > 0.9) { v.dres.g.visible = false; v.p.g.visible = true; }
      }
      emo += (e - emo) * Math.min(1, dt * 1.5);
      if (przerwa) { klatkaPrzerwy(dt); return; }
      const mowiacy = mowiId ? mapa.get(mowiId) : undefined;
      postacie.forEach((p, i) => {
        if (mowiacy && (mowiacy.p === p || mowiacy.dres === p)) { minka(p, Math.max(0.2, emo), t + i, true); p.tulow.rotation.x = -0.05; p.ramiona[0].rotation.x = -1.0 - Math.abs(Math.sin(t * 4)) * 0.6; p.ramiona[1].rotation.x = -0.5; return; }
        if (p.g.visible && mapa.size && [...mapa.values()].some((v) => v.dres === p && t > v.kiedy)) return;
        minka(p, emo + Math.sin(i * 7.1) * 0.15, t + i);
        // zwieszone głowy przy złym nastroju, kiwanie przy dobrym
        p.tulow.rotation.x = emo < -0.2 ? 0.35 : 0.06 + (emo > 0.3 ? Math.abs(Math.sin(t * 2.5 + i)) * 0.08 : 0);
        p.ramiona[0].rotation.x = p.ramiona[1].rotation.x = emo > 0.5 ? -2.6 + Math.sin(t * 6 + i) * 0.2 : -0.6;
      });
      // trener chodzi i gestykuluje
      trener.g.position.x = Math.sin(t * 0.5) * 1.2;
      trener.g.rotation.y = Math.PI + Math.sin(t * 0.5) * 0.6;
      minka(trener, m ? (e >= 0 ? 0.3 : -0.6) : 0, t, m);
      trener.ramiona[0].rotation.x = m ? -1.2 - Math.abs(Math.sin(t * 4)) * 0.8 : -0.3; trener.ramiona[1].rotation.x = m ? -0.9 - Math.abs(Math.sin(t * 3 + 1)) * 0.6 : -0.3;
      trener.uda[0].rotation.x = Math.sin(t * 2) * 0.25; trener.uda[1].rotation.x = -Math.sin(t * 2) * 0.25;
      if (mowiacy && (mowiacy.p.g.visible ? mowiacy.p : mowiacy.dres ?? mowiacy.p)) { const g = (mowiacy.p.g.visible ? mowiacy.p : mowiacy.dres ?? mowiacy.p).g; camCel.lerp(tmpV.set(g.position.x, 1.0, g.position.z), Math.min(1, dt * 2)); camPoz.lerp(tmpV.set(g.position.x * 0.5, 2.0, g.position.z + 3.6), Math.min(1, dt * 1.5)); }
      else { camCel.lerp(tmpV.set(0, 1.0, -1.2), Math.min(1, dt * 2)); camPoz.lerp(tmpV.set(Math.sin(t * 0.12) * 1.2, 2.6, 4.2), Math.min(1, dt * 1.5)); }
      cam.position.copy(camPoz); cam.lookAt(camCel);
      if (lekka) renderer.render(scena, cam); else composer.render(dt);
    };
    // ——— przerwa: zmęczenie, mowa trenera i reakcje drużyny ———
    let ostMowa: Mowa | null | undefined = null, t0 = 0, trX = 0, trRy = Math.PI;
    const klatkaPrzerwy = (dt: number) => {
      const { mowa, mowi } = stan.current;
      if (mowa !== ostMowa) { ostMowa = mowa; t0 = t; }
      const tm = mowa ? t - t0 : 0;
      const mowiTr = mowa ? tm < CZAS_MOWY : mowi;
      const r = mowa ? smooth(0.8, 2.6, tm) : 0; // siła reakcji drużyny
      const trafila = emo >= 0;
      // —— zawodnicy
      postacie.forEach((p, i) => {
        const v = rekw.get(p) ?? { bidon: false, recznik: false };
        const [r1, r2] = p.ramiona;
        const oddech = Math.sin(t * 3.4 + i * 1.3);
        // baza: zmęczenie — pochyleni, łokcie na kolanach, ciężki oddech, co chwilę łyk wody / ocieranie twarzy
        let pochyl = 0.32 + oddech * 0.035, a1 = -0.95, a2 = -0.95, z1 = 0.25, z2 = -0.25, twarz = -0.2, wstan = 0, patrz = 0.6, mow = false;
        const cykl = (t + i * 2.7) % 9;
        if (!mowa || r < 0.5) {
          if (v.bidon && cykl < 1.6) { const k = Math.sin((cykl / 1.6) * Math.PI); a2 = -0.95 - k * 1.9; z2 = -0.25 - k * 0.35; pochyl -= k * 0.45; }
          else if (v.recznik && cykl > 4 && cykl < 5.2) { const k = Math.sin(((cykl - 4) / 1.2) * Math.PI); a1 = -0.95 - k * 1.8; z1 = 0.25 + k * 0.5; pochyl -= k * 0.15; }
        }
        if (mowa) {
          // reakcje na mowę (płynnie od zmęczenia)
          let p1 = pochyl, b1 = a1, b2 = a2, y1 = z1, y2 = z2, tw = twarz, ws = 0, pt = patrz;
          if (mowa === "ochrzan") {
            const otrzezwienie = trafila ? smooth(CZAS_MOWY + 0.5, CZAS_MOWY + 2.5, tm) : 0; // ochrzan zadziałał → podnoszą głowy, zaciskają pięści
            p1 = 0.62 - otrzezwienie * 0.6; b1 = b2 = -0.45 - otrzezwienie * 0.3; y1 = 0.12; y2 = -0.12; tw = -0.75 + otrzezwienie * 0.3; pt = otrzezwienie * 0.8;
            if (otrzezwienie > 0.5 && i % 3 === 0) { b1 = -2.4 + Math.sin(t * 7 + i) * 0.25; y1 = 0.1; }
            if (!trafila && i % 4 === 1) p.tulow.rotation.y = Math.sin(t * 5 + i) * 0.25; // kręci głową
          } else if (mowa === "wiara") {
            const sila = trafila ? 1 : 0.45;
            p1 = 0.02; tw = 0.75 * sila; pt = 0.9;
            if (i % 3 === 0) { b1 = b2 = -1.35; y1 = 0.55 + Math.sin(t * 13 + i) * 0.35; y2 = -y1; } // klaszcze
            else { b1 = -2.7 + Math.sin(t * 7 + i) * 0.3 * sila; b2 = i % 2 ? -1.0 : -2.6 + Math.cos(t * 7 + i) * 0.3; y1 = 0.15; y2 = -0.15; } // pięści w górę
            ws = trafila && i % 2 === 0 ? smooth(CZAS_MOWY - 1.2, CZAS_MOWY + 0.3, tm) : 0; mow = trafila && i % 2 === 0 && tm > CZAS_MOWY; // wstają i krzyczą
          } else if (mowa === "pochwala") {
            const sila = trafila ? 1 : 0.35;
            p1 = 0.12 - sila * 0.1 + Math.abs(Math.sin(t * 2.6 + i)) * 0.08 * sila; tw = 0.75 * sila; pt = 0.8;
            if (i % 3 === 0 && sila > 0.5) { b1 = b2 = -1.3; y1 = 0.5 + Math.sin(t * 11 + i) * 0.35; y2 = -y1; } // oklaski
            else if (i % 3 === 1 && sila > 0.5) { b2 = -1.7; y2 = -0.1; } // kciuk w górę
          } else { // spokój: wyprostowani, słuchają, kiwają głowami
            p1 = 0.08 + Math.max(0, Math.sin(t * 1.8 + i * 0.7)) * 0.1; tw = trafila ? 0.15 : -0.05; pt = 1; b1 = b2 = -0.9;
          }
          const L = (a: number, b: number) => a + (b - a) * r;
          pochyl = L(pochyl, p1); a1 = L(a1, b1); a2 = L(a2, b2); z1 = L(z1, y1); z2 = L(z2, y2); twarz = L(twarz, tw); patrz = L(patrz, pt); wstan = ws;
        }
        minka(p, twarz + Math.sin(i * 7.1) * 0.08, t + i, mow);
        p.tulow.rotation.x = pochyl * (1 - wstan * 0.8);
        r1.rotation.x = a1; r2.rotation.x = a2; r1.rotation.z = z1; r2.rotation.z = z2;
        // patrzą na trenera
        if (!(mowa === "ochrzan" && !trafila && i % 4 === 1)) { const dx = trener.g.position.x - p.g.position.x, dz = trener.g.position.z - p.g.position.z; let k = Math.atan2(dx, dz) - p.g.rotation.y; k = Math.atan2(Math.sin(k), Math.cos(k)); p.tulow.rotation.y = Math.max(-0.7, Math.min(0.7, k)) * patrz; }
        // wstawanie z ławki (wiara)
        const sd = p.g.userData.sad ?? (p.g.userData.sad = { y: p.g.position.y, z: p.g.position.z, x: p.g.position.x });
        p.uda.forEach((u) => (u.rotation.x = -1.45 * (1 - wstan))); p.lydki.forEach((l) => (l.rotation.x = 1.45 * (1 - wstan)));
        p.g.position.y = sd.y + wstan * (0.1 + Math.abs(Math.sin(t * 6 + i)) * 0.08 * (tm > CZAS_MOWY + 0.5 ? 1 : 0));
        p.g.position.x = sd.x + Math.sin(p.g.rotation.y) * wstan * 0.35; p.g.position.z = sd.z + Math.cos(p.g.rotation.y) * wstan * 0.35;
      });
      // —— trener
      const [t1, t2] = trener.ramiona;
      let cel = Math.sin(t * 0.45) * 1.1, emoT = -0.1, kroki = 0.6, celRy = Math.PI;
      t1.rotation.z = 0; t2.rotation.z = 0;
      if (!mowa) { // namysł: ręce skrzyżowane, przechadza się
        t1.rotation.x = -1.25; t2.rotation.x = -1.15; t1.rotation.z = 0.75; t2.rotation.z = -0.75; emoT = -0.15 + (mowi ? 0.1 : 0);
        celRy = Math.PI + Math.sin(t * 0.45) * 0.5;
      } else {
        const gest = tm < CZAS_MOWY ? 1 : 0.35; // po mowie spokojniej
        if (mowa === "pochwala") { cel = Math.sin(t * 0.4) * 0.6; t1.rotation.x = t2.rotation.x = -1.3; const k = Math.sin(t * 10) * 0.4 * gest; t1.rotation.z = 0.55 + k; t2.rotation.z = -0.55 - k; emoT = 0.85; kroki = 0.3; }
        else if (mowa === "spokoj") { cel = tm < 2.4 ? 0.2 : 1.7; celRy = tm < 2.4 ? Math.PI : Math.PI - 0.9; t1.rotation.x = -1.05 - Math.sin(t * 2.2) * 0.2 * gest; t2.rotation.x = tm > 2.4 && tm < CZAS_MOWY + 1 ? -1.9 : -1.05 - Math.sin(t * 2.2 + 0.5) * 0.2 * gest; t2.rotation.z = tm > 2.4 ? 0.5 : 0; emoT = 0.15; kroki = 0.2; }
        else if (mowa === "wiara") { cel = Math.sin(t * 0.9) * 0.9; t1.rotation.x = -2.9 + Math.sin(t * 8) * 0.35 * gest; t2.rotation.x = -1.6 - Math.abs(Math.sin(t * 8 + 1)) * 0.9 * gest; emoT = 0.9; kroki = 1.6; trener.g.position.y = Math.abs(Math.sin(t * 8)) * 0.06 * gest; }
        else { // ochrzan: wskazuje palcem, chodzi szybko, kopie bidon
          cel = Math.sin(t * 1.1) * 1.4; celRy = Math.PI + Math.sin(t * 1.6) * 0.8 * gest; t1.rotation.x = -1.65 + Math.sin(t * 9) * 0.15 * gest; t2.rotation.x = -0.5 - Math.abs(Math.sin(t * 5)) * 1.2 * gest; emoT = -1; kroki = 1.4;
          if (kopany && !kopniety && tm > 1.1) { kopniety = true; kopV.set((kopany.position.x - trener.g.position.x) > 0 ? 3 : -3, 3.2, -2.2); }
        }
      }
      if (mowa && tm > CZAS_MOWY + 0.6) cel = 1.9 + Math.sin(t * 0.4) * 0.3; // po mowie trener odchodzi pod tablicę — widać reakcje drużyny
      trX += (cel - trX) * Math.min(1, dt * 1.6);
      const krok = Math.abs(cel - trX) > 0.05 ? 1 : 0.25;
      trener.g.position.x = trX; trRy += (celRy - trRy) * Math.min(1, dt * 3); trener.g.rotation.y = trRy;
      trener.uda[0].rotation.x = Math.sin(t * 5) * 0.3 * krok * kroki; trener.uda[1].rotation.x = -trener.uda[0].rotation.x;
      if (mowa === "ochrzan" && kopany && tm > 0.8 && tm < 1.3) trener.uda[1].rotation.x = -1.1 * Math.sin(((tm - 0.8) / 0.5) * Math.PI); // kopnięcie
      minka(trener, emoT, t, mowiTr);
      if (kopany && kopniety) { kopany.position.addScaledVector(kopV, dt); kopV.y -= 9.8 * dt; kopany.rotation.z += dt * 14; if (kopany.position.y < 0.05) { kopany.position.y = 0.05; kopV.multiplyScalar(0.45); kopV.y = Math.abs(kopV.y) > 0.4 ? -kopV.y : 0; } if (Math.abs(kopany.position.x) > 5) kopV.x = -kopV.x * 0.5; if (kopany.position.z < -3) kopV.z = Math.abs(kopV.z) * 0.4; }
      // —— kamera: w trakcie mowy na trenera (zza pleców zawodników), potem reakcje drużyny
      if (mowa && tm < CZAS_MOWY) { camCel.lerp(tmpV.set(trX, 1.35, 0.6), Math.min(1, dt * 2.5)); camPoz.lerp(tmpV.set(trX * 0.4 - 1.1, 1.75, -2.0), Math.min(1, dt * 1.8)); }
      else if (mowa) { camCel.lerp(tmpV.set(0, 0.95, -2.4), Math.min(1, dt * 1.5)); camPoz.lerp(tmpV.set(-0.6 + Math.sin(t * 0.25) * 1.2, 2.0, 1.9), Math.min(1, dt * 1.2)); }
      else { camCel.lerp(tmpV.set(0, 0.9, -1.8), Math.min(1, dt * 2)); camPoz.lerp(tmpV.set(Math.sin(t * 0.12) * 1.4, 2.9, 4.1), Math.min(1, dt * 1.5)); }
      cam.position.copy(camPoz); cam.lookAt(camCel);
      if (lekka) renderer.render(scena, cam); else composer.render(dt);
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); scena.clear(); };
  }, [klub.id]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: "#1b1f24", borderRadius: 12, overflow: "hidden" }} />;
}
