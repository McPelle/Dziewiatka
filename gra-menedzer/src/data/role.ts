// Role taktyczne zawodników (realistyczne) — per kategoria pozycji. Gracz wybiera rolę zawodnika w jego profilu;
// rola lekko modyfikuje wkład w atak/obronę drużyny (tylko klub gracza — AI gra neutralnie, kalibracja ligi bez zmian).
import type { Pozycja, StanGry, Zawodnik } from "../engine/types";

export interface RolaDef { kod: string; nazwa: string; opis: string; atak: number; obrona: number }

export const ROLE_POZYCJI: Record<Pozycja, RolaDef[]> = {
  BR: [
    { kod: "klasyczny", nazwa: "Klasyczny bramkarz", opis: "Pewny w polu karnym, gra na utrzymanie.", atak: 0, obrona: 0.1 },
    { kod: "rozgrywajacy", nazwa: "Bramkarz-rozgrywający", opis: "Włącza się w rozegranie od tyłu.", atak: 0.15, obrona: -0.05 },
  ],
  OBR: [
    { kod: "stoper", nazwa: "Stoper", opis: "Klasyczny środkowy obrońca — krycie i gra w powietrzu.", atak: 0, obrona: 0.3 },
    { kod: "kryjacy", nazwa: "Obrońca kryjący", opis: "Asekuracja, destrukcja akcji.", atak: -0.1, obrona: 0.4 },
    { kod: "libero", nazwa: "Libero (rozgrywający)", opis: "Wyprowadza piłkę, buduje akcje od obrony.", atak: 0.25, obrona: -0.05 },
    { kod: "boczny_of", nazwa: "Ofensywny bocznej obrony", opis: "Włącza się do ataku skrzydłem.", atak: 0.3, obrona: -0.2 },
    { kod: "wahadlowy", nazwa: "Wahadłowy", opis: "Pokrywa całą flankę — góra-dół.", atak: 0.25, obrona: -0.1 },
  ],
  POM: [
    { kod: "box2box", nazwa: "Box-to-box", opis: "Biega od pola do pola, pomaga w obu fazach.", atak: 0.15, obrona: 0.15 },
    { kod: "regista", nazwa: "Regista (głęboki rozgrywający)", opis: "Dyryguje grą z głębi.", atak: 0.25, obrona: -0.05 },
    { kod: "niszczyciel", nazwa: "Niszczyciel", opis: "Przerywa akcje, osłania obronę.", atak: -0.1, obrona: 0.35 },
    { kod: "playmaker", nazwa: "Rozgrywający (dziesiątka)", opis: "Kreuje sytuacje, ostatnie podanie.", atak: 0.4, obrona: -0.2 },
    { kod: "mezzala", nazwa: "Mezzala", opis: "Wchodzi w półprzestrzenie, dochodzi do pola karnego.", atak: 0.25, obrona: -0.05 },
  ],
  NAP: [
    { kod: "snajper", nazwa: "Snajper (wykańczający)", opis: "Gra na gola, czyha w polu karnym.", atak: 0.35, obrona: -0.05 },
    { kod: "slup", nazwa: "Target man (słup)", opis: "Punkt odniesienia, gra tyłem, zgrywa.", atak: 0.2, obrona: 0.05 },
    { kod: "falszywa9", nazwa: "Fałszywa dziewiątka", opis: "Schodzi do gry, wciąga obrońców.", atak: 0.2, obrona: 0.1 },
    { kod: "wszechstronny", nazwa: "Napastnik wszechstronny", opis: "Strzela i asystuje, wraca do pressingu.", atak: 0.15, obrona: 0.1 },
    { kod: "odwrocony", nazwa: "Odwrócony skrzydłowy", opis: "Wchodzi do środka na strzał.", atak: 0.3, obrona: -0.1 },
  ],
};

/** Lista ról dostępnych dla zawodnika (wg jego kategorii pozycji). */
export function roleDla(z: Zawodnik): RolaDef[] {
  return ROLE_POZYCJI[z.poz] ?? [];
}
/** Definicja aktualnie wybranej roli (lub domyślna pierwsza) dla zawodnika w klubie gracza. */
export function rolaZawodnika(s: StanGry, z: Zawodnik): RolaDef | undefined {
  const lista = roleDla(z);
  const kod = s.taktyka.role?.[z.id];
  return lista.find((r) => r.kod === kod) ?? lista[0];
}
/** Łączny wkład ról (atak/obrona) jedenastki klubu gracza. Liczony tylko dla klubu gracza. */
export function bonusRol(s: StanGry, linia: string[]): { atak: number; obrona: number } {
  let atak = 0, obrona = 0;
  for (const id of linia) {
    const kod = s.taktyka.role?.[id];
    if (!kod) continue;
    const z = s.zawodnicy[id]; if (!z) continue;
    const r = (ROLE_POZYCJI[z.poz] ?? []).find((x) => x.kod === kod);
    if (r) { atak += r.atak; obrona += r.obrona; }
  }
  return { atak, obrona };
}
