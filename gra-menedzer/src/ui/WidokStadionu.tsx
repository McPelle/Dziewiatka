import type { ReactElement } from "react";
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from "react-native-svg";
import type { Klub } from "../engine/types";
import { barwyKlubu } from "../data/barwy";

// Rysunek stadionu z lotu ptaka. Wszystko liczone z danych klubu:
// – trybuny rosną z pojemnością (mała ławka w klasie B → 4 trybuny + narożniki + drugi poziom w Ekstraklasie),
// – wokół „mini miasto": parkingi z autami, budki z jedzeniem, sklep, sanitariaty, kasy, strefa kibica,
//   muzeum, hotel, boiska treningowe; na stadionie loże VIP, telebim, dach i maszty oświetleniowe.

const W = 480, H = 400, CX = 248, CY = 190, PW = 136, PH = 88, M = 6;

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
const KOLORY_AUT = ["#d9463b", "#2f6fd6", "#e8e8e8", "#1f1f1f", "#9aa3ad", "#f2c230", "#3c8c4c", "#7a3fa0", "#c46a2b"];

type Strona = "S" | "N" | "W" | "E";
/** Podział miejsc na trybuny wg pojemności. */
export function podzialTrybun(poj: number): { strony: Partial<Record<Strona, number>>; narozniki: number } {
  let st: Partial<Record<Strona, number>>;
  if (poj < 400) st = { S: poj };
  else if (poj < 1500) st = { S: poj * 0.6, N: poj * 0.4 };
  else if (poj < 5000) st = { S: poj * 0.45, N: poj * 0.35, W: poj * 0.2 };
  else st = { S: poj * 0.35, N: poj * 0.3, W: poj * 0.175, E: poj * 0.175 };
  let narozniki = 0;
  if (poj >= 15000) { narozniki = poj * 0.1; for (const k of Object.keys(st) as Strona[]) st[k] = st[k]! * 0.9; }
  for (const k of Object.keys(st) as Strona[]) st[k] = Math.round(st[k]!);
  return { strony: st, narozniki: Math.round(narozniki) };
}
const glebokosc = (miejsca: number) => Math.max(6, Math.min(50, 4 + Math.sqrt(miejsca) * 0.4));

export function WidokStadionu({ klub, oswietlenie }: { klub: Klub; oswietlenie: boolean }) {
  const r = rng(klub.nazwa);
  const [kol1, kol2] = barwyKlubu(klub.nazwa);
  const ob = klub.obiekty;
  const p = (t: keyof typeof ob) => ob[t] ?? 0;
  const { strony, narozniki } = podzialTrybun(klub.pojemnosc);
  const d: Record<Strona, number> = { S: 0, N: 0, W: 0, E: 0 };
  for (const k of Object.keys(strony) as Strona[]) d[k] = glebokosc(strony[k]!);
  // Granice boiska + otoczenia boiska
  const bx0 = CX - PW / 2 - M, bx1 = CX + PW / 2 + M, by0 = CY - PH / 2 - M, by1 = CY + PH / 2 + M;
  const el: ReactElement[] = [];
  let key = 0;
  const k = () => String(key++);

  // ——— Teren, drogi, drzewa ———
  el.push(<Rect key={k()} x={0} y={0} width={W} height={H} fill="#2e5e33" />);
  el.push(<Rect key={k()} x={0} y={H - 22} width={W} height={14} fill="#43474d" />); // ulica dolna
  el.push(<Rect key={k()} x={128} y={0} width={8} height={H - 8} fill="#43474d" />); // ulica przy parkingu
  for (let x = 6; x < W; x += 18) el.push(<Rect key={k()} x={x} y={H - 15.5} width={9} height={1} fill="#e8e3c9" />);
  // plac wokół stadionu (bruk)
  el.push(<Rect key={k()} x={bx0 - d.W - 10} y={by0 - d.N - 10} width={bx1 - bx0 + d.W + d.E + 20} height={by1 - by0 + d.N + d.S + 20} rx={8} fill="#8b8f86" />);

  // ——— Boisko ———
  el.push(<Rect key={k()} x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} fill={klub.murawa === "sztuczna" ? "#2b8a4b" : "#2f9a4c"} />);
  for (let i = 0; i < 10; i++) el.push(<Rect key={k()} x={CX - PW / 2 + (i * PW) / 10} y={CY - PH / 2} width={PW / 20} height={PH} fill="#ffffff" opacity={0.05} />);
  el.push(<Rect key={k()} x={CX - PW / 2} y={CY - PH / 2} width={PW} height={PH} fill="none" stroke="#e9f5ea" strokeWidth={1} />);
  el.push(<Line key={k()} x1={CX} y1={CY - PH / 2} x2={CX} y2={CY + PH / 2} stroke="#e9f5ea" strokeWidth={1} />);
  el.push(<Circle key={k()} cx={CX} cy={CY} r={11} fill="none" stroke="#e9f5ea" strokeWidth={1} />);
  for (const sx of [-1, 1]) {
    const gx = CX + sx * PW / 2;
    el.push(<Rect key={k()} x={sx < 0 ? gx : gx - 20} y={CY - 22} width={20} height={44} fill="none" stroke="#e9f5ea" strokeWidth={1} />);
    el.push(<Rect key={k()} x={sx < 0 ? gx : gx - 7} y={CY - 10} width={7} height={20} fill="none" stroke="#e9f5ea" strokeWidth={1} />);
    el.push(<Rect key={k()} x={sx < 0 ? gx - 3 : gx} y={CY - 5} width={3} height={10} fill="#ffffff" />);
  }

  // ——— Trybuny ———
  const zad = p("zadaszenie");
  const zadaszone: Strona[] = zad >= 3 ? ["S", "N", "W", "E"] : zad === 2 ? ["S", "N"] : zad === 1 ? ["S"] : [];
  const trybuna = (strona: Strona, miejsca: number) => {
    const g = d[strona];
    const dlugaPelna = strona === "S" || strona === "N" ? bx1 - bx0 : by1 - by0;
    const dl = miejsca < 1200 ? Math.min(dlugaPelna, 36 + miejsca * 0.09) : dlugaPelna;
    let x: number, y: number, w: number, h: number;
    if (strona === "S") { w = dl; h = g; x = CX - dl / 2; y = by1 + 2; }
    else if (strona === "N") { w = dl; h = g; x = CX - dl / 2; y = by0 - 2 - g; }
    else if (strona === "W") { w = g; h = dl; x = bx0 - 2 - g; y = CY - dl / 2; }
    else { w = g; h = dl; x = bx1 + 2; y = CY - dl / 2; }
    const pion = strona === "W" || strona === "E";
    el.push(<Rect key={k()} x={x} y={y} width={w} height={h} fill={kol1} stroke="#1b1b1b" strokeWidth={0.6} />);
    // rzędy siedzisk
    const rzedy = Math.max(2, Math.floor(g / 2.6));
    for (let i = 1; i < rzedy; i++) {
      const f = i / rzedy;
      if (pion) el.push(<Line key={k()} x1={x + w * f} y1={y} x2={x + w * f} y2={y + h} stroke={kol2} strokeWidth={0.7} opacity={0.55} />);
      else el.push(<Line key={k()} x1={x} y1={y + h * f} x2={x + w} y2={y + h * f} stroke={kol2} strokeWidth={0.7} opacity={0.55} />);
    }
    // przejścia (schody)
    const przejsc = Math.max(1, Math.floor(dl / 28));
    for (let i = 1; i <= przejsc; i++) {
      const f = i / (przejsc + 1);
      if (pion) el.push(<Line key={k()} x1={x} y1={y + h * f} x2={x + w} y2={y + h * f} stroke="#d8d8d8" strokeWidth={1} />);
      else el.push(<Line key={k()} x1={x + w * f} y1={y} x2={x + w * f} y2={y + h} stroke="#d8d8d8" strokeWidth={1} />);
    }
    // drugi poziom
    if (g > 26) {
      const g2 = g * 0.45;
      if (strona === "S") el.push(<Rect key={k()} x={x} y={y + h - g2} width={w} height={g2} fill="#000" opacity={0.18} />);
      if (strona === "N") el.push(<Rect key={k()} x={x} y={y} width={w} height={g2} fill="#000" opacity={0.18} />);
      if (strona === "W") el.push(<Rect key={k()} x={x} y={y} width={g2} height={h} fill="#000" opacity={0.18} />);
      if (strona === "E") el.push(<Rect key={k()} x={x + w - g2} y={y} width={g2} height={h} fill="#000" opacity={0.18} />);
    }
    // dach
    if (zadaszone.includes(strona)) {
      const pokr = 0.75;
      if (strona === "S") el.push(<Rect key={k()} x={x - 1} y={y + h * (1 - pokr)} width={w + 2} height={h * pokr + 2} fill="#e6ecef" opacity={0.55} stroke="#ffffff" strokeWidth={0.6} />);
      if (strona === "N") el.push(<Rect key={k()} x={x - 1} y={y - 2} width={w + 2} height={h * pokr + 2} fill="#e6ecef" opacity={0.55} stroke="#ffffff" strokeWidth={0.6} />);
      if (strona === "W") el.push(<Rect key={k()} x={x - 2} y={y - 1} width={w * pokr + 2} height={h + 2} fill="#e6ecef" opacity={0.55} stroke="#ffffff" strokeWidth={0.6} />);
      if (strona === "E") el.push(<Rect key={k()} x={x + w * (1 - pokr)} y={y - 1} width={w * pokr + 2} height={h + 2} fill="#e6ecef" opacity={0.55} stroke="#ffffff" strokeWidth={0.6} />);
    }
    // podpis liczby miejsc
    const tx = x + w / 2, ty = y + h / 2 + 2.5;
    el.push(<SvgText key={k()} x={tx} y={ty} fontSize={pion ? 6.5 : 7.5} fontWeight="bold" fill="#ffffff" stroke="#000" strokeWidth={0.25} textAnchor="middle"
      transform={pion ? `rotate(${strona === "W" ? -90 : 90} ${tx} ${ty - 2.5})` : undefined}>{miejsca.toLocaleString("pl")}</SvgText>);
    return { x, y, w, h };
  };
  const ramki: Partial<Record<Strona, { x: number; y: number; w: number; h: number }>> = {};
  for (const s of ["S", "N", "W", "E"] as Strona[]) if (strony[s]) ramki[s] = trybuna(s, strony[s]!);
  // narożniki (duże stadiony)
  if (narozniki > 0) {
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x0 = sx < 0 ? bx0 - 2 - d.W : bx1 + 2, y0 = sy < 0 ? by0 - 2 - d.N : by1 + 2;
      const w = sx < 0 ? d.W : d.E, h = sy < 0 ? d.N : d.S;
      const ax = sx < 0 ? x0 + w : x0, ay = sy < 0 ? y0 + h : y0;
      const bx = sx < 0 ? x0 : x0 + w, by = sy < 0 ? y0 : y0 + h;
      el.push(<Polygon key={k()} points={`${ax},${ay} ${bx},${ay} ${bx},${by} ${ax},${by}`} fill={kol1} opacity={0.85} stroke="#1b1b1b" strokeWidth={0.6} />);
      if (zad >= 5) el.push(<Polygon key={k()} points={`${ax},${ay} ${bx},${ay} ${bx},${by} ${ax},${by}`} fill="#e6ecef" opacity={0.5} />);
    }
  }
  // loże VIP — przeszklony pas z tyłu trybuny głównej
  const loze = p("loze");
  if (loze > 0 && ramki.S) {
    const lw = Math.min(ramki.S.w - 6, 18 + loze * 12);
    el.push(<Rect key={k()} x={CX - lw / 2} y={ramki.S.y + ramki.S.h - 4} width={lw} height={3.5} fill="#9fd9ff" stroke="#1b4d70" strokeWidth={0.5} />);
    el.push(<SvgText key={k()} x={CX} y={ramki.S.y + ramki.S.h + 6} fontSize={5} fill="#ffffff" textAnchor="middle">LOŻE VIP</SvgText>);
  }
  // ławki rezerwowych
  el.push(<Rect key={k()} x={CX - 24} y={by1 - 4} width={14} height={2.5} fill="#cfd8dc" />);
  el.push(<Rect key={k()} x={CX + 10} y={by1 - 4} width={14} height={2.5} fill="#cfd8dc" />);

  // ——— Telebim ———
  const tel = p("telebim");
  if (tel > 0) {
    const tw = 18 + tel * 5, th = 9 + tel;
    const tx = ramki.W ? ramki.W.x - 4 - th : bx0 - 18 - th;
    el.push(<Rect key={k()} x={tx} y={CY - tw / 2} width={th} height={tw} fill="#111" stroke="#666" strokeWidth={0.8} />);
    el.push(<Rect key={k()} x={tx + 1.5} y={CY - tw / 2 + 1.5} width={th - 3} height={tw - 3} fill="#2b6cff" opacity={0.85} />);
    // bandy LED dookoła boiska
    el.push(<Rect key={k()} x={bx0 + 2} y={by1 - 2} width={bx1 - bx0 - 4} height={1.4} fill="#46a8ff" />);
    el.push(<Rect key={k()} x={bx0 + 2} y={by0 + 0.6} width={bx1 - bx0 - 4} height={1.4} fill="#46a8ff" />);
  }

  // ——— Maszty oświetleniowe ———
  if (oswietlenie) {
    const ox = [bx0 - d.W - 6, bx1 + d.E + 6], oy = [by0 - d.N - 6, by1 + d.S + 6];
    for (const x of ox) for (const y of oy) {
      el.push(<Circle key={k()} cx={x} cy={y} r={5} fill="#fff7c2" opacity={0.25} />);
      el.push(<Rect key={k()} x={x - 3} y={y - 2} width={6} height={4} fill="#f5f5f5" stroke="#555" strokeWidth={0.5} />);
    }
  }

  // ——— Kasy / bramki wejściowe (przy placu, od strony ulicy) ———
  const kasy = p("kasy");
  const yBramek = by1 + d.S + 12;
  for (let i = 0; i < Math.max(1, kasy * 2); i++) {
    const x = CX - (Math.max(1, kasy * 2) * 9) / 2 + i * 9;
    el.push(<Rect key={k()} x={x} y={yBramek} width={6} height={5} fill={kasy ? "#c0392b" : "#6d5a3d"} stroke="#222" strokeWidth={0.4} />);
  }
  el.push(<SvgText key={k()} x={CX} y={yBramek + 12} fontSize={5.5} fill="#ffffff" textAnchor="middle">{kasy ? `KASY · ${kasy * 2} bramek` : "wejście"}</SvgText>);

  // ——— Sanitariaty (niebieskie pawilony przy narożnikach placu) ———
  const toal = p("toalety");
  const rogi = [[bx0 - d.W - 9, by1 + d.S + 2], [bx1 + d.E + 2, by1 + d.S + 2], [bx0 - d.W - 9, by0 - d.N - 9], [bx1 + d.E + 2, by0 - d.N - 9]];
  for (let i = 0; i < Math.min(4, toal); i++) {
    const [x, y] = rogi[i];
    el.push(<Rect key={k()} x={x} y={y} width={7} height={7} fill="#2c7be5" stroke="#fff" strokeWidth={0.4} />);
    el.push(<SvgText key={k()} x={x + 3.5} y={y + 5.2} fontSize={4.5} fill="#fff" textAnchor="middle">WC</SvgText>);
  }
  if (toal === 5) { const [x, y] = rogi[0]; el.push(<Rect key={k()} x={x} y={y - 9} width={7} height={7} fill="#2c7be5" stroke="#fff" strokeWidth={0.4} />); }

  // ——— Parking (lewa kolumna): poziom 0 = trawiasty plac, każdy poziom = kolejny plac; 5 = parking wielopoziomowy ———
  const park = p("parking");
  const placy = Math.max(1, park);
  const ph = Math.min(52, (H - 40) / placy - 6);
  for (let i = 0; i < placy; i++) {
    const y0 = 10 + i * (ph + 6);
    const wielo = park >= 5 && i === 0;
    el.push(<Rect key={k()} x={6} y={y0} width={116} height={ph} fill={park ? (wielo ? "#5b6068" : "#3a3d42") : "#5d7a45"} stroke="#d6d6d6" strokeWidth={0.5} />);
    // miejsca i auta
    const rz = Math.max(1, Math.floor(ph / 14));
    for (let rr = 0; rr < rz; rr++) for (let c = 0; c < 12; c++) {
      const x = 9 + c * 9.4, y = y0 + 3 + rr * 14;
      if (park) el.push(<Line key={k()} x1={x - 0.8} y1={y} x2={x - 0.8} y2={y + 9} stroke="#e0e0e0" strokeWidth={0.4} />);
      if (r() < (park ? 0.78 : 0.35)) el.push(<Rect key={k()} x={x} y={y + 1} width={6.5} height={8} rx={1.4} fill={KOLORY_AUT[Math.floor(r() * KOLORY_AUT.length)]} stroke="#111" strokeWidth={0.3} />);
    }
    el.push(<Rect key={k()} x={8} y={y0 + 2} width={11} height={11} rx={2} fill="#1f5fbf" />);
    el.push(<SvgText key={k()} x={13.5} y={y0 + 10.5} fontSize={8} fontWeight="bold" fill="#fff" textAnchor="middle">P</SvgText>);
    if (wielo) el.push(<SvgText key={k()} x={70} y={y0 + ph - 3} fontSize={5.5} fill="#fff" textAnchor="middle">PARKING WIELOPOZIOMOWY</SvgText>);
  }

  // ——— Prawa kolumna: sklep, muzeum, hotel ———
  let yr = 10;
  const budynek = (h: number, kolor: string, napis: string, okna = 0) => {
    el.push(<Rect key={k()} x={362} y={yr} width={112} height={h} fill={kolor} stroke="#222" strokeWidth={0.6} />);
    for (let i = 0; i < okna; i++) for (let c = 0; c < 9; c++) el.push(<Rect key={k()} x={367 + c * 11.8} y={yr + 4 + i * 7} width={6} height={4} fill="#ffe9a8" opacity={0.85} />);
    el.push(<SvgText key={k()} x={418} y={yr + h - 4} fontSize={6.5} fontWeight="bold" fill="#fff" stroke="#000" strokeWidth={0.2} textAnchor="middle">{napis}</SvgText>);
    yr += h + 8;
  };
  const hotel = p("hotel");
  if (hotel) budynek(14 + hotel * 14, "#4b5a73", `HOTEL ${"★".repeat(Math.min(5, hotel))}`, hotel * 2);
  const sklep = p("sklep");
  if (sklep) budynek(18 + sklep * 6, kol1, sklep >= 4 ? "MEGASTORE KLUBOWY" : "SKLEP KLUBOWY");
  const muz = p("muzeum");
  if (muz) {
    budynek(20 + muz * 6, "#7a5c2e", "MUZEUM KLUBU");
    for (let i = 0; i < muz; i++) el.push(<SvgText key={k()} x={376 + i * 18} y={yr - 18} fontSize={9}>🏆</SvgText>);
  }

  // ——— Dolny pas: budki z jedzeniem i strefa kibica ———
  const gast = p("gastronomia");
  const yDol = H - 52;
  for (let i = 0; i < gast * 3; i++) {
    const x = 142 + i * 13;
    if (x > 352) break;
    el.push(<Rect key={k()} x={x} y={yDol} width={10} height={8} fill="#f4f1e6" stroke="#333" strokeWidth={0.4} />);
    el.push(<Polygon key={k()} points={`${x - 1},${yDol} ${x + 11},${yDol} ${x + 5},${yDol - 5}`} fill={i % 2 ? "#e74c3c" : "#f1c40f"} />);
  }
  if (gast) el.push(<SvgText key={k()} x={142} y={yDol + 15} fontSize={5.5} fill="#fff">GASTRONOMIA · {gast * 3} stoisk</SvgText>);
  const fz = p("strefaKibica");
  if (fz) {
    const x0 = 362, y0 = Math.max(yr, H - 92);
    el.push(<Rect key={k()} x={x0} y={y0} width={112} height={56} rx={4} fill="#3f7a3a" stroke="#cde8c5" strokeWidth={0.6} />);
    el.push(<Rect key={k()} x={x0 + 6} y={y0 + 6} width={34} height={14} fill="#222" stroke={kol1} strokeWidth={1.2} />); // scena
    for (let i = 0; i < fz + 1; i++) el.push(<Polygon key={k()} points={`${x0 + 48 + i * 13},${y0 + 22} ${x0 + 58 + i * 13},${y0 + 22} ${x0 + 53 + i * 13},${y0 + 12}`} fill={i % 2 ? kol1 : kol2} stroke="#222" strokeWidth={0.3} />);
    for (let i = 0; i < 18 + fz * 10; i++) el.push(<Circle key={k()} cx={x0 + 6 + r() * 100} cy={y0 + 27 + r() * 18} r={1.2} fill={r() < 0.5 ? kol1 : kol2} />);
    el.push(<SvgText key={k()} x={x0 + 56} y={y0 + 53} fontSize={6} fontWeight="bold" fill="#fff" textAnchor="middle">STREFA KIBICA</SvgText>);
  }

  // ——— Górny pas: boiska treningowe ———
  const baza = p("baza");
  for (let i = 0; i < Math.min(3, baza); i++) {
    const x = 146 + i * 70, y = 6;
    if (by0 - d.N - 12 < y + 34) break; // brak miejsca przy dużej trybunie północnej
    el.push(<Rect key={k()} x={x} y={y} width={62} height={34} fill="#2f9a4c" stroke="#e9f5ea" strokeWidth={0.8} />);
    el.push(<Line key={k()} x1={x + 31} y1={y} x2={x + 31} y2={y + 34} stroke="#e9f5ea" strokeWidth={0.6} />);
  }
  if (baza) el.push(<SvgText key={k()} x={146} y={47} fontSize={5.5} fill="#fff">BAZA TRENINGOWA · {Math.min(3, baza)} {baza >= 4 ? "+ hala" : ""}</SvgText>);

  // ——— Drzewa w wolnych miejscach ———
  for (let i = 0; i < 40; i++) {
    const x = 140 + r() * 215, y = 50 + r() * 290;
    const wSrodku = x > bx0 - d.W - 14 && x < bx1 + d.E + 14 && y > by0 - d.N - 14 && y < by1 + d.S + 24;
    if (wSrodku || (y > yDol - 8 && y < yDol + 18)) continue;
    el.push(<Circle key={k()} cx={x} cy={y} r={3 + r() * 2} fill="#1f4a24" opacity={0.9} />);
  }

  return (
    <Svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ aspectRatio: W / H, borderRadius: 10 }}>
      <G>{el}</G>
    </Svg>
  );
}
