// Prawdziwe przyśpiewki kibiców (krótkie, z dopingu) — tylko znalezione w źródłach. Wulgaryzmy w grze są wykropkowane.
export interface Przyspiewka { tekst: string; typ: "doping" | "miasto" | "zgoda" | "rywal" | "okrzyk"; rywal?: string }
export interface PrzyspiewkiKlubu { hymn?: string; przyspiewki: Przyspiewka[] }
export const PRZYSPIEWKI: Record<string, PrzyspiewkiKlubu> = {};
