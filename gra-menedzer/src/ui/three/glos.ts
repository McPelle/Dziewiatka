// Polski głos (wbudowana synteza mowy przeglądarki — na iPhonie głos „Zosia"/polski systemowy): pytania dziennikarzy,
// odpowiedzi trenera, komentator meczu. Nie zajmuje miejsca w pliku gry. Wyłącznik wspólny z dźwiękiem.
import { czyWyciszony } from "./dzwiek";

export type Rola = "dziennikarz" | "trener" | "komentator" | "zawodnik" | "spiker";
let glosPL: SpeechSynthesisVoice | null = null;
let wylaczony = typeof window !== "undefined" && window.localStorage?.getItem("dz_glos") === "0";
function wybierzGlos() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const g = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("pl"));
  glosPL = g.find((v) => /zosia|ewa|paulina|krzysztof|marek/i.test(v.name)) ?? g[0] ?? null;
  return glosPL;
}
if (typeof window !== "undefined" && window.speechSynthesis) { wybierzGlos(); window.speechSynthesis.onvoiceschanged = () => wybierzGlos(); }

export const glosDostepny = () => typeof window !== "undefined" && !!window.speechSynthesis;
export const glosWlaczony = () => !wylaczony;
export function ustawGlos(w: boolean) { wylaczony = !w; try { window.localStorage.setItem("dz_glos", w ? "1" : "0"); } catch { /* */ } if (!w) zamilknij(); }
export function zamilknij() { try { window.speechSynthesis?.cancel(); } catch { /* */ } }

/** Wypowiedź na głos. `przerwij` = ucisz poprzednią (np. nowe pytanie). Komentator mówi szybciej i wyżej przy golu. */
export function mow(tekst: string, rola: Rola, o: { przerwij?: boolean; emocje?: number } = {}) {
  if (!glosDostepny() || wylaczony || czyWyciszony()) return;
  const czysty = tekst.replace(/[„"”]/g, "").replace(/[⚽🟨🟥🔄🚑📺🗣📋⏱🏁⏸❗🧤😱🥅📣🎵👕⚠⚖️▶]/gu, "").replace(/\s+/g, " ").trim();
  if (!czysty) return;
  try {
    if (o.przerwij) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(czysty);
    u.lang = "pl-PL"; const g = glosPL ?? wybierzGlos(); if (g) u.voice = g;
    const e = o.emocje ?? 0;
    const prof: Record<Rola, [number, number]> = { dziennikarz: [1.05, 1.08], trener: [0.82, 0.98], komentator: [1.0 + e * 0.25, 1.12 + e * 0.2], zawodnik: [0.95, 1.0], spiker: [0.9, 0.95] };
    [u.pitch, u.rate] = prof[rola];
    u.volume = rola === "komentator" ? 0.95 : 1;
    window.speechSynthesis.speak(u);
  } catch { /* brak syntezy mowy */ }
}
