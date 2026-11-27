// Polski głos (wbudowana synteza mowy przeglądarki/telefonu). Każda postać mówi głosem swojej płci:
// zawodnicy, komentator, spiker, dziennikarze — męski; dziennikarki — damski; trener — wg imienia.
// Gra wykrywa wszystkie polskie głosy w urządzeniu (na iPhonie można dograć więcej: Ustawienia → Dostępność →
// Treść mówiona → Głosy → Polski) i przydziela je postaciom na stałe; dodatkowo każda postać ma własną
// wysokość i tempo mowy, więc nawet przy 1–2 głosach brzmi wiele różnych osób. Brak męskiego głosu →
// męski ton uzyskany z dostępnego głosu przez wyraźne obniżenie wysokości.
import { czyWyciszony } from "./dzwiek";

export type Rola = "dziennikarz" | "trener" | "komentator" | "zawodnik" | "spiker";
export type Plec = "M" | "K";
let wylaczony = typeof window !== "undefined" && window.localStorage?.getItem("dz_glos") === "0";
const MESKIE = /krzysztof|marek|jan\b|adam|piotr|tomasz|paweł|pawel|michał|michal|jakub|andrzej|male|mężczyzna|man\b|darek|zbigniew|grzegorz/i;
const DAMSKIE = /zosia|ewa|paulina|agata|maja|anna|female|kobieta|woman|alicja|joanna|magda|kasia|katarzyna|monika|ola\b/i;
let glosy: { M: SpeechSynthesisVoice[]; K: SpeechSynthesisVoice[]; nieznane: SpeechSynthesisVoice[] } = { M: [], K: [], nieznane: [] };

function wczytajGlosy() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const pl = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("pl"));
  glosy = { M: [], K: [], nieznane: [] };
  for (const v of pl) (MESKIE.test(v.name) ? glosy.M : DAMSKIE.test(v.name) ? glosy.K : glosy.nieznane).push(v);
  // „ulepszone/premium" głosy na początek — brzmią najnaturalniej
  const jakosc = (v: SpeechSynthesisVoice) => (/premium|enhanced|ulepszon|neural/i.test(v.name) ? 0 : 1);
  glosy.M.sort((a, b) => jakosc(a) - jakosc(b)); glosy.K.sort((a, b) => jakosc(a) - jakosc(b));
}
if (typeof window !== "undefined" && window.speechSynthesis) { wczytajGlosy(); window.speechSynthesis.onvoiceschanged = () => wczytajGlosy(); }

export const glosDostepny = () => typeof window !== "undefined" && !!window.speechSynthesis;
export const glosWlaczony = () => !wylaczony;
export function ustawGlos(w: boolean) { wylaczony = !w; try { window.localStorage.setItem("dz_glos", w ? "1" : "0"); } catch { /* */ } if (!w) zamilknij(); }
export function zamilknij() { try { window.speechSynthesis?.cancel(); } catch { /* */ } }
/** Ile głosów męskich/damskich wykryto (do informacji w ustawieniach). */
export function liczbaGlosow() { wczytajGlosy(); return { M: glosy.M.length, K: glosy.K.length, inne: glosy.nieznane.length }; }

/** Płeć po polskim imieniu (żeńskie kończą się zwykle na „-a", wyjątki męskie: Kuba, Barnaba, Bonawentura…). */
export function plecZImienia(imie?: string): Plec {
  if (!imie) return "M";
  const i = imie.trim().split(/\s+/)[0].toLowerCase();
  if (/^(kuba|barnaba|bonawentura|jarema|kosma|dyzma|zawisza|bodzia|sasza|misza|nikita|luca|andrea)$/.test(i)) return "M";
  return i.endsWith("a") ? "K" : "M";
}
const hash = (t: string) => { let h = 2166136261; for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

/**
 * Wypowiedź na głos.
 * `kto` — stały identyfikator mówiącego (imię i nazwisko / redakcja) → zawsze ten sam głos, wysokość i tempo.
 * `plec` — płeć mówiącego (domyślnie wg roli: dziennikarz losowo wg `kto`, reszta męska).
 */
export function mow(tekst: string, rola: Rola, o: { przerwij?: boolean; emocje?: number; kto?: string; plec?: Plec } = {}) {
  if (!glosDostepny() || wylaczony || czyWyciszony()) return;
  const czysty = tekst.replace(/[„"”]/g, "").replace(/[⚽🟨🟥🔄🚑📺🗣📋⏱🏁⏸❗🧤😱🥅📣🎵👕⚠⚖️▶🚩]/gu, "").replace(/\s+/g, " ").trim();
  if (!czysty) return;
  try {
    if (!glosy.M.length && !glosy.K.length && !glosy.nieznane.length) wczytajGlosy();
    if (o.przerwij) window.speechSynthesis.cancel();
    const kto = o.kto ?? rola;
    const h = hash(kto);
    const plec: Plec = o.plec ?? (rola === "dziennikarz" ? (h % 3 === 0 ? "K" : "M") : "M");
    const u = new SpeechSynthesisUtterance(czysty);
    u.lang = "pl-PL";
    const pula = plec === "M" ? glosy.M : glosy.K;
    const awaryjna = [...glosy.nieznane, ...(plec === "M" ? glosy.K : glosy.M)];
    const g = pula.length ? pula[h % pula.length] : awaryjna[h % Math.max(1, awaryjna.length)];
    if (g) u.voice = g;
    // brak głosu tej płci → przestrój dostępny (męski: dużo niżej; damski: wyżej)
    const zastepczy = !pula.length;
    const bazaTonu = plec === "M" ? (zastepczy ? 0.55 : 0.92) : (zastepczy ? 1.3 : 1.05);
    // indywidualny ton i tempo postaci (±) — wiele różnych osób nawet przy kilku głosach
    const rozrzutTonu = ((h >> 4) % 100) / 100 * 0.24 - 0.12;
    const rozrzutTempa = ((h >> 11) % 100) / 100 * 0.16 - 0.08;
    const e = o.emocje ?? 0;
    const tempoRoli: Record<Rola, number> = { dziennikarz: 1.06, trener: 0.97, komentator: 1.1 + e * 0.18, zawodnik: 1.0, spiker: 0.92 };
    u.pitch = Math.max(0.1, Math.min(2, bazaTonu + rozrzutTonu + (rola === "komentator" ? e * 0.2 : 0)));
    u.rate = Math.max(0.6, Math.min(1.6, tempoRoli[rola] + rozrzutTempa));
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch { /* brak syntezy mowy */ }
}
