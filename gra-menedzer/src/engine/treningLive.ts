// Trening „na żywo" (dla chętnych): program zajęć z bloków ćwiczeń, zdarzenia na boisku z decyzjami trenera,
// pochwały/upomnienia, wyróżnienie zawodnika (indywidualna uwaga) i intensywność. Rozliczany w raporcie dnia.
import { szansa, wybierz } from "./losuj";
import type { Intensywnosc, StanGry, Trening, Zawodnik } from "./types";

export type Cwiczenie = "rozruch" | "rozciaganie" | "dziadek" | "podania" | "sprinty" | "strzaly" | "gierka" | "taktyka" | "stale";
export const CWICZENIA: Record<Cwiczenie, { nazwa: string; ikona: string; opis: string; fokus: Trening[] }> = {
  rozruch: { nazwa: "Rozruch", ikona: "🏃", opis: "Trucht dookoła połowy boiska, skipy, krążenia.", fokus: ["kondycja"] },
  rozciaganie: { nazwa: "Rozciąganie", ikona: "🧘", opis: "Wypady, rozciąganie dynamiczne — mniej urazów.", fokus: ["kondycja"] },
  dziadek: { nazwa: "Dziadek (rondo)", ikona: "⭕", opis: "Szybka wymiana podań w kole, dwóch w środku odbiera.", fokus: ["technika", "zgranie"] },
  podania: { nazwa: "Podania w parach", ikona: "↔️", opis: "Przyjęcie i podanie, raz jedną, raz drugą nogą.", fokus: ["technika"] },
  sprinty: { nazwa: "Sprinty", ikona: "⚡", opis: "Odcinki 20–30 m, powrót truchtem.", fokus: ["szybkosc", "kondycja"] },
  strzaly: { nazwa: "Strzały na bramkę", ikona: "🥅", opis: "Uderzenia z 18–20 m, bramkarz broni.", fokus: ["wykonczenie", "bramkarski", "atak"] },
  gierka: { nazwa: "Gierka w znacznikach", ikona: "🦺", opis: "Mała gra na ograniczonym polu — intensywnie, dużo kontaktów.", fokus: ["ogolny", "zgranie"] },
  taktyka: { nazwa: "Ustawienie taktyczne", ikona: "📋", opis: "Przesuwanie formacji za piłką, pressing, asekuracja.", fokus: ["zgranie", "obrona"] },
  stale: { nazwa: "Stałe fragmenty", ikona: "🚩", opis: "Rzuty rożne: dośrodkowanie, wbiegnięcie, główka.", fokus: ["stale", "atak"] },
};

export interface SesjaTreningu {
  klucz: string; intens: Intensywnosc; bloki: Cwiczenie[];
  wyroznieni: string[]; zdjeci: string[]; wpisy: string[];
}
export interface ZdarzenieTr { id: string; tekst: string; opcje: { nazwa: string; skutek: () => string }[] }

/** Program zajęć (~1,5–2 h) pod fokus tygodnia: rozgrzewka, część główna, gra, wyciszenie. */
export function programDnia(fokus: Trening, dzienPrzedMeczem = false): Cwiczenie[] {
  const glowne: Record<Trening, Cwiczenie[]> = {
    kondycja: ["sprinty", "gierka"], zgranie: ["taktyka", "dziadek"], stale: ["stale", "strzaly"], atak: ["strzaly", "stale"], obrona: ["taktyka", "gierka"],
    technika: ["dziadek", "podania"], ogolny: ["dziadek", "podania"], wykonczenie: ["strzaly", "podania"], szybkosc: ["sprinty", "dziadek"], bramkarski: ["strzaly", "podania"],
  } as Record<Trening, Cwiczenie[]>;
  if (dzienPrzedMeczem) return ["rozruch", "dziadek", "stale", "rozciaganie"]; // rozruch przedmeczowy: krótko i lekko
  return ["rozruch", "rozciaganie", ...(glowne[fokus] ?? ["dziadek", "gierka"]), "gierka"];
}

const nz = (z: Zawodnik) => `${z.imie} ${z.nazwisko}`;

/** Losowe zdarzenie podczas bloku ćwiczeń (z decyzją trenera). */
export function zdarzenieTreningu(s: StanGry, ses: SesjaTreningu, cw: Cwiczenie): ZdarzenieTr | null {
  const kadra = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kontuzja === 0 && !ses.zdjeci.includes(z.id)) as Zawodnik[];
  if (kadra.length < 4 || !szansa(ses.intens === "intensywny" ? 0.75 : 0.55)) return null;
  const a = wybierz(kadra)!, b = wybierz(kadra.filter((z) => z.id !== a.id))!;
  const rodzaje: (() => ZdarzenieTr)[] = [
    () => ({ id: a.id, tekst: `🤕 ${nz(a)} łapie się za udo po ${cw === "sprinty" ? "sprincie" : "zwrocie"}. Fizjoterapeuta pyta, co robimy.`, opcje: [
      { nazwa: "Zdejmij z zajęć (lód, odpoczynek)", skutek: () => { ses.zdjeci.push(a.id); return `${a.nazwisko} kończy dziś trening — profilaktycznie.`; } },
      { nazwa: "Niech dokończy", skutek: () => { if (szansa(ses.intens === "intensywny" ? 0.45 : 0.3)) { a.kontuzja = 1; a.urazy = (a.urazy ?? 0) + 1; ses.zdjeci.push(a.id); return `Źle się skończyło — ${a.nazwisko} naciągnął mięsień (pauza 1 kol.).`; } return `${a.nazwisko} rozbiegał ból — dokończył zajęcia.`; } }] }),
    () => ({ id: a.id, tekst: `💥 Spięcie: ${nz(a)} ostro wszedł w ${nz(b)}. Zrobiło się gorąco, chłopaki się przepychają.`, opcje: [
      { nazwa: "Rozdziel i porozmawiaj z oboma", skutek: () => { a.morale = Math.min(100, a.morale + 1); b.morale = Math.min(100, b.morale + 1); return "Podali sobie ręce. Atmosfera opanowana."; } },
      { nazwa: "Niech się wyżyją — to sport kontaktowy", skutek: () => { if (szansa(0.5)) { for (const z of kadra) z.zgranie = Math.min(100, (z.zgranie ?? 70) + 0.5); return "Iskra rozpaliła zajęcia — intensywność poszła w górę."; } a.morale = Math.max(0, a.morale - 4); b.morale = Math.max(0, b.morale - 4); return "Zła krew zostaje — obaj chodzą obrażeni."; } },
      { nazwa: "Wyrzuć z zajęć prowokatora", skutek: () => { a.morale = Math.max(0, a.morale - 6); ses.zdjeci.push(a.id); for (const z of kadra) if (z.id !== a.id) z.morale = Math.min(100, z.morale + 0.5); return `${a.nazwisko} wylatuje z treningu. Drużyna widzi, kto tu rządzi.`; } }] }),
    () => { const m = kadra.filter((z) => z.wiek <= 21).sort((x, y) => y.potencjal - x.potencjal)[0] ?? a; return { id: m.id, tekst: `✨ ${nz(m)} robi dziś furorę — ${cw === "strzaly" ? "trafia w okienko raz za razem" : "ogrywa starszych kolegów jak dzieci"}.`, opcje: [
      { nazwa: "Pochwal przy drużynie", skutek: () => { m.morale = Math.min(100, m.morale + 5); m.forma = Math.min(5, m.forma + 0.4); return `${m.nazwisko} aż urósł. Forma w górę.`; } },
      { nazwa: "Weź na indywidualne zajęcia po treningu", skutek: () => { if (!ses.wyroznieni.includes(m.id)) ses.wyroznieni.push(m.id); return `Zostajesz z nim po zajęciach — szybszy rozwój.`; } },
      { nazwa: "Nie przewracaj mu w głowie", skutek: () => "Spokojnie — niech pracuje dalej." }] }; },
    () => ({ id: a.id, tekst: `😴 ${nz(a)} wyraźnie odpuszcza ćwiczenie. Reszta to widzi.`, opcje: [
      { nazwa: "Upomnij głośno", skutek: () => { a.morale = Math.max(0, a.morale - 3); a.forma = Math.min(5, a.forma + 0.2); return `${a.nazwisko} przyspieszył — ale minę ma nietęgą.`; } },
      { nazwa: "Porozmawiaj na boku", skutek: () => { if (szansa(0.6)) { a.morale = Math.min(100, a.morale + 2); return `Okazało się, że ma problemy w domu. Docenił rozmowę.`; } return `Wzruszył ramionami. Zobaczymy.`; } },
      { nazwa: "Ignoruj", skutek: () => { for (const z of kadra) z.morale = Math.max(0, z.morale - 0.5); return "Inni też zwolnili — dyscyplina siada."; } }] }),
    () => ({ id: a.id, tekst: `🎯 ${nz(a)} prosi o dodatkowe stałe fragmenty po zajęciach.`, opcje: [
      { nazwa: "Zgoda — zostańcie 20 minut", skutek: () => { if (!ses.wyroznieni.includes(a.id)) ses.wyroznieni.push(a.id); a.kondycja = Math.max(40, a.kondycja - 2); return `${a.nazwisko} zostaje z trenerem — dodatkowa praca.`; } },
      { nazwa: "Nie — odpoczynek też jest treningiem", skutek: () => "Rozsądnie — jutro kolejne zajęcia." }] }),
  ];
  return wybierz(rodzaje)!();
}

/** Pochwała / upomnienie wybranego zawodnika w trakcie zajęć. */
export function uwagaTrenera(s: StanGry, id: string, pochwala: boolean): string {
  const z = s.zawodnicy[id]; if (!z) return "";
  if (pochwala) { z.morale = Math.min(100, z.morale + 3); return `👏 „Brawo, ${z.nazwisko}! Tak ma to wyglądać!” — morale w górę.`; }
  const charakter = z.cechy?.includes("profesjonalista") || z.cechy?.includes("lider");
  if (charakter) { z.forma = Math.min(5, z.forma + 0.3); return `📢 „${z.nazwisko}, skup się!” — przyjął uwagę po męsku, przyspieszył.`; }
  z.morale = Math.max(0, z.morale - 3); z.forma = Math.min(5, z.forma + 0.15); return `📢 „${z.nazwisko}, więcej zaangażowania!” — przyspieszył, ale się naburmuszył.`;
}

/** Mnożnik rozwoju z sesji na żywo (intensywność + dopasowanie ćwiczeń do fokusu tygodnia). */
export function mnoznikSesji(s: StanGry, ses: SesjaTreningu): number {
  const dop = ses.bloki.filter((b) => CWICZENIA[b].fokus.includes(s.trening)).length;
  return (ses.intens === "lekki" ? 0.8 : ses.intens === "intensywny" ? 1.25 : 1) * (1 + Math.min(0.15, dop * 0.05));
}
