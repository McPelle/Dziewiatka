// Zadyma na trybunach — eskalacja krok po kroku, z inteligentnymi reakcjami kibiców, ochrony i policji:
// napięcie → prowokacje → przepychanki → starcie → interwencja stewardów → policja (deeskalacja / tyraliera / gaz / armatka)
// → kibice: wycofują się, stawiają opór albo przenoszą zadymę pod stadion. O przebiegu decydują: derby/kosa, wynik,
// prowokacje (oprawy), liczebność kibiców vs służb, jakość firmy ochroniarskiej, taktyka policji i Twoje reakcje.
import type { MeczLive } from "./meczNaZywo";

export type FazaZadymy = "napiecie" | "prowokacje" | "przepychanki" | "starcie" | "stewardzi" | "policja" | "wycofanie" | "opor" | "miasto" | "spokoj";
export interface Zadyma {
  faza: FazaZadymy; napiecie: number; sektor: "gospodarzy" | "gosci" | "oba"; start: number;
  kibice: number; stewardzi: number; policja: number; jakosc: number; taktyka: "deeskalacja" | "sila";
  zatrzymani: number; ranni: number; przerwaMin: number; armatka: boolean; reakcje: string[]; koniec?: boolean;
}

const los = (a: number, b: number) => a + Math.random() * (b - a);
const int = (a: number, b: number) => Math.floor(los(a, b + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Czy zaczyna się zadyma w tej minucie (zależnie od napięcia meczu). */
export function moznaZadyma(m: MeczLive): boolean {
  if (!m.bezp || m.bezp.widzowie <= 0 || m.zadyma || m.koniec || m.karne) return false;
  const pocz = (m.bezp.derby ? 0.0022 : 0.0003) * (1 + (m.oprawyPlan?.some((p) => p.o.obrazliwa) ? 1 : 0) + Math.abs(m.gd - m.gg) * 0.3 + (m.min > 75 ? 0.5 : 0));
  return Math.random() < pocz * (1.4 - (m.bezp.plan?.jakosc ?? 0.5));
}

export function startZadymy(m: MeczLive): Zadyma {
  const plan = m.bezp?.plan;
  const z: Zadyma = {
    faza: "napiecie", napiecie: m.bezp?.derby ? 45 : 30, sektor: pick(["gospodarzy", "gosci", "oba"] as const), start: m.min,
    kibice: int(m.bezp?.derby ? 80 : 20, m.bezp?.derby ? 400 : 120), stewardzi: plan?.ochroniarze ?? int(20, 80), policja: plan?.policja ?? (m.bezp?.derby ? 120 : 20),
    jakosc: plan?.jakosc ?? 0.5, taktyka: Math.random() < 0.55 ? "deeskalacja" : "sila", zatrzymani: 0, ranni: 0, przerwaMin: 0, armatka: false, reakcje: [],
  };
  m.zadyma = z;
  m.komentarz.unshift({ min: `${m.min}'`, typ: "kibice", tekst: `⚠️ Gęstnieje atmosfera ${z.sektor === "oba" ? "między sektorami" : z.sektor === "gosci" ? "w klatce gości" : "w młynie"} — gwizdy, wyzwiska, ktoś szarpie siatkę. Kierownik ds. bezpieczeństwa wzywa grupę interwencyjną.` });
  return z;
}

/** Twoje reakcje z ławki / klubu (zmniejszają napięcie). */
export function reakcjaKlubu(m: MeczLive, r: "spiker" | "kapitan" | "przerwa"): string {
  const z = m.zadyma; if (!z || z.koniec) return "Na trybunach spokój.";
  if (z.reakcje.includes(r)) return "Już to zrobiłeś.";
  z.reakcje.push(r);
  if (r === "spiker") { z.napiecie -= 8; return "📢 Spiker apeluje o spokój i przypomina o karach dla klubu — część kibiców odpuszcza."; }
  if (r === "kapitan") { const ok = Math.random() < 0.65; z.napiecie -= ok ? 18 : 3; return ok ? "🧢 Kapitan podchodzi pod sektor, rozmawia z gniazdowym — młyn bije brawo, emocje opadają." : "🧢 Kapitan próbuje rozmawiać, ale kibice go nie słuchają."; }
  z.napiecie -= 10; z.przerwaMin += 3; m.dolicz[m.polowa === 1 ? 0 : 1] = Math.min(10, m.dolicz[m.polowa === 1 ? 0 : 1] + 3);
  return "⏸ Prosisz sędziego o przerwę — drużyny schodzą do linii, delegat i policja mają czas na uspokojenie trybun.";
}

/** Jeden krok (minuta) zadymy. Zwraca opis do relacji (albo null). Ustawia flagi dla 3D (interwencja, armatka). */
export function krokZadymy(m: MeczLive): string | null {
  const z = m.zadyma; if (!z || z.koniec) return null;
  const sila = z.kibice / Math.max(1, z.stewardzi * (0.6 + z.jakosc) + (["policja", "opor", "wycofanie"].includes(z.faza) ? z.policja * 1.5 : 0));
  const wynikZly = m.bezp?.derby && (z.sektor === "gospodarzy" ? m.gd < m.gg : m.gg < m.gd);
  z.napiecie += los(-6, 9) + (sila > 1 ? 6 : -3) + (wynikZly ? 4 : 0) - (z.taktyka === "deeskalacja" && z.faza === "policja" ? 6 : 0);
  z.napiecie = Math.max(0, Math.min(100, z.napiecie));
  const sek = z.sektor === "oba" ? "przy płocie między sektorami" : z.sektor === "gosci" ? "w klatce gości" : "w młynie";
  let t: string | null = null;
  switch (z.faza) {
    case "napiecie":
      if (z.napiecie > 50) { z.faza = "prowokacje"; t = `🗯 ${sek[0].toUpperCase() + sek.slice(1)}: obraźliwe przyśpiewki, gesty, rzucane kubki. Stewardzi ustawiają się szpalerem.`; }
      else if (z.napiecie < 20) { z.faza = "spokoj"; t = "🟢 Emocje opadły — trybuny wracają do dopingu."; }
      break;
    case "prowokacje":
      if (z.napiecie > 62) { z.faza = "przepychanki"; t = `🤼 Przepychanki ${sek} — grupa w kapturach napiera na bramkę sektorową, stewardzi trzymają linię.`; }
      else if (z.napiecie < 30) { z.faza = "spokoj"; t = "🟢 Prowokacje ucichły — gniazdowy przejmuje kontrolę nad młynem."; }
      break;
    case "przepychanki":
      if (z.napiecie > 72 && sila > 0.8) { z.faza = "starcie"; z.ranni += int(0, 3); m.zadymaPrzerwa = true; t = `💥 Starcie ${sek}! Pękła bramka sektorowa, lecą krzesełka. Sędzia przerywa mecz i zabiera piłkarzy do środka boiska.`; }
      else if (z.jakosc > 0.6 || sila < 0.7) { z.faza = "stewardzi"; t = `🦺 Grupa interwencyjna stewardów (${Math.round(z.stewardzi * 0.15)} os.) wchodzi między strony i rozdziela kibiców.`; }
      break;
    case "starcie":
      z.faza = "policja"; z.armatka = !!m.bezp?.derby && z.taktyka === "sila" && Math.random() < 0.5;
      t = z.taktyka === "sila" ? `🚔 Policja wkracza tyralierą: pododdział prewencji w kaskach i z tarczami, użyty gaz pieprzowy${z.armatka ? ", za stadionem rusza armatka wodna" : ""}.` : "🚔 Policja ustawia kordon i negocjatora — próba wygaszenia bez użycia siły.";
      break;
    case "stewardzi":
      if (z.napiecie > 70) { z.faza = "policja"; t = "🚔 Stewardzi nie dają rady — kierownik ds. bezpieczeństwa wzywa policję na trybunę."; }
      else if (z.napiecie < 45) { z.faza = "spokoj"; z.zatrzymani += int(0, 2); t = `🟢 Stewardzi opanowali sytuację${z.zatrzymani ? `, ${z.zatrzymani} os. wyprowadzone ze stadionu` : ""}. Gra toczy się dalej.`; }
      break;
    case "policja": {
      // kibice: wycofanie (gdy policja silniejsza / deeskalacja) albo opór (gdy liczni i nakręceni)
      const opor = sila > 0.55 && z.napiecie > 60 && Math.random() < 0.55;
      if (opor) { z.faza = "opor"; z.ranni += int(1, 5); z.zatrzymani += int(2, 10); t = `🔥 Kibice stawiają opór — race w stronę policji, szarpanina na schodach. Policja używa pałek${z.armatka ? " i armatki wodnej pod bramą" : ""}. Ranni: ${z.ranni}, zatrzymani: ${z.zatrzymani}.`; }
      else { z.faza = "wycofanie"; z.zatrzymani += int(0, 6); t = `↩️ Kibice wycofują się w głąb sektora, zasłaniają się flagami. Policja zostaje w kordonie przy płocie${z.zatrzymani ? `, zatrzymani: ${z.zatrzymani}` : ""}.`; }
      break;
    }
    case "opor":
      if (Math.random() < 0.45) { z.faza = "miasto"; t = "🏙 Część grupy opuszcza stadion i przenosi zadymę na ulice — policja blokuje skrzyżowania przy dworcu, latają kamienie."; }
      else { z.faza = "wycofanie"; z.zatrzymani += int(1, 6); t = `↩️ Policja wypycha grupę z przejścia, kibice wycofują się. Łącznie zatrzymanych: ${z.zatrzymani}.`; }
      break;
    case "wycofanie":
      if (z.napiecie < 55 || Math.random() < 0.5) { z.faza = "spokoj"; m.zadymaPrzerwa = false; t = `🟢 Sytuacja opanowana po ${m.min - z.start} min. Sędzia wznawia grę. Bilans: zatrzymani — ${z.zatrzymani}, ranni — ${z.ranni}.`; }
      break;
    case "miasto":
      z.faza = "spokoj"; m.zadymaPrzerwa = false; z.zatrzymani += int(3, 15);
      t = `🚓 Po meczu media donoszą o zamieszkach w mieście — zatrzymanych łącznie: ${z.zatrzymani}, zniszczone przystanki. Wojewoda zapowiada konsekwencje.`; break;
    case "spokoj":
      z.koniec = true; m.zadymaPrzerwa = false;
      // skutki do rozliczenia (kary, zakazy): incydent z wagą zależną od przebiegu
      (m.incydenty ??= []).push({ typ: z.ranni || z.faza === "spokoj" && z.zatrzymani > 5 ? "bojka" : "przedmioty", min: z.start, sektor: z.sektor === "oba" ? "gosci" : z.sektor, opis: `Zadyma (${z.zatrzymani} zatrzymanych, ${z.ranni} rannych)`, opanowany: z.zatrzymani < 4 && z.ranni === 0 });
      return null;
  }
  if (m.zadymaPrzerwa) z.przerwaMin++; // zegar stoi w czasie przerwy
  return t;
}
