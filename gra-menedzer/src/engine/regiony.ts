// Regiony klubów: województwo i podokręg — żeby awanse i spadki były realne (PZPN/ZPN):
// spadkowicz trafia wyłącznie do ligi SWOJEGO województwa i podokręgu, nigdy do obcego (np. Malbork ↛ Słupsk).
import { SCIEZKI } from "../data/sciezki";
import { MIASTA } from "../data/miasta";
import type { Klub, StanGry } from "./types";

export type Woj =
  | "małopolskie" | "pomorskie" | "zachodniopomorskie" | "kujawsko-pomorskie" | "wielkopolskie" | "świętokrzyskie"
  | "podkarpackie" | "lubelskie" | "mazowieckie" | "łódzkie" | "podlaskie" | "warmińsko-mazurskie" | "dolnośląskie"
  | "lubuskie" | "opolskie" | "śląskie";

// Miasta klubów lig centralnych i III ligi (poziomy 1–4) → województwo.
const WOJ_MIASTA: Record<string, Woj> = {
  "Biała Podlaska": "lubelskie", "Białystok": "podlaskie", "Bielsko-Biała": "śląskie", "Busko Zdrój": "świętokrzyskie",
  "Bydgoszcz": "kujawsko-pomorskie", "Bytom": "śląskie", "Chełm": "lubelskie", "Chojnice": "pomorskie", "Chorzów": "śląskie",
  "Czarnków": "wielkopolskie", "Częstochowa": "śląskie", "Dębica": "podkarpackie", "Gdańsk": "pomorskie", "Gdynia": "pomorskie",
  "Gliwice": "śląskie", "Grodzisk Mazowiecki": "mazowieckie", "Grudziądz": "kujawsko-pomorskie", "Głogów": "dolnośląskie",
  "Jarosław": "podkarpackie", "Jędrzejów": "świętokrzyskie", "Kalisz": "wielkopolskie", "Katowice": "śląskie", "Kielce": "świętokrzyskie",
  "Kleczew": "wielkopolskie", "Kolbuszowa Dolna": "podkarpackie", "Koszalin": "zachodniopomorskie", "Kraków": "małopolskie",
  "Kórnik": "wielkopolskie", "Legnica": "dolnośląskie", "Lubaczów": "podkarpackie", "Lubin": "dolnośląskie", "Lublin": "lubelskie",
  "Luzino": "pomorskie", "Mielec": "podkarpackie", "Morawica": "świętokrzyskie", "Nieciecza": "małopolskie", "Niepołomice": "małopolskie",
  "Nowy Staw": "pomorskie", "Nowy Sącz": "małopolskie", "Nowy Targ": "małopolskie", "Opole": "opolskie",
  "Ostrowiec Świętokrzyski": "świętokrzyskie", "Poznań": "wielkopolskie", "Połaniec": "świętokrzyskie", "Pruszków": "mazowieckie",
  "Płock": "mazowieckie", "Radom": "mazowieckie", "Rzeszów": "podkarpackie", "Siedlce": "mazowieckie", "Skawina": "małopolskie",
  "Skierniewice": "łódzkie", "Stalowa Wola": "podkarpackie", "Starachowice": "świętokrzyskie", "Stargard": "zachodniopomorskie",
  "Stęszew": "wielkopolskie", "Swarzędz": "wielkopolskie", "Szczecin": "zachodniopomorskie", "Tarnobrzeg": "podkarpackie",
  "Toruń": "kujawsko-pomorskie", "Tychy": "śląskie", "Warszawa": "mazowieckie", "Wrocław": "dolnośląskie", "Września": "wielkopolskie",
  "Zabrze": "śląskie", "Zamość": "lubelskie", "Zielona Góra": "lubuskie", "Łódź": "łódzkie", "Łęczna": "lubelskie",
  // III liga gr. I (2026/27)
  "Suwałki": "podlaskie", "Zambrów": "podlaskie", "Łomża": "podlaskie", "Elbląg": "warmińsko-mazurskie", "Lidzbark Warmiński": "warmińsko-mazurskie",
  "Olsztyn": "warmińsko-mazurskie", "Nowy Dwór Mazowiecki": "mazowieckie", "Mińsk Mazowiecki": "mazowieckie", "Ząbki": "mazowieckie", "Troszyn": "mazowieckie",
  "Mława": "mazowieckie", "Sieradz": "łódzkie", "Łowicz": "łódzkie", "Tomaszów Mazowiecki": "łódzkie",
  "Środa Wielkopolska": "wielkopolskie", "Świdnik": "lubelskie", "Świecie": "kujawsko-pomorskie", "Świnoujście": "zachodniopomorskie",
};
// Grupy III ligi (PZPN): województwa przypisane do grup.
const GRUPY_III: { re: RegExp; woj: Woj[] }[] = [
  { re: /gr(upa)?\.?\s*I\b(?!I|V)/i, woj: ["mazowieckie", "łódzkie", "podlaskie", "warmińsko-mazurskie"] },
  { re: /gr(upa)?\.?\s*II\b(?!I)/i, woj: ["kujawsko-pomorskie", "pomorskie", "zachodniopomorskie", "wielkopolskie"] },
  { re: /gr(upa)?\.?\s*III\b/i, woj: ["dolnośląskie", "lubuskie", "opolskie", "śląskie"] },
  { re: /gr(upa)?\.?\s*IV\b/i, woj: ["małopolskie", "świętokrzyskie", "podkarpackie", "lubelskie"] },
];
const PREFIKS_WOJ: [string, Woj][] = [["Zachodniopomorskie", "zachodniopomorskie"], ["Kujawsko-Pomorskie", "kujawsko-pomorskie"], ["Pomorskie", "pomorskie"], ["Warmińsko-Mazurskie", "warmińsko-mazurskie"], ["Podlaskie", "podlaskie"], ["Małopolska", "małopolskie"]];
const wojSciezki = (nazwa: string): Woj | undefined => PREFIKS_WOJ.find(([p]) => nazwa.startsWith(p))?.[1];

// ——— Drzewo lig z danych (wszystkie ścieżki 4 województw) ———
type Wezel = { nazwa: string; poziom: number; woj?: Woj; dzieci: Set<string>; miasta: Set<string>; kluby: Set<string> };
let _drzewo: Map<string, Wezel> | null = null;
let _klubWoj: Map<string, Woj> | null = null;
let _miastoWoj: Map<string, Woj> | null = null;
function drzewo(): Map<string, Wezel> {
  if (_drzewo) return _drzewo;
  const m = new Map<string, Wezel>();
  const kw = new Map<string, Woj>();
  const mw = new Map<string, Woj>();
  for (const sc of SCIEZKI) {
    const woj = wojSciezki(sc.nazwa);
    sc.ligi.forEach((l, i) => {
      const w = m.get(l.nazwa) ?? { nazwa: l.nazwa, poziom: i + 1, dzieci: new Set<string>(), miasta: new Set<string>(), kluby: new Set<string>() };
      if (i >= 4 && woj) w.woj = woj; // IV liga i niżej — liga jednego województwa
      const dz = sc.ligi[i + 1];
      if (dz) w.dzieci.add(dz.nazwa);
      for (const k of l.kluby ?? []) { w.kluby.add(k.nazwa); if (i >= 4) w.miasta.add(k.miasto); if (i >= 4 && woj) { kw.set(k.nazwa, woj); if (!mw.has(k.miasto)) mw.set(k.miasto, woj); } }
      m.set(l.nazwa, w);
    });
  }
  // miasta poddrzewa: liga „zna" miasta wszystkich lig poniżej siebie (podokręg = suma swoich grup)
  const zbierz = (n: string, seen = new Set<string>()): Set<string> => {
    const w = m.get(n); if (!w || seen.has(n)) return new Set(); seen.add(n);
    const out = new Set(w.miasta);
    for (const d of w.dzieci) for (const x of zbierz(d, seen)) out.add(x);
    return out;
  };
  for (const w of m.values()) if (w.poziom >= 5) w.miasta = zbierz(w.nazwa);
  _drzewo = m; _klubWoj = kw; _miastoWoj = mw;
  return m;
}

/** Województwo klubu (miasto lig centralnych/III ligi albo liga regionalna, w której występuje w danych). */
export function wojKlubu(k: Pick<Klub, "nazwa" | "miasto">): Woj | undefined {
  drzewo();
  return WOJ_MIASTA[k.miasto] ?? _klubWoj!.get(k.nazwa) ?? _klubWoj!.get(k.nazwa.replace(/\s+(II|III|IV)(?=\s|$)/, "")) ?? _miastoWoj!.get(k.miasto);
}
/** Województwa obsługiwane przez ligę (III liga: grupa; IV liga i niżej: jedno). */
export function wojLigi(nazwaLigi: string): Woj[] | null {
  const w = drzewo().get(nazwaLigi);
  if (w?.woj) return [w.woj];
  const g = GRUPY_III.find((x) => x.re.test(nazwaLigi));
  if (g && /3\.?\s*Liga|III liga/i.test(nazwaLigi)) return g.woj;
  return null; // ligi centralne — cała Polska
}
const odl = (a: string, b: string) => { const p = MIASTA[a], q = MIASTA[b]; if (!p || !q) return Infinity; return Math.hypot(p[0] - q[0], (p[1] - q[1]) * 0.62); };

/** Czy klub, spadając z ligi `gorna`, trafia (regionalnie) do ligi `dolna` (jednej z jej podgrup). */
export function trafiaDo(k: Pick<Klub, "nazwa" | "miasto">, gorna: string, dolna: string): boolean {
  const wd = wojLigi(dolna);
  const woj = wojKlubu(k);
  if (wd) {
    if (!woj || !wd.includes(woj)) return false;      // inne województwo — nigdy
    const dz = [...(drzewo().get(gorna)?.dzieci ?? [])].filter((n) => { const x = wojLigi(n); return !x || !woj || x.includes(woj); });
    if (dz.length <= 1) return true;                    // jedna liga tego województwa niżej
    // kilka grup niżej (podokręgi) — decyduje miasto: należy do poddrzewa grupy albo najbliższa grupa
    const w = drzewo().get(dolna);
    if (w?.kluby.has(k.nazwa) || w?.miasta.has(k.miasto)) return true;
    const kto = dz.find((n) => { const x = drzewo().get(n); return x?.kluby.has(k.nazwa) || x?.miasta.has(k.miasto); });
    if (kto) return kto === dolna;
    let best = "", bd = Infinity;
    for (const n of dz) for (const c of drzewo().get(n)?.miasta ?? []) { const d = odl(k.miasto, c); if (d < bd) { bd = d; best = n; } }
    return best === dolna;                              // brak współrzędnych → poza tą grupą (nie zgadujemy)
  }
  return true; // liga centralna niżej — każdy klub
}
/** Grupy-rodzeństwo ligi `dolna` (inne podgrupy tej samej ligi nadrzędnej) — źródło awansów spoza symulowanej piramidy. */
export function rodzenstwo(gorna: string, dolna: string): string[] {
  const g = drzewo().get(gorna);
  if (!g) return [];
  const wd = wojLigi(gorna);
  return [...g.dzieci].filter((n) => n !== dolna && (!wd || (wojLigi(n) ?? wd).some((x) => wd.includes(x))));
}
/** Kluby z danych danej ligi (do „wirtualnych" awansów z grup spoza symulacji). */
export function klubyLigiZDanych(nazwaLigi: string) {
  for (const sc of SCIEZKI) for (const l of sc.ligi) if (l.nazwa === nazwaLigi) return l.kluby ?? [];
  return [];
}
/** Etykieta regionu do UI. */
export function opisRegionu(s: StanGry, k: Klub): string {
  const w = wojKlubu(k);
  return w ? `woj. ${w}` : "";
}
