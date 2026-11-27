// Puchar — jak w Polsce: najpierw wojewódzki (regionalny) Puchar Polski dla amatorów,
// jego zdobywca awansuje do głównego (centralnego) Pucharu Polski, gdzie grają zawodowcy
// (Ekstraklasa, I–II liga). Kluby zawodowe startują od razu w fazie głównej.
import { frekwencja } from "./derby";
import { los, losInt, szansa, tasuj, wybierz, wybierzWazone, zl } from "./losuj";
import { autoSklad, zagrajMecz } from "./mecz";
import { BILET } from "./swiat";
import { odlegloscDrogowa } from "../data/miasta";
import type { Puchar, StanGry, Wynik } from "./types";

// Kluby z lig ogólnopolskich (poziomy 1–4: Ekstraklasa, I, II, III liga) grają główny PP od razu.
// Poziomy 5+ (IV liga i niżej) grają najpierw wojewódzki (regionalny) Puchar Polski — nazwa zależna od regionu.
/** Nazwa pucharu regionalnego wg regionu (mianownik „nom" + dopełniacz „gen" do rund). */
export function pucharRegion(s: StanGry): { nom: string; gen: string } {
  const r = s.sciezka || "";
  // Uwaga: kolejność — „Zachodniopomorskie" i „Kujawsko-Pomorskie" też zawierają „Pomorsk", więc sprawdzamy je najpierw.
  if (r.includes("Zachodniopomor")) return { nom: "Puchar Polski na szczeblu Zachodniopomorskiego ZPN", gen: "Pucharu Polski na szczeblu Zachodniopomorskiego ZPN" };
  if (r.includes("Kujawsko")) return { nom: "Puchar Polski na szczeblu Kujawsko-Pomorskiego ZPN", gen: "Pucharu Polski na szczeblu Kujawsko-Pomorskiego ZPN" };
  if (r.includes("Pomorsk")) return { nom: "Puchar Polski na szczeblu Pomorskiego ZPN", gen: "Pucharu Polski na szczeblu Pomorskiego ZPN" };
  if (r.includes("Małopol")) return { nom: "Puchar Polski na szczeblu Małopolskiego ZPN", gen: "Pucharu Polski na szczeblu Małopolskiego ZPN" };
  return { nom: "regionalny Puchar Polski", gen: "regionalnego Pucharu Polski" };
}
/** Podokręg pomorski gracza (Gdańsk / Słupsk / Malbork) — z nazwy ścieżki. Puste dla innych regionów. */
export function okregPomorski(s: StanGry): string {
  const r = s.sciezka || "";
  if (!r.includes("Pomorsk")) return "";
  if (r.includes("Słupsk")) return "Słupsk";
  if (r.includes("Malbork")) return "Malbork";
  if (r.includes("Gdańsk")) return "Gdańsk";
  return "";
}

/** Podokręg małopolski gracza (Kraków / Nowy Sącz / Tarnów…) — z nazwy ścieżki. Puste dla innych regionów. */
export function okregMalopolski(s: StanGry): string {
  const r = s.sciezka || "";
  const sep = "Małopolska — ";
  const i = r.indexOf(sep);
  if (i < 0) return "";
  // pierwszy człon podokręgu (przed „ / "), np. „Nowy Sącz / Gorlice" → „Nowy Sącz", „Kraków I" → „Kraków I"
  return r.slice(i + sep.length).split(" / ")[0].trim();
}

/** Podokręg kujawsko-pomorski gracza (Bydgoszcz / Toruń / Włocławek) — z nazwy ścieżki. Puste dla innych regionów. */
export function okregKujawski(s: StanGry): string {
  const r = s.sciezka || "";
  const sep = "Kujawsko-Pomorskie — ";
  const i = r.indexOf(sep);
  if (i < 0) return "";
  // np. „Bydgoszcz III" → „Bydgoszcz", „Włocławek" → „Włocławek"
  return r.slice(i + sep.length).replace(/\s+[IVX]+$/, "").split(" / ")[0].trim();
}

/** Rundy pucharu regionalnego. Eliminacje okręgowe (podokręg gracza) → finał wojewódzki danego ZPN. */
export function nazwyRegion(s: StanGry): string[] {
  const okP = okregPomorski(s);
  if (okP) return [
    `Ćwierćfinał Pucharu Polski — okręg ${okP}`,
    `Półfinał Pucharu Polski — okręg ${okP}`,
    `Finał okręgu ${okP} (Puchar Polski)`,
    `Finał wojewódzki — Puchar Polski Pomorskiego ZPN`,
  ];
  const okM = okregMalopolski(s);
  if (okM) return [
    `Ćwierćfinał Pucharu Polski — okręg ${okM}`,
    `Półfinał Pucharu Polski — okręg ${okM}`,
    `Finał okręgu ${okM} (Puchar Polski)`,
    `Finał wojewódzki — Puchar Polski Małopolskiego ZPN`,
  ];
  const okK = okregKujawski(s);
  if (okK) return [
    `Ćwierćfinał Pucharu Polski — podokręg ${okK}`,
    `Półfinał Pucharu Polski — podokręg ${okK}`,
    `Finał podokręgu ${okK} (Puchar Polski)`,
    `Finał wojewódzki — Puchar Polski Kujawsko-Pomorskiego ZPN`,
  ];
  const g = pucharRegion(s).gen;
  return [`1/8 ${g}`, `Ćwierćfinał ${g}`, `Półfinał ${g}`, `Finał ${g}`];
}
const POZIOM_ZAWODOWY = 4;

// Krajowy puchar: oficjalna nazwa sezonu 2026/27 to „STS Puchar Polski" (sponsor tytularny STS, umowa z PZPN na 3 sezony od 2025/26).
export const NAZWY_GLOWNY = ["1/32 STS Pucharu Polski", "1/16 STS Pucharu Polski", "1/8 STS Pucharu Polski", "Ćwierćfinał STS Pucharu Polski", "Półfinał STS Pucharu Polski", "Finał STS Pucharu Polski"];

/** Pełna drabinka (lista rund) Twojej drogi w pucharze — amator gra regionalny + główny, zawodowiec tylko główny. */
export function pelnaDrabinka(s: StanGry): string[] {
  const amator = s.kluby[s.mojKlub] && s.kluby[s.mojKlub].poziom > POZIOM_ZAWODOWY;
  return amator ? [...nazwyRegion(s), ...NAZWY_GLOWNY] : [...NAZWY_GLOWNY];
}

// Nagrody za rundę (zł) — rosną z fazą. Indeks = numer rundy.
const NAGRODA_REGION = [1_000, 2_000, 4_000, 10_000];
const NAGRODA_GLOWNY = [20_000, 50_000, 120_000, 300_000, 700_000, 2_000_000];

export function nowyPuchar(s: StanGry): Puchar {
  const poziom = s.kluby[s.mojKlub].poziom;
  const zawodowy = poziom <= POZIOM_ZAWODOWY;
  // Rundy pucharowe rozłożone na sezon (co ~2–3 kolejki).
  const kolejek = s.ligi[poziom - 1].terminarz.length;
  const ile = zawodowy ? NAZWY_GLOWNY.length : nazwyRegion(s).length + NAZWY_GLOWNY.length;
  const krok = Math.max(2, Math.floor((kolejek - 2) / ile));
  const harmonogram: number[] = [];
  for (let i = 0; i < ile; i++) harmonogram.push(2 + i * krok);
  // Pole uczestników do pełnego losowania par (bez mojego klubu — dokładany przy losowaniu rundy).
  const poleFaza = zawodowy
    ? s.ligi.filter((l) => l.poziom <= POZIOM_ZAWODOWY).flatMap((l) => l.kluby)
    : s.ligi.filter((l) => l.poziom > POZIOM_ZAWODOWY).flatMap((l) => l.kluby);
  const pole = poleFaza.filter((id) => id !== s.mojKlub && !s.kluby[id]?.rezerwaDla).slice(0, 31);
  return {
    faza: zawodowy ? "glowny" : "regionalny",
    runda: 0,
    harmonogram,
    przeciwnik: null,
    ostatniMecz: null,
    nazwaRundy: zawodowy ? NAZWY_GLOWNY[0] : nazwyRegion(s)[0],
    zdobywcaRegion: null,
    zdobywcaGlowny: null,
    pole,
  };
}

/** Szybkie rozegranie pary pucharowej (bez symulacji minuta-po-minucie) — zwycięzca wg siły/renomy + wynik. */
function rozegrajPare(s: StanGry, aId: string, bId: string): { winner: string; tekst: string } {
  const ra = s.kluby[aId]?.renoma ?? 0.3, rb = s.kluby[bId]?.renoma ?? 0.3;
  const pWin = Math.max(0.15, Math.min(0.85, 0.5 + (ra - rb) * 1.1));
  const aWin = szansa(pWin);
  const silniej = aWin ? ra : rb, slabiej = aWin ? rb : ra;
  let gW = losInt(1, 2) + (silniej - slabiej > 0.2 ? losInt(0, 2) : 0);
  let gP = losInt(0, 1);
  if (gW <= gP) gW = gP + 1;
  const karne = gW === gP + 1 && szansa(0.18) && silniej - slabiej < 0.1;
  const tekst = aWin ? `${gW}:${gP}${karne ? " k." : ""}` : `${gP}:${gW}${karne ? " k." : ""}`;
  return { winner: aWin ? aId : bId, tekst };
}

/** Losuje rywala pucharowego z właściwej puli (regionalny = amatorzy regionu; główny = zawodowcy, coraz mocniejsi). */
function losujRywala(s: StanGry, faza: "regionalny" | "glowny", runda: number): string {
  const moj = s.mojKlub;
  const mojPoziom = s.kluby[moj].poziom;
  // Rywal pochodzi z pola uczestników wciąż w grze (pełne losowanie par), jeśli jest dostępne.
  const poleAkt = (s.puchar?.pole ?? []).filter((id) => id !== moj && !s.kluby[id]?.rezerwaDla);
  if (poleAkt.length) {
    const mojaR = s.kluby[moj].renoma;
    return wybierzWazone(poleAkt, (id) => {
      const r = s.kluby[id].renoma;
      if (faza === "glowny" && runda >= 3) return 1 + r * 2;
      return 1 / (1 + Math.abs(r - mojaR) * 4);
    });
  }
  let pula: string[];
  if (faza === "regionalny") {
    // amatorzy z tej samej drabiny (poziom ≥ 4), nie mój klub, bez zespołów rezerw (PZPN — rezerwy nie grają w pucharze)
    pula = s.ligi.filter((l) => l.poziom > POZIOM_ZAWODOWY).flatMap((l) => l.kluby).filter((id) => id !== moj && !s.kluby[id]?.rezerwaDla);
  } else {
    // zawodowcy; w późniejszych rundach coraz wyższe ligi (jak w realu — na końcu Ekstraklasa)
    const maxPoziom = Math.max(1, POZIOM_ZAWODOWY - Math.floor(runda / 2));
    pula = s.ligi.filter((l) => l.poziom <= POZIOM_ZAWODOWY && l.poziom >= Math.min(maxPoziom, 1)).flatMap((l) => l.kluby).filter((id) => id !== moj && !s.kluby[id]?.rezerwaDla);
    if (mojPoziom > POZIOM_ZAWODOWY) {
      // amator w fazie głównej — early rounds mogą trafić słabszego zawodowca, późne na pewno mocnego
    }
  }
  if (!pula.length) pula = Object.keys(s.kluby).filter((id) => id !== moj);
  // W regionalnym i wczesnych rundach dobieraj rywali zbliżonych siłą (mniej pogromów);
  // w głównym w późnych rundach preferuj mocniejszych (jak w realu — na końcu Ekstraklasa).
  const mojaRenoma = s.kluby[moj].renoma;
  return wybierzWazone(pula, (id) => {
    const r = s.kluby[id].renoma;
    if (faza === "glowny" && runda >= 3) return 1 + r * 2; // finałowe fazy: mocniejsi
    return 1 / (1 + Math.abs(r - mojaRenoma) * 4); // bliżej siłą
  });
}

export interface WynikPucharu {
  rozegrano: boolean;
  wynik?: Wynik;
  awans?: boolean;
  nazwa?: string;
}

/** Jeśli na tę kolejkę przypada runda pucharu, rozgrywa mecz gracza. Zwraca info do pokazania. */
export function moznaPuchar(s: StanGry): boolean {
  const p = s.puchar;
  return !!p && (p.faza === "regionalny" || p.faza === "glowny") && p.harmonogram.includes(s.kolejka);
}

export function rundaPucharu(s: StanGry): WynikPucharu {
  const p = s.puchar;
  if (!p || (p.faza !== "regionalny" && p.faza !== "glowny")) return { rozegrano: false };

  const nazwyFazy = p.faza === "regionalny" ? nazwyRegion(s) : NAZWY_GLOWNY;
  const nazwa = nazwyFazy[Math.min(p.runda, nazwyFazy.length - 1)];
  const rywalId = losujRywala(s, p.faza, p.runda);
  p.przeciwnik = rywalId;

  // Finał głównego PP gra się na neutralnym obiekcie (PGE Narodowy w Warszawie) — bez atutu własnego boiska.
  const finalGlowny = p.faza === "glowny" && p.runda === NAZWY_GLOWNY.length - 1;
  // Gospodarz: losowo, ale słabszy (wyższy numer poziomu) częściej u siebie (jak w PP amator u siebie).
  const mojSlabszy = s.kluby[s.mojKlub].poziom >= s.kluby[rywalId].poziom;
  const uSiebie = finalGlowny ? false : mojSlabszy ? szansa(0.7) : szansa(0.4);
  if (finalGlowny) wiadomosc(s, `🏟 Finał STS Pucharu Polski na PGE Narodowym w Warszawie — przeciwnik: ${s.kluby[rywalId].nazwa}!`);
  const moj = { klubId: s.mojKlub, sklad: s.taktyka.sklad, formacja: s.taktyka.formacja, nastawienie: s.taktyka.nastawienie };
  const ryw = { klubId: rywalId, sklad: autoSklad(s, rywalId, "4-4-2"), formacja: "4-4-2", nastawienie: "zrownowazone" as const };
  let w = zagrajMecz(s, uSiebie ? moj : ryw, uSiebie ? ryw : moj, true, { ...(finalGlowny ? { domAtut: 1 } : {}), puchar: "polski" });
  // Puchar nie ma remisów — najpierw dogrywka, jeśli dalej remis to rzuty karne (lepszy lekko faworytem).
  let karne = false, dogrywka = false;
  if (w.gd === w.gg) {
    const przewaga = Math.max(0.3, Math.min(0.7, 0.5 + (s.kluby[s.mojKlub].renoma - s.kluby[rywalId].renoma) * 0.4));
    const wygramy = szansa(przewaga);
    const dodaj = (my: boolean) => { if (uSiebie) w = { ...w, gd: w.gd + (my ? 1 : 0), gg: w.gg + (my ? 0 : 1) }; else w = { ...w, gg: w.gg + (my ? 1 : 0), gd: w.gd + (my ? 0 : 1) }; };
    if (szansa(0.35)) { dogrywka = true; dodaj(wygramy); } // gol w dogrywce rozstrzyga
    else { karne = true; dodaj(wygramy); }               // rzuty karne
  }
  p.ostatniMecz = w;
  // Frekwencja pucharowa: gdy gościsz u siebie (zwłaszcza wyżej notowany rywal), przychodzi więcej kibiców.
  if (uSiebie) {
    const kd = s.kluby[s.mojKlub];
    const widzowie = frekwencja(s, s.mojKlub, rywalId, 0.15); // puchar = dodatkowe zainteresowanie
    kd.kasa += widzowie * BILET[kd.poziom - 1];
    if (s.kluby[rywalId].poziom < kd.poziom) wiadomosc(s, `Puchar: ${s.kluby[rywalId].nazwa} w gościach — ${widzowie.toLocaleString("pl")} kibiców na trybunach, komplet!`);
  } else if (p.faza === "glowny") {
    // Kibicowski wyjazd życia na daleki mecz pucharowy (realny rywal w głównym PP): dojazd przez pół Polski, oprawa, koszt.
    const d = odlegloscDrogowa(s.kluby[s.mojKlub].miasto, s.kluby[rywalId].miasto);
    if (d > 220) {
      s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 3);
      const koszt = Math.round((d * 8) / 100) * 100;
      s.kluby[s.mojKlub].kasa -= koszt;
      wiadomosc(s, `🚌 Kibicowski wyjazd życia do ${s.kluby[rywalId].miasto} (${d} km) na Puchar Polski — gorący doping z sektora gości (zaufanie +3, koszt oprawy/dojazdu ${zl(koszt)}).`);
    }
  }
  const moje = uSiebie ? w.gd : w.gg;
  const ich = uSiebie ? w.gg : w.gd;
  const awans = moje > ich;

  const nagroda = p.faza === "regionalny" ? NAGRODA_REGION[Math.min(p.runda, NAGRODA_REGION.length - 1)] : NAGRODA_GLOWNY[Math.min(p.runda, NAGRODA_GLOWNY.length - 1)];
  s.kluby[s.mojKlub].kasa += nagroda;
  const rywalNazwa = s.kluby[rywalId].nazwa;
  const wynikTekst = `${moje}:${ich}${karne ? " (k.)" : dogrywka ? " (dogr.)" : ""}`;
  if (!p.sciezka) p.sciezka = [];
  p.sciezka.push({ nazwa, przeciwnik: rywalId, wynik: wynikTekst, awans, uSiebie });

  // Pełne losowanie par rundy: mój mecz + pozostałe pary z pola uczestników (rozegrane szybko), zwycięzcy → kolejna runda.
  {
    const pozostali = tasuj((p.pole ?? []).filter((id) => id !== rywalId && id !== s.mojKlub));
    const pary: { dom: string; gosc: string; wynik: string }[] = [{ dom: uSiebie ? s.mojKlub : rywalId, gosc: uSiebie ? rywalId : s.mojKlub, wynik: wynikTekst }];
    const zwyciezcy: string[] = [awans ? s.mojKlub : rywalId];
    for (let i = 0; i + 1 < pozostali.length; i += 2) {
      const r = rozegrajPare(s, pozostali[i], pozostali[i + 1]);
      pary.push({ dom: pozostali[i], gosc: pozostali[i + 1], wynik: r.tekst });
      zwyciezcy.push(r.winner);
    }
    if (pozostali.length % 2 === 1) zwyciezcy.push(pozostali[pozostali.length - 1]); // wolny los (bye)
    p.pary = pary;
    p.pole = zwyciezcy; // zwycięzcy par przechodzą do następnej rundy
  }

  if (!awans) {
    p.faza = "odpadl";
    wiadomosc(s, `Puchar: odpadliście z ${rywalNazwa} (${wynikTekst}) w rundzie „${nazwa}". Premia ${zl(nagroda)}.`);
    return { rozegrano: true, wynik: w, awans: false, nazwa };
  }

  // awans
  const ostatnia = p.runda >= nazwyFazy.length - 1;
  wiadomosc(s, `Puchar: ${wynikTekst} z ${rywalNazwa} — awans z rundy „${nazwa}"! Premia ${zl(nagroda)}.`);
  s.zarzad = Math.min(100, s.zarzad + (p.faza === "glowny" ? 4 : 2));

  if (!ostatnia) {
    p.runda++;
    p.nazwaRundy = nazwyFazy[p.runda];
    return { rozegrano: true, wynik: w, awans: true, nazwa };
  }

  // wygrana faza
  if (p.faza === "regionalny") {
    p.zdobywcaRegion = s.mojKlub;
    p.faza = "glowny";
    p.runda = 0;
    p.nazwaRundy = NAZWY_GLOWNY[0];
    // dołóż rundy głównego do harmonogramu, jeśli się skończyły
    const ost = p.harmonogram[p.harmonogram.length - 1];
    const krok = 2;
    while (p.harmonogram.length < nazwyRegion(s).length + NAZWY_GLOWNY.length) p.harmonogram.push(ost + krok * (p.harmonogram.length));
    wiadomosc(s, `🏆 Zdobyliście wojewódzki Puchar Polski (${pucharRegion(s).nom})! Wchodzicie do centralnego STS Pucharu Polski — I runda (1/32), zagracie z zawodowcami.`);
    s.historia.push({ sezon: s.sezon, liga: pucharRegion(s).nom, miejsce: 1, wynik: "mistrz" });
    return { rozegrano: true, wynik: w, awans: true, nazwa: `Zdobywca ${pucharRegion(s).gen}` };
  } else {
    p.zdobywcaGlowny = s.mojKlub;
    p.faza = "zdobyty";
    wiadomosc(s, `🏆🏆 ZDOBYLIŚCIE PUCHAR POLSKI! Historyczny sukces — zagracie w europejskich pucharach (Liga Konferencji Europy)!`);
    s.zarzad = Math.min(100, s.zarzad + 20);
    s.kluby[s.mojKlub].kasa += 3_000_000;
    s.kluby[s.mojKlub].renoma = Math.min(1, s.kluby[s.mojKlub].renoma + 0.08);
    s.historia.push({ sezon: s.sezon, liga: "STS Puchar Polski", miejsce: 1, wynik: "mistrz" });
    return { rozegrano: true, wynik: w, awans: true, nazwa: "Zdobywca STS Pucharu Polski" };
  }
}

// import opóźniony, by uniknąć cyklu z sezon.ts
function wiadomosc(s: StanGry, tekst: string) {
  s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst });
  s.wiadomosci = s.wiadomosci.slice(0, 60);
}

export function etapPucharu(s: StanGry): string {
  const p = s.puchar;
  if (!p) return "";
  if (p.faza === "regionalny") return `${pucharRegion(s).nom} — ${p.nazwaRundy}`;
  if (p.faza === "glowny") return p.nazwaRundy;
  if (p.faza === "zdobyty") return "Zdobywca STS Pucharu Polski 🏆";
  return "Odpadliście z pucharu";
}
