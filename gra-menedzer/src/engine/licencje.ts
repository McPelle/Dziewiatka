// Licencje trenerskie UEFA (C → B → A → PRO): doświadczenie daje prawo zapisu, licencję zdobywa się na płatnym kursie
// (kilka miesięcy, egzamin). Liga wymaga odpowiedniej licencji — bez niej: prowadzenie warunkowe w trakcie kursu albo kara.
import type { StanGry } from "./types";

export type Licencja = "C" | "B" | "A" | "PRO";
const RANGA: Record<Licencja, number> = { C: 0, B: 1, A: 2, PRO: 3 };
export const KURSY: Record<Exclude<Licencja, "C">, { koszt: number; tygodnie: number; pkt: number; opis: string }> = {
  B: { koszt: 9000, tygodnie: 16, pkt: 4, opis: "Kurs UEFA B — szkoła trenerów ZPN: zajęcia weekendowe, staż w klubie, egzamin praktyczny." },
  A: { koszt: 18000, tygodnie: 24, pkt: 9, opis: "Kurs UEFA A — PZPN: moduły w Szkole Trenerów, staż w klubie centralnym, praca dyplomowa." },
  PRO: { koszt: 45000, tygodnie: 40, pkt: 16, opis: "Kurs UEFA Pro — elita: staże zagraniczne, analityka, zarządzanie sztabem; egzamin przed komisją." },
};
export const wymaganaLicencja = (poziom: number): Licencja => (poziom <= 2 ? "PRO" : poziom <= 5 ? "A" : poziom <= 7 ? "B" : "C");
export function punktyDorobku(s: StanGry): number {
  const h = s.historia ?? []; return h.length + h.filter((x) => x.wynik === "awans" || x.wynik === "mistrz").length * 2 + h.filter((x) => x.wynik === "mistrz").length * 3;
}
export function nastepnaLicencja(s: StanGry): Exclude<Licencja, "C"> | null { const l = (s.trenerLicencja ?? "C") as Licencja; return l === "C" ? "B" : l === "B" ? "A" : l === "A" ? "PRO" : null; }

export function zapiszNaKurs(s: StanGry): string | null {
  const cel = nastepnaLicencja(s); if (!cel) return "Masz już najwyższą licencję UEFA Pro.";
  if (s.kursLicencji) return "Już jesteś na kursie.";
  const k = KURSY[cel]; if (punktyDorobku(s) < k.pkt) return `Za mały dorobek trenerski (${punktyDorobku(s)}/${k.pkt} pkt — sezony, awanse, tytuły).`;
  const klub = s.kluby[s.mojKlub]; if (klub.kasa < k.koszt) return "Klub nie ma środków na opłacenie kursu.";
  klub.kasa -= k.koszt; s.kursLicencji = { cel, pozostalo: k.tygodnie };
  return null;
}
/** Tydzień: postęp kursu, egzamin; ostrzeżenia / kary za brak wymaganej licencji. */
export function tydzienLicencji(s: StanGry): string | null {
  const klub = s.kluby[s.mojKlub]; if (!klub) return null;
  const kurs = s.kursLicencji;
  if (kurs) {
    kurs.pozostalo--;
    if (kurs.pozostalo <= 0) {
      if (Math.random() < 0.88) { s.trenerLicencja = kurs.cel; s.kursLicencji = undefined; return `🎓 Egzamin zdany! Masz licencję trenerską UEFA ${kurs.cel}.`; }
      kurs.pozostalo = 4; return `📝 Egzamin na UEFA ${kurs.cel} niezdany — poprawka za 4 tygodnie.`;
    }
    return null;
  }
  const wym = wymaganaLicencja(klub.poziom), ma = (s.trenerLicencja ?? "C") as Licencja;
  if (RANGA[ma] < RANGA[wym] && s.kolejka % 4 === 0) {
    const kara = [20000, 12000, 6000, 3000, 1500, 800, 400, 300, 200][Math.min(8, klub.poziom - 1)];
    klub.kasa -= kara; return `⚖️ Komisja Licencyjna: liga wymaga licencji UEFA ${wym}, a Ty masz ${ma} i nie jesteś na kursie — kara ${kara.toLocaleString("pl")} zł. Zapisz się na kurs (Sztab → Licencja).`;
  }
  return null;
}
