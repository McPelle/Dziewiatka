// Żywy świat wokół klubu: lokalna prasa (artykuł po każdym meczu), media społecznościowe kibiców, realne godziny
// meczów wg szczebla, wyjazdy busem (koszt wg odległości, korki, awarie), dotacje z gminy dla klubów amatorskich.
import { odlegloscDrogowa } from "../data/miasta";
import { losInt, szansa, wybierz } from "./losuj";
import type { StanGry, Wynik } from "./types";

export interface Artykul { sezon: number; kolejka: number; gazeta: string; tytul: string; lead: string; ocena: number; gwiazda?: string }
export interface Wpis { sezon: number; kolejka: number; autor: string; tekst: string; serca: number }

const GAZETY = (miasto: string, poziom: number) => poziom <= 3 ? ["Przegląd Sportowy", "Sport.pl", "Meczyki.pl", "Weszło"] : poziom <= 5 ? [`Gazeta ${miasto.split(" ")[0]}ska`, "Portal Regionalny", "Futbol Regionu", "Lokalna Telewizja"] : [`Kurier ${miasto}`, `Głos ${miasto}`, "90minut regionalnie", "Facebook: Wiadomości z gminy"];
const nz = (s: StanGry, id?: string) => { const z = id ? s.zawodnicy[id] : undefined; return z ? `${z.imie} ${z.nazwisko}` : ""; };

/** Godzina rozpoczęcia meczu wg szczebla, dnia i pory roku (realia polskich lig). */
export function godzinaMeczu(s: StanGry, domId: string, kolejka: number, data: Date): { godz: string; wieczor: boolean } {
  const k = s.kluby[domId]; const p = k?.poziom ?? 6;
  const h = (domId.length * 31 + kolejka * 7 + s.sezon) % 97;
  const zima = [10, 11, 2, 3].includes(data.getMonth() + 1);
  const niedziela = data.getDay() === 0;
  const opcje: string[] =
    p === 1 ? ["15:00", "17:30", "20:15", "12:30"] :
    p === 2 ? ["12:40", "15:00", "17:30", "20:00"] :
    p === 3 ? ["13:00", "15:00", "17:00", "18:00"] :
    p === 4 ? ["14:00", "15:00", "16:00", "17:00"] :
    p === 5 ? (zima ? ["13:00", "14:00"] : ["15:00", "16:00", "17:00"]) :
    p === 6 ? (zima ? ["13:00", "14:00"] : ["15:00", "16:00", "17:00"]) :
    niedziela ? (zima ? ["11:00", "13:00"] : ["11:00", "13:00", "15:00", "16:00"]) : (zima ? ["13:00", "14:00"] : ["15:00", "16:00", "17:00"]);
  let godz = opcje[h % opcje.length];
  const oswietlenie = k?.oswietlenie ?? p <= 3;
  if (!oswietlenie && Number(godz.slice(0, 2)) >= 17) godz = zima ? "13:00" : "16:00"; // bez masztów — mecz musi skończyć się za dnia
  const zmrok = zima ? 16 : 19;
  return { godz, wieczor: Number(godz.slice(0, 2)) + 1.8 >= zmrok };
}

/** Wyjazd busem na mecz (kluby amatorskie i półzawodowe): koszt, czasem korek lub awaria (zmęczenie przed meczem). */
export function wyjazdBusem(s: StanGry, domId: string): string | null {
  const moj = s.kluby[s.mojKlub], dom = s.kluby[domId];
  if (!dom || domId === s.mojKlub || moj.poziom <= 2) return null;
  const km = odlegloscDrogowa(moj.miasto, dom.miasto);
  if (!km || km < 5) return null;
  const stawka = moj.poziom <= 4 ? 9 : moj.poziom <= 6 ? 6 : 4.5; // zł/km (bus, kierowca, paliwo, autostrada)
  const koszt = Math.round(km * 2 * stawka / 10) * 10;
  moj.kasa -= koszt;
  let tekst = `🚌 Wyjazd do ${dom.miasto} (${km} km): koszt busa ${koszt.toLocaleString("pl")} zł.`;
  if (szansa(km > 120 ? 0.12 : 0.05)) {
    const powod = wybierz(["korek na obwodnicy", "awaria busa — zastępczy przyjechał po godzinie", "objazd przez remont drogi", "zamknięty przejazd kolejowy"]);
    for (const id of s.taktyka.sklad) { const z = s.zawodnicy[id]; if (z) z.kondycja = Math.max(40, z.kondycja - losInt(2, 5)); }
    tekst += ` Po drodze: ${powod} — rozgrzewka w biegu, zawodnicy zmęczeni.`;
  }
  return tekst;
}

/** Artykuł w gazecie i wpisy kibiców po meczu Twojej drużyny. */
export function poMeczu(s: StanGry, w: Wynik, derby: string | null) {
  const moj = s.kluby[s.mojKlub]; const dom = w.dom === s.mojKlub;
  const my = dom ? w.gd : w.gg, oni = dom ? w.gg : w.gd;
  const rywal = s.kluby[dom ? w.gosc : w.dom]?.nazwa ?? "rywal";
  const roz = my - oni;
  const strzelcy = (w.zdarzenia ?? []).filter((z) => z.typ === "gol" && z.klubId === s.mojKlub).map((z) => z.zawodnikId);
  const gwiazda = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z?.ocenaMeczu).sort((a, b) => (b.ocenaMeczu ?? 0) - (a.ocenaMeczu ?? 0))[0];
  const pozno = (w.zdarzenia ?? []).some((z) => z.typ === "gol" && z.min >= 85);
  const tytul =
    roz >= 3 ? wybierz([`Pogrom! ${moj.nazwa} rozbija ${rywal}`, `Koncert ${moj.nazwa}`, `${my}:${oni}! Kanonada w meczu z ${rywal}`]) :
    roz > 0 ? (pozno ? wybierz(["Dramat w doliczonym czasie!", `Zwycięski gol w końcówce — ${moj.nazwa} wygrywa`]) : wybierz([`${moj.nazwa} lepszy od ${rywal}`, "Trzy punkty zostają w klubie", `Ważna wygrana ${moj.nazwa}`])) :
    roz === 0 ? wybierz(["Podział punktów", `Remis z ${rywal}`, "Ani to wygrana, ani porażka"]) :
    roz <= -3 ? wybierz([`Blamaż! ${moj.nazwa} rozbity`, "Czarny dzień", `${oni} goli straconych — co się dzieje?`]) :
    wybierz([`Porażka z ${rywal}`, "Zabrakło niewiele", `${moj.nazwa} bez punktów`]);
  const lead = `${derby ? `${derby}! ` : ""}${dom ? "Na własnym stadionie" : "Na wyjeździe"} ${moj.nazwa} ${roz > 0 ? "pokonał" : roz < 0 ? "przegrał z" : "zremisował z"} ${rywal} ${my}:${oni}.` +
    (strzelcy.length ? ` Bramki: ${[...new Set(strzelcy)].map((id) => s.zawodnicy[id]?.nazwisko).join(", ")}.` : "") +
    (gwiazda ? ` Najlepszy na boisku: ${nz(s, gwiazda.id)} (nota ${gwiazda.ocenaMeczu?.toFixed(1)}).` : "");
  const art: Artykul = { sezon: s.sezon, kolejka: s.kolejka, gazeta: wybierz(GAZETY(moj.miasto, moj.poziom)), tytul, lead, ocena: Math.max(1, Math.min(10, Math.round(6 + roz * 1.2 + (Math.random() - 0.5) * 2))), gwiazda: gwiazda?.id };
  s.prasa = [art, ...(s.prasa ?? [])].slice(0, 40);
  // kibice w sieci
  const NICKI = ["Kibol_od_zawsze", "Ultras1922", "Pani Krysia", "TrenerZKanapy", "BiałoNiebiescy", "Stary_Kibic", "Sektor_C", "Młody_Gniewny", "TatoNaTrybunach", "Ekspert_z_osiedla", "Gosia_kibicuje", "Pan Zdzisław"];
  const posty = roz > 0
    ? [`Brawo chłopaki!!! ${my}:${oni} 💪`, `${gwiazda ? gwiazda.nazwisko + " — klasa sama w sobie" : "Cała drużyna na 10"} 🔥`, "Trener wie, co robi. W końcu!", `Na następny mecz zabieram całą rodzinę ⚽`, roz >= 3 ? "To był koncert, a nie mecz 🎶" : "Męczyli się, ale są 3 punkty"]
    : roz === 0 ? ["Remis… bez szału.", "Gdzie były zmiany?!", "Punkt to punkt, szanujemy.", "Sędzia znowu przeciwko nam 🙄"]
    : ["Trener out!!!", "Wstyd. Po prostu wstyd.", "Kto ustawiał ten skład?!", roz <= -3 ? "Takiego wstydu dawno nie było 😡" : "Szkoda, było blisko.", "Czas na zmiany w klubie."];
  const wpisy: Wpis[] = Array.from({ length: losInt(2, 4) }, () => ({ sezon: s.sezon, kolejka: s.kolejka, autor: wybierz(NICKI), tekst: wybierz(posty), serca: losInt(2, roz > 0 ? 180 : 60) }));
  s.social = [...wpisy, ...(s.social ?? [])].slice(0, 60);
}

/** Dotacja z gminy na start sezonu (kluby amatorskie żyją z gminy) — zależy od szczebla, wyników i zaufania kibiców. */
export function dotacjaGminy(s: StanGry) {
  const k = s.kluby[s.mojKlub]; if (!k || k.poziom <= 3) return;
  const baza = [0, 0, 0, 120000, 70000, 40000, 25000, 15000, 10000][Math.min(8, k.poziom - 1)];
  const kibice = (s.zaufanieKibicow ?? 60) / 60;
  const kwota = Math.round(baza * (0.7 + Math.random() * 0.5) * Math.min(1.3, Math.max(0.6, kibice)) / 500) * 500;
  k.kasa += kwota;
  s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🏛 Rada Gminy przyznała klubowi dotację na sezon: ${kwota.toLocaleString("pl")} zł (wniosek na upowszechnianie sportu). Ocena wniosku zależy od działalności klubu i zaangażowania kibiców.` });
}
