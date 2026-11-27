// Przed meczem: szatnia (przebranie, rozmowy zawodników), rozgrzewka na boisku i ostatnie słowa trenera.
// Wszystko wpływa na mecz: mowa → motywacja na cały mecz, rozgrzewka → kondycja, „wejście w mecz" i ryzyko urazu.
import { los, losInt, szansa, wybierz } from "./losuj";
import type { MeczLive } from "./meczNaZywo";
import type { StanGry, Zawodnik } from "./types";
import { jezykZawodnika, PO_JEZYKU, polski, rozumienie, type Kat } from "./jezyki";

export type MowaPrzed = "motywacja" | "spokoj" | "taktyka" | "kibice" | "presja" | "kapitan";
export type Rozgrzewka = "lekka" | "normalna" | "intensywna";
/** Kwestia w szatni: `id` zawodnika albo "trener" / "asystent" / "kitman". */
export interface Kwestia { id: string; tekst: string; kat?: Kat }

export const ROZGRZEWKI: Record<Rozgrzewka, { nazwa: string; ikona: string; opis: string }> = {
  lekka: { nazwa: "Lekka", ikona: "🚶", opis: "Trucht, rozciąganie, kilka podań. Oszczędza siły (−1% kondycji), ale drużyna wolniej wchodzi w mecz (pierwsze 15 min słabiej)." },
  normalna: { nazwa: "Normalna", ikona: "🏃", opis: "Klasyczne 25 minut: rozruch, dziadek, podania w parach, sprinty, strzały na bramkarza (−2% kondycji)." },
  intensywna: { nazwa: "Intensywna", ikona: "⚡", opis: "Wysokie tempo, sprinty i gierka. Mocne wejście w mecz (pierwsze 15 min lepiej), ale −4% kondycji i ryzyko naciągnięcia mięśnia." },
};

export const MOWY_PRZED: Record<MowaPrzed, { nazwa: string; ikona: string; opis: string }> = {
  motywacja: { nazwa: "Zostawcie serce na boisku", ikona: "🔥", opis: "Mowa motywacyjna. Najlepiej działa, gdy jesteście underdogiem." },
  spokoj: { nazwa: "Spokojnie, róbmy swoje", ikona: "🧘", opis: "Zdejmuje presję. Dobra, gdy jesteście faworytem albo w drużynie są nerwowi." },
  taktyka: { nazwa: "Ostatnie wskazówki taktyczne", ikona: "📋", opis: "Przypomnienie planu na mecz — pewny, umiarkowany efekt." },
  kibice: { nazwa: "Grajcie dla kibiców", ikona: "📣", opis: "Najmocniej u siebie i w derbach, na wyjeździe słabiej." },
  presja: { nazwa: "Dziś nie ma wymówek", ikona: "😤", opis: "Ostra mowa. Przy wysokim morale nakręca, przy niskim — może zdołować." },
  kapitan: { nazwa: "Niech mówi kapitan", ikona: "©️", opis: "Głos oddajesz kapitanowi — efekt zależy od jego przywództwa." },
};

const nzw = (s: StanGry, id?: string) => (id && s.zawodnicy[id] ? s.zawodnicy[id].nazwisko : "");
const moj = (m: MeczLive) => (m.moja === "dom" ? m.dom : m.gosc);
const rywal = (m: MeczLive) => (m.moja === "dom" ? m.gosc : m.dom);

/** Kontekst meczu: faworyt (renoma), derby, puchar, u siebie, pogoda. */
function kontekst(s: StanGry, m: MeczLive) {
  const ja = s.kluby[moj(m).klubId], on = s.kluby[rywal(m).klubId];
  const roznica = (ja.renoma ?? 0.5) - (on.renoma ?? 0.5);
  return { ja, on, faworyt: roznica > 0.12, underdog: roznica < -0.12, uSiebie: m.moja === "dom", puchar: !!m.puchar };
}

/** Rozmowy w szatni (przebranie przed rozgrzewką albo tuż przed wyjściem). */
export function rozmowySzatni(s: StanGry, m: MeczLive, etap: "przebranie" | "wyjscie", opcje?: { derby?: boolean; deszcz?: boolean }): Kwestia[] {
  const k = kontekst(s, m);
  const xi = moj(m).naBoisku.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
  const law = moj(m).lawka.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
  const kap = s.zawodnicy[s.kapitan ?? ""] && xi.some((z) => z.id === s.kapitan) ? s.zawodnicy[s.kapitan!] : [...xi].sort((a, b) => (b.atrybuty?.prz ?? b.umiej) - (a.atrybuty?.prz ?? a.umiej))[0];
  const br = xi.find((z) => z.poz === "BR");
  const mlody = [...xi, ...law].filter((z) => z.wiek <= 20).sort((a, b) => a.wiek - b.wiek)[0];
  const weteran = [...xi].filter((z) => z.wiek >= 30 || z.cechy?.includes("weteran")).sort((a, b) => b.wiek - a.wiek)[0];
  const snajper = [...xi].filter((z) => z.poz === "NAP" || z.poz === "POM").sort((a, b) => b.gole - a.gole)[0];
  const nerwowy = xi.find((z) => z.cechy?.includes("nerwowy"));
  const lawkowy = law.find((z) => z.poz !== "BR" && z.umiej >= (xi.reduce((a, z) => a + z.umiej, 0) / Math.max(1, xi.length)) - 2);
  const gwiazdaRywala = rywal(m).naBoisku.map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => (b!.gole * 2 + b!.umiej / 10) - (a!.gole * 2 + a!.umiej / 10))[0];
  const out: Kwestia[] = [];
  const dodaj = (z: Zawodnik | undefined | string, tekst: string) => { if (!z) return; out.push({ id: typeof z === "string" ? z : z.id, tekst }); };
  if (etap === "przebranie") {
    dodaj("kitman", wybierz(["Stroje wiszą, getry poukładane, korki wyczyszczone. Kto nie ma kompletu, ręka w górę!", "Panowie, koszulki meczowe na haczykach. Treningowe zostawiacie w koszu, nie na podłodze!"]));
    if (nerwowy) dodaj(nerwowy, wybierz(["Kto widział moje getry?! Kitman!", "Gdzie są moje nagolenniki? Przed chwilą tu leżały…"]));
    if (nerwowy) dodaj("kitman", "Wiszą na twoim haczyku. Jak co tydzień.");
    if (opcje?.deszcz) dodaj(br ?? kap, "Murawa mokra — wkręcane korki dziś, panowie. Piłka będzie śliska.");
    if (mlody) dodaj(mlody, wybierz(["Ale mam motyle w brzuchu… pełne trybuny dziś?", "Pierwszy raz w tej koszulce w takim meczu. Ręce mi się trzęsą."]));
    if (mlody && weteran && weteran.id !== mlody.id) dodaj(weteran, "Spokojnie, młody. Pierwsze podanie do najbliższego i od razu wejdziesz w mecz.");
    if (gwiazdaRywala) dodaj(kap, `Uważajmy na ich ${gwiazdaRywala.nazwisko}. Ostatnio strzela jak na zawołanie — nie dajemy mu się obrócić.`);
    if (snajper && snajper.gole > 0) dodaj(snajper, wybierz(["Dajcie mi dziś jedną piłkę w szesnastkę, resztę zrobię sam.", "Ktoś dziś stawia pizzę po meczu?"]));
    if (snajper) dodaj(wybierz(xi.filter((z) => z.id !== snajper.id)) ?? kap, "Stawia ten, kto strzeli! Czyli pewnie ty…");
    if (opcje?.derby) dodaj(weteran ?? kap, "To są derby, panowie. Tego się nie przegrywa — całe miasto na to patrzy.");
    if (k.puchar) dodaj(kap, "Puchar rządzi się swoimi prawami. Dziś nie ma jutra — wygrany idzie dalej.");
    if (lawkowy) dodaj(lawkowy, "Znowu ławka… Nic, będę gotowy, jak trener zawoła.");
    const nowy = [...xi, ...law].find((z) => polski(z) < 25);
    if (nowy) {
      const polak = xi.find((z) => polski(z) >= 100 && z.id !== nowy.id);
      dodaj("kitman", `(kitman pokazuje ${nowy.nazwisko} na migi, gdzie wisi jego koszulka z numerem ${nowy.numer ?? ""})`);
      if (polak) dodaj(polak, `${nowy.imie}, ready? Gotowy? No, gotowy… ready!`);
      out.push({ id: nowy.id, tekst: "Jestem gotowy, trenerze!", kat: "gotowy" });
    }
    const uczy = [...xi, ...law].find((z) => polski(z) >= 25 && polski(z) < 55);
    if (uczy) out.push({ id: uczy.id, tekst: "Kto stawia pizzę po meczu?", kat: "pizza" });
    dodaj("asystent", `Panowie, za pięć minut wychodzimy na rozgrzewkę. ${br ? `${br.nazwisko} — ty wcześniej, z trenerem bramkarzy.` : ""}`);
  } else {
    if (br) dodaj(br, "Obrona, gadamy ze sobą przy stałych fragmentach. Każdy ma swojego!");
    if (weteran && weteran.id !== kap?.id) dodaj(weteran, "Pierwsze piętnaście minut — pełna koncentracja. Zero głupich strat.");
    if (k.underdog) dodaj(kap, `Nikt na nas nie stawia. I bardzo dobrze — niech ${k.on.nazwa} się zdziwi.`);
    else if (k.faworyt) dodaj(kap, "Wszyscy myślą, że to będzie spacer. Nie będzie — szanujemy rywala i robimy swoje.");
    if (mlody) dodaj(mlody, "Dam z siebie wszystko.");
  }
  return out;
}

/** Mowa trenera tuż przed wyjściem. Zwraca reakcje zawodników i opis efektu. Ustawia motywację na cały mecz. */
export function mowaPrzedMeczem(s: StanGry, m: MeczLive, t: MowaPrzed, opcje?: { derby?: boolean }): { efekt: number; opis: string; tekst: string; reakcje: Kwestia[] } {
  const k = kontekst(s, m);
  const xi = moj(m).naBoisku.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
  const morale = xi.reduce((a, z) => a + z.morale, 0) / Math.max(1, xi.length);
  const nerwowi = xi.filter((z) => z.cechy?.includes("nerwowy")).length;
  const kap = s.zawodnicy[s.kapitan ?? ""] ?? [...xi].sort((a, b) => (b.atrybuty?.prz ?? b.umiej) - (a.atrybuty?.prz ?? a.umiej))[0];
  let e = 0, tekst = "";
  switch (t) {
    case "motywacja": e = k.underdog ? 0.05 : k.faworyt ? 0.01 : 0.03; tekst = `Panowie! ${k.underdog ? `Nikt w nas nie wierzy — ${k.on.nazwa} przyjechał po trzy punkty. ` : ""}Zostawcie dziś serce na tym boisku. Każdy pojedynek, każda piłka — nasza!`; break;
    case "spokoj": e = (k.faworyt ? 0.035 : 0.015) + nerwowi * 0.008; tekst = "Spokojnie. Jesteśmy dobrze przygotowani. Róbcie to, co na treningach — krótko, prosto, cierpliwie. Wynik przyjdzie sam."; break;
    case "taktyka": e = 0.025; tekst = `Przypominam: ${s.taktyka.formacja}, ${s.taktyka.pressing === "wysoki" ? "wysoki pressing od pierwszej minuty" : s.taktyka.pressing === "niski" ? "cofamy się i czekamy na kontrę" : "zwarta linia i doskok"}. Stałe fragmenty — każdy pilnuje swojego. Do roboty!`; break;
    case "kibice": e = k.uSiebie ? (opcje?.derby ? 0.06 : 0.04) : 0.012; tekst = k.uSiebie ? "Słyszycie ich? Oni przyszli tu dla was. Grajcie dla nich — niech dziś wyjdą z tego stadionu dumni!" : "Nasi kibice przejechali kawał drogi. Zasłużyli na walkę do ostatniej minuty."; break;
    case "presja": e = morale >= 65 ? 0.045 : morale >= 45 ? 0.0 : -0.04; tekst = "Dziś nie ma wymówek. Ani murawa, ani sędzia, ani pogoda. Jeśli ktoś nie jest gotowy zostawić zdrowia na boisku — niech zostanie w szatni."; break;
    case "kapitan": { const prz = kap?.atrybuty?.prz ?? kap?.umiej ?? 50; e = -0.01 + (prz / 100) * 0.06 + (kap?.cechy?.includes("lider") ? 0.015 : 0); tekst = `Kapitanie, twoje słowa. — ${kap?.nazwisko ?? ""}: „Panowie, w kółko! Gramy jeden za drugiego. Kto upadnie — podnosimy. Na trzy!”`; break; }
  }
  e += los(-0.012, 0.012);
  // cudzoziemcy bez polskiego rozumieją mowę słabiej (chyba że jest tłumacz albo rodak tłumaczy)
  const roz = xi.map((z) => rozumienie(s, z, xi));
  const srRoz = roz.reduce((a, r) => a + r, 0) / Math.max(1, roz.length);
  if (e > 0) e *= srRoz;
  m.motMoj = Math.max(0.94, Math.min(1.08, 1 + e));
  xi.forEach((z, i) => { z.morale = Math.max(0, Math.min(100, z.morale + e * 60 * roz[i])); });
  const pozytywne = ["Tak jest, trenerze!", "Dawaj, panowie, idziemy po to!", "Zrobimy to!", "Jesteśmy gotowi!", "Do końca, razem!"];
  const neutralne = ["Dobra, słyszeliśmy.", "Jasne…", "Okej."];
  const negatywne = ["Znowu to samo…", "Łatwo powiedzieć.", "(cisza — kilku zawodników patrzy w podłogę)"];
  const pula = e >= 0.03 ? pozytywne : e >= 0 ? neutralne : negatywne;
  const reakcje: Kwestia[] = [];
  const mowiacy = [...xi].sort(() => Math.random() - 0.5).slice(0, 3);
  for (const z of mowiacy) reakcje.push({ id: z.id, tekst: wybierz(pula) });
  // ktoś nie zrozumiał? (cudzoziemiec bez polskiego, bez tłumacza)
  const zagubiony = xi.find((z, i) => roz[i] < 0.5);
  if (zagubiony) {
    reakcje.unshift({ id: zagubiony.id, tekst: "Przepraszam… nie rozumiem.", kat: "nierozumiem" });
    const rodak = xi.find((x) => x.id !== zagubiony.id && jezykZawodnika(x) === jezykZawodnika(zagubiony) && polski(x) >= 55);
    if (rodak) reakcje.splice(1, 0, { id: rodak.id, tekst: `(${rodak.nazwisko} po cichu tłumaczy koledze ${PO_JEZYKU[jezykZawodnika(rodak)]})`, kat: "ok" });
  }
  if (e >= 0.02 && kap) reakcje.push({ id: kap.id, tekst: `Na trzy! Raz, dwa, trzy — ${s.kluby[moj(m).klubId].nazwa.split(" ").slice(-1)[0]}!` });
  const opisRoz = srRoz < 0.85 ? ` (część obcokrajowców zrozumiała tylko część — ${(s.tlumacze ?? []).length ? "tłumacze pomagali, ale nie przy każdym języku" : "przydałby się tłumacz albo kurs polskiego"})` : "";
  const opis0 = e >= 0.04 ? "Zawodnicy wychodzą nakręceni — w szatni aż zahuczało!" : e >= 0.02 ? "Mowa trafiła — drużyna skoncentrowana." : e >= 0 ? "Spokojnie przyjęte, bez wielkich emocji." : "Mowa nie trafiła — część zawodników zwiesiła głowy.";
  const opis = opis0 + opisRoz;
  m.komentarz.unshift({ min: "0'", typ: "taktyka", tekst: `🗣 Szatnia przed meczem: „${MOWY_PRZED[t].nazwa}". ${opis}` });
  m.przedmecz = { ...(m.przedmecz ?? {}), mowa: t };
  return { efekt: e, opis, tekst, reakcje };
}

/** Rozgrzewka: kondycja, „wejście w mecz" (pierwsze 15 min) i ryzyko urazu (zmiana w składzie przed meczem). */
export function zastosujRozgrzewke(s: StanGry, m: MeczLive, r: Rozgrzewka): string[] {
  const zesp = moj(m), wp: string[] = [];
  const spadek = r === "lekka" ? 1 : r === "normalna" ? 2 : 4;
  for (const id of [...zesp.naBoisku, ...zesp.lawka]) { const z = s.zawodnicy[id]; if (z) z.kondycja = Math.max(40, z.kondycja - spadek * (zesp.naBoisku.includes(id) ? 1 : 0.5)); }
  // rywal rozgrzewa się normalnie
  for (const id of rywal(m).naBoisku) { const z = s.zawodnicy[id]; if (z) z.kondycja = Math.max(40, z.kondycja - 2); }
  m.rozruch = r === "lekka" ? { do: 15, mn: 0.94 } : r === "intensywna" ? { do: 15, mn: 1.06 } : undefined;
  const ryzyko = r === "intensywna" ? 0.07 : r === "normalna" ? 0.015 : 0.004;
  if (szansa(ryzyko)) {
    const pole = zesp.naBoisku.filter((id) => s.zawodnicy[id]?.poz !== "BR");
    const ofiara = s.zawodnicy[wybierz(pole) ?? ""];
    if (ofiara) {
      const zast = zesp.lawka.map((id) => s.zawodnicy[id]).filter((z) => z && z.poz !== "BR").sort((a, b) => (b!.poz === ofiara.poz ? 10 : 0) + b!.umiej - ((a!.poz === ofiara.poz ? 10 : 0) + a!.umiej))[0];
      ofiara.kontuzja = Math.max(ofiara.kontuzja, losInt(1, 2)); ofiara.urazy = (ofiara.urazy ?? 0) + 1;
      if (zast) {
        const zam = (l: string[]) => { const i = l.indexOf(ofiara.id); if (i >= 0) l[i] = zast.id; };
        zam(zesp.naBoisku); zam(zesp.start); zam(zesp.zagrali); zesp.lawka = zesp.lawka.filter((id) => id !== zast.id);
        wp.push(`🚑 Pech na rozgrzewce: ${ofiara.imie} ${ofiara.nazwisko} naciągnął mięsień (pauza ${ofiara.kontuzja} kol.). Do składu wskakuje ${zast.imie} ${zast.nazwisko} — zgłoszona zmiana w protokole przed meczem.`);
        m.komentarz.unshift({ min: "0'", typ: "uraz", tekst: wp[wp.length - 1] });
      }
    }
  }
  wp.unshift(r === "intensywna" ? "⚡ Intensywna rozgrzewka — zawodnicy rozgrzani do czerwoności, gotowi od pierwszego gwizdka." : r === "lekka" ? "🚶 Lekka rozgrzewka — siły oszczędzone, ale nogi jeszcze trochę „zaspane”." : "🏃 Rozgrzewka według planu — rozruch, dziadek, podania, sprinty i strzały na bramkarza.");
  m.przedmecz = { ...(m.przedmecz ?? {}), rozgrzewka: r };
  return wp;
}
