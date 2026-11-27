// Agenci piłkarscy. Zawodnicy II liga → Ekstraklasa (poziom ≤ 3) mają REALNYCH agentów/agencje
// działające w polskim futbolu; III liga → klasa B (poziom ≥ 4) — agenci generowani.
// Lista realnych uzupełniana z badań sieciowych (Transfermarkt, media, strony agencji).
import { wybierz } from "../engine/losuj";

// Realne agencje menedżerskie reprezentujące polskich piłkarzy (zweryfikowane — fakty publiczne).
export const AGENCJE_REAL: string[] = [
  "Fabryka Futbolu", "BMG Sport", "KFM — Kołakowski Football Management", "Eurosports Management",
  "SEG (Sports Entertainment Group)", "Stars&Friends", "Pro Profil", "CAA Base", "Gol International",
];
// Realni, rozpoznawalni agenci / menedżerowie piłkarscy (osoby publiczne, zweryfikowane).
export const AGENCI_REAL: string[] = [
  "Mariusz Piekarski", "Cezary Kucharski", "Tomasz Magdziarz", "Jarosław Kołakowski", "Bartłomiej Bolek",
  "Przemysław Erdman", "Szymon Pacanowski", "Daniel Chylaszek", "Pini Zahavi", "Maik Barthel",
];

const PULA_REAL = [...AGENCJE_REAL, ...AGENCI_REAL];

/** Losowy REALNY agent/agencja (dla zawodników szczebla zawodowego: Ekstraklasa / I / II liga). */
export function losujAgentaReal(): string {
  return PULA_REAL.length ? wybierz(PULA_REAL) : "Interperformances";
}
