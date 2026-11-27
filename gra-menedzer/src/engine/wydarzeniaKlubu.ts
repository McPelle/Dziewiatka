// Życie klubu poza boiskiem:
//  • #75 sezonowe wydarzenia: opłatek klubowy przed przerwą zimową, plebiscyt lokalnej gazety na najlepszego sportowca
//    regionu (styczeń), gala podsumowania sezonu w wojewódzkim ZPN (koniec sezonu);
//  • #51 dni klubu organizowane przez Ciebie: festyn, dzień otwarty, turniej dla dzieci — koszt, przychód, zaufanie kibiców.
import type { StanGry, Zawodnik } from "./types";

const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const kibice = (s: StanGry, d: number) => { s.zaufanieKibicow = Math.max(0, Math.min(100, (s.zaufanieKibicow ?? 60) + d)); };
const kadra = (s: StanGry) => s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
const gwiazda = (s: StanGry) => [...kadra(s)].sort((a, b) => (b.gole * 3 + b.asysty * 2 + b.umiej / 5) - (a.gole * 3 + a.asysty * 2 + a.umiej / 5))[0];

/** Co kolejkę (r = numer rozgrywanej kolejki od 0, n = liczba kolejek). Zwraca komunikaty. */
export function wydarzeniaSezonowe(s: StanGry, r: number, n: number): string[] {
  const out: string[] = []; const k = s.kluby[s.mojKlub]; const pol = Math.ceil(n / 2);
  if (r === pol - 1) { // ostatnia kolejka jesieni → grudzień
    const koszt = k.poziom <= 2 ? 25000 : k.poziom <= 4 ? 6000 : 1200; k.kasa -= koszt;
    for (const z of kadra(s)) z.morale = Math.min(100, z.morale + 4);
    out.push(`🎄 Opłatek klubowy: zawodnicy, sztab, zarząd i ${k.poziom >= 6 ? "działacze z gminy" : "sponsorzy"} przy wigilijnym stole${k.poziom >= 7 ? " w remizie" : ""}. Życzenia, kolędy, prezes dziękuje za rundę. Koszt ${zl(koszt)}, morale szatni w górę.`);
  }
  if (r === pol + 1) { // styczeń/luty → plebiscyt lokalnej gazety
    const g = gwiazda(s); if (g) {
      const miejsce = Math.max(1, Math.round(1 + Math.random() * 8 - (g.gole + g.asysty) / 6 - (k.poziom <= 3 ? 2 : 0)));
      if (miejsce <= 3) { g.morale = Math.min(100, g.morale + 8); kibice(s, 2); }
      out.push(`📰 Plebiscyt lokalnej gazety na Najpopularniejszego Sportowca Regionu: ${g.imie} ${g.nazwisko} z ${k.nazwa} na ${miejsce}. miejscu${miejsce === 1 ? " — WYGRYWA! Statuetka trafia do klubowej gabloty" : miejsce <= 3 ? " — na podium!" : ""}.`);
    }
  }
  if (r === n - 1) { // gala ZPN na koniec sezonu
    const g = gwiazda(s); const nagr = pick(["Odkrycie sezonu", "Najlepszy zawodnik ligi", "Fair Play", "Trener sezonu", "Kibice sezonu"]);
    const nasz = Math.random() < (k.poziom >= 5 ? 0.35 : 0.2);
    out.push(`🎩 Gala podsumowania sezonu ${k.poziom <= 3 ? "PZPN" : "wojewódzkiego ZPN"}: ${nasz ? (nagr === "Trener sezonu" ? `nagroda „Trener sezonu” dla Ciebie (${s.trener})!` : nagr === "Kibice sezonu" ? `wyróżnienie „Kibice sezonu” dla trybun ${k.nazwa}!` : `„${nagr}” — ${g ? `${g.imie} ${g.nazwisko}` : "zawodnik"} (${k.nazwa})!`) : "statuetki rozdane — tym razem bez nagrody dla Twojego klubu, ale delegacja była obecna."}`);
    if (nasz) { s.zarzad = Math.min(100, s.zarzad + 2); kibice(s, 2); }
  }
  return out;
}

export type DzienKlubu = "festyn" | "otwarty" | "turniej";
export const DNI_KLUBU: Record<DzienKlubu, { nazwa: string; ikona: string; opis: string }> = {
  festyn: { nazwa: "Festyn rodzinny", ikona: "🎪", opis: "Grill, dmuchańce, mecz oldbojów, loteria fantowa. Koszt organizacji, przychód z gastronomii i loterii." },
  otwarty: { nazwa: "Dzień otwarty", ikona: "🚪", opis: "Zwiedzanie szatni i stadionu, autografy, trening otwarty. Tani, buduje więź z kibicami, sprzedaje karnety." },
  turniej: { nazwa: "Turniej dla dzieci", ikona: "🧒", opis: "Turniej orlików z okolicznych szkół o puchar klubu. Rodzice na trybunach, przyszli wychowankowie." },
};
const ileRazy = (s: StanGry) => ((s as unknown as { dniKlubu?: Record<string, number> }).dniKlubu ??= {});

/** Czy można zorganizować dzień klubu (raz na rundę: jesień / wiosna). */
export function moznaDzienKlubu(s: StanGry, n: number): boolean {
  const runda = `${s.sezon}-${s.kolejka < Math.ceil(n / 2) ? "J" : "W"}`; return !ileRazy(s)[runda];
}
export function organizujDzienKlubu(s: StanGry, typ: DzienKlubu, n: number): string {
  if (!moznaDzienKlubu(s, n)) return "W tej rundzie klub już zorganizował dzień klubu.";
  const k = s.kluby[s.mojKlub]; const skala = k.poziom <= 2 ? 8 : k.poziom <= 4 ? 3 : k.poziom <= 6 ? 1.2 : 0.6;
  const pogoda = Math.random(); const ludzie = Math.round((k.pojemnosc ?? 500) * (0.15 + Math.random() * 0.35) * (pogoda < 0.2 ? 0.5 : 1) * ((s.zaufanieKibicow ?? 60) / 60));
  const koszt = Math.round((typ === "festyn" ? 1800 : typ === "otwarty" ? 500 : 1100) * skala / 100) * 100;
  const przychod = Math.round(ludzie * (typ === "festyn" ? 28 : typ === "otwarty" ? 6 : 12) / 100) * 100;
  k.kasa += przychod - koszt; kibice(s, typ === "otwarty" ? 4 : 3);
  ileRazy(s)[`${s.sezon}-${s.kolejka < Math.ceil(n / 2) ? "J" : "W"}`] = 1;
  const extra = typ === "turniej" && Math.random() < 0.35 ? " Trener akademii wypatrzył dwóch zdolnych chłopaków — zaproszeni na testy do juniorów." : typ === "festyn" && Math.random() < 0.3 ? " Mecz oldbojów skończył się remisem i dogrywką przy grillu." : "";
  return `${DNI_KLUBU[typ].ikona} ${DNI_KLUBU[typ].nazwa}: przyszło ok. ${ludzie.toLocaleString("pl-PL")} osób${pogoda < 0.2 ? " (deszcz przerzedził frekwencję)" : ""}. Koszt ${zl(koszt)}, przychód ${zl(przychod)} — bilans ${zl(przychod - koszt)}. Zaufanie kibiców w górę.${extra}`;
}
