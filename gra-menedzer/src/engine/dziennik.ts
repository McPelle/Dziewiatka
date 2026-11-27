// Dziennik kariery trenera — oś czasu kluczowych momentów (debiut, pierwsza wygrana, awanse/spadki, tytuły,
// puchary, zwolnienia i zmiany klubów, rekordowe transfery, osiągnięcia, derby, pogromy, kontrakty, licencje).
// Większość momentów jest WYPROWADZANA ze stanu gry (historia, trenerKariera, archiwumMeczow, osiagniecia,
// wiadomości). Ponieważ archiwum meczów i wiadomości są przycinane, momenty są zapisywane na trwałe
// w s.dziennik (idempotentnie, po kluczu) — wystarczy wołać aktualizujDziennik(s) po każdej kolejce i po nowym sezonie.
import { jestDerby } from "./derby";
import { OSIAGNIECIA } from "./osiagniecia";
import type { StanGry, WpisTrenera } from "./types";
import { aktualizujMuzeum } from "./muzeum";
import { aktualizujZdjecia } from "./zdjeciaDruzyny";

export type TypMomentu =
  | "start" | "debiut" | "pierwszaWygrana" | "pierwszyMecz" | "jubileusz"
  | "awans" | "spadek" | "tytul" | "puchar" | "europa"
  | "zwolnienie" | "odejscie" | "nowyKlub"
  | "kupno" | "sprzedaz" | "osiagniecie" | "derby" | "pogrom"
  | "kontrakt" | "licencja" | "legenda" | "inne";

export interface MomentKariery {
  klucz: string; // unikalny klucz (deduplikacja)
  sezon: number;
  kolejka: number; // 0 = przed sezonem / nieznana
  typ: TypMomentu;
  ikona: string;
  tytul: string;
  opis?: string;
  klub?: string; // nazwa klubu trenera w chwili zdarzenia
  waga?: 1 | 2 | 3; // 3 = kamień milowy (wyróżniany na osi czasu)
}

interface MetaDziennika {
  archOst?: string; // klucz ostatniego przetworzonego meczu z archiwum
  meczeKlubu?: Record<string, number>; // przetworzone mecze w danym klubie (nazwa)
  maxRoznica?: number; // najwyższa wygrana (różnica bramek) w karierze
  wiad?: string[]; // klucze przetworzonych wiadomości
  rekordKupno?: number;
  rekordSprzedaz?: number;
  licencja?: string;
  kontrakt?: { klub: string; do: number };
  powody?: Record<string, "zwolniony" | "wygasl">; // powód zamknięcia etapu (klucz klub|od)
  europa?: string; // „sezon|rozgrywki" ostatnio odnotowanej kampanii
}

export interface DziennikKariery { momenty: MomentKariery[]; meta: MetaDziennika }

type ZDziennikiem = StanGry & { dziennik?: DziennikKariery };

/** Dziennik w stanie gry (tworzony przy pierwszym użyciu). */
export function dziennik(s: StanGry): DziennikKariery {
  const x = s as ZDziennikiem;
  if (!x.dziennik) x.dziennik = { momenty: [], meta: {} };
  if (!x.dziennik.meta) x.dziennik.meta = {};
  return x.dziennik;
}

const nazwaMojego = (s: StanGry) => s.kluby[s.mojKlub]?.nazwa;
const sez = (r: number) => `${r}/${String((r + 1) % 100).padStart(2, "0")}`;

/** Zapisuje moment w dzienniku (jeśli klucz jeszcze nie istnieje). Zwraca true, gdy dodano. */
export function zapiszMoment(s: StanGry, m: Omit<MomentKariery, "sezon" | "kolejka" | "klub"> & Partial<Pick<MomentKariery, "sezon" | "kolejka" | "klub">>): boolean {
  const d = dziennik(s);
  if (d.momenty.some((x) => x.klucz === m.klucz)) return false;
  d.momenty.push({ sezon: s.sezon, kolejka: s.kolejka, klub: s.zwolniony ? undefined : nazwaMojego(s), ...m });
  if (d.momenty.length > 400) {
    // przycinanie: najpierw najmniej ważne, najstarsze
    const idx = d.momenty.findIndex((x) => (x.waga ?? 1) === 1);
    d.momenty.splice(idx >= 0 ? idx : 0, 1);
  }
  return true;
}

/** Moment transferowy (rekord zakupu/sprzedaży). Można wołać bezpośrednio z logiki transferów. */
export function momentTransferu(s: StanGry, kierunek: "kupno" | "sprzedaz", zawodnik: string, kwota: number, drugiKlub?: string, kiedy?: { sezon: number; kolejka: number }): boolean {
  if (!(kwota > 0)) return false;
  const d = dziennik(s);
  const pole = kierunek === "kupno" ? "rekordKupno" : "rekordSprzedaz";
  const rekord = d.meta[pole] ?? 0;
  if (kwota <= rekord) return false;
  d.meta[pole] = kwota;
  const pierwszy = rekord === 0;
  const kw = `${Math.round(kwota).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} zł`;
  return zapiszMoment(s, {
    ...(kiedy ?? {}),
    klucz: `${kierunek}|${kiedy?.sezon ?? s.sezon}|${kiedy?.kolejka ?? s.kolejka}|${zawodnik}`,
    typ: kierunek,
    ikona: kierunek === "kupno" ? "✍️" : "💰",
    tytul: kierunek === "kupno"
      ? (pierwszy ? `Pierwszy transfer gotówkowy: ${zawodnik}` : `Rekordowy zakup: ${zawodnik}`)
      : (pierwszy ? `Pierwsza sprzedaż za gotówkę: ${zawodnik}` : `Rekordowa sprzedaż: ${zawodnik}`),
    opis: `${kw}${drugiKlub ? (kierunek === "kupno" ? "" : ` · do ${drugiKlub}`) : ""}`,
    waga: pierwszy ? 2 : 3,
  });
}

/** Etap pracy trenera obejmujący dany sezon (ostatni pasujący). */
export function klubWSezonie(s: StanGry, sezon: number): WpisTrenera | undefined {
  const k = s.trenerKariera ?? [];
  for (let i = k.length - 1; i >= 0; i--) if (k[i].od <= sezon && (k[i].do == null || k[i].do! >= sezon)) return k[i];
  return undefined;
}

const LIC_RANGA: Record<string, number> = { C: 1, B: 2, A: 3, PRO: 4 };
const kluczMeczu = (m: { sezon: number; kolejka: number; rywal: string; my: number; oni: number }) => `${m.sezon}|${m.kolejka}|${m.rywal}|${m.my}:${m.oni}`;
const liczba = (t: string) => Number(t.replace(/\s/g, ""));
const hashTekstu = (t: string) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h.toString(36); };

/** Przegląda stan gry i dopisuje nowe momenty do dziennika (idempotentne — można wołać dowolnie często). */
export function aktualizujDziennik(s: StanGry) {
  const d = dziennik(s);
  const meta = d.meta;
  const kariera = s.trenerKariera ?? [];

  // ——— Etapy pracy: objęcie klubu, odejście / zwolnienie ———
  kariera.forEach((w, i) => {
    zapiszMoment(s, {
      klucz: `objecie|${w.klub}|${w.od}`, sezon: w.od, klub: w.klub,
      kolejka: i === 0 ? 0 : i === kariera.length - 1 && w.od === s.sezon ? s.kolejka : kariera[i - 1].do === w.od ? 98 : 0,
      typ: i === 0 ? "start" : "nowyKlub", ikona: i === 0 ? "🎬" : "🤝",
      tytul: i === 0 ? `Początek kariery trenerskiej: ${w.klub}` : `Nowy klub: ${w.klub}`,
      opis: i === 0 ? `Pierwsza praca na ławce trenerskiej (sezon ${sez(w.od)}).` : `Objęcie zespołu w sezonie ${sez(w.od)}.`,
      waga: 3,
    });
    if (w.do != null) {
      const kl = `${w.klub}|${w.od}`;
      if (!meta.powody) meta.powody = {};
      const ostatni = i === kariera.length - 1;
      if (ostatni && s.zwolniony && s.powodWolny && !meta.powody[kl]) meta.powody[kl] = s.powodWolny;
      const powod = meta.powody[kl];
      const bilans = `${w.mecze} mecz. (${w.w}-${w.r}-${w.p}), bramki ${w.bz}:${w.bp}${w.awanse ? `, awanse: ${w.awanse}` : ""}${w.tytuly ? `, tytuły: ${w.tytuly}` : ""}`;
      zapiszMoment(s, {
        klucz: `odejscie|${kl}`, sezon: w.do, kolejka: ostatni && s.zwolniony && w.do === s.sezon ? s.kolejka : 99, klub: w.klub,
        typ: powod === "zwolniony" ? "zwolnienie" : "odejscie",
        ikona: powod === "zwolniony" ? "🚪" : powod === "wygasl" ? "📄" : "👋",
        tytul: powod === "zwolniony" ? `Zwolniony z ${w.klub}` : powod === "wygasl" ? `Koniec kontraktu w ${w.klub}` : `Pożegnanie z ${w.klub}`,
        opis: `Bilans etapu: ${bilans}.`, waga: 3,
      });
    }
  });

  // ——— Mecze (archiwum przetwarzane przyrostowo) ———
  const arch = s.archiwumMeczow ?? [];
  let start = 0;
  if (meta.archOst) {
    let j = arch.length - 1;
    while (j >= 0 && kluczMeczu(arch[j]) !== meta.archOst) j--;
    start = j + 1; // brak (przycięte archiwum) → od początku; klucze momentów chronią przed duplikatami
  }
  if (!meta.meczeKlubu) meta.meczeKlubu = {};
  const idKlubu = new Map(Object.values(s.kluby).map((k) => [k.nazwa, k.id]));
  for (let j = start; j < arch.length; j++) {
    const m = arch[j];
    const klub = klubWSezonie(s, m.sezon)?.klub ?? nazwaMojego(s) ?? "";
    const wynik = `${m.my}:${m.oni}`;
    const opisM = `${klub} – ${m.rywal} ${wynik} (${m.dom ? "u siebie" : "na wyjeździe"})${m.strzelcy.filter(Boolean).length ? `, gole: ${[...new Set(m.strzelcy.filter(Boolean))].join(", ")}` : ""}`;
    const nKlub = (meta.meczeKlubu[klub] ?? 0) + 1;
    meta.meczeKlubu[klub] = nKlub;
    const base = { sezon: m.sezon, kolejka: m.kolejka + 1, klub }; // archiwum: indeks kolejki (0..), dziennik: numer (1..)
    if (j === 0 && arch.length < 600) zapiszMoment(s, { ...base, klucz: "debiut", typ: "debiut", ikona: "🎽", tytul: `Debiut na ławce: ${m.my > m.oni ? "wygrana" : m.my === m.oni ? "remis" : "porażka"} ${wynik} z ${m.rywal}`, opis: opisM, waga: 3 });
    else if (nKlub === 1 && kariera.length > 1 && kariera[0].klub !== klub) zapiszMoment(s, { ...base, klucz: `pierwszyMecz|${klub}`, typ: "pierwszyMecz", ikona: "🎽", tytul: `Pierwszy mecz w ${klub}: ${wynik} z ${m.rywal}`, opis: opisM, waga: 2 });
    if (m.my > m.oni) {
      zapiszMoment(s, { ...base, klucz: "pierwszaWygrana", typ: "pierwszaWygrana", ikona: "🥇", tytul: `Pierwsze zwycięstwo: ${wynik} z ${m.rywal}`, opis: opisM, waga: 3 });
      const roz = m.my - m.oni;
      const rywalId = idKlubu.get(m.rywal);
      const myId = idKlubu.get(klub) ?? s.mojKlub;
      const derby = rywalId ? jestDerby(s, myId, rywalId) : null;
      if (derby) {
        const pierwsze = !d.momenty.some((x) => x.typ === "derby");
        zapiszMoment(s, { ...base, klucz: `derby|${kluczMeczu(m)}`, typ: "derby", ikona: "⚔️", tytul: `${pierwsze ? "Pierwsze wygrane derby" : "Wygrane derby"}: ${wynik} z ${m.rywal}`, opis: `${derby}. ${opisM}`, waga: pierwsze ? 3 : 2 });
      }
      if (roz >= 3 && roz > (meta.maxRoznica ?? 0)) {
        zapiszMoment(s, { ...base, klucz: `pogrom|${kluczMeczu(m)}`, typ: "pogrom", ikona: "💥", tytul: `Najwyższa wygrana w karierze: ${wynik} z ${m.rywal}`, opis: opisM, waga: 2 });
      } else if (roz >= 5) { // pierwszy pogrom w sezonie (bez zalewania dziennika w niższych ligach)
        zapiszMoment(s, { ...base, klucz: `pogromSezonu|${m.sezon}|${klub}`, typ: "pogrom", ikona: "💥", tytul: `Pogrom: ${wynik} z ${m.rywal}`, opis: opisM, waga: 1 });
      }
      meta.maxRoznica = Math.max(meta.maxRoznica ?? 0, roz);
    }
  }
  if (arch.length) meta.archOst = kluczMeczu(arch[arch.length - 1]);

  // ——— Jubileusze na ławce ———
  const meczeSuma = kariera.reduce((a, w) => a + w.mecze, 0);
  for (const n of [50, 100, 200, 300, 500, 750, 1000]) {
    if (meczeSuma >= n) zapiszMoment(s, { klucz: `jubileusz|${n}`, typ: "jubileusz", ikona: "🎂", tytul: `${n}. mecz w roli trenera`, opis: `Jubileusz na ławce trenerskiej.`, waga: n >= 100 ? 2 : 1 });
  }

  // ——— Sezony: awanse, spadki, tytuły, puchary ———
  let awanse = 0, spadki = 0, tytuly = 0;
  for (const h of s.historia ?? []) {
    const klub = klubWSezonie(s, h.sezon)?.klub;
    const base = { sezon: h.sezon, kolejka: 99, klub };
    if (h.miejsce === 1) {
      tytuly++;
      zapiszMoment(s, { ...base, klucz: `tytul|${h.sezon}`, typ: "tytul", ikona: "🏆", tytul: tytuly === 1 ? `Pierwsze mistrzostwo: ${h.liga}` : `Mistrzostwo: ${h.liga}`, opis: `${klub ?? ""} wygrywa rozgrywki ${h.liga} w sezonie ${sez(h.sezon)}.`, waga: 3 });
    }
    if (h.wynik === "awans") {
      awanse++;
      zapiszMoment(s, { ...base, klucz: `awans|${h.sezon}`, typ: "awans", ikona: "⬆️", tytul: awanse === 1 ? `Pierwszy awans w karierze!` : `Awans z ${h.liga}`, opis: `${klub ?? ""}: ${h.miejsce}. miejsce w ${h.liga} — awans o szczebel wyżej.`, waga: 3 });
    }
    if (h.wynik === "spadek") {
      spadki++;
      zapiszMoment(s, { ...base, klucz: `spadek|${h.sezon}`, typ: "spadek", ikona: "⬇️", tytul: spadki === 1 ? `Pierwszy spadek w karierze` : `Spadek z ${h.liga}`, opis: `${klub ?? ""}: ${h.miejsce}. miejsce w ${h.liga}.`, waga: 3 });
    }
    if (h.puchar) {
      const nazwa = h.puchar === "glowny" ? "Puchar Polski" : "Puchar Polski na szczeblu regionu";
      zapiszMoment(s, { ...base, klucz: `puchar|${h.sezon}`, typ: "puchar", ikona: "🥇", tytul: `${nazwa} zdobyty!`, opis: `${klub ?? ""} sięga po trofeum w sezonie ${sez(h.sezon)}.`, waga: 3 });
    }
  }

  // ——— Europa ———
  if (s.europa && !s.zwolniony) {
    const ROZ = { LM: "Liga Mistrzów", LE: "Liga Europy", LK: "Liga Konferencji Europy" } as const;
    const n = ROZ[s.europa.rozgrywki];
    zapiszMoment(s, { klucz: `europa|${s.sezon}|${s.europa.rozgrywki}`, typ: "europa", ikona: "🌍", tytul: `Europejskie puchary: ${n}`, opis: `Start w rozgrywkach UEFA w sezonie ${sez(s.sezon)}.`, kolejka: 0, waga: 3 });
    if (s.europa.faza === "zdobyty") zapiszMoment(s, { klucz: `europaZdobyta|${s.sezon}`, typ: "puchar", ikona: "🏆", tytul: `Triumf w rozgrywkach: ${n}!`, opis: `Europejskie trofeum w sezonie ${sez(s.sezon)}.`, waga: 3 });
  }

  // ——— Osiągnięcia ———
  for (const [id, sezon] of Object.entries(s.osiagniecia ?? {})) {
    const o = OSIAGNIECIA.find((x) => x.id === id);
    if (!o) continue;
    zapiszMoment(s, { klucz: `osiag|${id}`, sezon, kolejka: sezon === s.sezon ? s.kolejka : 99, klub: klubWSezonie(s, sezon)?.klub, typ: "osiagniecie", ikona: o.ikona, tytul: `Osiągnięcie: ${o.nazwa}`, opis: o.opis, waga: 1 });
  }

  // ——— Licencja trenerska ———
  const lic = s.trenerLicencja;
  if (lic && lic !== meta.licencja) {
    if ((LIC_RANGA[lic] ?? 0) > (LIC_RANGA[meta.licencja ?? "C"] ?? 1)) {
      zapiszMoment(s, { klucz: `licencja|${lic}`, typ: "licencja", ikona: "🎓", tytul: `Licencja trenerska UEFA ${lic}`, opis: lic === "PRO" ? "Najwyższe uprawnienia trenerskie — droga do każdej ligi otwarta." : "Zdany kurs i egzamin — nowe uprawnienia trenerskie.", waga: lic === "PRO" ? 3 : 2 });
    }
    meta.licencja = lic;
  }

  // ——— Kontrakt: przedłużenia w tym samym klubie ———
  const mk = nazwaMojego(s);
  if (!s.zwolniony && mk && s.trenerKontraktDo != null) {
    const k = meta.kontrakt;
    if (k && k.klub === mk && s.trenerKontraktDo > k.do) {
      zapiszMoment(s, { klucz: `kontrakt|${mk}|${s.trenerKontraktDo}`, typ: "kontrakt", ikona: "✍", tytul: `Przedłużenie kontraktu z ${mk}`, opis: `Nowa umowa obowiązuje do sezonu ${sez(s.trenerKontraktDo)}.`, waga: 2 });
    }
    meta.kontrakt = { klub: mk, do: s.trenerKontraktDo };
  }

  // ——— Wiadomości: transfery i pożegnania legend ———
  const juz = new Set(meta.wiad ?? []);
  const nowe: string[] = [];
  for (const w of [...s.wiadomosci].reverse()) { // od najstarszej
    const kl = `${w.sezon}|${w.kolejka}|${hashTekstu(w.tekst)}`;
    if (juz.has(kl)) continue;
    nowe.push(kl);
    const t = w.tekst;
    const kiedy = { sezon: w.sezon, kolejka: w.kolejka };
    let r: RegExpMatchArray | null;
    if ((r = t.match(/^✍️ Transfer dobity: (.+?) \(\w+\) — (?:za )?([\d ]+) zł/))) momentTransferu(s, "kupno", r[1], liczba(r[2]), undefined, kiedy);
    else if ((r = t.match(/^Sprzedano (.+?) do (.+?) za ([\d ]+) zł/))) momentTransferu(s, "sprzedaz", r[1], liczba(r[3]), r[2], kiedy);
    else if ((r = t.match(/^💸 (.+?) aktywował klauzulę wykupu \(([\d ]+) zł\) (.+?) — zawodnik odchodzi/))) momentTransferu(s, "sprzedaz", r[3], liczba(r[2]), r[1], kiedy);
    else if ((r = t.match(/^🎇 Mecz pożegnalny (.+?) przy kompletnych trybunach\. Numer (\S+) zostaje zastrzeżony/))) {
      zapiszMoment(s, { klucz: `legenda|${w.sezon}|${r[1]}`, sezon: w.sezon, kolejka: w.kolejka, typ: "legenda", ikona: "🎇", tytul: `Pożegnanie legendy: ${r[1]}`, opis: r[2] !== "—" ? `Numer ${r[2]} zastrzeżony na zawsze.` : "Mecz pożegnalny przy kompletnych trybunach.", waga: 2 });
    }
  }
  meta.wiad = [...(meta.wiad ?? []), ...nowe].slice(-150);

  sortujDziennik(s);
}

const KOLEJNOSC: Partial<Record<TypMomentu, number>> = { start: 0, zwolnienie: 9, odejscie: 9, nowyKlub: 10 };
function sortujDziennik(s: StanGry) {
  dziennik(s).momenty.sort((a, b) => a.sezon - b.sezon || a.kolejka - b.kolejka || (KOLEJNOSC[a.typ] ?? 5) - (KOLEJNOSC[b.typ] ?? 5));
}

/** Momenty dziennika (chronologicznie; opcjonalnie tylko wybrane typy). */
export function momentyDziennika(s: StanGry, typy?: TypMomentu[]): MomentKariery[] {
  const m = (s as ZDziennikiem).dziennik?.momenty ?? [];
  return typy ? m.filter((x) => typy.includes(x.typ)) : m;
}

/** Jeden hook dla całej kroniki: dziennik kariery, muzeum klubu i zdjęcie drużyny na nowy sezon. */
export function aktualizujKronike(s: StanGry) {
  try {
    aktualizujMuzeum(s);
    aktualizujDziennik(s);
    aktualizujZdjecia(s);
  } catch (e) {
    // kronika nigdy nie może zatrzymać rozgrywki
    if (typeof console !== "undefined") console.warn("kronika:", e);
  }
}
