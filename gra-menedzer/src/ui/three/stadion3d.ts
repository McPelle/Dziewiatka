// Stadion 3D budowany z danych klubu (Three.js): murawa z pasami koszenia, linie, bramki z siatkami, trybuny wg pojemności
// (klasa B — ławeczka i barierki, Ekstraklasa — 4 trybuny + narożniki + drugi poziom), dach, maszty oświetleniowe,
// bandy reklamowe z nazwami sponsorów, tablica wyników, kibice (instancje), otoczenie miasto/wieś, place budowy.
import * as THREE from "three";
import type { Klub, StanGry } from "../../engine/types";
import type { Budowa } from "../../engine/budowy";
import { barwyKlubu } from "../../data/barwy";
import { podzialTrybun } from "../WidokStadionu";

export const DL = 105, SZ = 68; // wymiary boiska (m)
type Strona = "S" | "N" | "W" | "E";

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
const canvas = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

/** Tekstura murawy: pasy koszenia, delikatny szum trawy, wytarcia w polach karnych (zużycie w sezonie). */
function teksturaMurawy(sztuczna: boolean, zuzycie: number, snieg: boolean): THREE.CanvasTexture {
  const c = canvas(1024, 664), g = c.getContext("2d")!;
  const a = sztuczna ? "#2f8f45" : "#3a9a3f", b = sztuczna ? "#2a8340" : "#338a37";
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect((i * c.width) / 16, 0, c.width / 16 + 1, c.height); }
  const img = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) { const n = (Math.random() - 0.5) * 18; img.data[i] += n * 0.6; img.data[i + 1] += n; img.data[i + 2] += n * 0.4; }
  g.putImageData(img, 0, 0);
  // wytarcia (łysiny) w polach karnych i na środku — rosną z zużyciem
  if (!sztuczna && zuzycie > 0.05) {
    for (const [cx, cy, r] of [[60, 332, 90], [964, 332, 90], [512, 332, 70]] as [number, number, number][]) {
      const gr = g.createRadialGradient(cx, cy, 5, cx, cy, r);
      gr.addColorStop(0, `rgba(120,95,55,${Math.min(0.75, zuzycie)})`); gr.addColorStop(1, "rgba(120,95,55,0)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, r * 0.8, r * 1.2, 0, 0, Math.PI * 2); g.fill();
    }
  }
  if (snieg) { g.fillStyle = "rgba(245,248,255,0.55)"; g.fillRect(0, 0, c.width, c.height); }
  // linie boiska
  const sx = c.width / DL, sy = c.height / SZ, L = (x: number) => x * sx, T = (y: number) => y * sy;
  g.strokeStyle = snieg ? "#ff5a1f" : "rgba(255,255,255,0.92)"; g.lineWidth = 3.2;
  g.strokeRect(L(0.5), T(0.5), L(DL - 1), T(SZ - 1));
  g.beginPath(); g.moveTo(L(DL / 2), T(0.5)); g.lineTo(L(DL / 2), T(SZ - 0.5)); g.stroke();
  g.beginPath(); g.ellipse(L(DL / 2), T(SZ / 2), L(9.15), T(9.15), 0, 0, Math.PI * 2); g.stroke();
  for (const sxx of [0, 1]) {
    const x0 = sxx ? DL - 0.5 : 0.5, k = sxx ? -1 : 1;
    g.strokeRect(L(Math.min(x0, x0 + k * 16.5)), T(SZ / 2 - 20.16), L(16.5), T(40.32));
    g.strokeRect(L(Math.min(x0, x0 + k * 5.5)), T(SZ / 2 - 9.16), L(5.5), T(18.32));
    g.beginPath(); g.arc(L(x0 + k * 11), T(SZ / 2), 3, 0, Math.PI * 2); g.fillStyle = g.strokeStyle as string; g.fill();
    g.beginPath(); g.ellipse(L(x0 + k * 11), T(SZ / 2), L(9.15), T(9.15), 0, sxx ? Math.PI - 0.93 : -0.93, sxx ? Math.PI + 0.93 : 0.93); g.stroke();
  }
  g.beginPath(); g.arc(L(DL / 2), T(SZ / 2), 3, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Bramka z siatką (słupki 12 cm, 7,32 × 2,44 m). */
export function bramka(strona: -1 | 1, siatka: boolean): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2 });
  const r = 0.06, W = 7.32, H = 2.44, D = 2;
  const cyl = (len: number) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
  const s1 = cyl(H); s1.position.set(0, H / 2, -W / 2); const s2 = cyl(H); s2.position.set(0, H / 2, W / 2);
  const p = cyl(W); p.rotation.x = Math.PI / 2; p.position.set(0, H, 0);
  for (const m of [s1, s2, p]) { m.castShadow = true; g.add(m); }
  if (siatka) {
    const c = canvas(64, 64), x = c.getContext("2d")!; x.strokeStyle = "rgba(255,255,255,0.85)"; x.lineWidth = 2;
    for (let i = 0; i <= 64; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(64, i); x.stroke(); }
    const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const mk = (w: number, h: number, rx: number, ry: number) => { const t = tex.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }); };
    const tyl = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mk(W, H, 18, 6)); tyl.rotation.y = Math.PI / 2; tyl.position.set(D * strona, H / 2, 0); tyl.name = "siatka";
    const gora = new THREE.Mesh(new THREE.PlaneGeometry(D, W), mk(D, W, 5, 18)); gora.rotation.x = Math.PI / 2; gora.position.set((D / 2) * strona, H, 0);
    const b1 = new THREE.Mesh(new THREE.PlaneGeometry(D, H), mk(D, H, 5, 6)); b1.position.set((D / 2) * strona, H / 2, -W / 2);
    const b2 = b1.clone(); b2.position.z = W / 2;
    g.add(tyl, gora, b1, b2);
  }
  g.position.set((strona * DL) / 2, 0, 0);
  return g;
}

function bandy(sponsorzy: string[], led: boolean): THREE.Group {
  const g = new THREE.Group();
  const tex = (tekst: string, i: number) => {
    const c = canvas(512, 64), x = c.getContext("2d")!;
    const kol = led ? ["#0b1d4a", "#1a1a1a", "#7a0d10", "#0d4a22"][i % 4] : ["#f4f4f0", "#1e3d8f", "#c8102e", "#f2c230"][i % 4];
    x.fillStyle = kol; x.fillRect(0, 0, 512, 64);
    x.fillStyle = led ? "#ffffff" : (i % 4 === 0 || i % 4 === 3 ? "#111" : "#fff"); x.font = "bold 40px Arial"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(tekst.toUpperCase().slice(0, 22), 256, 34);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const lista = sponsorzy.length ? sponsorzy : ["Twoja reklama tutaj", "Sklep u Basi", "Auto-Serwis", "Piekarnia"];
  let i = 0;
  const segment = (x: number, z: number, rot: number, w: number) => {
    const mat = new THREE.MeshStandardMaterial({ map: tex(lista[i % lista.length], i), emissive: led ? new THREE.Color(0xffffff) : new THREE.Color(0), emissiveIntensity: led ? 0.35 : 0, emissiveMap: led ? undefined : undefined, roughness: 0.6 });
    if (led) mat.emissiveMap = mat.map;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.9, 0.15), mat); m.position.set(x, 0.45, z); m.rotation.y = rot; m.castShadow = true; g.add(m); i++;
  };
  const W = 10;
  for (let x = -DL / 2 + 5; x <= DL / 2 - 5; x += W) { segment(x, -SZ / 2 - 4, 0, W - 0.2); segment(x, SZ / 2 + 4, Math.PI, W - 0.2); }
  for (const sx of [-1, 1]) for (const z of [-24, -14, 14, 24]) segment(sx * (DL / 2 + 4.5), z, sx * Math.PI / 2, W - 0.2);
  return g;
}

export interface OpcjeStadionu { noc: boolean; snieg: boolean; deszcz: boolean; widzowie: number; budowy?: Budowa[]; lekka?: boolean }
export interface Stadion3D { grupa: THREE.Group; kibice?: THREE.InstancedMesh; kibiceBaza: Float32Array; reflektory: THREE.Object3D[]; siatki: THREE.Mesh[]; aktualizuj: (t: number, emocje: number) => void }

/** Buduje cały stadion z otoczeniem. */
export function zbudujStadion(s: StanGry | null, klub: Klub, o: OpcjeStadionu): Stadion3D {
  const r = rng(klub.nazwa);
  const grupa = new THREE.Group();
  const [kol1, kol2] = barwyKlubu(klub.nazwa);
  const poj = klub.pojemnosc;
  const nisko = klub.poziom >= 7;
  // teren
  const teren = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: o.snieg ? 0xe8eef2 : 0x3d6b35, roughness: 1 }));
  teren.rotation.x = -Math.PI / 2; teren.position.y = -0.02; teren.receiveShadow = true; grupa.add(teren);
  // murawa
  const zuzycie = s ? Math.min(0.8, (s.kolejka % 17) / 17 * (klub.murawa === "podgrzewana" ? 0.3 : nisko ? 1 : 0.6)) : 0.2;
  const murawa = new THREE.Mesh(new THREE.PlaneGeometry(DL + 8, SZ + 6), new THREE.MeshStandardMaterial({ color: 0x3a9a3f, roughness: 0.95 }));
  murawa.rotation.x = -Math.PI / 2; murawa.receiveShadow = true; grupa.add(murawa);
  const pole = new THREE.Mesh(new THREE.PlaneGeometry(DL, SZ), new THREE.MeshStandardMaterial({ map: teksturaMurawy(klub.murawa === "sztuczna", zuzycie, o.snieg), roughness: o.deszcz ? 0.55 : 0.92 }));
  pole.rotation.x = -Math.PI / 2; pole.position.y = 0.01; pole.receiveShadow = true; grupa.add(pole);
  const siatki: THREE.Mesh[] = [];
  for (const st of [-1, 1] as const) { const b = bramka(st, !nisko || r() < 0.4); grupa.add(b); b.traverse((x) => { if (x.name === "siatka") siatki.push(x as THREE.Mesh); }); }
  // chorągiewki rożne
  for (const x of [-DL / 2, DL / 2]) for (const z of [-SZ / 2, SZ / 2]) {
    const kij = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    kij.position.set(x, 0.75, z); grupa.add(kij);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.32), new THREE.MeshStandardMaterial({ color: kol1, side: THREE.DoubleSide })); fl.position.set(x + 0.22, 1.35, z); grupa.add(fl);
  }
  // ławki rezerwowych + strefa techniczna
  for (const sx of [-1, 1]) {
    const lawka = new THREE.Mesh(new THREE.BoxGeometry(8, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x2a3340, transparent: true, opacity: 0.85, roughness: 0.3 }));
    lawka.position.set(sx * 9, 0.8, SZ / 2 + 2.3); lawka.castShadow = true; grupa.add(lawka);
  }
  // bandy (sponsorzy) — od IV ligi wzwyż; niżej barierki
  const sponsorzy = s?.sponsorzy?.map((x) => x.nazwa) ?? [];
  if (!nisko) grupa.add(bandy(sponsorzy, klub.poziom <= 3));
  else {
    const mat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.6, roughness: 0.4 });
    for (const z of [-SZ / 2 - 3, SZ / 2 + 3]) { const b = new THREE.Mesh(new THREE.BoxGeometry(DL + 6, 0.06, 0.06), mat); b.position.set(0, 1.05, z); grupa.add(b);
      for (let x = -DL / 2 - 3; x <= DL / 2 + 3; x += 3) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05), mat); p.position.set(x, 0.52, z); grupa.add(p); } }
  }
  // ——— trybuny ———
  const { strony, narozniki } = podzialTrybun(poj);
  const zad = klub.obiekty?.zadaszenie ?? 0;
  const zadaszone: Strona[] = zad >= 3 ? ["S", "N", "W", "E"] : zad === 2 ? ["S", "N"] : zad === 1 ? ["S"] : [];
  const kibicePoz: number[] = [];
  const matSiedz = [new THREE.MeshStandardMaterial({ color: kol1, roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: kol2, roughness: 0.7 })];
  const matBeton = new THREE.MeshStandardMaterial({ color: 0x8d8f8a, roughness: 0.95 });
  const trybuna = (st: Strona, miejsca: number) => {
    const dlugaPelna = st === "S" || st === "N" ? DL + 6 : SZ + 4;
    const dl = miejsca < 1200 ? Math.min(dlugaPelna, 12 + miejsca * 0.05) : dlugaPelna;
    const rzedy = Math.max(2, Math.min(42, Math.round(miejsca / (dl * 2.0))));
    const gl = 0.8, wys = 0.42, odl = st === "S" || st === "N" ? SZ / 2 + 6 : DL / 2 + 6;
    const g = new THREE.Group();
    for (let i = 0; i < rzedy; i++) {
      const stopien = new THREE.Mesh(new THREE.BoxGeometry(dl, wys * (i + 1), gl), i % 6 === 5 ? matBeton : matSiedz[Math.floor(i / 6) % 2]);
      stopien.position.set(0, (wys * (i + 1)) / 2, i * gl + gl / 2); stopien.castShadow = !o.lekka && i % 3 === 0; stopien.receiveShadow = true; g.add(stopien);
      for (let x = -dl / 2 + 0.3; x < dl / 2; x += 0.55) kibicePoz.push(0, 0, 0, x, wys * (i + 1) + 0.5, i * gl + gl / 2, st === "S" ? 0 : st === "N" ? 1 : st === "W" ? 2 : 3, odl);
    }
    const tyl = new THREE.Mesh(new THREE.BoxGeometry(dl, wys * rzedy + 1.5, 0.4), matBeton); tyl.position.set(0, (wys * rzedy + 1.5) / 2, rzedy * gl + 0.2); tyl.castShadow = true; g.add(tyl);
    if (rzedy > 28) { const p2 = new THREE.Mesh(new THREE.BoxGeometry(dl, 0.6, 1.2), matBeton); p2.position.set(0, wys * 18, 18 * gl); g.add(p2); }
    if (zadaszone.includes(st)) {
      const gleb = rzedy * gl + 2, h = wys * rzedy + 4;
      const dach = new THREE.Mesh(new THREE.BoxGeometry(dl + 1, 0.3, gleb * 0.9), new THREE.MeshStandardMaterial({ color: 0xdfe5e8, metalness: 0.5, roughness: 0.35, transparent: true, opacity: 0.92 }));
      dach.position.set(0, h, gleb * 0.45 + 1); dach.rotation.x = -0.06; dach.castShadow = true; g.add(dach);
      for (let x = -dl / 2; x <= dl / 2; x += Math.max(12, dl / 6)) { const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, h), matBeton); sl.position.set(x, h / 2, rzedy * gl + 0.4); g.add(sl); }
    }
    // ustaw trybunę na właściwym boku (stopnie rosną od boiska na zewnątrz)
    if (st === "S") { g.position.set(0, 0, odl); }
    else if (st === "N") { g.rotation.y = Math.PI; g.position.set(0, 0, -odl); }
    else if (st === "W") { g.rotation.y = -Math.PI / 2; g.position.set(-odl, 0, 0); }
    else { g.rotation.y = Math.PI / 2; g.position.set(odl, 0, 0); }
    grupa.add(g);
    return g;
  };
  if (poj < 150) {
    // klasa B: ławeczki i kilka krzesełek przy linii
    for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(5, 0.45, 0.4), new THREE.MeshStandardMaterial({ color: 0x8a5a2b })); l.position.set(-15 + i * 10, 0.45, SZ / 2 + 6); grupa.add(l); for (let x = -2; x <= 2; x += 0.6) kibicePoz.push(0, 0, 0, -15 + i * 10 + x, 1.0, 0, 9, 0); }
  } else for (const st of Object.keys(strony) as Strona[]) trybuna(st, strony[st]!);
  if (narozniki > 0) for (const [x, z, rot] of [[-1, -1, Math.PI * 0.75], [1, -1, -Math.PI * 0.75], [-1, 1, Math.PI * 0.25], [1, 1, -Math.PI * 0.25]] as [number, number, number][]) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 14), matSiedz[0]); n.position.set(x * (DL / 2 + 12), 5, z * (SZ / 2 + 12)); n.rotation.y = rot; n.castShadow = true; grupa.add(n);
  }
  // ——— kibice (instancje) ———
  let kibice: THREE.InstancedMesh | undefined;
  const wsz = kibicePoz.length / 8;
  const ile = Math.min(o.lekka ? 1500 : 6000, Math.round(wsz * Math.min(1, o.widzowie / Math.max(1, poj))));
  const kibiceBaza = new Float32Array(ile * 3);
  if (ile > 0) {
    kibice = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.9, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), ile);
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
    const kolory = [kol1, kol2, "#222222", "#3a4a6a", "#d0d0d0", "#7a2a2a", kol1];
    const wybrane = new Set<number>(); while (wybrane.size < ile) wybrane.add(Math.floor(r() * wsz));
    let k = 0;
    for (const idx of wybrane) {
      const b = idx * 8, lx = kibicePoz[b + 3], ly = kibicePoz[b + 4], lz = kibicePoz[b + 5], st = kibicePoz[b + 6], odl = kibicePoz[b + 7];
      if (st === 0) v.set(lx, ly, odl + lz); else if (st === 1) v.set(-lx, ly, -odl - lz); else if (st === 2) v.set(-odl - lz, ly, -lx); else if (st === 3) v.set(odl + lz, ly, lx); else v.set(lx, ly, SZ / 2 + 7.5);
      v.x += (r() - 0.5) * 0.15;
      kibiceBaza[k * 3] = v.x; kibiceBaza[k * 3 + 1] = v.y; kibiceBaza[k * 3 + 2] = v.z;
      mtx.compose(v, q, sc); kibice.setMatrixAt(k, mtx); kibice.setColorAt(k, col.set(kolory[Math.floor(r() * kolory.length)])); k++;
    }
    kibice.castShadow = false; grupa.add(kibice);
  }
  // ——— maszty oświetleniowe ———
  const reflektory: THREE.Object3D[] = [];
  const oswietlenie = klub.oswietlenie ?? klub.poziom <= 3;
  if (oswietlenie) for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const h = klub.poziom <= 2 ? 40 : 26;
    const maszt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, h), new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 0.7, roughness: 0.3 }));
    const px = x * (DL / 2 + 16), pz = z * (SZ / 2 + 16);
    maszt.position.set(px, h / 2, pz); maszt.castShadow = true; grupa.add(maszt);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(o.noc ? 0xfff6d8 : 0x000000), emissiveIntensity: o.noc ? 3 : 0 }));
    panel.position.set(px, h + 1, pz); panel.lookAt(0, 0, 0); grupa.add(panel); reflektory.push(panel);
  }
  // ——— tablica wyników ———
  const elektr = klub.poziom <= 4;
  const tab = new THREE.Mesh(new THREE.BoxGeometry(elektr ? 12 : 5, elektr ? 5 : 2.4, 0.4), new THREE.MeshStandardMaterial({ color: elektr ? 0x111111 : 0x1d3d1d, emissive: elektr ? new THREE.Color(0x223344) : new THREE.Color(0), emissiveIntensity: 0.6 }));
  tab.position.set(-(DL / 2 + (strony.W ? 26 : 10)), elektr ? 14 : 2.6, 0); tab.rotation.y = Math.PI / 2; tab.name = "tablica"; grupa.add(tab);
  if (!elektr) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2), matBeton); n.position.set(tab.position.x, 1, 0); grupa.add(n); }
  // ——— otoczenie: miasto albo wieś ———
  const miasto = klub.poziom <= 5 || poj >= 3000;
  const matDom = [0xd8cfc0, 0xb9a48a, 0xe6e0d4, 0x9fa7ad, 0xc77b55].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
  for (let i = 0; i < (o.lekka ? 25 : 60); i++) {
    const kat = r() * Math.PI * 2, d = 120 + r() * 140;
    const x = Math.cos(kat) * d, z = Math.sin(kat) * d;
    if (miasto && r() < 0.6) { const h = 12 + r() * 30; const b = new THREE.Mesh(new THREE.BoxGeometry(14 + r() * 10, h, 10 + r() * 8), matDom[Math.floor(r() * 4)]); b.position.set(x, h / 2, z); b.rotation.y = kat; grupa.add(b); }
    else if (r() < 0.5) { const dom = new THREE.Group(); const sc = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 8), matDom[Math.floor(r() * 5)]); sc.position.y = 3; const dach = new THREE.Mesh(new THREE.ConeGeometry(7, 4, 4), new THREE.MeshStandardMaterial({ color: 0x8a3b2a })); dach.position.y = 8; dach.rotation.y = Math.PI / 4; dom.add(sc, dach); dom.position.set(x, 0, z); grupa.add(dom); }
    else { const dr = new THREE.Mesh(new THREE.ConeGeometry(3 + r() * 2, 9 + r() * 6, 7), new THREE.MeshStandardMaterial({ color: o.snieg ? 0xdfe8e4 : 0x23502a, roughness: 1 })); dr.position.set(x, 5, z); dr.castShadow = !o.lekka; grupa.add(dr); }
  }
  if (!miasto) { // wiejski kościół na horyzoncie
    const k = new THREE.Group(); const naw = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 22), matDom[2]); naw.position.y = 4.5; const wie = new THREE.Mesh(new THREE.BoxGeometry(5, 22, 5), matDom[2]); wie.position.set(0, 11, -12);
    const hel = new THREE.Mesh(new THREE.ConeGeometry(3.6, 8, 4), new THREE.MeshStandardMaterial({ color: 0x3a5a45, metalness: 0.4 })); hel.position.set(0, 26, -12); hel.rotation.y = Math.PI / 4; k.add(naw, wie, hel); k.position.set(-150, 0, -170); grupa.add(k);
  }
  // ——— place budowy: ogrodzenie, dźwig, robotnicy ———
  for (const b of o.budowy ?? []) {
    const bud = new THREE.Group();
    const strona: Strona = b.cel.rodzaj === "stadion" ? (["S", "N", "W", "E"] as Strona[]).find((x) => !strony[x]) ?? "S" : "S";
    const pos = b.cel.rodzaj === "stadion" ? (strona === "S" ? [0, SZ / 2 + 30] : strona === "N" ? [0, -SZ / 2 - 30] : strona === "W" ? [-DL / 2 - 30, 0] : [DL / 2 + 30, 0]) : [70 + r() * 30, -60 + r() * 120];
    const plac = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), new THREE.MeshStandardMaterial({ color: 0x8a7a5c, roughness: 1 })); plac.rotation.x = -Math.PI / 2; plac.position.y = 0.03; bud.add(plac);
    const sieg = new THREE.Mesh(new THREE.BoxGeometry(36, 1.8, 18), new THREE.MeshBasicMaterial({ color: 0xff7a1a, wireframe: true })); sieg.position.y = 0.9; bud.add(sieg);
    const zolty = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.3 });
    const wieza = new THREE.Mesh(new THREE.BoxGeometry(1.4, 34, 1.4), zolty); wieza.position.set(6, 17, 0); bud.add(wieza);
    const wys = new THREE.Mesh(new THREE.BoxGeometry(34, 1, 1), zolty); wys.position.set(-4, 34, 0); wys.name = "wysiegnik"; bud.add(wys);
    const lina = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0x222222 })); lina.position.set(-14, 24, 0); bud.add(lina);
    for (let i = 0; i < 6; i++) { const w = robotnik(); w.position.set(-14 + r() * 28, 0, -7 + r() * 14); w.rotation.y = r() * 6; w.name = "robotnik"; bud.add(w); }
    const kop = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 2.4), zolty); kop.position.set(-8, 1.2, 4); bud.add(kop);
    bud.position.set(pos[0], 0, pos[1]); grupa.add(bud);
  }
  const mtx = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1);
  const aktualizuj = (t: number, emocje: number) => {
    // kibice: podskakują i falują przy emocjach (gol, groźna akcja)
    if (kibice && emocje > 0.05) {
      const n = kibice.count;
      for (let i = 0; i < n; i += 1) {
        const skok = Math.max(0, Math.sin(t * 9 + i * 1.7)) * 0.45 * emocje;
        v.set(kibiceBaza[i * 3], kibiceBaza[i * 3 + 1] + skok, kibiceBaza[i * 3 + 2]); mtx.compose(v, q, sc); kibice.setMatrixAt(i, mtx);
      }
      kibice.instanceMatrix.needsUpdate = true;
    }
    grupa.traverse((x) => { if (x.name === "wysiegnik") x.rotation.y = Math.sin(t * 0.15) * 0.6; if (x.name === "robotnik") x.position.y = Math.abs(Math.sin(t * 3 + x.id)) * 0.08; });
  };
  return { grupa, kibice, kibiceBaza, reflektory, siatki, aktualizuj };
}

/** Prosty robotnik budowlany (kask, kamizelka). */
function robotnik(): THREE.Group {
  const g = new THREE.Group();
  const kam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), new THREE.MeshStandardMaterial({ color: 0xff6a00 })); kam.position.y = 1.2;
  const nogi = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 0.28), new THREE.MeshStandardMaterial({ color: 0x2d3a55 })); nogi.position.y = 0.45;
  const glowa = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshStandardMaterial({ color: 0xe0b28c })); glowa.position.y = 1.75;
  const kask = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffe14d })); kask.position.y = 1.8;
  g.add(kam, nogi, glowa, kask); return g;
}

/** Światło sceny: dzień (słońce z cieniem) albo noc pod reflektorami. */
export function swiatla(scena: THREE.Scene, noc: boolean, mgla: boolean, lekka: boolean) {
  scena.background = new THREE.Color(noc ? 0x0b1226 : mgla ? 0xb9c2c8 : 0x8fbbe8);
  scena.fog = new THREE.Fog(scena.background as THREE.Color, mgla ? 40 : 160, mgla ? 170 : 520);
  const hemi = new THREE.HemisphereLight(noc ? 0x6b7aa8 : 0xdfeeff, noc ? 0x1a2a1a : 0x445533, noc ? 0.55 : 0.9); scena.add(hemi);
  const slonce = new THREE.DirectionalLight(noc ? 0xfff4dd : 0xfff2d8, noc ? 1.6 : 2.4);
  slonce.position.set(noc ? 20 : 60, noc ? 90 : 80, noc ? 30 : 45);
  slonce.castShadow = true; slonce.shadow.mapSize.set(lekka ? 1024 : 2048, lekka ? 1024 : 2048);
  const c = slonce.shadow.camera as THREE.OrthographicCamera; c.left = -70; c.right = 70; c.top = 50; c.bottom = -50; c.near = 10; c.far = 220; slonce.shadow.bias = -0.0004;
  scena.add(slonce);
  if (noc) for (const x of [-1, 1]) for (const z of [-1, 1]) { const sp = new THREE.SpotLight(0xfff3d6, 900, 220, 0.75, 0.6, 1.3); sp.position.set(x * (DL / 2 + 16), 34, z * (SZ / 2 + 16)); sp.target.position.set(-x * 8, 0, -z * 6); scena.add(sp, sp.target); }
}

/** Zamiana ciężkich materiałów (PBR) na lekkie (Lambert) — błyskawiczne przygotowanie grafiki na telefonach. */
export function uproscMaterialy(obj: THREE.Object3D) {
  const cache = new Map<THREE.Material, THREE.Material>();
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh; const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!m || Array.isArray(m) || !(m instanceof THREE.MeshStandardMaterial)) return;
    let n = cache.get(m);
    if (!n) { n = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, transparent: m.transparent, opacity: m.opacity, side: m.side, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, emissiveMap: m.emissiveMap, depthWrite: m.depthWrite }); cache.set(m, n); }
    mesh.material = n;
  });
}
