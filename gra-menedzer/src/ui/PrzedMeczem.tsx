// Przed meczem (dla chętnych — każdy etap można zasymulować):
// 1) szatnia: przebranie z dresów w stroje meczowe, rozmowy zawodników, kitman, asystent; wybór strojów,
// 2) rozgrzewka 3D na boisku (obie drużyny, sztab, kibice się schodzą) z wyborem intensywności,
// 3) ostatnie słowa w szatni: mowa trenera i reakcje zawodników — potem wyjście z tunelu.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import type { MeczLive } from "../engine/meczNaZywo";
import { MOWY_PRZED, mowaPrzedMeczem, ROZGRZEWKI, rozmowySzatni, zastosujRozgrzewke, type Kwestia, type MowaPrzed, type Rozgrzewka } from "../engine/przedmecz";
import type { StanGry } from "../engine/types";
import { NAZWA_JEZYKA, wypowiedz, wypowiedzTrenera, type Wypowiedz } from "../engine/jezyki";
import { trenerKlubu } from "../data/trenerzy";
import type { StrojeMeczu } from "./strojeDane";
import { CZCIONKA, K, st } from "./styl";
import { Szatnia3D } from "./three/Szatnia3D";
import { Cwiczenia3D, type Cwiczenie } from "./three/Cwiczenia3D";
import { grafika3D } from "./three/Stadion3DWidok";
import { mow, plecZImienia, zamilknij } from "./three/glos";
import { gwizdek } from "./three/dzwiek";
import type { Ustawienia3D } from "./three/Mecz3D";
import { liczySieJakoMlodziezowiec, wymogMlodziezowca } from "../engine/swiat";

type Etap = "start" | "szatnia" | "rozgrzewka" | "mowa";
const PLAN_ROZGRZEWKI: Cwiczenie[] = ["rozruch", "rozciaganie", "dziadek", "podania", "sprinty", "strzaly"];

/** Wybór mowy przez asystenta (gdy przedmecz symulowany). */
function mowaAsystenta(s: StanGry, m: MeczLive, derby: boolean): MowaPrzed {
  const ja = s.kluby[m.moja === "dom" ? m.dom.klubId : m.gosc.klubId], on = s.kluby[m.moja === "dom" ? m.gosc.klubId : m.dom.klubId];
  const r = (ja.renoma ?? 0.5) - (on.renoma ?? 0.5);
  return derby && m.moja === "dom" ? "kibice" : r < -0.12 ? "motywacja" : r > 0.12 ? "spokoj" : "taktyka";
}

export function PrzedMeczem({ s, m, stroje, ust, wyborStrojow, onGotowe }: { s: StanGry; m: MeczLive; stroje: StrojeMeczu; ust: Ustawienia3D; wyborStrojow: ReactNode; onGotowe: () => void }) {
  const [etap, setEtap] = useState<Etap>("start");
  const [rozg, setRozg] = useState<Rozgrzewka>("normalna");
  const [wpisy, setWpisy] = useState<string[]>([]);
  const [kwestie, setKwestie] = useState<Kwestia[]>([]);
  const [ile, setIle] = useState(0); // ile kwestii już padło
  const [mowiTrener, setMowiTrener] = useState(false);
  const [nastroj, setNastroj] = useState(0);
  const [mowa, setMowa] = useState<MowaPrzed | null>(null);
  const [cwT, setCwT] = useState(0);
  const timer = useRef<any>(null);
  const moja = m.moja, mojZ = moja === "dom" ? m.dom : m.gosc, ich = moja === "dom" ? m.gosc : m.dom;
  const klub = s.kluby[mojZ.klubId], gospodarz = s.kluby[m.dom.klubId];
  const kit = stroje[moja].pole, kitBr = stroje[moja].br;
  const trener = s.trener ?? "Trener";
  const g3 = Platform.OS === "web" && grafika3D();
  /** Jak to powie konkretna osoba (cudzoziemiec — w swoim języku albo łamanym polskim). */
  const wyp = (q: Kwestia): Wypowiedz => s.zawodnicy[q.id] && !q.tekst.startsWith("(") ? wypowiedz(s, s.zawodnicy[q.id], q.tekst, { kat: q.kat }) : { tekst: q.tekst, glos: "pl-PL", jezyk: "pl", poziom: "plynny" };
  const kto = (id: string) => id === "kitman" ? "Kierownik drużyny (kitman)" : id === "asystent" ? "Asystent trenera" : id === "trener" ? trener : `${s.zawodnicy[id]?.numer ?? ""} ${s.zawodnicy[id]?.nazwisko ?? ""}`;

  // kolejne kwestie co ~3,4 s (z głosem — każdy zawodnik ma swój)
  useEffect(() => {
    if (ile >= kwestie.length) return;
    const q = kwestie[ile], w = wyp(q);
    if (!q.tekst.startsWith("(")) mow(w.tekst, q.id === "trener" ? "trener" : "zawodnik", { kto: q.id === "trener" ? trener : q.id, plec: q.id === "trener" ? plecZImienia(trener) : "M", przerwij: true, jezyk: w.glos });
    timer.current = setTimeout(() => setIle((i) => i + 1), 3400);
    return () => clearTimeout(timer.current);
  }, [ile, kwestie]);
  useEffect(() => () => { zamilknij(); clearTimeout(timer.current); }, []);
  // rozgrzewka: zmiana ćwiczeń co ~12 s
  useEffect(() => { if (etap !== "rozgrzewka") return; const t = setInterval(() => setCwT((v) => v + 1), 12000); return () => clearInterval(t); }, [etap]);

  const mowiId = ile < kwestie.length ? kwestie[ile].id : null;
  const doSzatni = () => { setEtap("szatnia"); setKwestie(rozmowySzatni(s, m, "przebranie", { derby: ust.derby, deszcz: ust.pogoda === "deszcz" })); setIle(0); };
  const naRozgrzewke = () => { zamilknij(); setKwestie([]); setIle(0); setEtap("rozgrzewka"); gwizdek(); };
  const poRozgrzewce = (r: Rozgrzewka) => { const w = zastosujRozgrzewke(s, m, r); setWpisy(w); zamilknij(); setEtap("mowa"); setKwestie(rozmowySzatni(s, m, "wyjscie")); setIle(0); };
  const powiedzMowe = (t: MowaPrzed) => {
    const r = mowaPrzedMeczem(s, m, t, { derby: ust.derby }); setMowa(t); s.osiagnieciaFlagi = { ...(s.osiagnieciaFlagi ?? {}), mowa: true };
    setMowiTrener(true); mow(r.tekst, "trener", { kto: trener, plec: plecZImienia(trener), przerwij: true });
    setWpisy((w) => [`🗣 ${r.opis}`, ...w]);
    setTimeout(() => { setMowiTrener(false); setNastroj(Math.max(-1, Math.min(1, r.efekt * 20))); setKwestie([{ id: "trener", tekst: r.tekst }, ...r.reakcje]); setIle(1); }, Math.min(9000, 1500 + r.tekst.length * 55));
  };
  const symulujWszystko = () => { zastosujRozgrzewke(s, m, "normalna"); mowaPrzedMeczem(s, m, mowaAsystenta(s, m, !!ust.derby), { derby: ust.derby }); koniec(); };
  const koniec = () => { zamilknij(); m.przedmecz = { ...(m.przedmecz ?? {}), gotowe: true }; onGotowe(); };

  const Dymki = () => (
    <View style={[st.karta, { marginHorizontal: 0, marginTop: 8 }]}>
      {kwestie.slice(0, ile + 1).filter((_, i) => i < kwestie.length).slice(-5).map((q, i, arr) => (
        (() => { const w = wyp(q); return (
        <View key={i} style={{ marginVertical: 2 }}>
          <Text style={[st.tekst, { fontSize: 13, color: i === arr.length - 1 && ile < kwestie.length ? K.tekst : K.szary }]}>
            <Text style={{ color: q.id === "trener" ? K.akcent : K.niebieski, fontWeight: "800" }}>{kto(q.id)}{w.jezyk !== "pl" ? ` (${w.poziom === "podstawy" ? "łamanym polskim" : NAZWA_JEZYKA[w.jezyk]})` : ""}: </Text>{q.tekst.startsWith("(") ? <Text style={{ fontStyle: "italic" }}>{q.tekst}</Text> : `„${w.tekst}”`}
          </Text>
          {w.tlumaczenie && <Text style={[st.maly, { fontSize: 11.5, marginLeft: 10, fontStyle: "italic" }]}>↳ {w.poziom === "podstawy" ? "chodzi mu o to" : w.tlumaczNazwa ? `tłumaczy ${w.tlumaczNazwa}` : "tłumaczenie"}: „{w.tlumaczenie}”</Text>}
        </View>); })()))}
      {!kwestie.length && <Text style={st.maly}>W szatni cisza — skupienie przed meczem.</Text>}
    </View>
  );

  if (etap === "start") return (
    <View>
      <View style={[st.karta, { marginHorizontal: 0 }]}>
        <Text style={[st.tytul, { fontSize: 18 }]}>⏳ Przed meczem</Text>
        <Text style={[st.maly, { marginTop: 4 }]}>{gospodarz.stadion ?? `Stadion w ${gospodarz.miasto}`} · początek {ust.godz ?? ""}. Możesz być przy wszystkim albo zostawić to sztabowi.</Text>
        <Text style={[st.tekst, { marginTop: 8 }]}>👕 1. Szatnia: przebranie, rozmowy, wybór strojów</Text>
        <Text style={st.tekst}>🏃 2. Rozgrzewka na boisku (3D)</Text>
        <Text style={st.tekst}>🗣 3. Ostatnie słowa trenera przed wyjściem</Text>
      </View>
      {(() => { // przepis PZPN o młodzieżowcu: brak U-21 w jedenastce = walkower 0:3 po meczu
        const wym = m.puchar ? 0 : wymogMlodziezowca(klub.poziom, s.sciezka, s.ligi[klub.poziom - 1]?.nazwa); const ma = mojZ.start.filter((id) => s.zawodnicy[id] && liczySieJakoMlodziezowiec(s.zawodnicy[id], klub.poziom, s.sciezka)).length;
        if (!wym || ma >= wym) return null;
        return (
          <View style={[st.karta, { marginHorizontal: 0, borderColor: K.czerwony, borderWidth: 2 }]}>
            <Text style={[st.tekst, { color: K.czerwony, fontWeight: "900" }]}>⚠ Brak młodzieżowca w jedenastce: {ma}/{wym}</Text>
            <Text style={[st.maly, { marginTop: 4 }]}>Przepis PZPN: na tym szczeblu na boisku przez cały mecz musi być {wym} młodzieżowiec(ów) (rocznik 2006 i młodsi). Bez tego mecz zostanie zweryfikowany jako walkower 0:3. Popraw skład w zakładce „Skład” przed rozpoczęciem.</Text>
          </View>
        ); })()}
      {(() => { const ryw = s.kluby[ich.klubId]; if (!ryw.trenerNazwisko) return null; const w = wypowiedzTrenera(ryw.trenerKraj, ryw.trenerPolski, Math.random() < 0.5 ? "szacunek" : "wygrac"); return (
        <View style={[st.karta, { marginHorizontal: 0 }]}>
          <Text style={st.naglowek}>🎙 Trener rywala przed meczem</Text>
          <Text style={st.tekst}><Text style={{ color: K.niebieski, fontWeight: "800" }}>{trenerKlubu(ryw)}{w.jezyk !== "pl" ? ` (${w.poziom === "podstawy" ? "łamanym polskim" : NAZWA_JEZYKA[w.jezyk]})` : ""}: </Text>„{w.tekst}”</Text>
          {w.tlumaczenie && <Text style={[st.maly, { fontStyle: "italic", marginTop: 2 }]}>↳ {w.tlumacz ? "tłumacz" : "chodzi mu o to"}: „{w.tlumaczenie}”</Text>}
        </View>); })()}
      <Pressable style={st.przycisk} onPress={doSzatni}><Text style={st.przyciskTekst}>▶ Idę do szatni</Text></Pressable>
      <Pressable style={[st.przycisk, { backgroundColor: "transparent", borderWidth: 1, borderColor: K.linia }]} onPress={symulujWszystko}><Text style={[st.przyciskTekst, { color: K.tekst }]}>⏩ Zasymuluj przedmecz (prowadzi asystent)</Text></Pressable>
      {wyborStrojow}
    </View>
  );

  if (etap === "szatnia") return (
    <View>
      <Text style={[st.naglowek]}>👕 Szatnia — przebranie i rozmowy</Text>
      {g3 && <Szatnia3D s={s} klub={klub} zawodnicy={[...mojZ.naBoisku, ...mojZ.lawka]} kit={kit} kitBr={kitBr} nastroj={0.1} mowi={false} przed mowiId={mowiId} />}
      <Dymki />
      <View style={[st.wiersz, { gap: 8 }]}>
        <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0 }]} onPress={naRozgrzewke}><Text style={st.przyciskTekst}>🏃 Na rozgrzewkę ›</Text></Pressable>
        <Pressable style={[st.przyciskMaly, { justifyContent: "center" }]} onPress={() => poRozgrzewce("normalna")}><Text style={st.przyciskMalyTekst}>⏩ Rozgrzewka bez Ciebie</Text></Pressable>
      </View>
      {wyborStrojow}
    </View>
  );

  if (etap === "rozgrzewka") return (
    <View>
      <Text style={st.naglowek}>🏃 Rozgrzewka — {ROZGRZEWKI[rozg].nazwa.toLowerCase()} · kibice się schodzą</Text>
      {g3 ? (
        <Cwiczenia3D s={s} klub={gospodarz} widzowie={Math.round(ust.widzowie * 0.45)} noc={ust.noc} pogoda={ust.pogoda} tempo={rozg === "lekka" ? 0.75 : rozg === "intensywna" ? 1.35 : 1}
          grupy={[
            { ids: [...mojZ.naBoisku, ...mojZ.lawka.slice(0, 5)], kit, kitBr, strona: moja === "dom" ? -1 : 1, cwiczenie: PLAN_ROZGRZEWKI[cwT % PLAN_ROZGRZEWKI.length] },
            { ids: [...ich.naBoisku, ...ich.lawka.slice(0, 5)], kit: stroje[moja === "dom" ? "gosc" : "dom"].pole, kitBr: stroje[moja === "dom" ? "gosc" : "dom"].br, strona: moja === "dom" ? 1 : -1, cwiczenie: PLAN_ROZGRZEWKI[(cwT + 2) % PLAN_ROZGRZEWKI.length] },
          ]} />
      ) : <View style={[st.karta, { marginHorizontal: 0 }]}><Text style={st.tekst}>Drużyna rozgrzewa się na boisku…</Text></View>}
      <Text style={[st.maly, { marginTop: 6 }]}>Teraz: {["rozruch", "rozciąganie", "dziadek", "podania w parach", "sprinty", "strzały na bramkarza"][cwT % 6]} · rywal rozgrzewa się na drugiej połowie</Text>
      <Text style={[st.naglowek, { marginTop: 8 }]}>Intensywność rozgrzewki</Text>
      {(Object.keys(ROZGRZEWKI) as Rozgrzewka[]).map((r) => (
        <Pressable key={r} onPress={() => setRozg(r)} style={[st.karta, { marginHorizontal: 0, marginVertical: 3, borderColor: rozg === r ? K.akcent : K.linia, borderWidth: 1 }]}>
          <Text style={[st.tekst, { fontWeight: "800", color: rozg === r ? K.akcent : K.tekst }]}>{ROZGRZEWKI[r].ikona} {ROZGRZEWKI[r].nazwa}</Text>
          <Text style={st.maly}>{ROZGRZEWKI[r].opis}</Text>
        </Pressable>))}
      <Pressable style={st.przycisk} onPress={() => poRozgrzewce(rozg)}><Text style={st.przyciskTekst}>🚪 Koniec rozgrzewki — do szatni ›</Text></Pressable>
    </View>
  );

  // etap „mowa"
  return (
    <View>
      <Text style={st.naglowek}>🗣 Szatnia — ostatnie minuty przed wyjściem</Text>
      {g3 && <Szatnia3D s={s} klub={klub} zawodnicy={[...mojZ.naBoisku, ...mojZ.lawka]} kit={kit} kitBr={kitBr} nastroj={nastroj} mowi={mowiTrener} mowiId={mowiId === "trener" ? null : mowiId} />}
      {wpisy.map((w, i) => <Text key={i} style={[st.maly, { marginTop: 4, color: w.startsWith("🚑") ? K.czerwony : K.tekst }]}>{w}</Text>)}
      <Dymki />
      {!mowa ? (<>
        <Text style={[st.naglowek, { marginTop: 6 }]}>Twoja mowa do drużyny</Text>
        {(Object.keys(MOWY_PRZED) as MowaPrzed[]).map((t) => (
          <Pressable key={t} onPress={() => powiedzMowe(t)} style={[st.karta, { marginHorizontal: 0, marginVertical: 3 }]}>
            <Text style={[st.tekst, { fontWeight: "800" }]}>{MOWY_PRZED[t].ikona} {MOWY_PRZED[t].nazwa}</Text>
            <Text style={st.maly}>{MOWY_PRZED[t].opis}</Text>
          </Pressable>))}
        <Pressable onPress={() => { mowaPrzedMeczem(s, m, mowaAsystenta(s, m, !!ust.derby), { derby: ust.derby }); koniec(); }} style={{ alignItems: "center", marginTop: 6 }}><Text style={[st.maly, { color: K.niebieski }]}>⏩ Niech mówi asystent i wychodzimy</Text></Pressable>
      </>) : (
        <Pressable style={st.przycisk} onPress={koniec}><Text style={[st.przyciskTekst, { fontFamily: CZCIONKA }]}>🚶 Do tunelu ›</Text></Pressable>
      )}
    </View>
  );
}
