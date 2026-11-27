// Bezpieczeństwo meczów (wg ustawy o bezpieczeństwie imprez masowych — uproszczone):
// • impreza masowa = stadion udostępnia co najmniej 1000 miejsc → organizator (klub) MUSI zapewnić służbę
//   porządkową i informacyjną: min. 10 osób na każde 300 widzów (mecz podwyższonego ryzyka: 15 na 300),
//   kierownika ds. bezpieczeństwa i zabezpieczenie medyczne — za to płaci KLUB (firma ochroniarska),
// • policja działa z urzędu (bez opłat) — przy meczach podwyższonego ryzyka pododdziały prewencji,
// • poniżej 1000 miejsc to nie impreza masowa — wystarczą porządkowi (wolontariusze klubu).
// Jakość firmy i liczebność obsady decydują o incydentach: race, rzucanie przedmiotów, wtargnięcia, bójki → kary.
import { los, losInt, szansa, wybierz, zl } from "./losuj";
import type { Klub, StanGry } from "./types";

export type FirmaOchrony = "wolontariusze" | "lokalna" | "standard" | "premium";
/** Firmy (fikcyjne nazwy) — stawka za osobę na mecz i jakość (0–1). */
export const FIRMY_OCHRONY: Record<FirmaOchrony, { nazwa: string; stawka: number; jakosc: number; opis: string; licencja: boolean }> = {
  wolontariusze: { nazwa: "Porządkowi klubowi (wolontariusze)", stawka: 40, jakosc: 0.25, opis: "Kibice-wolontariusze w kamizelkach. Tylko gdy to nie jest impreza masowa (do 999 miejsc).", licencja: false },
  lokalna: { nazwa: "„Gród” Ochrona — firma lokalna", stawka: 160, jakosc: 0.45, opis: "Tania, z licencją, ale mało doświadczona przy dużych meczach.", licencja: true },
  standard: { nazwa: "„Bastion Security” — firma regionalna", stawka: 230, jakosc: 0.68, opis: "Solidna obsada imprez masowych, wyszkoleni stewardzi.", licencja: true },
  premium: { nazwa: "„Tarcza Arena Services” — firma stadionowa", stawka: 320, jakosc: 0.88, opis: "Specjaliści od meczów podwyższonego ryzyka: wywiad kibicowski, monitoring, grupy interwencyjne.", licencja: true },
};
export interface UstawieniaOchrony { firma: FirmaOchrony; obsada: number /* 1 = minimum ustawowe */; wsparcieOpraw?: boolean }
export const ustawieniaOchrony = (s: StanGry): UstawieniaOchrony => (s.ochrona ??= { firma: "lokalna", obsada: 1.1 });

export interface Zabezpieczenie {
  masowa: boolean; podwyzszoneRyzyko: boolean; minimum: number; ochroniarze: number; koordynatorzy: number;
  policja: number; radiowozy: number; medyczne: number; koszt: number; firma: FirmaOchrony; jakosc: number; zgodne: boolean;
}

/** Plan zabezpieczenia meczu u siebie: ile osób wymaga ustawa, ile wystawia firma, ile policji, koszt. */
export function planZabezpieczenia(s: StanGry, kd: Klub, widzowie: number, ryzyko: boolean): Zabezpieczenie {
  const u = ustawieniaOchrony(s);
  const masowa = kd.pojemnosc >= 1000 && widzowie > 0;
  const naTrzysta = ryzyko ? 15 : 10;
  const minimum = masowa ? Math.ceil(widzowie / 300) * naTrzysta : Math.max(widzowie > 0 ? 4 : 0, Math.ceil(widzowie / 120));
  let firma = u.firma;
  if (masowa && firma === "wolontariusze") firma = "lokalna"; // przy imprezie masowej wymagana licencjonowana służba
  const ochroniarze = Math.round(minimum * Math.max(0.6, u.obsada));
  const koordynatorzy = masowa ? Math.max(1, Math.ceil(ochroniarze / 25)) : 0;
  const policja = !masowa ? (ryzyko ? 4 : 0) : Math.round((ryzyko ? 60 : 8) + widzowie / (ryzyko ? 40 : 600)) * (kd.poziom <= 2 ? 1.6 : kd.poziom <= 4 ? 1 : 0.6);
  const radiowozy = Math.max(policja > 0 ? 1 : 0, Math.round(policja / 9));
  const medyczne = masowa ? (widzowie > 5000 ? 2400 : 1200) : 0;
  const f = FIRMY_OCHRONY[firma];
  const koszt = Math.round((ochroniarze + koordynatorzy * 1.6) * f.stawka + medyczne + (u.wsparcieOpraw && widzowie > 0 ? Math.min(15000, 300 + widzowie * 0.4) : 0));
  return { masowa, podwyzszoneRyzyko: ryzyko, minimum, ochroniarze, koordynatorzy, policja: Math.round(policja), radiowozy, medyczne, koszt, firma, jakosc: f.jakosc, zgodne: !masowa || u.obsada >= 1 };
}

export type TypIncydentu = "race" | "przedmioty" | "wtargniecie" | "bojka" | "transparent" | "oprawa";
export interface Incydent { typ: TypIncydentu; min: number; sektor: "gospodarzy" | "gosci"; opis: string; opanowany: boolean }

/** Prawdopodobieństwo incydentu w minucie meczu (dla meczu na żywo) i w całym meczu (symulacja). */
export function ryzykoIncydentow(s: StanGry, kd: Klub, kg: Klub, widzowie: number, derby: boolean, z?: Zabezpieczenie): number {
  if (widzowie <= 0) return 0;
  const kibice = (k: Klub) => (k.poziom <= 2 ? 1.3 : k.poziom <= 4 ? 1 : k.poziom <= 6 ? 0.55 : 0.25) * (0.6 + (k.renoma ?? 0.5) * 0.8);
  const baza = (derby ? 0.55 : 0.08) * (kibice(kd) * 0.6 + kibice(kg) * 0.4);
  const ochr = z ? (1.35 - z.jakosc * 0.75) * (z.zgodne ? Math.max(0.65, 1.3 - (ustawieniaOchrony(s).obsada - 1) * 0.9) : 1.9) : 1;
  return Math.min(0.95, baza * ochr);
}

const OPIS: Record<TypIncydentu, (sek: string) => string> = {
  race: (sk) => `W sektorze ${sk} odpalono race — odpalający w czarnych pelerynach i kominiarkach, zasłonięci flagami. Dym zasnuwa boisko, sędzia przerywa grę.`,
  przedmioty: (sk) => `Z sektora ${sk} lecą na murawę zapalniczki i kubki. Sędzia zatrzymuje mecz, spiker apeluje o spokój.`,
  wtargniecie: (sk) => `Kibic z sektora ${sk} wbiega na murawę! Stewardzi ruszają w pogoń.`,
  bojka: (sk) => `Przepychanki w sektorze ${sk} — grupa interwencyjna ochrony i policja wchodzą na trybunę.`,
  transparent: (sk) => `W sektorze ${sk} zawisł obraźliwy transparent — delegat odnotowuje w protokole.`,
  oprawa: (sk) => `Sektor ${sk} prezentuje wielką oprawę — sektorówka na całą trybunę, flagi i doping!`,
};
/** Losuje incydent (mecz na żywo / symulacja). `opanowany` — czy ochrona szybko zareagowała. */
export function losujIncydent(min: number, z: Zabezpieczenie | undefined, derby: boolean): Incydent {
  const typ: TypIncydentu = wybierz(derby ? ["race", "race", "przedmioty", "wtargniecie", "bojka", "transparent"] : ["race", "przedmioty", "wtargniecie", "wtargniecie", "transparent"] as TypIncydentu[])!;
  const sektor: "gospodarzy" | "gosci" = szansa(derby ? 0.5 : 0.6) ? "gosci" : "gospodarzy";
  const sk = sektor === "gosci" ? "gości" : "gospodarzy";
  return { typ, min, sektor, opis: OPIS[typ](sk), opanowany: szansa(z ? 0.25 + z.jakosc * 0.7 : 0.5) };
}

/** Kara (Komisja Ligi / Wydział Dyscypliny) za incydent — skala wg szczebla, dwa razy więcej, gdy ochrona nie opanowała. */
function kara(kd: Klub, i: Incydent): number {
  const skala = [40000, 20000, 9000, 4000, 2000, 1200, 700, 500, 400][Math.min(8, kd.poziom - 1)];
  const w = { race: 1, przedmioty: 0.7, wtargniecie: 0.5, bojka: 1.4, transparent: 0.6, oprawa: 0 }[i.typ];
  return Math.round((skala * w * (i.opanowany ? 0.6 : 1.2) * los(0.8, 1.25)) / 100) * 100;
}

/**
 * Rozliczenie bezpieczeństwa meczu u siebie: koszt ochrony (płaci klub), incydenty i kary, opinia policji.
 * `incydentyLive` — gdy mecz był oglądany na żywo (wtedy nie losujemy drugi raz).
 */
export function rozliczBezpieczenstwo(s: StanGry, kd: Klub, kg: Klub, widzowie: number, derby: boolean, incydentyLive?: Incydent[]): string[] {
  const wp: string[] = [];
  const z = planZabezpieczenia(s, kd, widzowie, derby);
  kd.kasa -= z.koszt;
  s.ostatnieZabezpieczenie = { ...z, widzowie, rywal: kg.nazwa, incydenty: [] };
  if (widzowie <= 0) return wp;
  let inc: Incydent[] = incydentyLive ?? [];
  if (!incydentyLive) {
    const r = ryzykoIncydentow(s, kd, kg, widzowie, derby, z);
    if (szansa(r)) inc.push(losujIncydent(losInt(5, 88), z, derby));
    if (derby && szansa(r * 0.4)) inc.push(losujIncydent(losInt(5, 88), z, derby));
  }
  inc = inc.filter((i) => i.typ !== "oprawa" || true);
  const opisZab = z.masowa
    ? `🛡 Zabezpieczenie: ${z.ochroniarze} stewardów (${FIRMY_OCHRONY[z.firma].nazwa}${z.zgodne ? "" : " — PONIŻEJ minimum ustawowego!"}), ${z.koordynatorzy} koord., policja z urzędu: ${z.policja} funkcjonariuszy, ${z.radiowozy} radiowozów${derby ? ", armatka wodna w gotowości" : ""}. Koszt dla klubu: ${zl(z.koszt)}.`
    : `🛡 Porządek: ${z.ochroniarze} porządkowych (${FIRMY_OCHRONY[z.firma].nazwa}). Koszt: ${zl(z.koszt)}.`;
  if (derby || !z.zgodne || inc.some((i) => i.typ !== "oprawa")) wp.push(opisZab); // zwykłe mecze bez zdarzeń — tylko w panelu Bezpieczeństwo
  let suma = 0;
  for (const i of inc) {
    if (i.typ === "oprawa") { wp.push(`🎆 ${i.opis}`); continue; }
    const k = kara(kd, i);
    // kibice gości: karę płaci klub gości; gospodarz — tylko gdy jego ochrona zawiodła (organizator imprezy)
    if (i.sektor === "gosci" && i.opanowany) { kg.kasa = Math.max(0, kg.kasa - k); wp.push(`🚨 ${i.min}' ${i.opis} Ochrona szybko opanowała sytuację. Kara dla ${kg.nazwa}: ${zl(k)}.`); continue; }
    if (i.sektor === "gosci") kg.kasa = Math.max(0, kg.kasa - k);
    suma += i.sektor === "gosci" ? Math.round(k * 0.4 / 100) * 100 : k;
    wp.push(`🚨 ${i.min}' ${i.opis} ${i.opanowany ? "Ochrona szybko opanowała sytuację." : derby && i.typ === "bojka" ? "Ochrona nie dała rady — policja użyła armatki wodnej, są zatrzymani." : "Ochrona nie dała rady — interweniowała policja."} Kara dla ${i.sektor === "gosci" ? `${kg.nazwa} (i dla nas jako organizatora — ${zl(Math.round(k * 0.4 / 100) * 100)})` : "naszego klubu"}: ${zl(k)}.`);
  }
  if (suma) kd.kasa = Math.max(0, kd.kasa - suma);
  // zniszczenia i sankcje: osobno dla kibiców gospodarzy i gości (każdy odpowiada za swoich)
  const powazne = inc.filter((i) => !i.opanowany && (i.typ === "bojka" || i.typ === "race" || i.typ === "przedmioty")).length;
  wp.push(...nalozSankcje(s, kd, kd, inc.filter((i) => i.sektor === "gospodarzy"), derby));
  wp.push(...nalozSankcje(s, kg, kd, inc.filter((i) => i.sektor === "gosci"), derby));
  if (!z.zgodne && szansa(0.5)) { s.zakazTrybun = (s.zakazTrybun ?? 0) + 1; wp.push("⚖️ Kontrola wojewody: za mało służby porządkowej względem ustawy — najbliższy mecz u siebie bez publiczności."); }
  s.opiniaPolicji = Math.max(0, Math.min(100, (s.opiniaPolicji ?? 60) + (inc.length ? -4 * powazne - 1 : 1.5)));
  if (!inc.length && z.masowa && derby) wp.push("✅ Derby bez incydentów — policja chwali organizację meczu.");
  s.ostatnieZabezpieczenie.incydenty = inc;
  return wp;
}

// ——— sankcje (realia polskich stadionów) ———
const WAGA: Record<TypIncydentu, number> = { race: 2, przedmioty: 1.5, wtargniecie: 1, bojka: 3, transparent: 1, oprawa: 0 };
const nazwaS = (k: Klub) => k.nazwa;
/**
 * Konsekwencje dla klubu, którego KIBICE rozrabiali (`kibiceKlubu`) na stadionie `gospodarz`:
 * zniszczenia (rachunek za krzesełka, toalety, płot), regres od zidentyfikowanych sprawców, zakazy stadionowe,
 * Komisja Ligi (zakaz wyjazdowy / zamknięta trybuna), wojewoda (zamknięty sektor gości / mecz bez publiczności).
 */
export function nalozSankcje(s: StanGry, kibiceKlubu: Klub, gospodarz: Klub, inc: Incydent[], derby: boolean): string[] {
  const wp: string[] = []; if (!inc.length) return wp;
  const goscie = kibiceKlubu.id !== gospodarz.id;
  const moi = kibiceKlubu.id === s.mojKlub;
  const pkt = inc.reduce((a, i) => a + WAGA[i.typ] * (i.opanowany ? 0.6 : 1.3), 0) * (derby ? 1.3 : 1);
  const skala = [1, 0.6, 0.3, 0.15, 0.08, 0.05, 0.03, 0.02, 0.015][Math.min(8, gospodarz.poziom - 1)];
  const sk = (kibiceKlubu.sankcje ??= {});
  // zniszczenia infrastruktury — rachunek od gospodarza obiektu dla klubu, którego kibice niszczyli
  if (inc.some((i) => i.typ === "bojka" || (i.typ === "race" && !i.opanowany)) && szansa(0.75)) {
    const szkody = Math.round(losInt(8000, 90000) * skala * (derby ? 1.5 : 1) / 100) * 100;
    if (szkody >= 300) {
      kibiceKlubu.kasa = Math.max(0, kibiceKlubu.kasa - szkody);
      const co = wybierz(["połamane krzesełka", "zdemolowane toalety", "wyrwane bramki sektora i uszkodzony płot", "spalone siedziska i zniszczony monitoring", "zniszczona siatka klatki i bramka ewakuacyjna"]);
      wp.push(`🧾 Zniszczenia w sektorze ${goscie ? "gości" : "gospodarzy"} na stadionie ${nazwaS(gospodarz)}: ${co} — rachunek dla ${nazwaS(kibiceKlubu)}: ${zl(szkody)}.`);
      if (moi && szansa(0.5)) { const zwrot = Math.round(szkody * (0.2 + Math.random() * 0.3) / 100) * 100; kibiceKlubu.kasa += zwrot; wp.push(`⚖️ Regres: klub odzyskał ${zl(zwrot)} od zidentyfikowanych sprawców (monitoring, bilety imienne).`); }
    }
  }
  // zakazy stadionowe (sąd / klub) dla zidentyfikowanych
  if (pkt >= 2.5) {
    // zamaskowani (peleryny, kominiarki, zasłony z flag) — monitoring często nie daje rady; lepsza ochrona/monitoring = większa szansa
    const pirot = inc.some((i) => i.typ === "race");
    const jakoscMon = gospodarz.id === s.mojKlub ? FIRMY_OCHRONY[ustawieniaOchrony(s).firma].jakosc : 0.5;
    const szansaId = pirot ? 0.03 + jakoscMon * 0.07 : 0.35 + jakoscMon * 0.35; // zamaskowanych pirotechników niemal nigdy nie udaje się ustalić
    const n = Math.round(Math.max(1, pkt * losInt(1, 4)) * (szansa(szansaId) ? (pirot ? 0.4 : 1) : 0));
    if (n > 0) { sk.zakazyStadionowe = (sk.zakazyStadionowe ?? 0) + n; if (moi || gospodarz.id === s.mojKlub) wp.push(`👮 Policja zidentyfikowała ${n} ${n === 1 ? "osobę" : "osób"} z monitoringu — wnioski o zakazy stadionowe (do 6 lat) i zarzuty.`); }
    else if (moi || gospodarz.id === s.mojKlub) wp.push(`🥷 Sprawcy byli zamaskowani (peleryny, kominiarki, parasole, zasłony z flag) — monitoring nikogo nie rozpoznał. Kara spada na klub.`);
  }
  // Komisja Ligi / Wydział Dyscypliny
  if (pkt >= 4) {
    if (goscie) { const m = pkt >= 7 ? losInt(2, 4) : 1; sk.zakazWyjazdowy = Math.max(sk.zakazWyjazdowy ?? 0, m); wp.push(`⚖️ Komisja Ligi: kibice ${nazwaS(kibiceKlubu)} z zakazem wyjazdowym na ${m} ${m === 1 ? "mecz" : "mecze"} — klub nie dostanie biletów do sektora gości.`); }
    else { const m = pkt >= 7 ? 2 : 1; sk.trybunaZamknieta = Math.max(sk.trybunaZamknieta ?? 0, m); wp.push(`⚖️ Komisja Ligi: zamknięta trybuna z gniazdem dopingu na stadionie ${nazwaS(kibiceKlubu)} na ${m} ${m === 1 ? "mecz" : "mecze"} (sektor gospodarzy).`); }
  }
  // Wojewoda (decyzja administracyjna po wniosku policji)
  if (pkt >= 7 || (derby && inc.some((i) => i.typ === "bojka" && !i.opanowany))) {
    if (goscie) { const gs = (gospodarz.sankcje ??= {}); const m = losInt(1, 3); gs.sektorGosciZamkniety = Math.max(gs.sektorGosciZamkniety ?? 0, m); wp.push(`🏛 Wojewoda na wniosek policji: sektor gości na stadionie ${nazwaS(gospodarz)} zamknięty na ${m} ${m === 1 ? "mecz" : "mecze"}.`); }
    else { sk.stadionZamkniety = Math.max(sk.stadionZamkniety ?? 0, 1); if (kibiceKlubu.id === s.mojKlub) s.zakazTrybun = Math.max(s.zakazTrybun ?? 0, 1); wp.push(`🏛 Wojewoda: najbliższy mecz na stadionie ${nazwaS(kibiceKlubu)} bez udziału publiczności (zakaz imprezy masowej).`); }
  }
  return wp;
}

/** Mecz wyjazdowy Twojego klubu: Twoi kibice w klatce gości (derby / mecze podwyższonego ryzyka) — konsekwencje dla Ciebie. */
export function rozliczWyjazd(s: StanGry, gospodarz: Klub, moj: Klub, gosci: number, derby: boolean): string[] {
  const wp: string[] = []; if (gosci <= 0) return wp;
  const r = ryzykoIncydentow(s, gospodarz, moj, gosci * 10, derby) * 0.6;
  if (!szansa(r)) return wp;
  const i = losujIncydent(losInt(5, 88), undefined, derby); i.sektor = "gosci";
  i.opis = i.opis.replace("sektorze gości", `sektorze gości (nasi kibice)`).replace("sektora gości", "sektora gości (nasi kibice)");
  const k = kara(gospodarz, i); moj.kasa = Math.max(0, moj.kasa - k);
  wp.push(`🚨 Na wyjeździe w ${gospodarz.miasto}: ${i.opis} Kara dla naszego klubu: ${zl(k)}.`);
  wp.push(...nalozSankcje(s, moj, gospodarz, [i], derby));
  return wp;
}

/** Zużycie sankcji po rozegranym meczu (wołane po każdym meczu klubu). */
export function zuzyjSankcje(dom: Klub, gosc: Klub) {
  const d = dom.sankcje, g = gosc.sankcje;
  if (d?.stadionZamkniety) d.stadionZamkniety--; if (d?.trybunaZamknieta) d.trybunaZamknieta--; if (d?.sektorGosciZamkniety) d.sektorGosciZamkniety--;
  if (g?.zakazWyjazdowy) g.zakazWyjazdowy--;
}
/** Opis aktywnych sankcji klubu (UI). */
export function opisSankcji(k: Klub): string[] {
  const x = k.sankcje ?? {}, o: string[] = [];
  if (x.zakazWyjazdowy) o.push(`🚫 zakaz wyjazdowy kibiców: ${x.zakazWyjazdowy} mecz(e)`);
  if (x.sektorGosciZamkniety) o.push(`🧱 sektor gości zamknięty decyzją wojewody: ${x.sektorGosciZamkniety} mecz(e)`);
  if (x.trybunaZamknieta) o.push(`🚷 zamknięta trybuna gospodarzy: ${x.trybunaZamknieta} mecz(e)`);
  if (x.stadionZamkniety) o.push(`🏛 stadion bez publiczności: ${x.stadionZamkniety} mecz(e)`);
  if (x.zakazyStadionowe) o.push(`👮 zakazy stadionowe kibiców klubu (łącznie): ${x.zakazyStadionowe}`);
  return o;
}
