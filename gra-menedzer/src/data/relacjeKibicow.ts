// Relacje kibicowskie (zgody, układy, kosy) — tylko potwierdzone w źródłach (stadionowioprawcy.net, Wikipedia, prasa).
// Kosa = mecz podwyższonego ryzyka; zgoda/układ = mecz przyjaźni (wspólne oprawy, wymiana szalików).
export interface RelacjaKibicow { a: string; b: string; typ: "zgoda" | "uklad" | "kosa"; nazwa?: string }
export const RELACJE_KIBICOW: RelacjaKibicow[] = [];
