// Otoczenie stadionu 3D (#32): miasto (bloki z wielkiej płyty, wieżowce, ulice, park), miasteczko (bloki + domki)
// albo wieś (pola, las, domy przy drodze, kościół, stodoły). Tania geometria: instancje (bloki, domy, drzewa) i scalone
// siatki z kolorami wierzchołków (pola, drogi, tory, kościół) — ok. 9 wywołań rysowania na całe otoczenie.
// Deterministyczne dla klubu (rng z nazwy); w trybie lekkim mniejszy zasięg i mniej obiektów.
import * as THREE from "three";
import type { Klub, StanGry } from "../../engine/types";
import type { KsztaltStadionu } from "../../data/ksztaltyStadionow";
import { Geo, kolor } from "./trybuny3d";

export type TypOtoczenia = "metropolia" | "miasto" | "wies";

// duże miasta (≈ powyżej 250 tys. mieszkańców) i średnie miasta (≈ powyżej 40 tys.) — wystarczy do heurystyki
const METROPOLIE = new Set(["Warszawa", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Białystok", "Katowice", "Gdynia"]);
const MIASTA_SREDNIE = new Set(["Częstochowa", "Radom", "Toruń", "Rzeszów", "Kielce", "Gliwice", "Zabrze", "Olsztyn", "Bielsko-Biała", "Bytom", "Zielona Góra",
  "Rybnik", "Ruda Śląska", "Opole", "Tychy", "Sosnowiec", "Elbląg", "Płock", "Wałbrzych", "Gorzów Wielkopolski", "Chorzów", "Tarnów", "Koszalin", "Legnica",
  "Grudziądz", "Słupsk", "Kalisz", "Jaworzno", "Nowy Sącz", "Jelenia Góra", "Siedlce", "Mielec", "Stalowa Wola", "Inowrocław", "Lubin", "Głogów", "Piła",
  "Stargard", "Tczew", "Wejherowo", "Starogard Gdański", "Pruszków", "Świnoujście", "Chojnice", "Malbork", "Kwidzyn", "Sopot", "Rumia", "Skierniewice",
  "Świdnik", "Łęczna", "Nowy Targ", "Oświęcim", "Chrzanów", "Bochnia", "Gorlice", "Zakopane", "Brodnica", "Włocławek", "Kołobrzeg", "Police", "Wieliczka",
  "Grodzisk Mazowiecki", "Lębork", "Bytów", "Kartuzy", "Kościerzyna", "Puck", "Pruszcz Gdański", "Myślenice", "Andrychów", "Wadowice", "Limanowa", "Szczecinek",
  // warmińsko-mazurskie, podlaskie i III liga gr. I
  "Ełk", "Suwałki", "Łomża", "Ostróda", "Iława", "Giżycko", "Kętrzyn", "Bartoszyce", "Mrągowo", "Szczytno", "Działdowo", "Augustów", "Zambrów", "Grajewo", "Bielsk Podlaski", "Hajnówka", "Sokółka", "Siemiatycze", "Braniewo", "Pisz", "Olecko", "Lidzbark Warmiński", "Nowe Miasto Lubawskie", "Gołdap", "Mława", "Ciechanów", "Sieradz", "Łowicz", "Tomaszów Mazowiecki", "Mińsk Mazowiecki", "Nowy Dwór Mazowiecki", "Ząbki"]);

/** Miasto czy wieś: nadpisanie z kształtu stadionu → lista miast → liczba klubów z miejscowości → liga i pojemność. */
export function typOtoczenia(klub: Klub, s: StanGry | null, ks?: KsztaltStadionu): TypOtoczenia {
  if (ks?.otoczenie) return ks.otoczenie;
  const m = klub.miasto ?? "";
  if (METROPOLIE.has(m)) return "metropolia";
  if (MIASTA_SREDNIE.has(m)) return "miasto";
  let ile = 0;
  if (s?.kluby) for (const k of Object.values(s.kluby)) if (k.miasto === m && ++ile >= 6) break;
  if (ile >= 6) return "metropolia";
  if (ile >= 3) return "miasto";
  if (klub.poziom <= 3 || klub.pojemnosc >= 2500) return "miasto";
  if (klub.poziom <= 5 && klub.pojemnosc >= 1200) return "miasto";
  return "wies";
}

type Strefa = "bloki" | "wiezowce" | "domki" | "park" | "pola" | "las";
interface OpcjeOtoczenia { noc: boolean; snieg: boolean; lekka: boolean }

let teksturaOkien: { dzien: THREE.CanvasTexture; noc: THREE.CanvasTexture } | undefined;
/** Tekstura elewacji bloku: 8×8 okien (komórka 32 px); w nocy osobna mapa świecących okien. */
function oknaTex() {
  if (teksturaOkien) return teksturaOkien;
  const mk = (noc: boolean) => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!;
    g.fillStyle = noc ? "#000" : "#e4e1d8"; g.fillRect(0, 0, 256, 256);
    let h = 12345;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      h = Math.imul(h ^ (h >>> 13), 1274126177) + 7; const los = ((h >>> 0) % 100) / 100;
      if (noc) { if (los < 0.38) { g.fillStyle = los < 0.1 ? "#9fc4ff" : "#ffd98a"; g.fillRect(i * 32 + 8, j * 32 + 9, 16, 15); } }
      else { g.fillStyle = los < 0.15 ? "#5d6b78" : "#3b4855"; g.fillRect(i * 32 + 8, j * 32 + 9, 16, 15); g.fillStyle = "#c9c5ba"; g.fillRect(i * 32 + 6, j * 32 + 24, 20, 2); }
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  teksturaOkien = { dzien: mk(false), noc: mk(true) };
  return teksturaOkien;
}
/** Bryła bloku z UV dopasowanym do wymiarów (okno co 3,2 m, kondygnacja 3 m), dach bez okien. */
function geoBloku(w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0);
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  const wym: [number, number][] = [[d, h], [d, h], [0, 0], [0, 0], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
    const i = f * 4 + v, [fw, fh] = wym[f];
    if (fw === 0) uv.setXY(i, 0.01, 0.01); else uv.setXY(i, (uv.getX(i) * fw) / 3.2 / 8, (uv.getY(i) * fh) / 3 / 8);
  }
  return g;
}
/** Dom: ściany (box) + dach dwuspadowy (pryzmat) — osobne instancje, by kolorować niezależnie. */
function geoDachu(): THREE.BufferGeometry {
  const g = new Geo(), k = kolor(0xffffff);
  const A: [number, number, number] = [-0.55, 0, -0.56], B: [number, number, number] = [0.55, 0, -0.56], Cc: [number, number, number] = [0.55, 0, 0.56], D: [number, number, number] = [-0.55, 0, 0.56];
  const E: [number, number, number] = [-0.55, 1, 0], F: [number, number, number] = [0.55, 1, 0];
  g.quad(A, B, F, E, k); g.quad(Cc, D, E, F, k); g.tri(D, A, E, k); g.tri(B, Cc, F, k);
  return g.zbuduj();
}
function geoDrzewa(iglaste: boolean): THREE.BufferGeometry {
  const g = new Geo(), pien = kolor(0x5a3d26), kor = kolor(iglaste ? 0x2c5a32 : 0x3f7a35);
  g.box(0, 1.2, 0, 0.5, 2.4, 0.5, pien);
  const korona = iglaste ? new THREE.ConeGeometry(2.6, 8, 6) : new THREE.IcosahedronGeometry(3.2, 0);
  korona.translate(0, iglaste ? 6 : 5.2, 0);
  const nk = korona.toNonIndexed(), p = nk.getAttribute("position");
  for (let i = 0; i < p.count; i += 3) g.tri([p.getX(i), p.getY(i), p.getZ(i)], [p.getX(i + 1), p.getY(i + 1), p.getZ(i + 1)], [p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)], kor);
  korona.dispose(); nk.dispose();
  return g.zbuduj();
}

/** Buduje otoczenie wokół stadionu. R0 — promień wolny od zabudowy (stadion + plac). */
export function zbudujOtoczenie(typ: TypOtoczenia, r: () => number, R0: number, mat: THREE.Material, o: OpcjeOtoczenia, orbita = 0): THREE.Group {
  const grupa = new THREE.Group(); grupa.name = "otoczenie";
  const C = 28, RMAX = o.lekka ? Math.min(300, R0 + 150) : 300;
  const snieg = o.snieg;
  const rozne = new Geo(); // drogi, tory, pola, kościół, pociąg
  const asfalt = kolor(snieg ? 0xc9ced3 : 0x4a4d52), pobocze = kolor(snieg ? 0xe9eef2 : 0x8a8f86);
  // ——— strefy: kilka „ziaren" kąta z typem zabudowy ———
  const typy: Strefa[] = typ === "metropolia" ? ["bloki", "wiezowce", "bloki", "park", "bloki", "domki"]
    : typ === "miasto" ? ["bloki", "domki", "domki", "park", "bloki", "domki"] : ["pola", "pola", "las", "domki", "pola", "las"];
  const ziarna = typy.map((t, i) => ({ kat: (i / typy.length) * Math.PI * 2 + (r() - 0.5) * 0.8, t }));
  const strefa = (x: number, z: number): Strefa => {
    const a = Math.atan2(z, x); let best = ziarna[0], bd = 9;
    for (const zr of ziarna) { let d = Math.abs(a - zr.kat) % (Math.PI * 2); if (d > Math.PI) d = Math.PI * 2 - d; if (d < bd) { bd = d; best = zr; } }
    return best.t;
  };
  // ——— drogi ———
  const drogi: { nx: number; nz: number; d: number; w: number }[] = []; // prosta: nx*x + nz*z = d
  const droga = (kat: number, d: number, w: number) => {
    const nx = Math.cos(kat), nz = Math.sin(kat), tx = -nz, tz = nx, L = 640;
    const p = (s: number, off: number): [number, number, number] => [nx * (d + off) + tx * s, 0.04, nz * (d + off) + tz * s];
    rozne.quad(p(-L / 2, -w / 2 - 1.5), p(L / 2, -w / 2 - 1.5), p(L / 2, w / 2 + 1.5), p(-L / 2, w / 2 + 1.5), pobocze);
    const q = (s: number, off: number): [number, number, number] => [nx * (d + off) + tx * s, 0.06, nz * (d + off) + tz * s];
    rozne.quad(q(-L / 2, -w / 2), q(L / 2, -w / 2), q(L / 2, w / 2), q(-L / 2, w / 2), asfalt);
    drogi.push({ nx, nz, d, w: w + 3 });
  };
  const katDrogi = r() * Math.PI;
  if (typ === "wies") droga(katDrogi, R0 + 6 + r() * 20, 6);
  else {
    droga(katDrogi, R0 + 4, typ === "metropolia" ? 14 : 9);
    droga(katDrogi + Math.PI / 2, -(R0 + 4 + r() * 30), 8);
    if (typ === "metropolia") droga(katDrogi + Math.PI, R0 + 90 + r() * 40, 8);
  }
  // ——— tory kolejowe ———
  let tor: { nx: number; nz: number; d: number } | undefined;
  if (r() < (typ === "wies" ? 0.4 : 0.55)) {
    const kat = r() * Math.PI, d = R0 + 50 + r() * 80, nx = Math.cos(kat), nz = Math.sin(kat), tx = -nz, tz = nx, L = 640;
    const p = (s: number, off: number, y: number): [number, number, number] => [nx * (d + off) + tx * s, y, nz * (d + off) + tz * s];
    const tluczen = kolor(snieg ? 0xd8dadc : 0x7d7468), szyna = kolor(0x9a9da0), podkl = kolor(0x4a3a2c);
    rozne.quad(p(-L / 2, -3, 0.08), p(L / 2, -3, 0.08), p(L / 2, 3, 0.08), p(-L / 2, 3, 0.08), tluczen);
    for (const off of [-0.75, 0.75]) { rozne.quad(p(-L / 2, off - 0.06, 0.32), p(L / 2, off - 0.06, 0.32), p(L / 2, off + 0.06, 0.32), p(-L / 2, off + 0.06, 0.32), szyna); }
    if (!o.lekka) for (let s = -200; s <= 200; s += 2.2) { const c0 = p(s, 0, 0.2); rozne.box(c0[0], 0.18, c0[2], 0.3, 0.12, 2.4, podkl, -kat); }
    // trakcja (słupy) w mieście, pociąg regionalny stojący na szlaku
    if (typ !== "wies" && !o.lekka) for (let s = -240; s <= 240; s += 50) { const c0 = p(s, 3.6, 0); rozne.box(c0[0], 3.6, c0[2], 0.3, 7.2, 0.3, szyna, -kat); }
    if (r() < 0.6) {
      const s0 = (r() - 0.5) * 200, wag = [kolor(0xc8102e), kolor(0xf2c230), kolor(0xc8102e)];
      for (let i = 0; i < 3; i++) { const c0 = p(s0 + i * 21, 0, 0); rozne.box(c0[0], 2.4, c0[2], 20, 3.6, 2.9, wag[i], -kat + Math.PI / 2); }
    }
    tor = { nx, nz, d };
  }
  // ——— kolekcje instancji ———
  const bloki: { x: number; z: number; rot: number; k: THREE.Color; typ: 0 | 1 | 2 }[] = [];
  const domy: { x: number; z: number; rot: number; sx: number; sy: number; sz: number; kw: THREE.Color; kd: THREE.Color }[] = [];
  const drzewa: { x: number; z: number; s: number; igl: boolean; k: THREE.Color }[] = [];
  const kolBlok = [0xe8e2d2, 0xd5d9dc, 0xe6d6b8, 0xc9d4c0, 0xd8c6c0, 0xbfc9d6].map(kolor);
  const kolDom = [0xf1ece0, 0xe8dcc0, 0xd9d2c4, 0xf3e3c3, 0xcfd8d0, 0xe9d0b8].map(kolor);
  const kolDach = (snieg ? [0xf4f6f8, 0xe8ecef] : [0x8a3b2a, 0x6b2e22, 0x4a4d52, 0x7a4a2a, 0x3d3f44]).map(kolor);
  const kolPola = (snieg ? [0xf0f3f6, 0xe6ebef, 0xdfe5ea] : [0xc9b36a, 0xd8c47a, 0x6f8f3a, 0x5d7f35, 0x7a5f3e, 0xe0d050, 0x8aa04a]).map(kolor);
  const kolDrz = snieg ? [kolor(0xdfe8e4), kolor(0xc9d6d0)] : [kolor(0xffffff), kolor(0xd8e8c8), kolor(0xb8d0a8)];
  const kolKosciol: THREE.Color[] = [kolor(typ === "wies" ? 0xf0ece2 : 0xb5523a), kolor(snieg ? 0xeef2f5 : 0x3a5a45)];
  const blisko = (x: number, z: number, l: { nx: number; nz: number; d: number }, m: number) => Math.abs(l.nx * x + l.nz * z - l.d) < m;
  let kosciol = false;
  const cellsCount = Math.ceil(RMAX / C);
  for (let i = -cellsCount; i <= cellsCount; i++) for (let j = -cellsCount; j <= cellsCount; j++) {
    const cx = i * C + (r() - 0.5) * 4, cz = j * C + (r() - 0.5) * 4, dist = Math.hypot(cx, cz);
    if (dist < R0 + C * 0.45 || dist > RMAX) continue;
    if (drogi.some((l) => blisko(cx, cz, l, l.w / 2 + C * 0.42))) {
      // przy drodze na wsi: domy wzdłuż, w mieście drzewa w szpalerze
      if (typ !== "wies" && r() < 0.5) drzewa.push({ x: cx, z: cz, s: 0.8 + r() * 0.3, igl: false, k: kolDrz[Math.floor(r() * kolDrz.length)] });
      continue;
    }
    if (tor && blisko(cx, cz, tor, 4 + C * 0.42)) continue;
    let st = strefa(cx, cz);
    // wieś: zabudowa skupia się przy drodze
    if (typ === "wies") { const dr = drogi[0]; const dd = Math.abs(dr.nx * cx + dr.nz * cz - dr.d); if (dd < C * 1.6 && st !== "las") st = "domki"; else if (st === "domki") st = "pola"; }
    if (typ !== "wies" && dist > RMAX - C * 2 && st === "domki" && r() < 0.5) st = "park";
    // pas, po którym krąży kamera w menu/podglądzie stadionu: bez wysokich bloków tuż przed obiektywem
    const naOrbicie = orbita > 0 && dist > orbita * 0.68 && dist < orbita * 1.38;
    if (naOrbicie && (st === "bloki" || st === "wiezowce")) st = r() < 0.5 ? "park" : "domki";
    const rot = typ === "wies" ? katDrogi + Math.PI / 2 : katDrogi + Math.PI / 2 + (r() < 0.2 ? Math.PI / 2 : 0);
    if (!kosciol && st === "domki" && dist > R0 + 40 && !naOrbicie && r() < 0.25) {
      kosciol = true; zbudujKosciol(rozne, cx, cz, rot, typ !== "wies", kolKosciol); continue;
    }
    if (st === "bloki" || st === "wiezowce") {
      const t: 0 | 1 | 2 = st === "wiezowce" ? (r() < 0.5 ? 2 : 1) : r() < 0.2 ? 1 : 0;
      if (o.lekka && r() < 0.3) continue;
      bloki.push({ x: cx, z: cz, rot, k: kolBlok[Math.floor(r() * kolBlok.length)], typ: t });
      if (r() < 0.5) drzewa.push({ x: cx + C * 0.42, z: cz + (r() - 0.5) * C, s: 0.8 + r() * 0.4, igl: false, k: kolDrz[Math.floor(r() * kolDrz.length)] });
    } else if (st === "domki") {
      const n = typ === "wies" ? 2 : 3;
      for (let q = 0; q < n; q++) {
        if (r() < (o.lekka ? 0.45 : 0.15)) continue;
        const ox = (q - (n - 1) / 2) * (C / n) + (r() - 0.5) * 2, oz = (r() - 0.5) * 8;
        const cs = Math.cos(rot), sn = Math.sin(rot);
        const stodola = typ === "wies" && q === 1 && r() < 0.35;
        domy.push({ x: cx + ox * cs + oz * sn, z: cz - ox * sn + oz * cs, rot, sx: stodola ? 14 : 8 + r() * 3, sy: stodola ? 5.5 : 5 + r() * 2.5, sz: stodola ? 9 : 7.5 + r() * 2,
          kw: stodola ? kolor(snieg ? 0x8a6a4a : 0x7a5236) : kolDom[Math.floor(r() * kolDom.length)], kd: kolDach[Math.floor(r() * kolDach.length)] });
      }
      if (r() < 0.7) drzewa.push({ x: cx + (r() - 0.5) * C * 0.8, z: cz + (r() - 0.5) * C * 0.8, s: 0.7 + r() * 0.5, igl: r() < 0.3, k: kolDrz[Math.floor(r() * kolDrz.length)] });
    } else if (st === "park" || st === "las") {
      const n = st === "las" ? (o.lekka ? 4 : 7) : (o.lekka ? 2 : 4);
      for (let q = 0; q < n; q++) drzewa.push({ x: cx + (r() - 0.5) * C, z: cz + (r() - 0.5) * C, s: 0.8 + r() * 0.6, igl: st === "las" ? r() < 0.75 : r() < 0.2, k: kolDrz[Math.floor(r() * kolDrz.length)] });
    } else { // pola: prostokąt uprawy (czasem z miedzą i samotnym drzewem)
      const k = kolPola[Math.floor(r() * kolPola.length)], a = C / 2 - 0.6;
      const v = (dx: number, dz: number): [number, number, number] => [i * C + dx, 0.03, j * C + dz]; // pola w siatce — bez nakładania
      rozne.quad(v(-a, -a), v(a, -a), v(a, a), v(-a, a), k);
      if (r() < 0.12) drzewa.push({ x: cx, z: cz, s: 1 + r() * 0.4, igl: false, k: kolDrz[0] });
    }
  }
  // wieś bez kościoła na liście? postaw go przy drodze (wieża kościoła to znak rozpoznawczy wsi)
  if (!kosciol && typ !== "metropolia") {
    const dr = drogi[0], tx = -dr.nz, tz = dr.nx, s = (r() - 0.5) * 120, off = dr.d + dr.w / 2 + 14;
    zbudujKosciol(rozne, dr.nx * off + tx * s, dr.nz * off + tz * s, katDrogi + Math.PI / 2, typ !== "wies", kolKosciol);
  }
  // parking przy stadionie (miasto)
  if (typ !== "wies") {
    const kat = katDrogi + Math.PI, d = R0 - 14, cx = Math.cos(kat) * d, cz = Math.sin(kat) * d, cs = Math.cos(katDrogi), sn = Math.sin(katDrogi);
    const v = (dx: number, dz: number): [number, number, number] => [cx + dx * cs + dz * sn, 0.05, cz - dx * sn + dz * cs];
    rozne.quad(v(-30, -9), v(30, -9), v(30, 9), v(-30, 9), asfalt);
    const auta = [0xc8102e, 0x1d3f94, 0xdddddd, 0x222222, 0x8a8f96, 0x2f6b3a].map(kolor);
    for (let i = 0; i < (o.lekka ? 8 : 22); i++) { const p = v(-27 + (i % 11) * 5.4, i < 11 ? -5 : 5); rozne.box(p[0], 0.75, p[2], 2, 1.5, 4.4, auta[Math.floor(r() * auta.length)], -katDrogi); }
  }
  if (!rozne.pusta) { const m = new THREE.Mesh(rozne.zbuduj(), mat); m.receiveShadow = !o.lekka; grupa.add(m); }
  // ——— instancje: bloki ———
  const tex = oknaTex();
  const matBlok = new THREE.MeshStandardMaterial({ map: tex.dzien, roughness: 0.9, emissive: o.noc ? 0xffffff : 0x000000, emissiveMap: o.noc ? tex.noc : null, emissiveIntensity: o.noc ? 0.9 : 0 });
  const wymiary: [number, number, number][] = [[26, 15, 11], [22, 33, 13], [18, 48, 18]];
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), osY = new THREE.Vector3(0, 1, 0);
  for (const t of [0, 1, 2] as const) {
    const lista = bloki.filter((b) => b.typ === t); if (!lista.length) continue;
    const [w, h, d] = wymiary[t];
    const im = new THREE.InstancedMesh(geoBloku(w, h, d), matBlok, lista.length);
    lista.forEach((b, i) => { q.setFromAxisAngle(osY, b.rot); mtx.compose(v.set(b.x, 0, b.z), q, sc.set(1, 1, 1)); im.setMatrixAt(i, mtx); im.setColorAt(i, b.k); });
    grupa.add(im);
  }
  // ——— domy ———
  if (domy.length) {
    const sciany = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ roughness: 0.95 }), domy.length);
    const dachy = new THREE.InstancedMesh(geoDachu(), new THREE.MeshStandardMaterial({ roughness: 0.85 }), domy.length);
    domy.forEach((d, i) => {
      q.setFromAxisAngle(osY, d.rot);
      mtx.compose(v.set(d.x, 0, d.z), q, sc.set(d.sx, d.sy, d.sz)); sciany.setMatrixAt(i, mtx); sciany.setColorAt(i, d.kw);
      mtx.compose(v.set(d.x, d.sy, d.z), q, sc.set(d.sx, d.sz * 0.42, d.sz)); dachy.setMatrixAt(i, mtx); dachy.setColorAt(i, d.kd);
    });
    grupa.add(sciany, dachy);
  }
  // ——— drzewa ———
  for (const igl of [true, false]) {
    const lista = drzewa.filter((d) => d.igl === igl); if (!lista.length) continue;
    const im = new THREE.InstancedMesh(geoDrzewa(igl), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), lista.length);
    lista.forEach((d, i) => { q.setFromAxisAngle(osY, d.x * 0.37); mtx.compose(v.set(d.x, 0, d.z), q, sc.set(d.s, d.s * (0.85 + ((i * 7) % 5) * 0.08), d.s)); im.setMatrixAt(i, mtx); im.setColorAt(i, d.k); });
    grupa.add(im);
  }
  return grupa;
}

/** Kościół: nawa z dachem dwuspadowym, wieża z hełmem (wieś: biały tynk, miasto: czerwona cegła, dwie wieże). */
function zbudujKosciol(g: Geo, x: number, z: number, rot: number, miejski: boolean, [mur, helm]: THREE.Color[]) {
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const p = (dx: number, dy: number, dz: number): [number, number, number] => [x + dx * cs + dz * sn, dy, z - dx * sn + dz * cs];
  const dach = kolor(miejski ? 0x5a3a2e : 0x8a3b2a);
  g.box(x, 5, z, 10, 10, 22, mur, rot);
  // dach nawy (dwuspadowy)
  g.quad(p(-5.5, 10, -11), p(-5.5, 10, 11), p(0, 15, 11), p(0, 15, -11), dach);
  g.quad(p(5.5, 10, 11), p(5.5, 10, -11), p(0, 15, -11), p(0, 15, 11), dach);
  g.tri(p(-5, 10, 11), p(5, 10, 11), p(0, 15, 11), mur); g.tri(p(5, 10, -11), p(-5, 10, -11), p(0, 15, -11), mur);
  const wieze = miejski ? [-3.2, 3.2] : [0];
  for (const ox of wieze) {
    const w = miejski ? 4 : 5, h = miejski ? 30 : 24, c = p(ox, 0, -13);
    g.box(c[0], h / 2, c[2], w, h, w, mur, rot);
    // hełm: ostrosłup
    const top = p(ox, h + (miejski ? 10 : 9), -13);
    const n = [p(ox - w / 2, h, -13 - w / 2), p(ox + w / 2, h, -13 - w / 2), p(ox + w / 2, h, -13 + w / 2), p(ox - w / 2, h, -13 + w / 2)];
    for (let i = 0; i < 4; i++) g.tri(n[i], n[(i + 1) % 4], top, helm);
    g.box(top[0], top[1] + 1, top[2], 0.2, 2, 0.2, kolor(0xd9b44a), rot); g.box(top[0], top[1] + 1.3, top[2], 1.0, 0.2, 0.2, kolor(0xd9b44a), rot);
  }
}
