// Planowanie dni w kalendarzu (jak w Football Managerze): w każdy dzień bez meczu możesz ustawić zajęcia drużyny —
// trening (temat + intensywność), regeneracja, dzień wolny, analiza wideo rywala, sparing w tygodniu, wyjazd
// integracyjny, spotkanie z zarządem, dzień otwarty dla kibiców, badania medyczne. Szablon tygodnia powiela plan.
import { losInt, szansa, wybierz } from "./losuj";
import { badaniaCalejKadry } from "./extranet";
import type { Intensywnosc, StanGry, Trening } from "./types";

export type RodzajAkt = "trening" | "regeneracja" | "wolne" | "wideo" | "sparing" | "integracja" | "zarzad" | "kibice" | "badania";
export interface Aktywnosc { rodzaj: RodzajAkt; fokus?: Trening; intens?: Intensywnosc; rywal?: string }

export const KATALOG: Record<RodzajAkt, { nazwa: string; ikona: string; opis: string; koszt?: (s: StanGry) => number }> = {
  trening: { nazwa: "Trening", ikona: "🏋", opis: "Rozwój umiejętności wg tematu. Mocny = szybszy rozwój, ale zmęczenie i ryzyko urazu." },
  regeneracja: { nazwa: "Regeneracja / odnowa", ikona: "🧊", opis: "Basen, masaże, rozciąganie: kondycja w górę, mniejsze ryzyko urazów." },
  wolne: { nazwa: "Dzień wolny", ikona: "☕", opis: "Odpoczynek: kondycja i morale w górę, brak rozwoju." },
  wideo: { nazwa: "Analiza wideo rywala", ikona: "📺", opis: "Odprawa z nagraniami najbliższego rywala: lepsze przygotowanie taktyczne do meczu." },
  sparing: { nazwa: "Sparing w tygodniu", ikona: "🤝", opis: "Gra kontrolna dla rezerwowych i wracających po urazie: zgranie i forma, lekkie zmęczenie." },
  integracja: { nazwa: "Wyjazd integracyjny", ikona: "🎳", opis: "Kręgle, grill, paintball: morale i zgranie drużyny w górę.", koszt: (s) => [20000, 12000, 6000, 3000, 1500, 800, 500, 300, 200][Math.min(8, s.kluby[s.mojKlub].poziom - 1)] },
  zarzad: { nazwa: "Spotkanie z zarządem", ikona: "🤵", opis: "Rozmowa o celach i budżecie: przy dobrych wynikach zarząd ufa bardziej, przy złych — ostrzega." },
  kibice: { nazwa: "Dzień otwarty dla kibiców", ikona: "🎉", opis: "Autografy, trening otwarty, sklepik: zaufanie kibiców i drobny przychód." },
  badania: { nazwa: "Badania medyczne", ikona: "🩺", opis: "Testy wydolnościowe i profilaktyka: mniejsza podatność na urazy przez kilka tygodni. Odnawia orzeczenia lekarskie kadry (Extranet)." },
};
export const FOKUSY: [Trening, string][] = [["kondycja", "Kondycja"], ["zgranie", "Taktyka i zgranie"], ["stale", "Stałe fragmenty"], ["atak", "Atak"], ["obrona", "Obrona"], ["technika", "Technika"], ["ogolny", "Gra w małych grach"], ["wykonczenie", "Wykończenie"], ["szybkosc", "Szybkość"], ["bramkarski", "Bramkarze"]];
export const INTENSYWNOSCI: [Intensywnosc, string][] = [["lekki", "Lekka"], ["normalny", "Średnia"], ["intensywny", "Mocna"]];

export const kluczDnia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const planNa = (s: StanGry, d: Date): Aktywnosc | undefined => s.planDni?.[kluczDnia(d)];

export function zaplanuj(s: StanGry, d: Date, a: Aktywnosc | null, dzisiajData: Date): string | null {
  if (d < new Date(dzisiajData.getFullYear(), dzisiajData.getMonth(), dzisiajData.getDate())) return "Nie można planować przeszłości.";
  const k = kluczDnia(d);
  if (!a) { if (s.planDni) delete s.planDni[k]; return null; }
  if (a.rodzaj === "kibice") {
    const mies = `${d.getFullYear()}-${d.getMonth()}`;
    if (Object.entries(s.planDni ?? {}).some(([kk, x]) => x.rodzaj === "kibice" && kk !== k && kk.startsWith(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`))) return "Dzień otwarty — najwyżej raz w miesiącu.";
    void mies;
  }
  (s.planDni ??= {})[k] = a;
  return null;
}
/** Powiel plan dnia na ten sam dzień tygodnia przez kolejne `tygodni` tygodni (szablon tygodnia). */
export function powielTygodniowo(s: StanGry, d: Date, tygodni: number) {
  const a = planNa(s, d); if (!a) return 0;
  let n = 0;
  for (let i = 1; i <= tygodni; i++) { const x = new Date(d); x.setDate(x.getDate() + i * 7); if (!s.planDni![kluczDnia(x)]) { s.planDni![kluczDnia(x)] = { ...a }; n++; } }
  return n;
}
export function opisAkt(a: Aktywnosc): string {
  const k = KATALOG[a.rodzaj];
  if (a.rodzaj === "trening") return `${k.ikona} Trening: ${FOKUSY.find(([f]) => f === a.fokus)?.[1] ?? "ogólny"} · ${INTENSYWNOSCI.find(([i]) => i === a.intens)?.[1] ?? "Średnia"}`;
  if (a.rodzaj === "sparing" && a.rywal) return `${k.ikona} Sparing: ${a.rywal}`;
  return `${k.ikona} ${k.nazwa}`;
}

/** Wykonanie zaplanowanej aktywności (dzień kalendarza). `trening` — funkcja treningu dnia z kalendarza. */
export function wykonajAktywnosc(s: StanGry, a: Aktywnosc, trening: () => string[]): string[] {
  const k = s.kluby[s.mojKlub];
  const kadra = k.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const zdrowi = kadra.filter((z) => z.kontuzja === 0);
  const wp: string[] = [];
  switch (a.rodzaj) {
    case "trening": {
      const stFok = s.trening, stInt = s.treningIntensywnosc;
      s.trening = a.fokus ?? s.trening; s.treningIntensywnosc = a.intens ?? "normalny";
      const w = trening();
      s.trening = stFok; s.treningIntensywnosc = stInt;
      // intensywność: zmęczenie i ryzyko urazu na zajęciach
      const zm = a.intens === "intensywny" ? 5 : a.intens === "lekki" ? 0 : 2;
      for (const z of zdrowi) z.kondycja = Math.max(35, z.kondycja - zm);
      if (a.intens === "intensywny") for (const z of zdrowi) if (szansa(0.008 * (z.podatnosc ?? 1))) { z.kontuzja = losInt(1, 2); w.push(`🤕 Mocny trening: ${z.imie} ${z.nazwisko} naciągnął mięsień — ${z.kontuzja} kol. przerwy.`); }
      if (a.intens === "lekki") w.push("Lekkie zajęcia — mniejszy przyrost, ale świeże nogi.");
      return w;
    }
    case "regeneracja":
      for (const z of kadra) z.kondycja = Math.min(100, z.kondycja + 10);
      for (const z of kadra) if (z.kontuzja > 0 && szansa(0.12)) z.kontuzja = Math.max(0, z.kontuzja - 1);
      return ["🧊 Odnowa biologiczna: kondycja całej kadry +10%.", "Fizjoterapeuci przyspieszyli powrót części kontuzjowanych."];
    case "wolne":
      for (const z of kadra) { z.kondycja = Math.min(100, z.kondycja + 7); z.morale = Math.min(100, z.morale + 2); }
      return ["☕ Dzień wolny: zawodnicy odpoczęli (kondycja +7%, morale +2)."];
    case "wideo": {
      s.motywacjaMeczu = Math.min(0.06, (s.motywacjaMeczu ?? 0) + 0.025);
      return ["📺 Analiza wideo rywala: drużyna zna jego słabe punkty i schematy — lepsze przygotowanie do najbliższego meczu."];
    }
    case "sparing": {
      const graja = zdrowi.filter((z) => !s.taktyka.sklad.includes(z.id)).slice(0, 14);
      for (const z of graja) { z.forma = Math.min(5, z.forma + 0.4); z.kondycja = Math.max(45, z.kondycja - 6); z.zgranie = Math.min(100, (z.zgranie ?? 80) + 2); }
      const gs = losInt(0, 4), gr = losInt(0, 3);
      const strz = graja.filter((z) => z.poz !== "BR");
      return [`🤝 Sparing z ${a.rywal ?? "rywalem z niższej ligi"}: ${gs}:${gr}${gs && strz.length ? ` (gole: ${Array.from({ length: gs }, () => wybierz(strz).nazwisko).join(", ")})` : ""}.`, `Zagrali głównie rezerwowi (${graja.length}) — lepsza forma i zgranie, lekkie zmęczenie.`];
    }
    case "integracja": {
      const koszt = KATALOG.integracja.koszt!(s); k.kasa -= koszt;
      for (const z of kadra) { z.morale = Math.min(100, z.morale + 5); z.zgranie = Math.min(100, (z.zgranie ?? 80) + 4); z.relacja = Math.min(100, (z.relacja ?? 60) + 2); }
      return [`🎳 Wyjazd integracyjny (${wybierz(["kręgle i pizza", "paintball", "grill nad jeziorem", "kajaki", "escape room"])}): morale +5, zgranie +4. Koszt ${koszt.toLocaleString("pl")} zł.`];
    }
    case "zarzad": {
      const liga = s.ligi[k.poziom - 1];
      const tab = liga ? [...liga.kluby] : [];
      void tab;
      const forma = (k.seria ?? 0);
      if (forma >= 0) { s.zarzad = Math.min(100, s.zarzad + 3); return ["🤵 Spotkanie z zarządem: prezes zadowolony z kierunku — zaufanie zarządu +3."]; }
      s.zarzad = Math.max(0, s.zarzad - 1); return ["🤵 Spotkanie z zarządem: prezes oczekuje poprawy wyników — „Liczymy na punkty w najbliższych meczach.”"];
    }
    case "kibice": {
      const przych = Math.round([30000, 15000, 8000, 4000, 2000, 1000, 600, 400, 300][Math.min(8, k.poziom - 1)] * (0.7 + Math.random() * 0.6));
      k.kasa += przych; s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 4);
      return [`🎉 Dzień otwarty: kibice na treningu, autografy, zdjęcia, sklepik. Zaufanie kibiców +4, przychód ${przych.toLocaleString("pl")} zł.`];
    }
    case "badania":
      for (const z of kadra) z.podatnosc = Math.max(0.7, (z.podatnosc ?? 1) * 0.96);
      return ["🩺 Badania i profilaktyka: wykryto drobne przeciążenia, zalecono indywidualne ćwiczenia — mniejsze ryzyko urazów.", badaniaCalejKadry(s)].filter(Boolean); // + odnowienie orzeczeń w Extranecie
  }
  return wp;
}
