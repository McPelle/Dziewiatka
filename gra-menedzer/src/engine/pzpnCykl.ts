// Haki cyklu gry dla realiów PZPN: Extranet/badania/ITC (#79, #126), zgłoszenie drużyny i wycofania (#133),
// obsada sędziowska po meczu (#135). Wszystkie tanie (tylko kadra Twojego klubu + jeden mecz), wołane z sezon.ts/dzien.ts.
import { aktualizujExtranet, powodNieuprawnienia } from "./extranet";
import { autoSklad } from "./mecz";
import { obsadaPoMeczu } from "./obsadaSedziowska";
import { zgloszeniePoKolejce, zgloszeniePrzedKolejka } from "./zgloszenie";
import type { StanGry } from "./types";

const wiad = (s: StanGry, t: string) => { s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: t }); s.wiadomosci = s.wiadomosci.slice(0, 60); };

/** Codziennie (dalejDzien): wyniki badań, decyzje ITC, potwierdzenia w Extranecie, wpisy do s.niedostepni. */
export function pzpnDzien(s: StanGry) { aktualizujExtranet(s); }

/** W przygotujKolejke — po wylosowaniu s.niedostepni, PRZED kontrolą składu (`const zle = …`). */
export function pzpnPrzedSkladem(s: StanGry) { aktualizujExtranet(s); }

/** Na początku zagrajKolejke: termin opłaty wpisowej + ostatnia kontrola uprawnień (badania mogły wygasnąć w tygodniu). */
export function pzpnPrzedKolejka(s: StanGry) {
  if (s.zwolniony || !s.kluby[s.mojKlub]) return;
  aktualizujExtranet(s);
  zgloszeniePrzedKolejka(s);
  const zle = s.taktyka.sklad.filter((id) => { const z = s.zawodnicy[id]; return z && powodNieuprawnienia(s, z); });
  if (!zle.length) return;
  const zostaja = s.taktyka.sklad.filter((id) => !zle.includes(id));
  const dopelnij = autoSklad(s, s.mojKlub, s.taktyka.formacja).filter((id) => !zostaja.includes(id));
  s.taktyka.sklad = [...zostaja, ...dopelnij].slice(0, 11);
  s.taktyka.reczneSloty = false;
  wiad(s, `📋 Kierownik drużyny skreślił z protokołu: ${zle.map((id) => s.zawodnicy[id]?.nazwisko).join(", ")} — brak uprawnień w Extranecie (badania / ITC / potwierdzenie). Skład uzupełniony.`);
}

/** Na końcu zagrajKolejke (s.kolejka wskazuje już następną kolejkę). */
export function pzpnPoKolejce(s: StanGry) {
  const r = s.kolejka - 1;
  const liga = s.ligi[(s.kluby[s.mojKlub]?.poziom ?? 0) - 1];
  const w = liga?.wyniki[r]?.find((x) => x.dom === s.mojKlub || x.gosc === s.mojKlub);
  obsadaPoMeczu(s, w, (t) => wiad(s, t));
  zgloszeniePoKolejce(s);
}
