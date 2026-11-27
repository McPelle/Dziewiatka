// Przyśpiewki na trybunach: dobór do sytuacji (wynik, derby/kosa, zgoda) i cenzura wulgaryzmów (kropki).
import { PRZYSPIEWKI, type Przyspiewka } from "../data/przyspiewki";
import type { Klub } from "./types";

const WULGARNE = /\b(s?kurw\w*|chuj\w*|huj\w*|wy?pierd\w*|spierd\w*|pierd\w*|jeb\w*|zajeb\w*|wyjeb\w*|pojeb\w*|pizd\w*|cip\w*|dziwk\w*|cwel\w*|pedał\w*|pedal\w*|ciot\w*|kutas\w*|fiut\w*|dup[aąey]\w*|szmat\w*|gówn\w*|gown\w*|sraj\w*|srać\w*)/giu;
/** Wulgaryzmy wykropkowane: „k…a" (pierwsza i ostatnia litera). */
export function cenzura(t: string): string {
  return t.replace(WULGARNE, (w) => (w.length <= 2 ? "…" : `${w[0]}${"…"}${w[w.length - 1]}`));
}
/** Wersja do odczytu głosem — wulgaryzmy pominięte. */
export const doGlosu = (t: string) => t.replace(WULGARNE, "…");

const dla = (k: Klub) => PRZYSPIEWKI[k.nazwa]?.przyspiewki ?? [];
const losuj = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const pasujeRywal = (p: Przyspiewka, r: Klub) => !!p.rywal && (r.nazwa.includes(p.rywal) || p.rywal.includes(r.nazwa.split(" ")[0]));

/** Przyśpiewka pasująca do chwili: na rywala (derby/kosa), zgodowa, albo doping/okrzyk/miasto. Zwraca tekst ocenzurowany lub null. */
export function przyspiewka(k: Klub, rywal: Klub, o: { derby: boolean; zgoda: boolean; wynik: number }): string | null {
  const l = dla(k); if (!l.length) return null;
  let pula: Przyspiewka[] = [];
  if (o.derby && Math.random() < 0.45) pula = l.filter((p) => p.typ === "rywal" && pasujeRywal(p, rywal));
  if (!pula.length && o.derby && Math.random() < 0.25) pula = l.filter((p) => p.typ === "rywal");
  if (!pula.length && o.zgoda && Math.random() < 0.5) pula = l.filter((p) => p.typ === "zgoda" && pasujeRywal(p, rywal));
  if (!pula.length) pula = l.filter((p) => p.typ === "doping" || p.typ === "okrzyk" || p.typ === "miasto");
  if (!pula.length) pula = l;
  return cenzura(losuj(pula).tekst);
}
export const hymnKlubu = (k: Klub) => PRZYSPIEWKI[k.nazwa]?.hymn;
export const ilePrzyspiewek = (k: Klub) => dla(k).length;

const krot = (k: Klub) => k.nazwa.split(" ").filter((w) => w.length > 2 && !/^(KS|MKS|GKS|LKS|LZS|TS|SKS|KP|MZKS|ZKS|FC|II|III|Sp)$/.test(w))[0] ?? k.nazwa;
/** Gniazdowy (prowadzący młyn) wymyśla przyśpiewkę NA POCZEKANIU — pod sytuację w meczu. Wulgaryzmy wykropkowane. */
export function improwizacja(k: Klub, r: Klub, c: { wynik: number; min: number; strzelec?: string; bramkarzRywala?: string; sedzia?: string; derby?: boolean; przerwa?: boolean }): string {
  const K = krot(k), R = krot(r), M = k.miasto, MR = r.miasto;
  const pula: string[] = [];
  if (c.strzelec) pula.push(`${c.strzelec}, ${c.strzelec} — strzela nam gola, ${c.strzelec}!`, `Kto strzelił bramkę? ${c.strzelec}! Kto rządzi w ${M}? ${K}!`, `Ole, ole, ${c.strzelec} — cała trybuna śpiewa dla ciebie!`);
  if (c.bramkarzRywala && c.wynik > 0) pula.push(`${c.bramkarzRywala}, ${c.bramkarzRywala}, gdzie ty masz ręce?`, `Bramkarz z ${MR} — dziurawy jak sito!`);
  if (c.sedzia) pula.push(`Sędzia, sędzia, gdzie masz gwizdek? Kalosz nie sędzia!`, `${c.sedzia} — okulary kup sobie!`);
  if (c.przerwa) pula.push(`Druga połowa — gramy dla ${M}! Dawaj, ${K}, jeszcze raz!`, `Czterdzieści pięć minut — zostaw serce na murawie!`);
  if (c.wynik > 0) pula.push(`Prowadzi ${K}, a ${R} płacze!`, `${R}, ${R}, jedziecie do domu z niczym!`, `Jeszcze jeden, jeszcze jeden — ${K}!`);
  else if (c.wynik < 0) pula.push(`${K} walczy, ${K} gra — my jesteśmy z wami do końca!`, `Nie poddawać się! Cała ${M} jest z wami!`, `Chłopaki, podnieście głowy — jeszcze wszystko przed nami!`);
  else pula.push(`Dalej, ${K}, strzel tego gola!`, `${M}, ${M}, ${M} — tylko ${K}!`, `Hej, ${K}, my jesteśmy z wami!`);
  if (c.derby) pula.push(`${R} to wieś, ${M} to stolica!`, `${MR} — tylko zapchlone miasto!`, `${R} k*rwa świnia, ${K} zawsze wygrywa!`, `Kto nie skacze, ten z ${MR}!`, `${R} — wasza flaga wisi u nas!`);
  if (c.min >= 85 && c.wynik >= 0) pula.push(`Ostatnie minuty — wszyscy razem, głośniej!`, `Jeszcze chwila — ${K} do końca!`);
  return cenzura(pula[Math.floor(Math.random() * pula.length)].replace("k*rwa", "kurwa"));
}
