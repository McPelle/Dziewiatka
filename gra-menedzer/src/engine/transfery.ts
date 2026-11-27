import { zakazTransferow } from "./wydzialGier";
// Transfery rozłożone w czasie (dni kalendarza), z realiami polskiego futbolu:
// oferta → odpowiedź klubu po 1–3 dniach (akceptacja / kontra / odmowa / konkurencja) → negocjacje z zawodnikiem lub agentem
// (pensja, długość, premia za podpis, premie za gole i występy, klauzula, obiecana rola) → badania medyczne →
// rejestracja w Extranecie PZPN → zawodnik w klubie. Dodatkowo: ekwiwalent za wyszkolenie (U-23), umowa wstępna
// z zawodnikiem, któremu wygasa kontrakt (wolny transfer latem), wypożyczenia z opcją / obowiązkiem wykupu, obserwowani.
import { los, losInt, szansa, wybierz, zl } from "./losuj";
import { cenaWywolawcza, latDoKonca, negocjujTransfer, oknoOtwarte, premiaPodpisu, wypozyczDoSiebie, zadaniePlacowe, type OfertaTransferu } from "./sezon";
import { wartosc } from "./swiat";
import type { StanGry, Zawodnik } from "./types";

export type EtapNeg = "klub" | "zawodnik" | "medyczne" | "rejestracja" | "zakonczona" | "zerwana";
export type Rola = "kluczowy" | "rotacja" | "rezerwowy" | "perspektywa";
export const ROLA_NAZWA: Record<Rola, string> = { kluczowy: "kluczowy zawodnik", rotacja: "rotacja w składzie", rezerwowy: "zmiennik", perspektywa: "perspektywiczny młody" };
export interface WarunkiKontraktu { pensja: number; lata: number; premia: number; bonusGol: number; bonusMecz: number; klauzula: number; rola: Rola }
export interface Negocjacja {
  id: string; zawodnikId: string; klubSprzedajacy?: string; etap: EtapNeg; odpowiedz: number; // dzień gry, w którym przyjdzie odpowiedź
  oferta: OfertaTransferu; rundyKlub: number; rundyZaw: number; zadania?: WarunkiKontraktu; propozycja?: WarunkiKontraktu;
  wstepna?: boolean; // umowa wstępna (zawodnik przyjdzie latem za darmo)
  dziennik: string[];
  uraz?: boolean;
  koniec?: number; // dzień zamknięcia (do sprzątania listy)
}

/** Licznik dni gry (rośnie z każdym „Dalej" — w sezonie i w okresach przygotowawczych). */
export const dzienGry = (s: StanGry) => s.licznikDni ?? 0;
const wiad = (s: StanGry, t: string) => { s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: t }); s.wiadomosci = s.wiadomosci.slice(0, 60); };
const nazwa = (s: StanGry, z: Zawodnik) => `${z.imie} ${z.nazwisko}`;

/** Oczekiwania zawodnika/agenta wobec kontraktu. */
export function zadaniaKontraktowe(s: StanGry, z: Zawodnik): WarunkiKontraktu {
  const moj = s.kluby[s.mojKlub];
  const pensja = zadaniePlacowe(s, z, moj.poziom);
  const kadra = moj.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.umiej - a.umiej);
  const miejsce = kadra.filter((x) => x.umiej > z.umiej).length;
  const rola: Rola = z.wiek <= 20 ? "perspektywa" : miejsce < 6 ? "kluczowy" : miejsce < 14 ? "rotacja" : "rezerwowy";
  return {
    pensja, lata: z.wiek >= 31 ? 2 : z.wiek <= 22 ? 4 : 3, premia: moj.poziom <= 5 ? Math.round(premiaPodpisu(pensja) / 100) * 100 : 0,
    bonusGol: moj.poziom <= 4 && (z.poz === "NAP" || z.poz === "POM") ? Math.round(pensja * 0.4 / 50) * 50 : 0,
    bonusMecz: moj.poziom <= 6 ? Math.round(pensja * 0.15 / 10) * 10 : 0,
    klauzula: z.umiej >= 60 && moj.poziom <= 3 ? Math.round(wartosc(z) * 2.5 / 10000) * 10000 : 0, rola,
  };
}

/** Rozpoczęcie: oferta dla klubu (albo od razu negocjacje z zawodnikiem, gdy wolny / amator / umowa wstępna). */
export function zlozOferte(s: StanGry, zId: string, oferta: OfertaTransferu, opcje: { wstepna?: boolean } = {}): string | null {
  if (zakazTransferow(s)) return "⛔ Zakaz transferów (Izba PZPN) — najpierw spłać zaległości wobec zawodników.";

  const z = s.zawodnicy[zId];
  if (!z) return "Brak zawodnika.";
  if ((s.negocjacje ?? []).some((n) => n.zawodnikId === zId && n.etap !== "zakonczona" && n.etap !== "zerwana")) return "Już negocjujesz z tym zawodnikiem.";
  if (!opcje.wstepna && !oknoOtwarte(s)) return "Okno transferowe jest zamknięte (wolnych zawodników możesz podpisać, albo zaproponuj umowę wstępną zawodnikowi z wygasającym kontraktem).";
  if (opcje.wstepna && !(z.klubId && latDoKonca(s, z) === 0)) return "Umowę wstępną można zawrzeć tylko z zawodnikiem, któremu kontrakt kończy się po tym sezonie.";
  const doKlubu = !!z.klubId && z.kontraktTyp !== "amator" && !opcje.wstepna;
  const n: Negocjacja = {
    id: `n${Date.now().toString(36)}${losInt(0, 999)}`, zawodnikId: zId, klubSprzedajacy: z.klubId ?? undefined,
    etap: doKlubu ? "klub" : "zawodnik", odpowiedz: dzienGry(s) + (doKlubu ? losInt(1, 3) : 1), oferta, rundyKlub: 0, rundyZaw: 0,
    wstepna: opcje.wstepna, dziennik: [],
  };
  if (!doKlubu) n.zadania = zadaniaKontraktowe(s, z);
  n.dziennik.push(doKlubu ? `Oferta ${zl(oferta.kwota)} wysłana do ${s.kluby[z.klubId!].nazwa} — odpowiedź za ${n.odpowiedz - dzienGry(s)} dni.`
    : opcje.wstepna ? `Rozmowy o umowie wstępnej z ${nazwa(s, z)} (${z.agent ? `agent: ${z.agent}` : "bez agenta"}).` : `Rozmowy z ${nazwa(s, z)} — ${z.agent ? `agent ${z.agent}` : "bez agenta"} przedstawi oczekiwania jutro.`);
  (s.negocjacje ??= []).push(n);
  return null;
}
/** Twoja propozycja kontraktu dla zawodnika/agenta (odpowiedź następnego dnia). */
export function zaproponujKontrakt(s: StanGry, negId: string, w: WarunkiKontraktu): string | null {
  const n = (s.negocjacje ?? []).find((x) => x.id === negId);
  if (!n || n.etap !== "zawodnik") return "Te negocjacje nie są na etapie kontraktu.";
  n.propozycja = w; n.odpowiedz = dzienGry(s) + 1;
  n.dziennik.push(`Propozycja: ${zl(w.pensja)}/kol., ${w.lata} sez., premia ${zl(w.premia)}, rola: ${ROLA_NAZWA[w.rola]} — czekamy na odpowiedź.`);
  return null;
}
/** Nowa kwota dla klubu (po kontrze / odmowie). */
export function podbijOferte(s: StanGry, negId: string, kwota: number): string | null {
  const n = (s.negocjacje ?? []).find((x) => x.id === negId);
  if (!n || n.etap !== "klub") return "Te negocjacje nie są na etapie klubu.";
  n.oferta = { ...n.oferta, kwota }; n.odpowiedz = dzienGry(s) + losInt(1, 2);
  n.dziennik.push(`Nowa oferta ${zl(kwota)} — klub odpowie za ${n.odpowiedz - dzienGry(s)} dni.`);
  return null;
}
export function zerwijNegocjacje(s: StanGry, negId: string) {
  const n = (s.negocjacje ?? []).find((x) => x.id === negId);
  if (n) { n.etap = "zerwana"; n.dziennik.push("Zerwałeś rozmowy."); }
}
/** Decyzja po badaniach medycznych, które wykryły uraz. */
export function decyzjaMedyczna(s: StanGry, negId: string, d: "kontynuuj" | "renegocjuj" | "zerwij") {
  const n = (s.negocjacje ?? []).find((x) => x.id === negId);
  if (!n || n.etap !== "medyczne" || !n.uraz) return;
  if (d === "zerwij") { n.etap = "zerwana"; n.dziennik.push("Transfer anulowany po badaniach medycznych."); return; }
  if (d === "renegocjuj") { n.oferta = { ...n.oferta, kwota: Math.round(n.oferta.kwota * 0.85 / 100) * 100 }; n.dziennik.push(`Kwota obniżona o 15% po badaniach: ${zl(n.oferta.kwota)}.`); }
  n.uraz = false; n.etap = "rejestracja"; n.odpowiedz = dzienGry(s) + 1;
  s.zawodnicy[n.zawodnikId].kontuzja = Math.max(s.zawodnicy[n.zawodnikId].kontuzja, losInt(1, 3));
}

/** Ekwiwalent za wyszkolenie (uchwała PZPN): młody (≤23) podpisujący umowę — jego ostatni klub dostaje rekompensatę. */
export function ekwiwalentZaWyszkolenie(s: StanGry, z: Zawodnik): { kwota: number; klub?: string } {
  if (z.wiek > 23) return { kwota: 0 };
  const ostatni = [...(z.kariera ?? [])].reverse().find((w) => w.klub && w.klub !== s.kluby[s.mojKlub].nazwa);
  if (!ostatni) return { kwota: 0 };
  const poz = s.kluby[s.mojKlub].poziom;
  const baza = [60000, 30000, 15000, 8000, 4000, 2000, 1000, 600, 400][Math.min(8, poz - 1)];
  return { kwota: Math.round(baza * (z.wiek <= 19 ? 1.3 : 1) / 100) * 100, klub: ostatni.klub };
}

/** Codzienne przetwarzanie negocjacji (wołane z kalendarza). */
export function przetworzNegocjacje(s: StanGry) {
  const dzis = dzienGry(s);
  for (const n of s.negocjacje ?? []) {
    if (n.etap === "zakonczona" || n.etap === "zerwana" || n.odpowiedz > dzis) continue;
    const z = s.zawodnicy[n.zawodnikId];
    if (!z) { n.etap = "zerwana"; continue; }
    if (n.etap === "klub") {
      const stary = z.klubId ? s.kluby[z.klubId] : undefined;
      if (!stary) { n.etap = "zawodnik"; n.zadania = zadaniaKontraktowe(s, z); continue; }
      const ask = cenaWywolawcza(s, z.id) * (n.rundyKlub > 0 && szansa(0.15) ? 1.1 : 1);
      const eff = n.oferta.kwota * (1 + (n.oferta.odsprzedazProc ?? 0) / 200) * (1 - Math.max(0, (n.oferta.ratySezony ?? 1) - 1) * 0.04);
      n.rundyKlub++;
      if (szansa(0.12) && n.rundyKlub === 1) {
        const konk = wybierz(Object.values(s.kluby).filter((k) => k.poziom <= s.kluby[s.mojKlub].poziom + 1 && k.id !== s.mojKlub && k.id !== stary.id && !k.pozaLiga && !k.pozaPiramida));
        n.dziennik.push(`⚔️ ${konk?.nazwa ?? "Inny klub"} też złożył ofertę — ${stary.nazwa} czeka na lepszą propozycję.`);
        wiad(s, `⚔️ Konkurencja o ${nazwa(s, z)}: ${konk?.nazwa ?? "inny klub"} też jest zainteresowany. Rozważ podbicie oferty.`);
        n.odpowiedz = dzis + 1e9; continue; // czeka na Twój ruch (podbij / zerwij)
      }
      if (eff >= ask) {
        n.etap = "zawodnik"; n.zadania = zadaniaKontraktowe(s, z); n.odpowiedz = dzis + 1;
        n.dziennik.push(`✅ ${stary.nazwa} przyjął ofertę ${zl(n.oferta.kwota)}. Teraz rozmowy z zawodnikiem${z.agent ? ` i agentem (${z.agent})` : ""}.`);
        wiad(s, `✅ ${stary.nazwa} zgadza się sprzedać ${nazwa(s, z)} za ${zl(n.oferta.kwota)} — przejdź do negocjacji kontraktu (Transfery → Negocjacje).`);
      } else if (eff >= ask * 0.8 && n.rundyKlub < 4) {
        const kontra = Math.round((ask + eff) / 2 / 100) * 100;
        n.dziennik.push(`↩ ${stary.nazwa}: kontroferta ${zl(kontra)}.`); n.odpowiedz = dzis + 1e9;
        wiad(s, `↩ ${stary.nazwa} odpowiada na ofertę za ${nazwa(s, z)}: chce ${zl(kontra)}.`);
      } else {
        n.etap = "zerwana"; n.dziennik.push(`❌ ${stary.nazwa} odrzuca — oczekuje ok. ${zl(Math.round(ask / 1000) * 1000)}.`);
        wiad(s, `❌ ${stary.nazwa} odrzucił ofertę za ${nazwa(s, z)} (oczekuje ok. ${zl(Math.round(ask / 1000) * 1000)}).`);
      }
    } else if (n.etap === "zawodnik") {
      if (!n.propozycja) { n.odpowiedz = dzis + 1e9; n.dziennik.push(`📋 Oczekiwania: ${zl(n.zadania!.pensja)}/kol., ${n.zadania!.lata} sez., premia ${zl(n.zadania!.premia)}${n.zadania!.bonusGol ? `, ${zl(n.zadania!.bonusGol)} za gola` : ""}${n.zadania!.bonusMecz ? `, ${zl(n.zadania!.bonusMecz)} za mecz` : ""}${n.zadania!.klauzula ? `, klauzula ${zl(n.zadania!.klauzula)}` : ""}, rola: ${ROLA_NAZWA[n.zadania!.rola]}.`); continue; }
      const p = n.propozycja, w = n.zadania!;
      // ocena propozycji: pensja najważniejsza, potem rola, premia, bonusy, długość
      const rolaPkt = { kluczowy: 3, rotacja: 2, perspektywa: 2, rezerwowy: 0 }[p.rola] - { kluczowy: 3, rotacja: 2, perspektywa: 2, rezerwowy: 0 }[w.rola];
      const ocena = p.pensja / Math.max(1, w.pensja) + rolaPkt * 0.04 + (p.premia - w.premia) / Math.max(1, w.pensja * 20) + (p.bonusGol + p.bonusMecz * 2 - w.bonusGol - w.bonusMecz * 2) / Math.max(1, w.pensja * 4) - Math.abs(p.lata - w.lata) * 0.03 + (p.klauzula > 0 && w.klauzula === 0 ? -0.03 : 0);
      n.rundyZaw++;
      if (ocena >= 0.98) {
        n.etap = n.wstepna ? "zakonczona" : "medyczne"; n.odpowiedz = dzis + 1;
        n.dziennik.push(`🤝 ${z.agent ? `${z.agent}: „Mamy porozumienie"` : `${z.imie}: „Zgoda!"`} — ${n.wstepna ? "umowa wstępna podpisana" : "jutro badania medyczne"}.`);
        if (n.wstepna) { z.przyszlyKlub = { klubId: s.mojKlub, warunki: p }; wiad(s, `✍️ Umowa wstępna: ${nazwa(s, z)} przejdzie do Was latem za darmo (koniec jego kontraktu).`); }
      } else if (ocena >= 0.85 && n.rundyZaw < 3) {
        w.pensja = Math.round(((w.pensja + p.pensja) / 2) / 10) * 10; n.odpowiedz = dzis + 1e9;
        n.dziennik.push(`↩ ${z.agent ?? z.imie}: „Za mało." Nowe oczekiwania: ${zl(w.pensja)}/kol. (runda ${n.rundyZaw}/3).`);
        wiad(s, `↩ ${z.agent ? `Agent ${nazwa(s, z)}` : nazwa(s, z)} odrzuca propozycję — oczekuje ${zl(w.pensja)}/kol. (${3 - n.rundyZaw} rund(y) zostało).`);
      } else {
        n.etap = "zerwana"; n.dziennik.push(`❌ ${z.agent ?? z.imie} zrywa rozmowy — warunki nie do przyjęcia.`);
        wiad(s, `❌ ${nazwa(s, z)} zerwał rozmowy kontraktowe.`);
      }
    } else if (n.etap === "medyczne") {
      if (n.uraz) continue;
      if (szansa(0.05)) { n.uraz = true; n.odpowiedz = dzis + 1e9; n.dziennik.push("🩺 Badania wykazały uraz — zdecyduj: kontynuuj, renegocjuj kwotę albo zerwij."); wiad(s, `🩺 Badania medyczne ${nazwa(s, z)} wykazały uraz — decyzja w Transfery → Negocjacje.`); continue; }
      n.etap = "rejestracja"; n.odpowiedz = dzis + 1; n.dziennik.push("🩺 Badania medyczne OK. Jutro rejestracja w Extranecie PZPN.");
    } else if (n.etap === "rejestracja") {
      const p = n.propozycja!;
      const r = negocjujTransfer(s, z.id, { ...n.oferta, pensja: p.pensja, lata: p.lata, premia: p.premia, klauzula: p.klauzula || undefined });
      if (!r.ok) { n.etap = "zerwana"; n.dziennik.push(`❌ Nie udało się sfinalizować: ${r.powod}`); wiad(s, `❌ Transfer ${nazwa(s, z)} nie doszedł do skutku: ${r.powod}`); continue; }
      z.bonusy = { gol: p.bonusGol, mecz: p.bonusMecz };
      if (p.rola === "kluczowy" || p.rola === "rotacja") z.obietnica = { typ: "minuty", doKolejki: s.sezon * 100 + s.kolejka + 5, mecze: z.mecze, kontraktDo: z.kontraktDo };
      const ekw = ekwiwalentZaWyszkolenie(s, z);
      if (ekw.kwota > 0 && n.oferta.kwota === 0) {
        s.kluby[s.mojKlub].kasa -= ekw.kwota;
        const k = Object.values(s.kluby).find((x) => x.nazwa === ekw.klub); if (k) k.kasa += ekw.kwota;
        wiad(s, `🎓 Ekwiwalent za wyszkolenie (PZPN): ${zl(ekw.kwota)} dla ${ekw.klub}.`);
      }
      n.etap = "zakonczona"; n.dziennik.push("✅ Zarejestrowany w Extranecie — zawodnik w klubie!");
    }
  }
  // sprzątanie starych
  for (const n of s.negocjacje ?? []) if ((n.etap === "zakonczona" || n.etap === "zerwana") && n.koniec === undefined) n.koniec = dzis;
  s.negocjacje = (s.negocjacje ?? []).filter((n) => n.koniec === undefined || dzis - n.koniec < 7); // zakończone widać jeszcze tydzień
}
/** Kontynuacja po kontrze/konkurencji: odblokuj czekające negocjacje (po Twojej decyzji odpowiedź za 1 dzień). */
export function czekaNaCiebie(n: Negocjacja, s: StanGry): boolean { return n.odpowiedz > dzienGry(s) + 1e6; }

/** Na koniec sezonu: umowy wstępne → zawodnicy przechodzą za darmo. */
export function realizujUmowyWstepne(s: StanGry) {
  for (const z of Object.values(s.zawodnicy)) {
    if (!z.przyszlyKlub) continue;
    const { klubId, warunki } = z.przyszlyKlub;
    z.przyszlyKlub = undefined;
    if (klubId !== s.mojKlub) continue;
    const stary = z.klubId ? s.kluby[z.klubId] : undefined;
    if (stary) stary.zawodnicy = stary.zawodnicy.filter((x) => x !== z.id);
    z.klubId = null; s.wolni.push(z.id);
    const r = negocjujTransfer(s, z.id, { kwota: 0, pensja: warunki.pensja, lata: warunki.lata, premia: warunki.premia, klauzula: warunki.klauzula || undefined });
    wiad(s, r.ok ? `✈️ ${z.imie} ${z.nazwisko} dołącza na mocy umowy wstępnej (wolny transfer).` : `⚠ Umowa wstępna z ${z.imie} ${z.nazwisko} nie doszła do skutku: ${r.powod}`);
  }
}

/** Wypożyczenie z opcją lub obowiązkiem wykupu. */
export function wypozyczZWykupem(s: StanGry, zId: string, kwotaWykupu: number, obowiazek: boolean): string | null {
  if (zakazTransferow(s)) return "⛔ Zakaz transferów (Izba PZPN) — najpierw spłać zaległości wobec zawodników.";

  const z = s.zawodnicy[zId]; const parent = z?.klubId;
  const b = wypozyczDoSiebie(s, zId);
  if (b) return b;
  z.wykup = { kwota: kwotaWykupu, obowiazek, klubId: parent! };
  wiad(s, `🔁 Wypożyczenie ${z.imie} ${z.nazwisko} ${obowiazek ? "z OBOWIĄZKIEM" : "z opcją"} wykupu za ${zl(kwotaWykupu)} (po sezonie).`);
  return null;
}
/** Skorzystanie z opcji wykupu (przy obowiązku — automatycznie na koniec sezonu). */
export function wykupZWypozyczenia(s: StanGry, zId: string): string | null {
  const z = s.zawodnicy[zId]; const moj = s.kluby[s.mojKlub];
  if (!z?.wykup) return "Brak opcji wykupu.";
  if (moj.kasa < z.wykup.kwota) return `Brakuje ${zl(z.wykup.kwota - moj.kasa)}.`;
  moj.kasa -= z.wykup.kwota; const par = s.kluby[z.wykup.klubId]; if (par) par.kasa += z.wykup.kwota;
  z.macierzysty = undefined; z.wypozyczenieDo = undefined;
  if (z.pensjaPelna) { z.pensja = z.pensjaPelna; z.pensjaPelna = undefined; z.doplataMacierzystego = undefined; }
  z.kontraktDo = Math.max(z.kontraktDo, s.sezon + 2);
  wiad(s, `✍️ Wykupiony z wypożyczenia: ${z.imie} ${z.nazwisko} za ${zl(z.wykup.kwota)}.`);
  z.wykup = undefined;
  return null;
}
/** Obserwowani (lista życzeń). */
export function przelaczObserwowanego(s: StanGry, zId: string) {
  const l = s.obserwowani ?? [];
  s.obserwowani = l.includes(zId) ? l.filter((x) => x !== zId) : [...l, zId];
}
export { los };
