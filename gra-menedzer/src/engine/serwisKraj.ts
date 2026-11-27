// Wiadomości z kraju (#52): serwis informacyjny ze świata gry po każdej kolejce — Ekstraklasa i I liga (lider, hit
// kolejki), zmiany trenerów w klubach szczebla centralnego, głośne transfery w oknach, mecze reprezentacji.
// Wszystko to zdarzenia symulowanego świata gry (nie prawdziwe newsy).
import { tabelaLigi } from "./swiat";
import type { StanGry } from "./types";

export interface News { sezon: number; kolejka: number; ikona: string; tytul: string; tekst: string }
interface Pamiec { trenerzy: Record<string, string>; gwiazdy: Record<string, string | null>; kadra: number }
const stan = (s: StanGry) => ((s as unknown as { serwis?: { news: News[]; pam?: Pamiec } }).serwis ??= { news: [] });
export const serwisKraju = (s: StanGry): News[] => stan(s).news;

export function serwisKolejki(s: StanGry, r: number, okno: boolean) {
  const S = stan(s); const out: News[] = []; const add = (ikona: string, tytul: string, tekst: string) => out.push({ sezon: s.sezon, kolejka: r, ikona, tytul, tekst });
  for (const p of [0, 1]) {
    const liga = s.ligi[p]; const wyn = liga?.wyniki[r]; if (!liga || !wyn?.length) continue;
    const hit = [...wyn].sort((a, b) => Math.abs(b.gd - b.gg) + (b.gd + b.gg) * 0.3 - (Math.abs(a.gd - a.gg) + (a.gd + a.gg) * 0.3))[0];
    const t = tabelaLigi(s, liga); const l = t[0];
    if (hit) add(p === 0 ? "⭐" : "1️⃣", `${liga.nazwa}: ${s.kluby[hit.dom]?.nazwa} ${hit.gd}:${hit.gg} ${s.kluby[hit.gosc]?.nazwa}`, `Hit ${r + 1}. kolejki. Liderem ${s.kluby[l.klubId]?.nazwa} (${l.pkt} pkt)${t[1] ? `, ${l.pkt - t[1].pkt} pkt przewagi nad ${s.kluby[t[1].klubId]?.nazwa}` : ""}.`);
  }
  // zmiany trenerów na szczeblu centralnym
  const pam = (S.pam ??= { trenerzy: {}, gwiazdy: {}, kadra: (s.kadraMecze ?? []).length });
  for (const k of Object.values(s.kluby)) {
    if (k.poziom > 3 || k.rezerwaDla) continue;
    const t = `${k.trenerImie ?? ""} ${k.trenerNazwisko ?? ""}`.trim(); const by = pam.trenerzy[k.id];
    if (by && t && by !== t && k.id !== s.mojKlub) add("🔄", `Zmiana trenera: ${k.nazwa}`, `${by} nie jest już trenerem. Zastępuje go ${t}.`);
    pam.trenerzy[k.id] = t;
  }
  // głośne transfery (tylko w rundach okien — tanio)
  if (okno) {
    const zn = Object.values(s.zawodnicy).filter((z) => z.umiej >= 68);
    for (const z of zn) { const by = pam.gwiazdy[z.id]; if (by !== undefined && by !== z.klubId && z.klubId && by) { const a = s.kluby[by], b = s.kluby[z.klubId]; if (a && b && out.length < 12) add("💸", `Transfer: ${z.imie} ${z.nazwisko}`, `Z ${a.nazwa} do ${b.nazwa} (OVR ${Math.floor(z.umiej)}, ${z.poz}).`); } pam.gwiazdy[z.id] = z.klubId; }
  } else if (!Object.keys(pam.gwiazdy).length) for (const z of Object.values(s.zawodnicy)) if (z.umiej >= 68) pam.gwiazdy[z.id] = z.klubId;
  // reprezentacja
  const km = s.kadraMecze ?? [];
  if (km.length > pam.kadra) for (const m of km.slice(pam.kadra)) add("🇵🇱", `${m.kadra}: ${m.gs}:${m.gr} z ${m.rywal}`, `${m.typ}${m.strzelcy.length ? ` · gole: ${m.strzelcy.join(", ")}` : ""}.`);
  pam.kadra = km.length;
  S.news = [...out, ...S.news].slice(0, 40);
}
