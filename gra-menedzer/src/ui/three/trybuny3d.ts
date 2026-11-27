// Trybuny 3D budowane z przekrojów „ciągniętych" po prostej (trybuna) albo po łuku (narożnik, łuk za bramką przy bieżni).
// Cała konstrukcja trybuny to JEDNA geometria z kolorami wierzchołków (krzesełka, beton, elewacja, dach) → mało wywołań
// rysowania: na trybunę 2 siatki (dolna część + górny poziom z dachem — chowany, gdy kamera TV „siedzi" na trybunie).
import * as THREE from "three";
import type { BokTrybuny, KsztaltStadionu, TrybunaKsztalt } from "../../data/ksztaltyStadionow";

export const DL = 105, SZ = 68; // wymiary boiska (m)
export type Strona = BokTrybuny;
type V3 = [number, number, number];
type P2 = [number, number];
const GL = 0.8, R1 = 0.4, R2 = 0.56; // głębokość rzędu, przewyższenie rzędu: dolny / górny poziom
// bieżnia lekkoatletyczna 400 m: proste 84,39 m, łuki o promieniu 36,5 m (wewnętrzny), 8 torów × 1,22 m
const BIEZ_A = 42.195, BIEZ_R = 36.5, BIEZ_W = 9.76;

const KOLORY = new Map<string, THREE.Color>();
export const kolor = (hex: string | number): THREE.Color => {
  const k = String(hex); let c = KOLORY.get(k);
  if (!c) { c = new THREE.Color(hex as THREE.ColorRepresentation); KOLORY.set(k, c); }
  return c;
};
const CIEMNE = new Map<THREE.Color, THREE.Color>();
const ciemniej = (c: THREE.Color): THREE.Color => { let d = CIEMNE.get(c); if (!d) { d = c.clone().multiplyScalar(0.72); CIEMNE.set(c, d); } return d; };

/** Zbieracz trójkątów z kolorami wierzchołków (niezindeksowana geometria → płaskie cieniowanie). */
export class Geo {
  p: number[] = []; c: number[] = [];
  tri(a: V3, b: V3, d: V3, k: THREE.Color) {
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], d[0], d[1], d[2]);
    for (let i = 0; i < 3; i++) this.c.push(k.r, k.g, k.b);
  }
  quad(a: V3, b: V3, c: V3, d: V3, k: THREE.Color) { this.tri(a, b, c, k); this.tri(a, c, d, k); }
  /** prostopadłościan wyrównany do osi świata */
  box(x: number, y: number, z: number, sx: number, sy: number, sz: number, k: THREE.Color, rotY = 0) {
    const cs = Math.cos(rotY), sn = Math.sin(rotY);
    const v = (dx: number, dy: number, dz: number): V3 => [x + dx * cs + dz * sn, y + dy, z - dx * sn + dz * cs];
    const a = sx / 2, b = sy / 2, c = sz / 2;
    const p = [v(-a, -b, -c), v(a, -b, -c), v(a, b, -c), v(-a, b, -c), v(-a, -b, c), v(a, -b, c), v(a, b, c), v(-a, b, c)];
    this.quad(p[0], p[1], p[2], p[3], k); this.quad(p[5], p[4], p[7], p[6], k);
    this.quad(p[4], p[0], p[3], p[7], k); this.quad(p[1], p[5], p[6], p[2], k);
    this.quad(p[3], p[2], p[6], p[7], k);
  }
  get pusta() { return this.p.length === 0; }
  zbuduj(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.c, 3));
    g.computeVertexNormals(); g.computeBoundingSphere();
    return g;
  }
}

/** Ścieżka, wzdłuż której ciągniemy przekrój: t = x wzdłuż trybuny (prosta) albo kąt (łuk). u — odległość od frontu, y — wysokość. */
interface Sciezka { ts: number[]; map: (t: number, u: number, y: number) => V3; luk: boolean; r0: number; t0: number; t1: number }
function prosta(st: Strona, front: number, L: number, krok = 6): Sciezka {
  const n = Math.max(2, Math.ceil(L / krok)), ts: number[] = [];
  for (let i = 0; i <= n; i++) ts.push(-L / 2 + (L * i) / n);
  const map = st === "S" ? (t: number, u: number, y: number): V3 => [t, y, front + u]
    : st === "N" ? (t: number, u: number, y: number): V3 => [-t, y, -(front + u)]
    : st === "E" ? (t: number, u: number, y: number): V3 => [front + u, y, -t]
    : (t: number, u: number, y: number): V3 => [-(front + u), y, t];
  return { ts, map, luk: false, r0: 0, t0: -L / 2, t1: L / 2 };
}
function luk(px: number, pz: number, r0: number, f0: number, f1: number, krok = 0.14): Sciezka {
  const n = Math.max(2, Math.ceil(Math.abs(f1 - f0) / krok)), ts: number[] = [];
  for (let i = 0; i <= n; i++) ts.push(f0 + ((f1 - f0) * i) / n);
  return { ts, map: (t, u, y) => [px + (r0 + u) * Math.sin(t), y, pz + (r0 + u) * Math.cos(t)], luk: true, r0, t0: f0, t1: f1 };
}

interface Seg { a: P2; b: P2; kol: (k: number) => THREE.Color; dach?: boolean }
const seg = (a: P2, b: P2, kol: THREE.Color | ((k: number) => THREE.Color), dach = false): Seg => ({ a, b, kol: typeof kol === "function" ? kol : () => kol, dach });

function ciagnij(g: Geo, s: Sciezka, segs: Seg[], yOff?: (t: number) => number) {
  for (let k = 0; k < s.ts.length - 1; k++) {
    const t0 = s.ts[k], t1 = s.ts[k + 1];
    for (const z of segs) {
      const o0 = z.dach && yOff ? yOff(t0) : 0, o1 = z.dach && yOff ? yOff(t1) : 0;
      g.quad(s.map(t0, z.a[0], z.a[1] + o0), s.map(t1, z.a[0], z.a[1] + o1), s.map(t1, z.b[0], z.b[1] + o1), s.map(t0, z.b[0], z.b[1] + o0), z.kol(k));
    }
  }
}
/** pionowy słup na ścieżce */
function slup(g: Geo, s: Sciezka, t: number, u: number, y0: number, y1: number, w: number, k: THREE.Color) {
  const dt = s.luk ? w / 2 / Math.max(1, s.r0 + u) : w / 2;
  const a = s.map(t - dt, u - w / 2, 0), b = s.map(t + dt, u - w / 2, 0), c = s.map(t + dt, u + w / 2, 0), d = s.map(t - dt, u + w / 2, 0);
  const up = (p: V3, y: number): V3 => [p[0], y, p[2]];
  for (const [p, q] of [[a, b], [b, c], [c, d], [d, a]] as [V3, V3][]) g.quad(up(p, y0), up(q, y0), up(q, y1), up(p, y1), k);
}
/** zaślepka końca trybuny (wielokąt przekroju) */
function zaslepka(g: Geo, s: Sciezka, t: number, zarys: P2[], k: THREE.Color) {
  const pts: THREE.Vector2[] = [];
  for (const [u, y] of zarys) { const l = pts[pts.length - 1]; if (!l || Math.abs(l.x - u) > 1e-3 || Math.abs(l.y - y) > 1e-3) pts.push(new THREE.Vector2(u, y)); }
  if (pts.length > 2 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-3) pts.pop();
  if (pts.length < 3) return;
  const tr = THREE.ShapeUtils.triangulateShape(pts, []);
  for (const [a, b, c] of tr) g.tri(s.map(t, pts[a].x, pts[a].y), s.map(t, pts[b].x, pts[b].y), s.map(t, pts[c].x, pts[c].y), k);
}

export type KolorMiejsca = (k: number, nr: number, poziom: 0 | 1) => THREE.Color;
/** Funkcja koloru krzesełek wg palety i wzoru (deterministyczna). */
export function paletaMiejsc(paleta: string[], gorne: string[] | undefined, wzor: KsztaltStadionu["wzor"], ziarno: number): KolorMiejsca {
  const p0 = paleta.map(kolor), p1 = (gorne ?? paleta).map(kolor);
  const hash = (a: number, b: number) => { let h = Math.imul(a * 73856093 ^ b * 19349663 ^ ziarno, 2654435761); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
  return (k, nr, poziom) => {
    const p = poziom ? p1 : p0;
    if (p.length === 1 || wzor === "jednolity") return p[0];
    if (wzor === "sektory") return p[Math.floor(k / 2) % p.length];
    if (wzor === "pasy") return p[Math.floor(nr / 6) % p.length];
    return p[Math.floor(hash(k + poziom * 1000, Math.floor(nr / 3)) * p.length)]; // mozaika: bloki 1 sektor × 3 rzędy
  };
}

interface Kolory { beton: THREE.Color; betonC: THREE.Color; elew: THREE.Color; szklo: THREE.Color; dachG: THREE.Color; dachD: THREE.Color; listwa: THREE.Color }
interface Przekroj { dolne: Seg[]; gorne: Seg[]; zarys: P2[]; miejsca: { u: number; y: number; p: 0 | 1 }[]; uTyl: number; gora: number }

/** Przekrój trybuny: n1 rzędów dolnego poziomu, n2 górnego (0 = jednopoziomowa), y0 — wysokość muru przy boisku. */
function przekroj(n1: number, n2: number, y0: number, km: (nr: number, p: 0 | 1) => (k: number) => THREE.Color, c: Kolory, stara: boolean): Przekroj {
  const dolne: Seg[] = [], gorne: Seg[] = [], zarys: P2[] = [[0, 0], [0, y0]], miejsca: Przekroj["miejsca"] = [];
  dolne.push(seg([0, 0], [0, y0], c.beton));
  const r1 = stara ? 0.34 : R1;
  let y = y0;
  for (let i = 0; i < n1; i++) {
    const u0 = i * GL, u1 = u0 + GL, kk = km(i, 0);
    dolne.push(seg([u0, y], [u1, y], kk)); zarys.push([u1, y]); miejsca.push({ u: u0 + GL * 0.6, y, p: 0 });
    if (i < n1 - 1) { const kn = km(i + 1, 0); dolne.push(seg([u1, y], [u1, y + r1], (k) => ciemniej(kn(k)))); y += r1; zarys.push([u1, y]); }
  }
  const uL = n1 * GL, yL = y;
  if (n2 > 0) {
    const yG = yL + 4.2, uG = uL - 3;
    gorne.push(seg([uL, yL], [uL, yG], c.szklo)); zarys.push([uL, yG]);
    gorne.push(seg([uL, yG], [uG, yG], c.betonC)); zarys.push([uG, yG]);
    gorne.push(seg([uG, yG], [uG, yG + 1.1], c.listwa)); zarys.push([uG, yG + 1.1]);
    y = yG + 1.1;
    for (let j = 0; j < n2; j++) {
      const u0 = uG + j * GL, u1 = u0 + GL, kk = km(j, 1);
      gorne.push(seg([u0, y], [u1, y], kk)); zarys.push([u1, y]); miejsca.push({ u: u0 + GL * 0.6, y, p: 1 });
      if (j < n2 - 1) { const kn = km(j + 1, 1); gorne.push(seg([u1, y], [u1, y + R2], (k) => ciemniej(kn(k)))); y += R2; zarys.push([u1, y]); }
    }
    const uU = uG + n2 * GL, gora = y + 1.1;
    gorne.push(seg([uU, y], [uU, gora], c.beton), seg([uU, gora], [uU + 0.4, gora], c.beton), seg([uU + 0.4, gora], [uU + 0.4, 0], c.elew));
    zarys.push([uU, gora], [uU + 0.4, gora], [uU + 0.4, 0]);
    return { dolne, gorne, zarys, miejsca, uTyl: uU + 0.4, gora };
  }
  const gora = yL + 1.1;
  dolne.push(seg([uL, yL], [uL, gora], c.beton), seg([uL, gora], [uL + 0.4, gora], c.beton), seg([uL + 0.4, gora], [uL + 0.4, 0], c.elew));
  zarys.push([uL, gora], [uL + 0.4, gora], [uL + 0.4, 0]);
  return { dolne, gorne, zarys, miejsca, uTyl: uL + 0.4, gora };
}

/** Dach nad przekrojem: od frontu (uF) do tyłu, wysokość yF z przodu (lekko opada do tyłu). */
function dachSeg(uF: number, uB: number, yF: number, c: Kolory): Seg[] {
  const yB = yF - 1.0;
  return [seg([uF, yF], [uB, yB], c.dachG, true), seg([uB, yB - 0.5], [uF, yF - 0.5], c.dachD, true), seg([uF, yF - 0.5], [uF, yF], c.listwa, true), seg([uB, yB], [uB, yB - 0.5], c.dachD, true)];
}

// ——— cały zestaw trybun ———
export interface OpcjeTrybun { lekka: boolean; snieg: boolean; kol1: string; kol2: string; y0: number }
export interface MiejscaKibicow { klucz: string; dolne: number[]; gorne: number[]; ukryj?: (cam: THREE.Camera) => 0 | 1 | 2 }
export interface Trybuny3D {
  grupa: THREE.Group;
  strony: Partial<Record<Strona, number>>; // boki z trybuną → głębokość (m)
  miejsca: MiejscaKibicow[];
  zasieg: number; // promień najdalszej konstrukcji od środka
  maszty: { x: number; z: number; h: number }[]; // proponowane maszty (puste → światła na dachu)
  swiatlaDach?: THREE.Mesh; // listwa reflektorów pod dachem (misa)
  tablica: { x: number; y: number; z: number; rotY: number; zawieszona: boolean };
  bieznia?: "lekkoatletyczna" | "zuzlowa";
  gora: number; // najwyższy punkt konstrukcji
}

/** Ukrywanie części siatki zależnie od kamery (bez przebudowy sceny): drawRange w onBeforeRender. */
function ukrywana(m: THREE.Mesh, warunek: (cam: THREE.Camera) => boolean) {
  m.onBeforeRender = (_r, _s, cam, geom) => { geom.setDrawRange(0, warunek(cam) ? 0 : Infinity); };
}

export function zbudujTrybuny(ks: KsztaltStadionu, poj: number, mat: THREE.Material, o: OpcjeTrybun, ziarno: number): Trybuny3D {
  const grupa = new THREE.Group();
  const bieznia = ks.bieznia;
  const strony: Partial<Record<Strona, number>> = {};
  const miejsca: MiejscaKibicow[] = [];
  const paleta = ks.krzeselka?.length ? ks.krzeselka : [o.kol1, o.kol2];
  const kolBazowy = paletaMiejsc(paleta, ks.krzeselkaGorne, ks.wzor ?? "sektory", ziarno);
  const c: Kolory = {
    beton: kolor(0x9a9b96), betonC: kolor(0x5d5f60), elew: kolor(ks.elewacja ?? "#8d8f8a"), szklo: kolor(0x2a3d52),
    dachG: kolor(o.snieg ? "#f1f4f7" : ks.dachKolor ?? "#dfe5e8"), dachD: kolor(0x6f777c), listwa: kolor(ks.elewacja ?? "#c9cdd0"),
  };
  // geometria boków: front (odległość od środka), długość
  const L_SN = bieznia ? 2 * BIEZ_A : DL + 4, L_WE = SZ + 4;
  const F_SN = bieznia ? BIEZ_R + BIEZ_W + 1.6 : SZ / 2 + 6, F_WE = bieznia ? F_SN : DL / 2 + 6;
  const boki = (Object.keys(ks.trybuny) as Strona[]).filter((b) => (ks.trybuny[b]?.u ?? 0) > 0);
  const sumaU = boki.reduce((a, b) => a + ks.trybuny[b]!.u, 0) || 1;
  const narozniki = !!ks.narozniki && !bieznia;
  const naRogi = narozniki ? 0.1 : 0;
  interface Bok { st: Strona; t: TrybunaKsztalt; n1: number; n2: number; prz: Przekroj; s: Sciezka; L: number; front: number; yDach: number }
  const lista: Bok[] = [];
  const kmDla = (t: TrybunaKsztalt) => {
    const kw = t.k ? paletaMiejsc(t.k, t.k, ks.wzor ?? "sektory", ziarno + 7) : kolBazowy;
    return (nr: number, p: 0 | 1) => (k: number) => kw(k, nr, p);
  };
  for (const st of boki) {
    const t = ks.trybuny[st]!;
    const d = Math.max(0.1, Math.min(1, t.d ?? 1));
    const lukowa = !!bieznia && (st === "W" || st === "E");
    const front = st === "S" || st === "N" ? F_SN : F_WE;
    const L = lukowa ? Math.PI * d : (st === "S" || st === "N" ? L_SN : L_WE) * d;
    const dlugoscM = lukowa ? Math.PI * d * (front + 8) : L;
    const m = (poj * (1 - naRogi) * t.u) / sumaU;
    let rzedy = Math.max(2, Math.round(m / (dlugoscM * 2)));
    let n1 = rzedy, n2 = 0;
    if ((t.p ?? 1) === 2 && rzedy >= 14) { n1 = Math.min(26, Math.round(rzedy * 0.55)); n2 = Math.min(24, Math.max(6, rzedy - n1)); }
    else n1 = Math.min(t.p === 2 ? 26 : 40, rzedy);
    if ((t.p ?? 1) === 2 && rzedy < 14) { n1 = Math.min(26, Math.max(8, Math.round(rzedy * 0.6))); n2 = 6; }
    rzedy = n1 + n2;
    const prz = przekroj(n1, n2, t.stara ? 0.6 : o.y0, kmDla(t), c, !!t.stara);
    let s: Sciezka;
    if (lukowa) { const srodek = st === "E" ? Math.PI / 2 : Math.PI * 1.5; s = luk(st === "E" ? BIEZ_A : -BIEZ_A, 0, front, srodek - L / 2, srodek + L / 2); }
    else s = prosta(st, front, L);
    lista.push({ st, t, n1, n2, prz, s, L, front, yDach: prz.gora + 4.5 });
    strony[st] = prz.uTyl;
  }
  // narożniki (misa): łuk między sąsiednimi pełnymi trybunami
  interface Rog { sx: number; sz: number; prz: Przekroj; s: Sciezka; dach: boolean }
  const rogi: Rog[] = [];
  const bok = (st: Strona) => lista.find((b) => b.st === st);
  if (narozniki) for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]] as [number, number][]) {
    const a = bok(sz > 0 ? "S" : "N"), b = bok(sx > 0 ? "E" : "W");
    if (!a || !b || (a.t.d ?? 1) < 0.95 || (b.t.d ?? 1) < 0.95) continue;
    const dwa = a.n2 > 0 && b.n2 > 0;
    const n1 = dwa ? Math.min(a.n1, b.n1) : Math.min(a.n1 + a.n2, b.n1 + b.n2, 40), n2 = dwa ? Math.min(a.n2, b.n2) : 0;
    const f0 = sx > 0 ? (sz > 0 ? 0 : Math.PI / 2) : (sz < 0 ? Math.PI : Math.PI * 1.5);
    const prz = przekroj(n1, n2, o.y0, kmDla(a.t), c, false);
    rogi.push({ sx, sz, prz, s: luk(sx * (L_SN / 2), sz * (L_WE / 2), 4, f0, f0 + Math.PI / 2), dach: !!(a.t.dach && b.t.dach) });
  }
  // wspólna wysokość dachu w zamkniętej misie (ciągły pierścień)
  const zadaszone = lista.filter((b) => b.t.dach);
  const misa = narozniki && zadaszone.length === 4 && rogi.length === 4;
  if (misa) { const yMax = Math.max(...lista.map((b) => b.yDach), ...rogi.map((r) => r.prz.gora + 4.5)); for (const b of lista) b.yDach = yMax; }
  const yMisa = misa ? lista[0].yDach : 0;
  const zamknieta = misa && !!ks.elewacja; // elewacja domyka przestrzeń pod dachem (np. „bursztyn" w Gdańsku)
  const yOffLuk = (b: Bok) => ks.dachTyp === "luk" && !b.s.luk ? (t: number) => 5.5 * Math.cos((Math.PI * t) / (b.L * 1.15)) - 1.5 : undefined;
  let gora = 0;
  // ——— budowa siatek ———
  for (const b of lista) {
    const gD = new Geo(), gG = new Geo();
    ciagnij(gD, b.s, b.prz.dolne); ciagnij(gG, b.s, b.prz.gorne);
    const otwarteKonce = !b.s.luk && !(narozniki && rogi.some((r) => (b.st === "S" && r.sz > 0) || (b.st === "N" && r.sz < 0) || (b.st === "E" && r.sx > 0) || (b.st === "W" && r.sx < 0)));
    if (otwarteKonce || b.s.luk) { zaslepka(gD, b.s, b.s.t0, b.prz.zarys, c.beton); zaslepka(gD, b.s, b.s.t1, b.prz.zarys, c.beton); }
    let yDachF = 0;
    if (b.t.dach) {
      const uF = b.t.stara ? -0.4 : b.prz.uTyl > 20 ? 2 : -1, uB = b.prz.uTyl + 0.6;
      yDachF = b.yDach;
      const yOff = yOffLuk(b);
      ciagnij(gG, b.s, dachSeg(uF, uB, yDachF, c), yOff);
      // podpory: z tyłu (nowoczesne) albo słupy od boiska (stare trybuny)
      const krok = b.s.luk ? 14 / (b.front + b.prz.uTyl) : 14;
      for (let t = b.s.t0 + krok / 2; t < b.s.t1; t += krok) {
        const off = yOff ? yOff(t) : 0;
        if (zamknieta) continue;
        slup(gG, b.s, t, b.prz.uTyl + 0.3, 0, yDachF - 1.4 + off, 0.5, c.beton);
        if (b.t.stara) slup(gG, b.s, t, -0.2, 0.6, yDachF - 0.5 + off, 0.3, c.betonC);
      }
      if (zamknieta) ciagnij(gG, b.s, [seg([b.prz.uTyl, b.prz.gora], [b.prz.uTyl + 0.6, yDachF - 1.5], c.elew)]);
      gora = Math.max(gora, yDachF + (yOff ? 4 : 0));
    }
    gora = Math.max(gora, b.prz.gora);
    const front = b.front, uTyl = b.prz.uTyl, L = b.L, st = b.st, gb = b.prz.gora, luk2 = b.s.luk;
    // położenie kamery względem trybuny: n — odległość od środka w kierunku trybuny, s — wzdłuż
    const wspol = (cam: THREE.Camera): [number, number] => {
      const p = cam.position;
      if (luk2) { const px = st === "E" ? BIEZ_A : -BIEZ_A; const dx = p.x - px; if ((st === "E" && dx < 0) || (st === "W" && dx > 0)) return [0, 0]; return [Math.hypot(dx, p.z), 0]; }
      return st === "S" ? [p.z, p.x] : st === "N" ? [-p.z, p.x] : st === "E" ? [p.x, p.z] : [-p.x, p.z];
    };
    const ukryjWszystko = (cam: THREE.Camera) => { const [n, s] = wspol(cam); return n > front - 1 && n < front + uTyl + 1.5 && Math.abs(s) < (luk2 ? 1e9 : L / 2 + 1.5) && cam.position.y < gb + 1.5; };
    const ukryjGorne = (cam: THREE.Camera) => { const [n, s] = wspol(cam); return n > front - 2 && n < front + uTyl + 35 && Math.abs(s) < (luk2 ? 1e9 : L / 2 + 25) && cam.position.y < 80; };
    const cien = !o.lekka;
    if (!gD.pusta) { const m = new THREE.Mesh(gD.zbuduj(), mat); m.castShadow = cien; m.receiveShadow = cien; ukrywana(m, ukryjWszystko); grupa.add(m); }
    if (!gG.pusta) { const m = new THREE.Mesh(gG.zbuduj(), mat); m.castShadow = cien; m.receiveShadow = cien; ukrywana(m, (cam) => ukryjGorne(cam) || ukryjWszystko(cam)); grupa.add(m); }
    // miejsca kibiców
    const dolne: number[] = [], gorne: number[] = [];
    for (const mj of b.prz.miejsca) {
      const krok = luk2 ? 0.55 / (front + mj.u) : 0.55;
      for (let t = b.s.t0 + krok / 2; t < b.s.t1; t += krok) { const v = b.s.map(t, mj.u, mj.y + 0.5); (mj.p ? gorne : dolne).push(v[0], v[1], v[2]); }
    }
    miejsca.push({ klucz: st, dolne, gorne, ukryj: (cam) => ukryjWszystko(cam) ? 2 : ukryjGorne(cam) ? 1 : 0 });
  }
  if (rogi.length) {
    const g = new Geo(), dolne: number[] = [], gorne: number[] = [];
    for (const r of rogi) {
      ciagnij(g, r.s, r.prz.dolne); ciagnij(g, r.s, r.prz.gorne);
      if (r.dach) {
        const yF = misa ? yMisa : r.prz.gora + 4.5;
        ciagnij(g, r.s, dachSeg(-1, r.prz.uTyl + 0.6, yF, c));
        if (zamknieta) ciagnij(g, r.s, [seg([r.prz.uTyl, r.prz.gora], [r.prz.uTyl + 0.6, yF - 1.5], c.elew)]);
        else slup(g, r.s, (r.s.t0 + r.s.t1) / 2, r.prz.uTyl + 0.3, 0, yF - 1.4, 0.5, c.beton);
      }
      for (const mj of r.prz.miejsca) { const krok = 0.55 / (4 + mj.u); for (let t = r.s.t0 + krok / 2; t < r.s.t1; t += krok) { const v = r.s.map(t, mj.u, mj.y + 0.5); (mj.p ? gorne : dolne).push(v[0], v[1], v[2]); } }
    }
    const m = new THREE.Mesh(g.zbuduj(), mat); m.castShadow = !o.lekka; m.receiveShadow = !o.lekka; grupa.add(m);
    miejsca.push({ klucz: "X", dolne, gorne });
  }
  // ——— bieżnia ———
  if (bieznia) grupa.add(biezniaMesh(bieznia, o.snieg));
  // ——— zasięg, maszty, tablica, światła dachowe ———
  let zasieg = 70;
  for (const b of lista) zasieg = Math.max(zasieg, b.s.luk ? b.front + b.prz.uTyl + BIEZ_A : Math.hypot(b.front + b.prz.uTyl, b.L / 2));
  for (const r of rogi) zasieg = Math.max(zasieg, Math.hypot(L_SN / 2, L_WE / 2) + 4 + r.prz.uTyl);
  const maszty: Trybuny3D["maszty"] = [];
  let swiatlaDach: THREE.Mesh | undefined;
  const hMaszt = Math.max(26, gora + 14);
  if (misa || zadaszone.length >= 4) {
    // reflektory w listwie pod krawędzią dachu (trybuny wzdłuż boiska)
    const g = new Geo(), k = kolor(0xffffff);
    for (const b of lista) if ((b.st === "S" || b.st === "N") && b.t.dach) {
      const uF = b.prz.uTyl > 20 ? 2 : -1;
      for (let i = 0; i < 9; i++) { const t = b.s.t0 + ((i + 0.5) / 9) * (b.s.t1 - b.s.t0); const v = b.s.map(t, uF + 0.6, b.yDach - 1.0); g.box(v[0], v[1], v[2], b.s.luk ? 1.5 : 5, 0.6, 1.2, k, b.st === "N" ? Math.PI : 0); }
    }
    if (!g.pusta) { swiatlaDach = new THREE.Mesh(g.zbuduj(), new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0x000000, roughness: 0.4 })); grupa.add(swiatlaDach); }
  } else if (bieznia) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const kon = bok(sx > 0 ? "E" : "W"), R = (BIEZ_R + BIEZ_W + 1.6) + (kon ? kon.prz.uTyl + 5 : 8);
      maszty.push({ x: sx * (BIEZ_A + R * 0.72), z: sz * R * 0.72, h: hMaszt });
    }
  } else {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const a = bok(sz > 0 ? "S" : "N"), b = bok(sx > 0 ? "E" : "W"), rog = rogi.find((r) => r.sx === sx && r.sz === sz);
      const d = rog ? 4 + rog.prz.uTyl + 4 : Math.max(19.8, 4 + 0.6 * Math.max(a?.prz.uTyl ?? 0, b?.prz.uTyl ?? 0) + 6);
      maszty.push({ x: sx * (L_SN / 2 + d * 0.707), z: sz * (L_WE / 2 + d * 0.707), h: hMaszt });
    }
  }
  const w = bok("W");
  let tablica: Trybuny3D["tablica"];
  if (w && w.t.dach && !w.s.luk) tablica = { x: -(w.front + (w.prz.uTyl > 20 ? 3 : 0.5)), y: w.yDach - 4.2, z: 0, rotY: Math.PI / 2, zawieszona: true };
  else if (w) { const v = w.s.map((w.s.t0 + w.s.t1) / 2, w.prz.uTyl + 1, 0); tablica = { x: v[0], y: w.prz.gora + 4, z: v[2], rotY: Math.PI / 2, zawieszona: false }; }
  else tablica = { x: -(bieznia ? BIEZ_A + BIEZ_R + BIEZ_W + 6 : DL / 2 + 10), y: 0, z: 0, rotY: Math.PI / 2, zawieszona: false };
  return { grupa, strony, miejsca, zasieg, maszty, swiatlaDach, tablica, bieznia, gora };
}

/** Bieżnia: tartan (czerwony, z liniami torów) albo żużel. */
function biezniaMesh(rodzaj: "lekkoatletyczna" | "zuzlowa", snieg: boolean): THREE.Mesh {
  const owal = (R: number, odw = false) => {
    const p = new THREE.Path();
    p.moveTo(-BIEZ_A, -R); p.lineTo(BIEZ_A, -R); p.absarc(BIEZ_A, 0, R, -Math.PI / 2, Math.PI / 2, false);
    p.lineTo(-BIEZ_A, R); p.absarc(-BIEZ_A, 0, R, Math.PI / 2, Math.PI * 1.5, false);
    if (odw) return new THREE.Path(p.getPoints(24).reverse());
    return p;
  };
  const sh = new THREE.Shape(owal(BIEZ_R + BIEZ_W + 0.8).getPoints(24));
  sh.holes.push(owal(BIEZ_R - 0.3, true));
  const geo = new THREE.ShapeGeometry(sh, 24); geo.rotateX(-Math.PI / 2);
  // linie torów — tekstura z pasami po promieniu (współrzędna = odległość od owalu wewnętrznego)
  const pos = geo.getAttribute("position"), uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), dx = Math.max(0, Math.abs(x) - BIEZ_A);
    uv[i * 2] = (Math.hypot(dx, z) - BIEZ_R) / BIEZ_W; uv[i * 2 + 1] = 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 4; const x = cv.getContext("2d")!;
  const tartan = rodzaj === "lekkoatletyczna";
  x.fillStyle = snieg ? "#e6e2e0" : tartan ? "#b2452f" : "#6b5a4a"; x.fillRect(0, 0, 256, 4);
  if (tartan && !snieg) { x.fillStyle = "rgba(255,255,255,0.85)"; for (let i = 0; i <= 8; i++) x.fillRect(Math.min(253, Math.round((i / 8) * 248)), 0, 2, 4); }
  if (!tartan) { x.fillStyle = "#f2f2f2"; x.fillRect(250, 0, 6, 4); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }));
  m.position.y = 0.012; m.receiveShadow = true;
  return m;
}
