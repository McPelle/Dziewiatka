// Stadion 3D budowany z danych klubu (Three.js): murawa z pasami koszenia, linie, bramki z siatkami, trybuny wg pojemności
// (klasa B — ławeczka i barierki, Ekstraklasa — 4 trybuny + narożniki + drugi poziom), dach, maszty oświetleniowe,
// bandy reklamowe z nazwami sponsorów, tablica wyników, kibice (instancje), otoczenie miasto/wieś, place budowy.
import * as THREE from "three";
import type { Klub, StanGry } from "../../engine/types";
import type { Budowa } from "../../engine/budowy";
import { barwyKlubu } from "../../data/barwy";
import { podzialTrybun } from "../WidokStadionu";
import { ksztaltStadionu, type KsztaltStadionu, type TrybunaKsztalt } from "../../data/ksztaltyStadionow";
import { DL, SZ, Geo, kolor, zbudujTrybuny, type MiejscaKibicow, type Strona, type Trybuny3D } from "./trybuny3d";
import { typOtoczenia, zbudujOtoczenie } from "./otoczenie3d";

export { DL, SZ };

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

function bandy(sponsorzy: string[], led: boolean, odl = 4): THREE.Group {
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
  for (let x = -DL / 2 + 5; x <= DL / 2 - 5; x += W) { segment(x, -SZ / 2 - odl, 0, W - 0.2); segment(x, SZ / 2 + odl, Math.PI, W - 0.2); }
  for (const sx of [-1, 1]) for (const z of [-24, -14, 14, 24]) segment(sx * (DL / 2 + 4.5), z, sx * Math.PI / 2, W - 0.2);
  return g;
}

export interface OpcjeStadionu { noc: boolean; snieg: boolean; deszcz: boolean; widzowie: number; budowy?: Budowa[]; lekka?: boolean }
export interface Stadion3D { grupa: THREE.Group; kibice?: THREE.InstancedMesh; kibiceBaza: Float32Array; reflektory: THREE.Object3D[]; siatki: THREE.Mesh[]; aktualizuj: (t: number, emocje: number) => void }

/** Typowy stadion (kluby bez prawdziwego kształtu): trybuny wg pojemności — jak dotąd (podzialTrybun). */
function ksztaltOgolny(klub: Klub, kol1: string, kol2: string): KsztaltStadionu {
  const { strony, narozniki } = podzialTrybun(klub.pojemnosc);
  const trybuny: Partial<Record<Strona, TrybunaKsztalt>> = {};
  for (const st of Object.keys(strony) as Strona[]) {
    const m = strony[st]!, pelna = st === "S" || st === "N" ? DL + 4 : SZ + 4;
    const dl = m < 1200 ? Math.min(pelna, 12 + m * 0.05) : pelna;
    trybuny[st] = { u: m, d: dl / pelna, p: klub.pojemnosc >= 20000 && (st === "S" || st === "N") ? 2 : 1, stara: klub.poziom >= 6 };
  }
  return { trybuny, narozniki: narozniki > 0, krzeselka: [kol1, kol2], wzor: "pasy", opis: "typowy stadion wg pojemności" };
}
/** Dachy: z kształtu stadionu + rozbudowa zadaszenia w obiektach klubu (1 = główna, 2 = wzdłuż boiska, 3+ = wszystkie). */
function ksztaltZDachami(ks: KsztaltStadionu, klub: Klub): KsztaltStadionu {
  const zad = klub.obiekty?.zadaszenie ?? 0;
  const zadaszone: Strona[] = zad >= 3 ? ["S", "N", "W", "E"] : zad === 2 ? ["S", "N"] : zad === 1 ? ["S"] : [];
  const trybuny: Partial<Record<Strona, TrybunaKsztalt>> = {};
  for (const st of Object.keys(ks.trybuny) as Strona[]) trybuny[st] = { ...ks.trybuny[st]!, dach: !!ks.trybuny[st]!.dach || zadaszone.includes(st) };
  return { ...ks, trybuny };
}

/** Buduje cały stadion z otoczeniem. */
export function zbudujStadion(s: StanGry | null, klub: Klub, o: OpcjeStadionu): Stadion3D {
  const r = rng(klub.nazwa);
  const grupa = new THREE.Group();
  const [kol1, kol2] = barwyKlubu(klub.nazwa);
  const poj = klub.pojemnosc;
  const nisko = klub.poziom >= 7;
  const ksReal = ksztaltStadionu(klub.nazwa);
  const ks = ksztaltZDachami(ksReal ?? ksztaltOgolny(klub, kol1, kol2), klub);
  const matBeton = new THREE.MeshStandardMaterial({ color: 0x8d8f8a, roughness: 0.95 });
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
  if (!nisko) grupa.add(bandy(sponsorzy, klub.poziom <= 3, ks.bieznia ? 1.9 : 4));
  else {
    // barierki z rur (jedna scalona siatka zamiast ~80 osobnych)
    const g = new Geo(), rura = kolor(0x9aa0a6);
    for (const z of [-SZ / 2 - 3, SZ / 2 + 3]) {
      g.box(0, 1.05, z, DL + 6, 0.06, 0.06, rura);
      for (let x = -DL / 2 - 3; x <= DL / 2 + 3; x += 3) g.box(x, 0.52, z, 0.05, 1.05, 0.05, rura);
    }
    grupa.add(new THREE.Mesh(g.zbuduj(), new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.6, roughness: 0.4 })));
  }
  // ——— trybuny: prawdziwy kształt stadionu (#31) albo typowy wg pojemności ———
  const matTryb = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
  const zrodla: MiejscaKibicow[] = [];
  let tryb: Trybuny3D | undefined;
  if (poj < 150) {
    // klasa B: ławeczki i kilka krzesełek przy linii
    const lawkiPoz: number[] = [];
    const g = new Geo(), drewno = kolor(o.snieg ? 0xb8a890 : 0x8a5a2b), noga = kolor(0x555555);
    for (let i = 0; i < 4; i++) {
      const x0 = -15 + i * 10;
      g.box(x0, 0.45, SZ / 2 + 6, 5, 0.08, 0.4, drewno);
      for (const dx of [-2.2, 2.2]) g.box(x0 + dx, 0.2, SZ / 2 + 6, 0.08, 0.4, 0.35, noga);
      for (let x = -2; x <= 2; x += 0.6) lawkiPoz.push(x0 + x, 1.0, SZ / 2 + 6.4);
    }
    const m = new THREE.Mesh(g.zbuduj(), matTryb); m.castShadow = !o.lekka; grupa.add(m);
    zrodla.push({ klucz: "L", dolne: lawkiPoz, gorne: [] });
  } else {
    tryb = zbudujTrybuny(ks, poj, matTryb, { lekka: !!o.lekka, snieg: o.snieg, kol1, kol2, y0: klub.poziom <= 3 ? 1.2 : nisko ? 0.5 : 0.9 }, Math.floor(r() * 1e6));
    grupa.add(tryb.grupa); zrodla.push(...tryb.miejsca);
  }
  const strony = tryb?.strony ?? {};
  // ——— kibice (instancje; osobno dla każdej trybuny, by chować je razem z trybuną przy kamerze „na trybunie") ———
  const grupyKibicow: { im: THREE.InstancedMesh; baza: Float32Array }[] = [];
  const wsz = zrodla.reduce((a, z) => a + (z.dolne.length + z.gorne.length) / 3, 0);
  const ile = Math.min(o.lekka ? 1500 : 6000, Math.round(wsz * Math.min(1, o.widzowie / Math.max(1, poj))));
  if (ile > 0) {
    const frac = ile / wsz;
    const geoK = new THREE.BoxGeometry(0.42, 0.9, 0.3), matK = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
    const kolory = [kol1, kol2, "#222222", "#3a4a6a", "#d0d0d0", "#7a2a2a", kol1];
    const wybierz = (arr: number[]): number[] => {
      const n = arr.length / 3, k = Math.min(n, Math.round(n * frac)), idx = Array.from({ length: n }, (_, i) => i);
      for (let i = 0; i < k; i++) { const j = i + Math.floor(r() * (n - i)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      return idx.slice(0, k);
    };
    for (const z of zrodla) {
      const dol = wybierz(z.dolne), gor = wybierz(z.gorne), n = dol.length + gor.length;
      if (!n) continue;
      const im = new THREE.InstancedMesh(geoK, matK, n), baza = new Float32Array(n * 3);
      let k = 0;
      for (const [arr, lista] of [[z.dolne, dol], [z.gorne, gor]] as [number[], number[]][]) for (const i of lista) {
        v.set(arr[i * 3] + (r() - 0.5) * 0.15, arr[i * 3 + 1], arr[i * 3 + 2]);
        baza[k * 3] = v.x; baza[k * 3 + 1] = v.y; baza[k * 3 + 2] = v.z;
        mtx.compose(v, q, sc); im.setMatrixAt(k, mtx); im.setColorAt(k, col.set(kolory[Math.floor(r() * kolory.length)])); k++;
      }
      const nDol = dol.length, ukryj = z.ukryj;
      if (ukryj) im.onBeforeRender = (_r, _s, cam) => { const u = ukryj(cam); im.count = u === 2 ? 0 : u === 1 ? nDol : n; };
      im.castShadow = false; grupa.add(im); grupyKibicow.push({ im, baza });
    }
  }
  const glowni = grupyKibicow.slice().sort((a, b) => b.baza.length - a.baza.length)[0];
  const kibice = glowni?.im, kibiceBaza = glowni?.baza ?? new Float32Array(0);
  // ——— oświetlenie: maszty w narożnikach albo reflektory pod dachem zamkniętej misy ———
  const reflektory: THREE.Object3D[] = [];
  const oswietlenie = klub.oswietlenie ?? klub.poziom <= 3;
  if (tryb?.swiatlaDach) {
    const m = tryb.swiatlaDach.material as THREE.MeshStandardMaterial;
    if (oswietlenie && o.noc) { m.emissive.set(0xfff6d8); m.emissiveIntensity = 3; }
    reflektory.push(tryb.swiatlaDach);
  } else if (oswietlenie) {
    const maszty = tryb?.maszty.length ? tryb.maszty : [-1, 1].flatMap((x) => [-1, 1].map((z) => ({ x: x * (DL / 2 + 16), z: z * (SZ / 2 + 16), h: 26 })));
    const matMaszt = new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 0.7, roughness: 0.3 });
    const matPanel = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(o.noc ? 0xfff6d8 : 0x000000), emissiveIntensity: o.noc ? 3 : 0 });
    for (const mp of maszty) {
      const h = Math.max(mp.h, klub.poziom <= 2 ? 40 : 26);
      const maszt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, h), matMaszt);
      maszt.position.set(mp.x, h / 2, mp.z); maszt.castShadow = !o.lekka; grupa.add(maszt);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.5), matPanel);
      panel.position.set(mp.x, h + 1, mp.z); panel.lookAt(0, 0, 0); grupa.add(panel); reflektory.push(panel);
    }
  }
  // ——— tablica wyników ———
  const elektr = klub.poziom <= 4;
  const tab = new THREE.Mesh(new THREE.BoxGeometry(elektr ? 12 : 5, elektr ? 5 : 2.4, 0.4), new THREE.MeshStandardMaterial({ color: elektr ? 0x111111 : 0x1d3d1d, emissive: elektr ? new THREE.Color(0x223344) : new THREE.Color(0), emissiveIntensity: 0.6 }));
  const tp = tryb?.tablica;
  if (tp && tp.zawieszona) tab.position.set(tp.x, tp.y, tp.z);
  else if (tp && tp.y > 0) {
    tab.position.set(tp.x, tp.y + (elektr ? 3 : 1.5), tp.z);
    for (const dz of [-3, 3]) { const n = new THREE.Mesh(new THREE.BoxGeometry(0.3, tab.position.y, 0.3), matBeton); n.position.set(tp.x - 0.4, tab.position.y / 2, tp.z + (elektr ? dz : dz / 2.5)); grupa.add(n); }
  } else {
    tab.position.set(tp ? tp.x : -(DL / 2 + 10), elektr ? 14 : 2.6, 0);
    const n = new THREE.Mesh(new THREE.CylinderGeometry(elektr ? 0.3 : 0.08, elektr ? 0.3 : 0.08, tab.position.y), matBeton); n.position.set(tab.position.x - 0.3, tab.position.y / 2, 0); grupa.add(n);
  }
  tab.rotation.y = Math.PI / 2; tab.name = "tablica"; grupa.add(tab);
  // ——— małe boisko (niższe ligi): ogrodzenie z siatki, budynek klubowy z szatniami ———
  if (klub.poziom >= 6 || poj < 1500) {
    const g = new Geo(), slup = kolor(0x4f6b52), mur = kolor([0xf0ead8, 0xe8e0c8, 0xdfe6e0][Math.floor(r() * 3)]), dachK = kolor(o.snieg ? 0xeef2f5 : 0x5a5d62);
    const zS = Math.max(SZ / 2 + 16, SZ / 2 + 6 + (strony.S ?? 0) + 5), zN = Math.max(SZ / 2 + 14, SZ / 2 + 6 + (strony.N ?? 0) + 5), xE = DL / 2 + 14 + (strony.E ?? 0), xW = DL / 2 + 14 + (strony.W ?? 0);
    const pts: [number, number][] = [[-xW, -zN], [xE, -zN], [xE, zS], [-xW, zS]];
    const siatkaPos: number[] = [], siatkaUv: number[] = [];
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % 4], L = Math.hypot(x1 - x0, z1 - z0), H = 2.4;
      for (let s = 0; s <= L; s += 3) g.box(x0 + ((x1 - x0) * s) / L, H / 2, z0 + ((z1 - z0) * s) / L, 0.08, H, 0.08, slup);
      siatkaPos.push(x0, 0, z0, x1, 0, z1, x1, H, z1, x0, 0, z0, x1, H, z1, x0, H, z0);
      siatkaUv.push(0, 0, L / 1.2, 0, L / 1.2, H / 1.2, 0, 0, L / 1.2, H / 1.2, 0, H / 1.2);
    }
    // budynek klubowy (szatnie) przy narożniku trybuny głównej
    const bx = -(DL / 2 + 4), bz = Math.min(zS - 7, SZ / 2 + 12);
    g.box(bx, 2, bz, 16, 4, 8, mur); g.box(bx, 4.15, bz, 16.6, 0.3, 8.6, dachK);
    g.box(bx + 3, 1.1, bz - 4.02, 1.2, 2.2, 0.06, kolor(0x6b4a2e));
    for (const dx of [-5, -2, 6]) g.box(bx + dx, 2.4, bz - 4.02, 1.6, 1.0, 0.06, kolor(0x34404c));
    // maszt z flagą klubu
    g.box(bx + 9.5, 4, bz - 2, 0.12, 8, 0.12, kolor(0xdddddd)); g.box(bx + 10.5, 7.3, bz - 2, 2, 1.2, 0.04, kolor(kol1)); g.box(bx + 10.5, 6.7, bz - 2, 2, 0.6, 0.05, kolor(kol2));
    const m = new THREE.Mesh(g.zbuduj(), matTryb); m.castShadow = !o.lekka; grupa.add(m);
    const cv = canvas(32, 32), x = cv.getContext("2d")!; x.strokeStyle = "rgba(70,95,75,0.9)"; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 16); x.lineTo(16, 0); x.lineTo(32, 16); x.lineTo(16, 32); x.closePath(); x.stroke();
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(siatkaPos, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(siatkaUv, 2)); sg.computeVertexNormals();
    grupa.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, depthWrite: false })));
  }
  // ——— otoczenie: metropolia / miasto / wieś (#32) ———
  const typ = typOtoczenia(klub, s, ksReal);
  grupa.add(zbudujOtoczenie(typ, r, (tryb?.zasieg ?? 75) + 18, matTryb, { noc: o.noc, snieg: o.snieg, lekka: !!o.lekka }, 70 + Math.sqrt(poj) * 0.9)); // orbita kamery menu (Stadion3DMenu/Widok)
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
    if (emocje > 0.05) for (const { im, baza } of grupyKibicow) {
      const n = baza.length / 3;
      for (let i = 0; i < n; i += 1) {
        const skok = Math.max(0, Math.sin(t * 9 + i * 1.7)) * 0.45 * emocje;
        v.set(baza[i * 3], baza[i * 3 + 1] + skok, baza[i * 3 + 2]); mtx.compose(v, q, sc); im.setMatrixAt(i, mtx);
      }
      im.instanceMatrix.needsUpdate = true;
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
    if (!n) { n = new THREE.MeshLambertMaterial({ color: m.color, vertexColors: m.vertexColors, map: m.map, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, side: m.side, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, emissiveMap: m.emissiveMap, depthWrite: m.depthWrite }); cache.set(m, n); }
    mesh.material = n;
  });
}
