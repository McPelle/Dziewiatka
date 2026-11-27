// Baza treningowa 3D: boiska (naturalne / sztuczne), budynek szatni, siłownia, maszty oświetleniowe, boisko akademii,
// hala pneumatyczna — wszystko rośnie razem z poziomem obiektu „Boiska treningowe” (obiekty.baza) i akademii.
// Low-poly: wspólne materiały i geometrie, drzewa i zawodnicy jako instancje, rysowanie tylko gdy widok jest na ekranie.
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import * as THREE from "three";
import type { Klub, StanGry } from "../../engine/types";
import { barwyKlubu } from "../../data/barwy";
import { bramka, uproscMaterialy } from "./stadion3d";
import { lekkaGrafika } from "./Stadion3DWidok";
import { K, st } from "../styl";

/** Co stoi w bazie przy danym poziomie (opis do legendy i do sceny). */
export function elementyBazy(klub: Klub) {
  const b = Math.max(0, Math.min(5, klub.obiekty.baza ?? 0));
  const a = Math.max(1, Math.min(5, klub.akademia ?? 1));
  return {
    poziom: b, akademia: a,
    boiska: [
      { nazwa: b >= 1 ? "Boisko główne (trawa naturalna)" : "Boisko gminne (wytarta trawa)", jest: true, swiatla: b >= 2 },
      { nazwa: "Boisko ze sztuczną nawierzchnią", jest: b >= 2, swiatla: b >= 3 },
      { nazwa: "Drugie boisko z naturalną trawą", jest: b >= 4, swiatla: b >= 5 },
      { nazwa: "Boisko akademii", jest: a >= 2, swiatla: a >= 4 },
    ],
    szatnia: b >= 4 ? "Budynek klubowy (szatnie, odnowa, biura)" : b >= 1 ? "Parterowy budynek szatni" : "Kontener-szatnia",
    silownia: b >= 3, hala: b >= 5, internat: a >= 3, orlik: a >= 5, parking: b >= 1,
  };
}

const ZIELEN = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 1 });

/** Tekstura linii boiska (szablon na kanwie, wspólny dla boisk tego samego rodzaju). */
function teksturaBoiska(rodzaj: "trawa" | "sztuczna" | "wytarta", dl: number, sz: number) {
  const c = document.createElement("canvas"); c.width = 512; c.height = Math.round(512 * sz / dl); const g = c.getContext("2d")!;
  const [a, b] = rodzaj === "sztuczna" ? ["#2c8a4c", "#2c8a4c"] : rodzaj === "wytarta" ? ["#5f8a3a", "#6a9140"] : ["#3c9a40", "#348c39"];
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect((i * c.width) / 12, 0, c.width / 12 + 1, c.height); }
  if (rodzaj === "wytarta") for (const [x, y, r] of [[0.08, 0.5, 0.12], [0.92, 0.5, 0.12], [0.5, 0.5, 0.1]]) { const gr = g.createRadialGradient(x * c.width, y * c.height, 2, x * c.width, y * c.height, r * c.width); gr.addColorStop(0, "rgba(130,100,60,0.85)"); gr.addColorStop(1, "rgba(130,100,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); }
  const sx = c.width / dl, sy = c.height / sz;
  g.strokeStyle = rodzaj === "wytarta" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.9)"; g.lineWidth = 2;
  g.strokeRect(2, 2, c.width - 4, c.height - 4);
  g.beginPath(); g.moveTo(c.width / 2, 2); g.lineTo(c.width / 2, c.height - 2); g.stroke();
  g.beginPath(); g.ellipse(c.width / 2, c.height / 2, 9.15 * sx, 9.15 * sy, 0, 0, Math.PI * 2); g.stroke();
  const pk = Math.min(16.5, dl * 0.16), pw = Math.min(40.3, sz * 0.6);
  for (const x0 of [2, c.width - 2]) { const k = x0 < 10 ? 1 : -1; g.strokeRect(Math.min(x0, x0 + k * pk * sx), c.height / 2 - (pw / 2) * sy, pk * sx, pw * sy); }
  if (rodzaj === "sztuczna") { g.strokeStyle = "rgba(255,220,80,0.7)"; g.lineWidth = 1.5; for (const f of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(2, c.height * f); g.lineTo(c.width - 2, c.height * f); g.stroke(); } } // linie małych gier
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function BazaTreningowa3D({ s, klub, wysokosc }: { s: StanGry | null; klub: Klub; wysokosc?: number }) {
  const host = useRef<any>(null);
  const [awaria, setAwaria] = useState(false);
  const e = elementyBazy(klub);
  const wBudowie = !!s && s.mojKlub === klub.id && (s.budowy ?? []).some((b) => b.cel.rodzaj === "obiekt" && b.cel.typ === "baza");
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    const lekka = lekkaGrafika();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !lekka }); } catch { setAwaria(true); return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 260;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : 1.75)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = !lekka; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", touchAction: "none" });
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene();
    const godz = new Date().getHours(), noc = godz >= 19 || godz < 6;
    scena.background = new THREE.Color(noc ? 0x0e1630 : 0x9cc6ee); scena.fog = new THREE.Fog(scena.background as THREE.Color, 260, 620);
    scena.add(new THREE.HemisphereLight(noc ? 0x6b7aa8 : 0xe6f2ff, noc ? 0x1a2a1a : 0x4a5a35, noc ? 0.5 : 0.95));
    const slonce = new THREE.DirectionalLight(noc ? 0x8899cc : 0xfff2dd, noc ? 0.35 : 2.2); slonce.position.set(-90, 140, 70);
    if (!lekka) { slonce.castShadow = true; slonce.shadow.mapSize.set(1024, 1024); Object.assign(slonce.shadow.camera, { left: -170, right: 170, top: 150, bottom: -150, far: 400 }); slonce.shadow.bias = -0.0008; }
    scena.add(slonce);
    const grupa = new THREE.Group(); scena.add(grupa);
    const [kol1, kol2] = barwyKlubu(klub.nazwa);
    // ——— wspólne materiały ———
    const M = {
      teren: ZIELEN("#6f8f4a"), asfalt: new THREE.MeshStandardMaterial({ color: 0x4a4d52, roughness: 0.95 }), chodnik: new THREE.MeshStandardMaterial({ color: 0xb9b4aa, roughness: 0.95 }),
      sciana: new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.9 }), dach: new THREE.MeshStandardMaterial({ color: 0x3b4048, roughness: 0.7 }),
      klub: new THREE.MeshStandardMaterial({ color: kol1, roughness: 0.7 }), klub2: new THREE.MeshStandardMaterial({ color: kol2, roughness: 0.7 }),
      szyba: new THREE.MeshStandardMaterial({ color: 0x8fb6cf, roughness: 0.15, metalness: 0.6, emissive: noc ? 0xffd890 : 0x000000, emissiveIntensity: noc ? 0.6 : 0 }),
      stal: new THREE.MeshStandardMaterial({ color: 0xa9adb3, roughness: 0.5, metalness: 0.6 }), siatka: new THREE.MeshStandardMaterial({ color: 0x2b3a2b, roughness: 0.9, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }),
      lampa: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6d8, emissiveIntensity: noc ? 2.5 : 0.25 }),
      kontener: new THREE.MeshStandardMaterial({ color: 0x4f7a5a, roughness: 0.8, metalness: 0.2 }), hala: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.6, side: THREE.DoubleSide }),
      drzewo: ZIELEN("#3f6b35"), pien: new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 }), budowa: new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.7 }), ziemia: ZIELEN("#7d6646"),
      pacholek: new THREE.MeshStandardMaterial({ color: 0xff7a00, roughness: 0.6 }),
    };
    const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, cien = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = cien; o.receiveShadow = true; grupa.add(o); return o; };
    // teren, drogi, chodniki
    const teren = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), M.teren); teren.rotation.x = -Math.PI / 2; teren.receiveShadow = true; grupa.add(teren);
    const plaski = (w: number, d: number, m: THREE.Material, x: number, z: number, y = 0.05) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); o.rotation.x = -Math.PI / 2; o.position.set(x, y, z); o.receiveShadow = true; grupa.add(o); return o; };
    plaski(8, 300, e.poziom >= 1 ? M.chodnik : M.ziemia, 0, 0, 0.04); // aleja środkiem bazy
    plaski(300, 9, M.asfalt, 0, -102, 0.04); // droga dojazdowa
    // ——— boiska ———
    const tex: Record<string, THREE.CanvasTexture> = {};
    const matBoiska = (r: "trawa" | "sztuczna" | "wytarta", dl: number, sz: number) => { const k = `${r}${dl}`; tex[k] ??= teksturaBoiska(r, dl, sz); return new THREE.MeshStandardMaterial({ map: tex[k], roughness: r === "sztuczna" ? 0.6 : 0.95 }); };
    const maszt = (x: number, z: number) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 22, 6), M.stal); s.position.set(x, 11, z); s.castShadow = true; grupa.add(s);
      const l = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.6), M.lampa); l.position.set(x, 22.5, z); l.lookAt(x * 0.2, 0, z * 0.2); grupa.add(l);
      if (noc && !lekka) { const sp = new THREE.SpotLight(0xfff3d6, 900, 140, 0.8, 0.6, 1.6); sp.position.set(x, 22, z); sp.target.position.set(x * 0.25, 0, z * 0.25); grupa.add(sp, sp.target); }
    };
    const boisko = (x: number, z: number, dl: number, sz: number, r: "trawa" | "sztuczna" | "wytarta", o: { swiatla?: boolean; plot?: boolean; pilkochwyty?: boolean; male?: boolean }) => {
      if (r === "sztuczna") plaski(dl + 8, sz + 8, M.chodnik, x, z, 0.03); // opaska wokół sztucznej murawy
      plaski(dl, sz, matBoiska(r, dl, sz), x, z, 0.08);
      for (const k of [-1, 1] as const) {
        const b = bramka(k, false); b.position.set(x + k * dl / 2, 0, z); if (o.male) b.scale.set(0.7, 0.8, 0.68); grupa.add(b);
        if (o.pilkochwyty) { const n = new THREE.Mesh(new THREE.PlaneGeometry(sz * 0.7, 6), M.siatka); n.position.set(x + k * (dl / 2 + 4), 3, z); n.rotation.y = Math.PI / 2; grupa.add(n); for (const zz of [-sz * 0.35, sz * 0.35]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6, 5), M.stal); p.position.set(x + k * (dl / 2 + 4), 3, z + zz); grupa.add(p); } }
      }
      if (o.plot) { // niski płotek (barierka) wokół
        const h = 1.1;
        for (const [w, d, px, pz] of [[dl + 8, 0.08, x, z - sz / 2 - 4], [dl + 8, 0.08, x, z + sz / 2 + 4], [0.08, sz + 8, x - dl / 2 - 4, z], [0.08, sz + 8, x + dl / 2 + 4, z]] as [number, number, number, number][]) box(w, 0.08, d, M.stal, px, h, pz, false);
      }
      if (o.swiatla) for (const sx of [-1, 1]) for (const sz2 of [-1, 1]) maszt(x + sx * (dl / 2 + 5), z + sz2 * (sz / 2 + 5));
      // ławki rezerwowych
      for (const k of [-1, 1]) { box(5, 2, 1.4, M.siatka, x + k * 9, 1, z - sz / 2 - 2.5, false); box(5, 0.5, 0.6, M.klub, x + k * 9, 0.4, z - sz / 2 - 2.3, false); }
    };
    const b = e.poziom, a = e.akademia;
    // A — główne boisko treningowe
    boisko(-64, -42, 100, 64, b >= 1 ? "trawa" : "wytarta", { swiatla: e.boiska[0].swiatla, plot: b >= 1, pilkochwyty: b >= 2 });
    // B — sztuczna nawierzchnia
    if (e.boiska[1].jest) boisko(64, -42, 100, 64, "sztuczna", { swiatla: e.boiska[1].swiatla, plot: true, pilkochwyty: true });
    // C — drugie naturalne
    if (e.boiska[2].jest) boisko(-64, 44, 100, 64, "trawa", { swiatla: e.boiska[2].swiatla, plot: true, pilkochwyty: true });
    // akademia (mniejsze boisko)
    if (e.boiska[3].jest) boisko(56, 40, 68, 44, "trawa", { swiatla: e.boiska[3].swiatla, plot: true, male: true, pilkochwyty: a >= 4 });
    if (e.orlik) { boisko(104, 40, 30, 20, "sztuczna", { plot: true, male: true }); const pl = new THREE.Mesh(new THREE.BoxGeometry(34, 4, 24), M.siatka); pl.position.set(104, 2, 40); grupa.add(pl); }
    // ——— budynki w środkowej alei ———
    const pasek = (w: number, d: number, x: number, y: number, z: number) => box(w + 0.1, 0.7, d + 0.1, M.klub, x, y, z, false);
    const okna = (w: number, x: number, y: number, z: number, n: number) => { for (let i = 0; i < n; i++) box(w / n * 0.6, 1.3, 0.1, M.szyba, x - w / 2 + (i + 0.5) * (w / n), y, z, false); };
    if (b === 0) { box(6, 2.6, 2.6, M.kontener, 0, 1.3, -60); box(6, 2.6, 2.6, M.kontener, 0, 1.3, -56.6); }
    else if (b < 4) { box(14, 3.6, 9, M.sciana, 0, 1.8, -58); box(14.6, 0.4, 9.6, M.dach, 0, 3.8, -58, false); pasek(14, 9, 0, 3.2, -58); okna(14, 0, 2.1, -53.45, 4); }
    else { box(18, 7.2, 12, M.sciana, 0, 3.6, -58); box(18.6, 0.5, 12.6, M.dach, 0, 7.45, -58, false); pasek(18, 12, 0, 6.6, -58); okna(18, 0, 2.2, -51.95, 6); okna(18, 0, 5.2, -51.95, 6); box(3, 3, 0.2, M.szyba, 0, 1.5, -51.9, false);
      const herb = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), M.klub2); herb.position.set(0, 5.2, -51.85); grupa.add(herb); }
    if (e.silownia) { // siłownia: przeszklona hala ze sprzętem
      box(16, 6, 22, M.sciana, 0, 3, -18); box(16.6, 0.5, 22.6, M.dach, 0, 6.2, -18, false); box(0.12, 4, 18, M.szyba, 8.02, 3, -18, false); box(0.12, 4, 18, M.szyba, -8.02, 3, -18, false); pasek(16, 22, 0, 5.4, -18);
    }
    if (e.internat) { box(16, 9, 12, M.sciana, 0, 4.5, 30); box(16.6, 0.5, 12.6, M.dach, 0, 9.25, 30, false); pasek(16, 12, 0, 8.6, 30); for (const y of [2.2, 5, 7.6]) okna(16, 0, y, 36.05, 5); }
    if (e.hala) { // hala pneumatyczna (balon) nad boiskiem do gry zimą
      const g = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 56, 16, 1, true, 0, Math.PI), M.hala); g.rotation.set(0, 0, Math.PI / 2); g.position.set(-64, 0, 118); g.scale.set(1, 1, 0.55); g.castShadow = true; grupa.add(g);
      for (const k of [-1, 1]) { const c = new THREE.Mesh(new THREE.CircleGeometry(22, 16, 0, Math.PI), M.hala); c.position.set(-64 + k * 28, 0, 118); c.rotation.y = Math.PI / 2; c.scale.set(0.55, 1, 1); grupa.add(c); }
      plaski(60, 6, M.chodnik, -64, 92, 0.04);
    }
    if (e.parking) { const n = 6 + b * 6; plaski(n * 3 + 6, 16, M.asfalt, 30, -82, 0.05);
      const auta = new THREE.InstancedMesh(new THREE.BoxGeometry(1.9, 1.4, 4.3), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.4 }), n);
      const mx = new THREE.Matrix4(), kolory = [0x2d3e50, 0xc0392b, 0xecf0f1, 0x7f8c8d, 0x1b4f72, 0x111111];
      for (let i = 0; i < n; i++) { mx.makeTranslation(30 - (n * 3) / 2 + i * 3 + 1.5, 0.75, -82 + (i % 2 ? 4 : -4)); auta.setMatrixAt(i, mx); auta.setColorAt(i, new THREE.Color(kolory[(i * 7) % kolory.length])); }
      auta.castShadow = true; grupa.add(auta); }
    // brama wjazdowa z barwami klubu
    if (b >= 1) { for (const k of [-1, 1]) box(0.6, 5, 0.6, M.klub, k * 6, 2.5, -96); box(12.6, 1.2, 0.5, M.klub2, 0, 5.2, -96, false); }
    // ——— trening na głównym boisku: zawodnicy (instancje) i pachołki ———
    const LZ = 12;
    const ciala = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.35, 1.0, 2, 6), new THREE.MeshStandardMaterial({ color: kol1, roughness: 0.8 }), LZ);
    const glowy = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 6, 5), new THREE.MeshStandardMaterial({ color: 0xe0b48c, roughness: 0.8 }), LZ);
    ciala.castShadow = true; grupa.add(ciala, glowy);
    const pach = new THREE.InstancedMesh(new THREE.ConeGeometry(0.3, 0.6, 5), M.pacholek, 10);
    { const mx = new THREE.Matrix4(); for (let i = 0; i < 10; i++) { mx.makeTranslation(-64 - 20 + i * 4, 0.3, -42 + (i % 2 ? 3 : -3)); pach.setMatrixAt(i, mx); } grupa.add(pach); }
    // ——— drzewa wokół (instancje) ———
    const ND = lekka ? 40 : 70;
    const korony = new THREE.InstancedMesh(new THREE.ConeGeometry(3.2, 9, 6), M.drzewo, ND), pnie = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.4, 0.5, 2.4, 5), M.pien, ND);
    { const mx = new THREE.Matrix4(); let h = 7; const los = () => ((h = (h * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < ND; i++) { const k = (i / ND) * Math.PI * 2 + los() * 0.05, rx = 175 + los() * 25, rz = 140 + los() * 20; const x = Math.cos(k) * rx, z = Math.sin(k) * rz, sk = 0.8 + los() * 0.6;
        mx.makeScale(sk, sk, sk).setPosition(x, 4.5 * sk + 2.2, z); korony.setMatrixAt(i, mx); mx.makeTranslation(x, 1.2, z); pnie.setMatrixAt(i, mx); } }
    korony.castShadow = true; grupa.add(korony, pnie);
    // ——— plac budowy (trwa rozbudowa bazy): ogrodzenie, ziemia, dźwig ———
    let dzwig: THREE.Object3D | null = null;
    if (wBudowie) {
      // gdzie powstaje kolejny element: 1 — budynek szatni, 2 — sztuczne boisko, 3 — siłownia, 4 — drugie boisko, 5 — hala
      const miejsca: [number, number, number, number][] = [[0, -58, 22, 16], [64, -42, 106, 70], [0, -18, 20, 26], [-64, 44, 106, 70], [-64, 118, 62, 48]];
      const [x, z, w0, d0] = miejsca[Math.min(4, b)];
      plaski(w0, d0, M.ziemia, x, z, 0.12);
      for (const [w, d, px, pz] of [[w0, 0.2, x, z - d0 / 2], [w0, 0.2, x, z + d0 / 2], [0.2, d0, x - w0 / 2, z], [0.2, d0, x + w0 / 2, z]] as [number, number, number, number][]) box(w, 1.6, d, M.budowa, px, 0.8, pz, false);
      dzwig = new THREE.Group(); dzwig.position.set(x + w0 / 2 - 4, 0, z); grupa.add(dzwig);
      const wieza = new THREE.Mesh(new THREE.BoxGeometry(1.2, 28, 1.2), M.budowa); wieza.position.y = 14; dzwig.add(wieza);
      const ramie = new THREE.Mesh(new THREE.BoxGeometry(26, 1, 1), M.budowa); ramie.position.set(-8, 28, 0); dzwig.add(ramie);
      const lina = new THREE.Mesh(new THREE.BoxGeometry(0.1, 14, 0.1), M.stal); lina.position.set(-16, 21, 0); dzwig.add(lina);
    }
    if (lekka) uproscMaterialy(grupa);
    // kadr dopasowany do tego, co już stoi (mała baza — kamera bliżej)
    const zakres = new THREE.Box3();
    for (const [x, z, w, d, jest] of [[-64, -42, 110, 74, true], [0, -58, 20, 14, true], [64, -42, 110, 74, e.boiska[1].jest || wBudowie], [-64, 44, 110, 74, e.boiska[2].jest], [56, 40, 76, 52, e.boiska[3].jest], [104, 40, 34, 24, e.orlik], [0, -18, 18, 24, e.silownia], [0, 30, 18, 14, e.internat], [-64, 118, 60, 46, e.hala]] as [number, number, number, number, boolean][])
      if (jest) zakres.union(new THREE.Box3(new THREE.Vector3(x - w / 2, 0, z - d / 2), new THREE.Vector3(x + w / 2, 10, z + d / 2)));
    const srodek = zakres.getCenter(new THREE.Vector3()).setY(0), rozm = zakres.getSize(new THREE.Vector3()), promien = Math.max(rozm.x, rozm.z) * 0.68 + 35;
    // ——— kamera: obracanie palcem, powolny obrót ———
    const cam = new THREE.PerspectiveCamera(42, W() / H(), 1, 900);
    let kat = 0.9, wys = 0.75, przeciaganie = false, px = 0, py = 0, odl = 1;
    const dol = (ev: PointerEvent) => { przeciaganie = true; px = ev.clientX; py = ev.clientY; };
    const ruch = (ev: PointerEvent) => { if (!przeciaganie) return; kat -= (ev.clientX - px) * 0.008; wys = Math.max(0.25, Math.min(1.5, wys + (ev.clientY - py) * 0.005)); px = ev.clientX; py = ev.clientY; };
    const gora = () => { przeciaganie = false; };
    const kolko = (ev: WheelEvent) => { ev.preventDefault(); odl = Math.max(0.5, Math.min(1.4, odl * (ev.deltaY > 0 ? 1.08 : 0.93))); };
    renderer.domElement.addEventListener("pointerdown", dol); window.addEventListener("pointermove", ruch); window.addEventListener("pointerup", gora);
    renderer.domElement.addEventListener("wheel", kolko, { passive: false });
    // rysowanie tylko gdy widok jest widoczny (oszczędza baterię na telefonie)
    let widac = true;
    const obs = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((w) => { widac = w[0]?.isIntersecting ?? true; }) : null; obs?.observe(el);
    const mx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
    let raf = 0, ost = performance.now(), t = 0;
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dt = Math.min(0.05, (n - ost) / 1000); ost = n;
      if (!widac || document.hidden) return;
      t += dt;
      if (!przeciaganie) kat += dt * 0.06;
      const r = promien * odl;
      cam.position.set(srodek.x + Math.cos(kat) * r, 20 + wys * r * 0.55, srodek.z + Math.sin(kat) * r); cam.lookAt(srodek);
      // zawodnicy: rozgrzewka w kółku (trucht) na głównym boisku
      for (let i = 0; i < LZ; i++) { const k = t * 0.35 + (i / LZ) * Math.PI * 2, skok = Math.abs(Math.sin(t * 7 + i)) * 0.15;
        v.set(-64 + Math.cos(k) * 22, 0.85 + skok, -42 + Math.sin(k) * 14); q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, -k); mx.compose(v, q, sc); ciala.setMatrixAt(i, mx);
        v.y += 1.0; mx.compose(v, q, sc); glowy.setMatrixAt(i, mx); }
      ciala.instanceMatrix.needsUpdate = true; glowy.instanceMatrix.needsUpdate = true;
      if (dzwig) dzwig.rotation.y = Math.sin(t * 0.3) * 0.8;
      renderer.render(scena, cam);
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => {
      cancelAnimationFrame(raf); obs?.disconnect(); window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", ruch); window.removeEventListener("pointerup", gora);
      grupa.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); });
      Object.values(tex).forEach((x) => x.dispose()); Object.values(M).forEach((x) => x.dispose());
      renderer.dispose(); renderer.domElement.remove(); scena.clear();
    };
  }, [klub.id, e.poziom, e.akademia, wBudowie]);
  return (
    <View>
      {awaria ? <Text style={st.maly}>Grafika 3D niedostępna na tym urządzeniu.</Text>
        : <View ref={host} style={{ width: "100%", height: wysokosc ?? 280, borderRadius: 10, overflow: "hidden", backgroundColor: "#9cc6ee" }} />}
      <LegendaBazy klub={klub} wBudowie={wBudowie} />
    </View>
  );
}

/** Legenda: co już jest w bazie, a co przybędzie z rozbudową. */
export function LegendaBazy({ klub, wBudowie }: { klub: Klub; wBudowie?: boolean }) {
  const e = elementyBazy(klub);
  const poz: [string, boolean, string][] = [
    ...e.boiska.map((b, i): [string, boolean, string] => [`${b.nazwa}${b.jest && b.swiatla ? " + oświetlenie" : ""}`, b.jest, i === 3 ? "akademia poz. 2" : i === 1 ? "baza poz. 2" : i === 2 ? "baza poz. 4" : ""]),
    [e.szatnia, true, ""], ["Siłownia", e.silownia, "baza poz. 3"], ["Hala pneumatyczna (trening zimą)", e.hala, "baza poz. 5"],
    ["Internat akademii", e.internat, "akademia poz. 3"], ["Orlik akademii", e.orlik, "akademia poz. 5"],
  ];
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={st.maly}>Boiska treningowe: poziom {e.poziom}/5 · akademia: poziom {e.akademia}/5{wBudowie ? " · 🚧 trwa rozbudowa" : ""}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
        {poz.map(([n, jest, wym]) => (
          <Text key={n} style={[st.maly, { fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: jest ? K.akcent : K.linia, color: jest ? K.tekst : K.szary }]}>{jest ? "✓" : "🔒"} {n}{!jest && wym ? ` (${wym})` : ""}</Text>
        ))}
      </View>
    </View>
  );
}
