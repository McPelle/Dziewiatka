import type { StanGry, Zawodnik } from "./types";

// Rozmowy trenera z zawodnikiem. Tematy zależą od sytuacji (forma, rola, wiek, kontrakt, kontuzja, kartki, plotki…),
// odpowiedzi mają różny TON, a efekt zależy od CHARAKTERU zawodnika (cechy), jego relacji z trenerem i tego,
// czy już w tym tygodniu rozmawialiście. Obietnice (minuty, kontrakt) są później rozliczane — złamana obietnica boli.

export type Ton = "wspierajacy" | "stanowczy" | "krytyczny" | "luz" | "obietnica";
export const TON_ETYKIETA: Record<Ton, string> = { wspierajacy: "🤝 wspierająco", stanowczy: "🎯 stanowczo", krytyczny: "⚠️ krytycznie", luz: "😄 na luzie", obietnica: "🤞 obietnica" };
export interface OpcjaRozmowy {
  tekst: string; ton: Ton; morale: number; relacja?: number;
  dobrze: string; zle?: string; // reakcja przy dobrym / słabym przyjęciu
  zostaje?: boolean; obietnica?: "minuty" | "kontrakt"; podwyzka?: number; naukaPozycji?: boolean; kapitan?: boolean;
}
export interface TematRozmowy { id: string; etykieta: string; ikona: string; kwestia: string; opcje: OpcjaRozmowy[] }

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const kol = (s: StanGry) => s.sezon * 100 + s.kolejka;

/** Mnożnik wpływu wg charakteru: nerwowi i niespokojni mocniej przeżywają krytykę, profesjonaliści ją przyjmują. */
function charakter(z: Zawodnik, o: OpcjaRozmowy): number {
  const c = z.cechy ?? [];
  let m = 1;
  if (o.morale < 0) {
    if (c.includes("nerwowy")) m *= 1.5;
    if (c.includes("niespokojny")) m *= 1.3;
    if (c.includes("profesjonalista")) m *= 0.5;
    if (c.includes("weteran") && o.ton === "krytyczny") m *= 1.2;
  } else {
    if (c.includes("lider") && (o.ton === "stanowczy" || o.kapitan)) m *= 1.3;
    if (c.includes("lojalny")) m *= 1.15;
    if (z.wiek <= 21 && o.ton === "wspierajacy") m *= 1.2;
    if (c.includes("profesjonalista") && o.ton === "luz") m *= 0.6;
  }
  return m;
}

/** Dostępne tematy rozmowy z zawodnikiem (zależne od kontekstu). */
export function tematyRozmowy(s: StanGry, z: Zawodnik): TematRozmowy[] {
  const t: TematRozmowy[] = [];
  const k = z.klubId ? s.kluby[z.klubId] : undefined;
  const poziom = k?.poziom ?? 9;
  const wXI = s.taktyka.sklad.includes(z.id);
  const kadra = (k?.zawodnicy ?? []).map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.umiej - a.umiej);
  const top = kadra.slice(0, 5).some((x) => x.id === z.id);
  const lataDoKonca = z.kontraktDo - s.sezon;

  // Forma / ostatni mecz
  if ((z.ocenaMeczu ?? 6) >= 7 || z.forma >= 1.5) t.push({ id: "pochwala", ikona: "⭐", etykieta: "Pochwała za formę", kwestia: "Ostatnio idzie mi naprawdę dobrze. Czuję pewność na boisku.", opcje: [
    { tekst: "Świetna robota — jesteś w życiowej formie!", ton: "wspierajacy", morale: 5, relacja: 3, dobrze: "Dzięki, trenerze! Dam z siebie jeszcze więcej." },
    { tekst: "Dobrze, ale nie osiadaj na laurach.", ton: "stanowczy", morale: 2, relacja: 1, dobrze: "Jasne, trzymam koncentrację.", zle: "Chyba zasłużyłem na trochę uznania…" },
    { tekst: "Pokaż mi to jeszcze w trzech meczach z rzędu.", ton: "krytyczny", morale: -1, dobrze: "Zrobię to, zobaczy pan.", zle: "Nic mi nie wystarcza w oczach trenera…" },
    { tekst: "Tylko nie zacznij się chwalić w szatni 😄", ton: "luz", morale: 3, relacja: 2, dobrze: "Haha, spokojnie, trenerze!" } ] });
  if ((z.ocenaMeczu ?? 6) < 5.5 || z.forma <= -1.5) t.push({ id: "krytyka", ikona: "📉", etykieta: "Słaba forma", kwestia: "Wiem, że ostatnio zawodzę. Nic mi nie wychodzi.", opcje: [
    { tekst: "Każdy ma gorszy okres — wierzę w ciebie.", ton: "wspierajacy", morale: 5, relacja: 3, dobrze: "To dla mnie bardzo ważne. Odbiję się." },
    { tekst: "Popracujemy indywidualnie po treningu.", ton: "stanowczy", morale: 3, relacja: 2, dobrze: "Dobrze, zostanę dłużej na zajęciach." },
    { tekst: "Jeśli się nie poprawisz, usiądziesz na ławce.", ton: "krytyczny", morale: -4, relacja: -2, dobrze: "Rozumiem. Wezmę się w garść.", zle: "Presja tylko pogarsza sprawę…" },
    { tekst: "Odpocznij głową — zagraj na luzie w następnym meczu.", ton: "luz", morale: 3, dobrze: "Może tego właśnie potrzebuję." } ] });

  // Rola w zespole
  if (wXI && top) t.push({ id: "rola", ikona: "🧱", etykieta: "Rola w zespole", kwestia: "Czuję, że jestem ważną postacią w tej drużynie.", opcje: [
    { tekst: "Jesteś filarem — buduję zespół wokół ciebie.", ton: "wspierajacy", morale: 5, relacja: 4, dobrze: "To ogromne wyróżnienie. Nie zawiodę." },
    { tekst: "Kluczowy gracz musi też ciągnąć młodszych.", ton: "stanowczy", morale: 3, relacja: 2, kapitan: false, dobrze: "Zgoda, wezmę ich pod skrzydła." },
    { tekst: "Nikt nie ma pewnego miejsca, ty też nie.", ton: "krytyczny", morale: -3, dobrze: "Dobrze, będę udowadniał co tydzień.", zle: "Po tym wszystkim, co dałem drużynie?" } ] });
  if (!wXI) t.push({ id: "minuty", ikona: "🪑", etykieta: "Za mało minut", kwestia: "Trenerze, chcę grać. Siedzenie na ławce mnie wykańcza.", opcje: [
    { tekst: "Obiecuję ci minuty w najbliższych meczach.", ton: "obietnica", morale: 6, relacja: 3, obietnica: "minuty", dobrze: "Trzymam pana za słowo!" },
    { tekst: "Walcz na treningach — miejsce czeka na najlepszych.", ton: "stanowczy", morale: 1, dobrze: "Dobrze, pokażę, że zasługuję." , zle: "Robię to od tygodni…" },
    { tekst: "Twoja szansa przyjdzie, cierpliwości.", ton: "wspierajacy", morale: 2, relacja: 1, dobrze: "Poczekam, ale nie wiecznie." },
    { tekst: "Na razie jesteś rezerwowym i tak zostanie.", ton: "krytyczny", morale: -6, relacja: -4, dobrze: "Rozumiem… choć to boli.", zle: "W takim razie pomyślę o zmianie klubu." } ] });

  // Wiek: młodzi i weterani
  if (z.wiek <= 21) t.push({ id: "mlody", ikona: "🌱", etykieta: "Rozwój młodego", kwestia: "Chcę się rozwijać jak najszybciej. Co mam robić?", opcje: [
    { tekst: "Masz potencjał na wyższą ligę — pracuj tak dalej.", ton: "wspierajacy", morale: 5, relacja: 3, dobrze: "Wow, to mnie motywuje jak nic innego!" },
    { tekst: "Dodatkowe zajęcia indywidualne — od jutra.", ton: "stanowczy", morale: 3, relacja: 2, dobrze: "Będę pierwszy na treningu." },
    { tekst: "Naucz się nowej pozycji — zwiększy twoje szanse.", ton: "stanowczy", morale: 2, naukaPozycji: true, dobrze: "Dobra, spróbuję czegoś nowego." },
    { tekst: "Na razie słuchaj starszych i nie wychylaj się.", ton: "krytyczny", morale: -2, dobrze: "Rozumiem, będę cierpliwy.", zle: "Myślałem, że dostanę więcej szans…" } ] });
  if (z.wiek >= 31) t.push({ id: "weteran", ikona: "🎖", etykieta: "Doświadczenie weterana", kwestia: "Czuję jeszcze siłę w nogach, ale wiem, że czas leci.", opcje: [
    { tekst: "Twoje doświadczenie jest bezcenne dla szatni.", ton: "wspierajacy", morale: 5, relacja: 3, dobrze: "Dziękuję. Pomogę młodym, ile się da." },
    { tekst: "Będę cię oszczędzał — jakość ponad ilość.", ton: "stanowczy", morale: 2, dobrze: "Rozsądne, zgoda.", zle: "Nie chcę być oszczędzany, chcę grać." },
    { tekst: "Pomyśl już o karierze trenerskiej.", ton: "luz", morale: -2, dobrze: "Haha… może kiedyś.", zle: "Wysyła mnie pan na emeryturę?" } ] });

  // Kontrakt / pensja
  if (lataDoKonca <= 1 && z.kontraktTyp !== "amator") t.push({ id: "kontrakt", ikona: "📄", etykieta: "Przyszłość i kontrakt", kwestia: "Kontrakt kończy mi się niedługo. Co dalej ze mną?", opcje: [
    { tekst: "Chcę cię zatrzymać — porozmawiamy o nowej umowie.", ton: "obietnica", morale: 6, relacja: 3, obietnica: "kontrakt", dobrze: "Świetnie, czekam na propozycję!" },
    { tekst: "Zobaczymy po sezonie, wszystko zależy od formy.", ton: "stanowczy", morale: -1, dobrze: "Rozumiem, pokażę się.", zle: "Niepewność mnie męczy…" },
    { tekst: "Nie planuję przedłużenia.", ton: "krytyczny", morale: -8, relacja: -5, dobrze: "Szkoda, ale dziękuję za szczerość.", zle: "W takim razie szukam klubu." } ] });
  if (z.morale < 60 && poziom <= 6 && kadra.indexOf(z) < kadra.length / 2) t.push({ id: "pensja", ikona: "💰", etykieta: "Prośba o podwyżkę", kwestia: "Gram dużo i dobrze. Uważam, że zasługuję na lepsze pieniądze.", opcje: [
    { tekst: "Zgoda — podnoszę pensję o 15%.", ton: "wspierajacy", morale: 9, relacja: 5, podwyzka: 0.15, dobrze: "Dziękuję! To pokazuje, że klub mnie ceni." },
    { tekst: "Wrócimy do tego przy nowej umowie.", ton: "obietnica", morale: 3, obietnica: "kontrakt", dobrze: "Dobrze, liczę na to." },
    { tekst: "Budżet jest jaki jest, nie ma podwyżek.", ton: "krytyczny", morale: -5, relacja: -3, dobrze: "Rozumiem sytuację klubu.", zle: "Inne kluby płacą więcej…" } ] });

  // Transfer / plotki
  if (z.prosiOTransfer) t.push({ id: "transfer", ikona: "✈️", etykieta: "Chce odejść", kwestia: "Myślę o zmianie klubu. Potrzebuję nowego wyzwania.", opcje: [
    { tekst: "Jesteś dla nas kluczowy — zostań, zbudujemy coś razem.", ton: "wspierajacy", morale: 7, relacja: 4, zostaje: true, dobrze: "Skoro tak mnie cenisz… zostaję." , zle: "Doceniam, ale decyzja zapadła…" },
    { tekst: "Zostań do lata, wtedy porozmawiamy.", ton: "obietnica", morale: 3, obietnica: "kontrakt", dobrze: "Dobrze, dam z siebie wszystko do końca sezonu." },
    { tekst: "Jeśli przyjdzie dobra oferta, nie będę blokował.", ton: "stanowczy", morale: 1, dobrze: "Dziękuję za uczciwość." },
    { tekst: "Masz kontrakt i masz go wypełnić.", ton: "krytyczny", morale: -6, relacja: -5, dobrze: "…Dobrze.", zle: "To się źle skończy dla nas obu." } ] });
  else if ((z.wystawiony ?? 0) > 0 || z.umiej > (kadra[0]?.umiej ?? 0) - 2) t.push({ id: "plotki", ikona: "📰", etykieta: "Plotki transferowe", kwestia: "W mediach piszą, że interesują się mną inne kluby. Co pan o tym myśli?", opcje: [
    { tekst: "Nie zamierzam cię sprzedawać.", ton: "wspierajacy", morale: 5, relacja: 3, dobrze: "To dobrze słyszeć, skupiam się na grze." },
    { tekst: "Plotki to plotki — graj swoje.", ton: "stanowczy", morale: 1, dobrze: "Racja, nie czytam gazet." },
    { tekst: "Każdy ma swoją cenę.", ton: "luz", morale: -3, dobrze: "Hm… rozumiem.", zle: "Czyli mogę zostać sprzedany w każdej chwili?" } ] });

  // Kontuzja, kartki
  if (z.kontuzja > 0) t.push({ id: "kontuzja", ikona: "🩹", etykieta: "Kontuzja", kwestia: `Ta kontuzja mnie dobija. Jeszcze ${z.kontuzja} ${z.kontuzja === 1 ? "kolejka" : "kolejek"} przerwy.`, opcje: [
    { tekst: "Wróć spokojnie — zdrowie najważniejsze.", ton: "wspierajacy", morale: 6, relacja: 3, dobrze: "Dzięki, nie będę się spieszył." },
    { tekst: "Potrzebujemy cię jak najszybciej.", ton: "stanowczy", morale: 1, dobrze: "Zrobię, co w mojej mocy.", zle: "Presja przy kontuzji to zły pomysł…" },
    { tekst: "Odwiedzę cię na rehabilitacji 😄", ton: "luz", morale: 4, relacja: 2, dobrze: "Haha, to by mnie podbudowało!" } ] });
  if (z.kartki >= 3 || z.zawieszenie > 0) t.push({ id: "kartki", ikona: "🟨", etykieta: "Zachowanie na boisku", kwestia: "Wiem, wiem… za dużo kartek. Emocje mnie ponoszą.", opcje: [
    { tekst: "Twoja pasja jest cenna — tylko ją kontroluj.", ton: "wspierajacy", morale: 3, relacja: 2, dobrze: "Popracuję nad tym." },
    { tekst: "Kolejna głupia kartka = kara finansowa.", ton: "stanowczy", morale: -2, dobrze: "Zrozumiałem, nie powtórzy się.", zle: "Kara? Za walkę dla drużyny?" },
    { tekst: "Osłabiasz drużynę. To nieprofesjonalne.", ton: "krytyczny", morale: -4, relacja: -2, dobrze: "Ma pan rację.", zle: "Nikt nie walczy tak jak ja…" } ] });

  // Pozycja, przywództwo, praca
  if (!z.naukaPozycji && (z.pozycjeDodatkowe?.length ?? 0) < 2) t.push({ id: "pozycja", ikona: "🔄", etykieta: "Nowa pozycja", kwestia: "Myśli pan, że mógłbym grać też gdzie indziej?", opcje: [
    { tekst: "Tak — zacznijmy naukę nowej pozycji.", ton: "wspierajacy", morale: 3, naukaPozycji: true, dobrze: "Super, chętnie spróbuję!" },
    { tekst: "Skup się na swojej pozycji — tam jesteś najlepszy.", ton: "stanowczy", morale: 1, dobrze: "Ok, doskonalę to, co mam." } ] });
  if ((z.cechy ?? []).includes("lider") || s.kapitan === z.id) t.push({ id: "lider", ikona: "©️", etykieta: "Przywództwo w szatni", kwestia: "Chłopaki patrzą na mnie. Jak mam ich prowadzić?", opcje: [
    { tekst: s.kapitan === z.id ? "Jesteś moim kapitanem — mów w moim imieniu." : "Chcę, żebyś został kapitanem.", ton: "wspierajacy", morale: 6, relacja: 4, kapitan: true, dobrze: "To zaszczyt. Nie zawiodę drużyny." },
    { tekst: "Pilnuj atmosfery i dyscypliny.", ton: "stanowczy", morale: 3, relacja: 2, dobrze: "Zadbam o to." },
    { tekst: "Najpierw sam dawaj przykład na boisku.", ton: "krytyczny", morale: -2, dobrze: "Słusznie.", zle: "Przecież daję…" } ] });
  if (poziom >= 7) t.push({ id: "zycie", ikona: "🏠", etykieta: "Praca i życie", kwestia: "Łączę futbol z pracą — czasem ciężko wyrobić się na treningi i mecze.", opcje: [
    { tekst: "Rozumiem — rodzina i praca są ważne.", ton: "wspierajacy", morale: 5, relacja: 3, dobrze: "Dzięki za wyrozumiałość, odwdzięczę się na boisku." },
    { tekst: "Ustawię treningi pod twój grafik.", ton: "obietnica", morale: 4, relacja: 2, dobrze: "Super, to mi bardzo pomoże." },
    { tekst: "Futbol musi być priorytetem.", ton: "krytyczny", morale: -4, relacja: -2, dobrze: "Postaram się.", zle: "…Nie zawsze mam na to wpływ." } ] });

  // Zawsze: samopoczucie i trening
  t.push({ id: "samopoczucie", ikona: "💬", etykieta: "Jak się czujesz w klubie?", kwestia: z.morale < 40 ? "Szczerze? Ostatnio coś mi ciąży. Atmosfera nie ta." : z.morale > 75 ? "Jest świetnie! Dobrze mi tu." : "Jest w porządku, choć bywało lepiej.", opcje: [
    { tekst: "Powiedz, co cię gryzie — pomogę.", ton: "wspierajacy", morale: 4, relacja: 4, dobrze: "Dzięki, że pan pyta. Już lżej." },
    { tekst: "Dobrze cię mieć w zespole.", ton: "wspierajacy", morale: 3, relacja: 2, dobrze: "Miło to słyszeć." },
    { tekst: "Zostaw emocje w domu, tu liczy się wynik.", ton: "krytyczny", morale: -3, dobrze: "Ok…", zle: "Nie jestem robotem, trenerze." },
    { tekst: "Wyjście drużynowe na pizzę po meczu? 😄", ton: "luz", morale: 4, relacja: 2, dobrze: "Haha, jestem za!" } ] });
  t.push({ id: "trening", ikona: "🏃", etykieta: "Zaangażowanie na treningach", kwestia: "Jak pan ocenia moją pracę na zajęciach?", opcje: [
    { tekst: "Trenujesz wzorowo — tak trzymać.", ton: "wspierajacy", morale: 4, relacja: 2, dobrze: "Dzięki, daję z siebie wszystko." },
    { tekst: "Stać cię na więcej intensywności.", ton: "stanowczy", morale: 0, dobrze: "Podkręcę tempo.", zle: "Przecież haruję…" },
    { tekst: "Odpuszczasz. Widzę to.", ton: "krytyczny", morale: -4, relacja: -2, dobrze: "Ma pan rację, poprawię się.", zle: "To nieprawda!" } ] });
  return t;
}

/** Zastosuj odpowiedź: morale, relacja, obietnice, podwyżka, nauka pozycji, kapitan. Zwraca reakcję i zmianę morale. */
export function zastosujRozmowe(s: StanGry, z: Zawodnik, o: OpcjaRozmowy): { reakcja: string; delta: number; uwaga?: string } {
  const teraz = kol(s);
  const powtorka = z.ostatniaRozmowa === teraz;
  const relacja = z.relacja ?? 60;
  let delta = o.morale * charakter(z, o) * (powtorka ? 0.3 : 1);
  // Relacja z trenerem: dobra relacja wzmacnia pozytywy i łagodzi krytykę; zła — odwrotnie.
  delta *= o.morale >= 0 ? 0.7 + relacja / 200 : 1.3 - relacja / 200;
  delta += (Math.random() - 0.5) * 2; // drobna nieprzewidywalność
  delta = Math.round(delta);
  const dobrzePrzyjete = delta >= 0 || !o.zle;
  z.morale = clamp(z.morale + delta);
  z.relacja = clamp(relacja + (o.relacja ?? Math.sign(o.morale)) * (powtorka ? 0.3 : 1));
  z.ostatniaRozmowa = teraz;
  let uwaga: string | undefined = powtorka ? "Rozmawialiście już w tym tygodniu — słowa ważą mniej." : undefined;
  if (o.zostaje && dobrzePrzyjete && z.morale >= 45) z.prosiOTransfer = false;
  if (o.obietnica) z.obietnica = { typ: o.obietnica, doKolejki: teraz + (o.obietnica === "minuty" ? 4 : 10), mecze: z.mecze, kontraktDo: z.kontraktDo };
  if (o.podwyzka) { z.pensja = Math.round(z.pensja * (1 + o.podwyzka)); uwaga = `Pensja wzrosła do ${z.pensja} zł/kolejkę.`; }
  if (o.naukaPozycji && !z.naukaPozycji) uwaga = "Wybierz nową pozycję do nauki w Centrum treningu (nauka pozycji).";
  if (o.kapitan) { s.kapitan = z.id; uwaga = `${z.imie} ${z.nazwisko} jest teraz kapitanem.`; }
  return { reakcja: dobrzePrzyjete ? o.dobrze : (o.zle ?? o.dobrze), delta, uwaga };
}

/** Rozliczenie obietnic (co kolejkę): dotrzymane — morale i zaufanie w górę; złamane — mocno w dół. */
export function rozliczObietnice(s: StanGry, wiad: (t: string) => void) {
  const teraz = kol(s);
  for (const id of s.kluby[s.mojKlub]?.zawodnicy ?? []) {
    const z = s.zawodnicy[id];
    const o = z?.obietnica;
    if (!o) continue;
    const dotrzymana = o.typ === "minuty" ? z.mecze - o.mecze >= 2 : z.kontraktDo > o.kontraktDo;
    if (dotrzymana) {
      z.morale = clamp(z.morale + 5); z.relacja = clamp((z.relacja ?? 60) + 6); z.obietnica = undefined;
      wiad(`🤝 ${z.imie} ${z.nazwisko}: „Trener dotrzymał słowa" — morale i zaufanie w górę.`);
    } else if (teraz >= o.doKolejki) {
      z.morale = clamp(z.morale - 12); z.relacja = clamp((z.relacja ?? 60) - 15); z.obietnica = undefined;
      if (z.morale < 40) z.prosiOTransfer = true;
      wiad(`💢 ${z.imie} ${z.nazwisko} czuje się oszukany — obiecałeś ${o.typ === "minuty" ? "minuty na boisku" : "nowy kontrakt"} i nie dotrzymałeś słowa (morale −12).`);
    }
  }
}
