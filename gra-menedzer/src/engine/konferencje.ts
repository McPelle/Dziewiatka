// Konferencje prasowe — PRZEDMECZOWE i POMECZOWE, po 3–4 pytania zależne od sytuacji.
// Odpowiedzi wpływają na: morale całej szatni, morale konkretnego zawodnika, zaufanie zarządu i kibiców,
// motywację przed najbliższym meczem (±) oraz nagłówki prasy.
import { jestDerby } from "./derby";
import { szansa, tasuj, wybierz } from "./losuj";
import { tabelaLigi } from "./swiat";
import type { StanGry, Wynik } from "./types";
import { jezykZawodnika, NAZWA_JEZYKA, polski, tlumaczDla } from "./jezyki";

export interface OpcjaKonf { tekst: string; morale: number; zarzad: number; kibice?: number; motywacja?: number; zawodnik?: { id: string; morale: number }; odzew: string }
export interface PytanieKonf { kontekst: string; pytanie: string; opcje: OpcjaKonf[] }

const MEDIA = ["Przegląd Sportowy", "Sport.pl", "lokalna gazeta", "Radio Region", "portal Łączy Nas Piłka", "TV Sport", "Weszło", "Meczyki.pl", "kanał kibiców na YouTube"];

/** Konferencja PRZED meczem gracza (nie zawsze — częściej przed derbami, hitami i w kryzysie). */
export function konferencjaPrzed(s: StanGry, rywalId: string, puchar: boolean): { media: string; pytania: PytanieKonf[] } | null {
  const moj = s.kluby[s.mojKlub], ryw = s.kluby[rywalId];
  if (!moj || !ryw) return null;
  const derby = jestDerby(s, s.mojKlub, rywalId);
  const tab = tabelaLigi(s, s.ligi[moj.poziom - 1]);
  const mPoz = tab.findIndex((w) => w.klubId === s.mojKlub) + 1, rPoz = tab.findIndex((w) => w.klubId === rywalId) + 1;
  const n = tab.length;
  const seria = moj.seria ?? 0;
  const waga = derby || puchar || (rPoz > 0 && rPoz <= 3) || Math.abs(seria) >= 3 || mPoz >= n - 2;
  if (!waga && !szansa(0.25)) return null;
  const pyt: PytanieKonf[] = [];
  const R = ryw.nazwa;
  if (derby) pyt.push({ kontekst: "Przed derbami", pytanie: `${derby}! Miasto żyje tym meczem. Co powiesz kibicom?`, opcje: [
    { tekst: "To najważniejszy mecz sezonu — zostawimy na boisku serce.", morale: 3, zarzad: 1, kibice: 4, motywacja: 0.02, odzew: "Kibice wniebowzięci, szatnia nakręcona." },
    { tekst: "Traktujemy to jak każdy inny mecz.", morale: 0, zarzad: 1, kibice: -2, motywacja: 0, odzew: "Chłodny przekaz — trybuny liczyły na więcej emocji." },
    { tekst: `${R}? Pokażemy im, kto rządzi w regionie.`, morale: 4, zarzad: -1, kibice: 3, motywacja: 0.03, odzew: "Prowokacja! Rywal przyklei to w szatni — będzie gorąco." } ] });
  if (rPoz > 0 && mPoz > 0 && rPoz < mPoz - 3) pyt.push({ kontekst: "Przed meczem z faworytem", pytanie: `${R} jest wyżej w tabeli (${rPoz}. miejsce). Macie szanse?`, opcje: [
    { tekst: "Nie boimy się nikogo — gramy o zwycięstwo.", morale: 3, zarzad: 1, motywacja: 0.02, odzew: "Odważnie — zespół wyjdzie bez kompleksów." },
    { tekst: "Oni są faworytem, my nie mamy nic do stracenia.", morale: 2, zarzad: 0, motywacja: 0.01, odzew: "Presja zdjęta z drużyny." },
    { tekst: "Remis będzie dobrym wynikiem.", morale: -1, zarzad: -1, motywacja: -0.01, odzew: "Defensywne nastawienie — część kibiców kręci nosem." } ] });
  else if (rPoz > mPoz + 3 && mPoz > 0) pyt.push({ kontekst: "Przed meczem z outsiderem", pytanie: `Jesteście faworytem z ${R}. Trzy punkty to obowiązek?`, opcje: [
    { tekst: "Szanujemy rywala — każdy mecz trzeba wygrać na boisku.", morale: 2, zarzad: 2, motywacja: 0.01, odzew: "Pokora — zespół nie zlekceważy rywala." },
    { tekst: "Tak, każdy wynik poza zwycięstwem to porażka.", morale: 0, zarzad: 3, motywacja: 0, odzew: "Wysoko zawieszona poprzeczka — zarząd zadowolony, presja rośnie." },
    { tekst: "Wygramy pewnie, bez dwóch zdań.", morale: 1, zarzad: 0, motywacja: -0.02, odzew: "Pewność siebie graniczy z lekceważeniem — uwaga na wpadkę." } ] });
  if (seria >= 3) pyt.push({ kontekst: "Seria zwycięstw", pytanie: `${seria} wygranych z rzędu. Co jest receptą na taką formę?`, opcje: [
    { tekst: "Ciężka praca całej drużyny.", morale: 3, zarzad: 1, odzew: "Szatnia doceniona." },
    { tekst: "Nie liczę zwycięstw — liczy się następny mecz.", morale: 1, zarzad: 2, motywacja: 0.01, odzew: "Koncentracja utrzymana." },
    { tekst: "Mamy najlepszy skład w lidze.", morale: 2, zarzad: 0, kibice: 2, motywacja: -0.01, odzew: "Buta — rywale się zmobilizują." } ] });
  if (seria <= -3) pyt.push({ kontekst: "Kryzys", pytanie: `${-seria} porażek z rzędu. Czujesz, że tracisz szatnię?`, opcje: [
    { tekst: "Szatnia jest ze mną. Przełamiemy się razem.", morale: 3, zarzad: 1, motywacja: 0.02, odzew: "Wotum zaufania podbudowało zespół." },
    { tekst: "Każdy musi spojrzeć w lustro, ja też.", morale: 0, zarzad: 2, odzew: "Uczciwe słowa — zarząd docenił." },
    { tekst: "Niektórzy zawodnicy grają poniżej poziomu.", morale: -4, zarzad: 1, motywacja: -0.01, odzew: "Szukanie winnych zmroziło szatnię." } ] });
  if (mPoz >= n - 2 && mPoz > 0) pyt.push({ kontekst: "Walka o utrzymanie", pytanie: "Jesteście w strefie spadkowej. Ten mecz to finał?", opcje: [
    { tekst: "Każdy mecz to teraz finał — gramy o życie.", morale: 2, zarzad: 2, kibice: 2, motywacja: 0.02, odzew: "Mobilizacja na maksa." },
    { tekst: "Bez paniki — zostało dużo meczów.", morale: 2, zarzad: 0, odzew: "Spokój udzielił się drużynie." },
    { tekst: "Jeśli przegramy, sezon jest stracony.", morale: -3, zarzad: -1, odzew: "Presja sparaliżowała część zawodników." } ] });
  if (puchar) pyt.push({ kontekst: "Przed meczem pucharowym", pytanie: "Puchar Polski — dacie szansę rezerwowym czy gracie najmocniejszym składem?", opcje: [
    { tekst: "Najmocniejszy skład — chcemy zajść daleko.", morale: 2, zarzad: 2, kibice: 2, motywacja: 0.01, odzew: "Ambicje pucharowe zauważone." },
    { tekst: "Rotacja — liga jest priorytetem.", morale: 1, zarzad: 1, kibice: -1, odzew: "Rezerwowi zadowoleni, kibice mniej." } ] });
  const kontuzjowani = moj.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kontuzja > 0).sort((a, b) => b.umiej - a.umiej);
  if (kontuzjowani[0]) { const z = kontuzjowani[0]; pyt.push({ kontekst: "Kontuzje", pytanie: `Brakuje ${z.imie} ${z.nazwisko}. Jak sobie poradzicie?`, opcje: [
    { tekst: "Mamy szeroką kadrę — ktoś wykorzysta szansę.", morale: 2, zarzad: 1, odzew: "Rezerwowi poczuli zaufanie." },
    { tekst: "To ogromna strata, nie da się go zastąpić.", morale: -1, zarzad: 0, zawodnik: { id: z.id, morale: 4 }, odzew: `${z.nazwisko} docenił słowa, reszta mniej.` } ] }); }
  // cudzoziemiec bez polskiego w kadrze
  const obcy = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).find((z) => z && polski(z) < 40 && s.taktyka.sklad.includes(z.id));
  if (obcy && szansa(0.5)) pyt.push({ kontekst: "Język w szatni", pytanie: `${obcy.imie} ${obcy.nazwisko} wciąż nie mówi po polsku (${NAZWA_JEZYKA[jezykZawodnika(obcy)]}). Jak się z nim dogadujecie?`, opcje: [
    { tekst: tlumaczDla(s, jezykZawodnika(obcy)) ? "Mamy tłumacza, a on ciężko pracuje nad polskim." : "Uczy się — zapisaliśmy go na kurs, reszta pomaga.", morale: 1, zarzad: 1, zawodnik: { id: obcy.id, morale: 4 }, odzew: `${obcy.nazwisko} docenił wsparcie.` },
    { tekst: "Piłka nożna ma jeden język — boisko.", morale: 2, zarzad: 0, odzew: "Zgrabna odpowiedź, media kupiły." },
    { tekst: "Musi się szybciej uczyć, inaczej będzie problem.", morale: -1, zarzad: 1, zawodnik: { id: obcy.id, morale: -5 }, odzew: `Presja na ${obcy.nazwisko} — w szatni cisza.` } ] });
  // trener rywala z zagranicy
  const rk = s.kluby[rywalId];
  if (rk?.trenerKraj && szansa(0.4)) pyt.push({ kontekst: "Trener rywala", pytanie: `Trener ${R}, ${rk.trenerImie} ${rk.trenerNazwisko} (${rk.trenerKraj}), mówi, że polska liga jest „fizyczna i chaotyczna”. Co na to?`, opcje: [
    { tekst: "Zapraszam na boisko — sprawdzimy, kto jest chaotyczny.", morale: 2, zarzad: 0, kibice: 2, motywacja: 0.02, odzew: "Wojna słowna! Nagłówki gotowe." },
    { tekst: "Każdy ma prawo do opinii. My robimy swoje.", morale: 1, zarzad: 1, odzew: "Spokój i klasa." } ] });
  // Ogólne — zawsze coś na koniec
  pyt.push(wybierz([
    { kontekst: "Cel sezonu", pytanie: `Zarząd oczekuje: ${s.cel}. Realne?`, opcje: [
      { tekst: "Zrobimy to — i więcej.", morale: 2, zarzad: 3, odzew: "Ambitna deklaracja zapisana przez zarząd." },
      { tekst: "Krok po kroku, nie składam obietnic.", morale: 1, zarzad: 0, odzew: "Ostrożnie." } ] },
    { kontekst: "Kibice", pytanie: "Kibice apelują o więcej ofensywnej gry. Słyszysz ich?", opcje: [
      { tekst: "Słyszę — dziś zagramy odważnie.", morale: 1, zarzad: 0, kibice: 3, motywacja: 0.01, odzew: "Trybuny zachwycone zapowiedzią." },
      { tekst: "Najważniejszy jest wynik, nie styl.", morale: 0, zarzad: 2, kibice: -2, odzew: "Pragmatyzm nie porwał kibiców." } ] },
    { kontekst: "Rywal", pytanie: `Trener ${R} mówi, że jesteście w ich zasięgu. Komentarz?`, opcje: [
      { tekst: "Szanujemy rywala, odpowiemy na boisku.", morale: 1, zarzad: 1, motywacja: 0.01, odzew: "Klasa." },
      { tekst: "Niech mówią — my gramy swoje.", morale: 2, zarzad: 0, motywacja: 0.01, odzew: "Pewność siebie udzieliła się szatni." },
      { tekst: "Zobaczymy, czy będzie taki pewny po meczu.", morale: 2, zarzad: -1, kibice: 2, motywacja: 0.02, odzew: "Wojna słowna! Media mają nagłówek." } ] },
  ] as PytanieKonf[]));
  return { media: wybierz(MEDIA), pytania: tasuj(pyt).slice(0, 4) };
}

/** Pytania POMECZOWE: wynik (z puli szablonów) + sędzia + zawodnik meczu / najsłabszy + kibice. */
export function konferencjaPo(s: StanGry, w: Wynik, moje: number, ich: number, pytanieWyniku: PytanieKonf): { media: string; pytania: PytanieKonf[] } {
  const pyt: PytanieKonf[] = [pytanieWyniku];
  const ryw = s.kluby[w.dom === s.mojKlub ? w.gosc : w.dom];
  const czerwMoje = (w.zdarzenia ?? []).filter((e) => e.typ === "czerwona" && e.klubId === s.mojKlub).length;
  const czerwIch = (w.zdarzenia ?? []).filter((e) => e.typ === "czerwona" && e.klubId !== s.mojKlub).length;
  if (czerwMoje || czerwIch) pyt.push({ kontekst: "Sędzia", pytanie: czerwMoje ? "Czerwona kartka dla waszego zawodnika. Sędzia przesadził?" : `${ryw?.nazwa} kończył w osłabieniu. Słuszna decyzja?`, opcje: [
    { tekst: "Nie komentuję pracy sędziów.", morale: 0, zarzad: 1, odzew: "Dyplomatycznie — bez kłopotów z komisją." },
    { tekst: czerwMoje ? "Skandaliczna decyzja, wypaczyła mecz!" : "Sędzia miał rację, to był brutalny faul.", morale: czerwMoje ? 2 : 0, zarzad: czerwMoje ? -2 : 0, kibice: czerwMoje ? 3 : 0, odzew: czerwMoje ? "Ostre słowa — kibice z Tobą, ale komisja może się przyjrzeć." : "Rzeczowa ocena." },
    { tekst: "Musimy kontrolować emocje — to nasza lekcja.", morale: -1, zarzad: 2, odzew: "Dojrzała postawa doceniona przez zarząd." } ] });
  const oceny = (s.ostatnieOceny ?? []).filter((o) => o.ocena > 0).sort((a, b) => b.ocena - a.ocena);
  const best = oceny[0] && s.zawodnicy[oceny[0].id], worst = oceny[oceny.length - 1] && s.zawodnicy[oceny[oceny.length - 1].id];
  if (best && oceny[0].ocena >= 7.2) pyt.push({ kontekst: "Zawodnik meczu", pytanie: `${best.imie} ${best.nazwisko} był dziś najlepszy na boisku (${oceny[0].ocena.toFixed(1)}). Pochwalisz go?`, opcje: [
    { tekst: `${best.nazwisko} był fenomenalny — to zawodnik na wyższą ligę.`, morale: 1, zarzad: 0, zawodnik: { id: best.id, morale: 7 }, odzew: `${best.nazwisko} uskrzydlony. Media już pytają o jego przyszłość.` },
    { tekst: "Wygrywa zespół, nie wyróżniam pojedynczych graczy.", morale: 2, zarzad: 1, zawodnik: { id: best.id, morale: -2 }, odzew: "Kolektyw ponad gwiazdy — choć bohater meczu liczył na więcej." } ] });
  if (worst && oceny.length > 5 && oceny[oceny.length - 1].ocena < 5.5 && moje <= ich) pyt.push({ kontekst: "Słaby występ", pytanie: `${worst.imie} ${worst.nazwisko} miał bardzo słaby dzień. Straci miejsce w składzie?`, opcje: [
    { tekst: "Każdy ma gorszy mecz — dalej w niego wierzę.", morale: 1, zarzad: 0, zawodnik: { id: worst.id, morale: 6 }, odzew: `${worst.nazwisko} poczuł wsparcie.` },
    { tekst: "Porozmawiamy w cztery oczy, nie przez media.", morale: 1, zarzad: 1, odzew: "Profesjonalnie." },
    { tekst: "Tak grać nie można. Wyciągnę konsekwencje.", morale: -1, zarzad: 1, zawodnik: { id: worst.id, morale: -8 }, odzew: `Publiczna krytyka zabolała ${worst.nazwisko}.` } ] });
  // zadymy / oprawy po meczu u siebie
  const zab = s.ostatnieZabezpieczenie;
  const zadyma = zab?.incydenty?.find((i) => i.typ !== "oprawa");
  if (zadyma && szansa(0.7)) pyt.push({ kontekst: "Incydenty na trybunach", pytanie: `Race, przerwa w grze, interwencja policji… Klub znów zapłaci karę. Co powie Pan kibicom?`, opcje: [
    { tekst: "Kocham ten doping, ale pirotechnika kosztuje klub i drużynę. Apeluję o rozsądek.", morale: 0, zarzad: 2, kibice: -1, odzew: "Zarząd zadowolony, młyn trochę mniej." },
    { tekst: "To sprawa klubu i ochrony, ja odpowiadam za boisko.", morale: 1, zarzad: 0, odzew: "Unik — ale bez wpadki." },
    { tekst: "Kibice robią atmosferę, której zazdrości cała liga.", morale: 1, zarzad: -2, kibice: 3, odzew: "Młyn skanduje Twoje nazwisko, zarząd marszczy brwi." } ] });
  else if (zab?.incydenty?.some((i) => i.typ === "oprawa") && szansa(0.6)) pyt.push({ kontekst: "Oprawa", pytanie: "Kibice przygotowali dziś piękną oprawę. Widział Pan z ławki?", opcje: [
    { tekst: "Ciarki! Dziękujemy — graliśmy także dla nich.", morale: 1, zarzad: 0, kibice: 4, odzew: "Kibice wrzucili cytat na profil grupy." },
    { tekst: "Skupiałem się na meczu, ale słyszałem doping.", morale: 0, zarzad: 1, kibice: 1, odzew: "Profesjonalnie." } ] });
  pyt.push(wybierz([
    { kontekst: "Kibice", pytanie: "Jak oceniasz doping kibiców?", opcje: [
      { tekst: "Byli naszym dwunastym zawodnikiem — dziękujemy!", morale: 1, zarzad: 0, kibice: 4, odzew: "Kibice docenieni — frekwencja w górę." },
      { tekst: "Potrzebujemy ich jeszcze bardziej.", morale: 0, zarzad: 0, kibice: 1, odzew: "Apel o wsparcie." } ] },
    { kontekst: "Następny mecz", pytanie: "Co dalej? Za tydzień kolejne wyzwanie.", opcje: [
      { tekst: "Regeneracja i pełna koncentracja na następnym rywalu.", morale: 1, zarzad: 1, motywacja: 0.01, odzew: "Profesjonalizm." },
      { tekst: "Najpierw chwila radości / oddechu — potem praca.", morale: 2, zarzad: 0, odzew: "Szatnia złapała oddech." } ] },
  ] as PytanieKonf[]));
  return { media: wybierz(MEDIA), pytania: pyt.slice(0, 4) };
}
