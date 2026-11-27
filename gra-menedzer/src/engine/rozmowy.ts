import type { StanGry, Zawodnik } from "./types";

export interface OpcjaRozmowy { tekst: string; morale: number; reakcja: string; zostaje?: boolean }
export interface TematRozmowy { id: string; etykieta: string; kwestia: string; opcje: OpcjaRozmowy[] }

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/** Dostępne tematy rozmowy z zawodnikiem (zależne od kontekstu: forma, gra, morale, poziom). */
export function tematyRozmowy(s: StanGry, z: Zawodnik): TematRozmowy[] {
  const tematy: TematRozmowy[] = [];
  const wXI = s.taktyka.sklad.includes(z.id);
  const poziom = z.klubId ? s.kluby[z.klubId].poziom : 9;

  // 1. Ostatni mecz — wg oceny
  if (z.ocenaMeczu != null) {
    if (z.ocenaMeczu >= 7) tematy.push({ id: "mecz", etykieta: "Ostatni mecz", kwestia: "Cieszę się z tego występu. Chcę grać tak dalej.", opcje: [
      { tekst: "Świetny mecz — tak trzymać!", morale: 4, reakcja: "Dzięki za zaufanie! Dam z siebie jeszcze więcej." },
      { tekst: "Dobrze, ale stać cię na jeszcze więcej.", morale: 1, reakcja: "Rozumiem, będę pracował." },
      { tekst: "Nie było aż tak dobrze.", morale: -4, reakcja: "…Myślałem, że zagrałem naprawdę nieźle." } ] });
    else if (z.ocenaMeczu < 5.5) tematy.push({ id: "mecz", etykieta: "Ostatni mecz", kwestia: "Wiem, że zagrałem słabo. Przepraszam.", opcje: [
      { tekst: "Każdemu zdarza się gorszy dzień — głowa do góry.", morale: 4, reakcja: "Dzięki, odkuję się w następnym." },
      { tekst: "Musisz grać lepiej, oczekuję poprawy.", morale: -2, reakcja: "Wezmę to sobie do serca." },
      { tekst: "Przeanalizujemy to na treningu.", morale: 1, reakcja: "Zgoda, popracuję nad błędami." } ] });
    else tematy.push({ id: "mecz", etykieta: "Ostatni mecz", kwestia: "Myślę, że zagrałem poprawnie.", opcje: [
      { tekst: "Solidnie — buduj na tym.", morale: 2, reakcja: "Dziękuję, tak zrobię." },
      { tekst: "Oczekuję więcej błysku.", morale: -1, reakcja: "Postaram się dołożyć coś od siebie." } ] });
  }

  // 2. Gra w pierwszym składzie
  if (wXI) tematy.push({ id: "sklad", etykieta: "Gra w składzie", kwestia: "Czuję się ważną częścią zespołu.", opcje: [
    { tekst: "Jesteś filarem drużyny.", morale: 4, reakcja: "To dla mnie wiele znaczy!" },
    { tekst: "Miejsce w składzie trzeba potwierdzać.", morale: 0, reakcja: "Jasne, nie odpuszczam." } ] });
  else tematy.push({ id: "sklad", etykieta: "Gra w składzie", kwestia: "Chciałbym grać więcej. Trudno siedzieć na ławce.", opcje: [
    { tekst: "Dostaniesz swoje szanse, cierpliwości.", morale: 3, reakcja: "Dziękuję za zaufanie, poczekam." },
    { tekst: "Walcz na treningach — miejsce czeka.", morale: 1, reakcja: "Dobra, udowodnię swoją wartość." },
    { tekst: "Na razie jesteś rezerwowym.", morale: -3, reakcja: "…To przykre, ale rozumiem." } ] });

  // 3. Chęć odejścia / samopoczucie
  if (z.prosiOTransfer) tematy.push({ id: "transfer", etykieta: "Chce odejść", kwestia: "Zastanawiam się nad zmianą klubu.", opcje: [
    { tekst: "Jesteś dla nas kluczowy — zostań.", morale: 6, reakcja: "Skoro tak mnie cenisz… zostaję.", zostaje: true },
    { tekst: "Przemyśl to, jeszcze porozmawiamy.", morale: 2, reakcja: "Dobrze, dam sobie czas." },
    { tekst: "Jeśli chcesz odejść, nie zatrzymuję.", morale: -4, reakcja: "Rozumiem. Poszukam nowego klubu." } ] });
  else tematy.push({ id: "morale", etykieta: "Samopoczucie", kwestia: z.morale < 40 ? "Szczerze? Ostatnio trochę mi ciąży atmosfera." : "Ogólnie czuję się w klubie w porządku.", opcje: [
    { tekst: "Dobrze cię mieć w zespole.", morale: 3, reakcja: "Miło to słyszeć, trenerze." },
    { tekst: "Powiedz, co cię gryzie — pomogę.", morale: 4, reakcja: "Dzięki, że pan pyta. Już lepiej." },
    { tekst: "Trzymaj wysoki poziom.", morale: 0, reakcja: "Będę się starał." } ] });

  // 4. Praca i życie (amatorzy / półamatorzy — niższe klasy)
  if (poziom >= 7) tematy.push({ id: "zycie", etykieta: "Praca i życie", kwestia: "Łączę futbol z pracą — czasem ciężko wyrobić się na treningi i mecze.", opcje: [
    { tekst: "Rozumiem — zdrowie i rodzina najważniejsze.", morale: 5, reakcja: "Dzięki za wyrozumiałość, odwdzięczę się na boisku." },
    { tekst: "Ustawię treningi pod twój grafik pracy.", morale: 4, reakcja: "Super, to mi bardzo pomoże." },
    { tekst: "Futbol musi być priorytetem.", morale: -4, reakcja: "…Nie zawsze mam na to wpływ." } ] });

  return tematy;
}

/** Zastosuj wybraną odpowiedź: morale zawodnika (i ewentualnie zostaje w klubie). */
export function zastosujRozmowe(z: Zawodnik, opcja: OpcjaRozmowy) {
  z.morale = clamp(z.morale + opcja.morale);
  if (opcja.zostaje) z.prosiOTransfer = false;
}
