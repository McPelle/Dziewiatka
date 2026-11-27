import { PrzejscieDnia, type DzienKarty } from "./PrzejscieDnia";
import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { KalendarzMiesiac } from "./KalendarzMiesiac";
import { zl } from "../engine/losuj";
import { dalejDzien, doMeczu, fmtData } from "../engine/dzien";
import { dataOkresu, dniRazem, kosztObozuPrzyg, nazwaDnia, OBOZY_PRZYG, pozyskajKandydata, rywaleSparingowi, skrocUrlop, testySzczebel, wybierzOboz, zaplanujSparing } from "../engine/okres";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));

/** Panel okresu przygotowawczego (lato / zima): dni, urlop (z możliwością skrócenia), obóz, sparingi, testy, kandydaci. */
export function PanelOkresu({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [rywale, setRywale] = useState(() => rywaleSparingowi(s));
  const [plan, setPlan] = useState(false);
  const o = s.okres!;
  const d = dataOkresu(s);
  const razem = dniRazem(o);
  const raport = s.raportyDni?.[0];
  const [miesiac, setMiesiac] = useState(false);
  const [przejscie, setPrzejscie] = useState<{ stary: DzienKarty; nowy: DzienKarty } | null>(null);
  const dzienSparingu = Math.max(o.dzien + 1, o.dniUrlopu + 2);
  const kand = (o.kandydaci ?? []).map((id) => s.zawodnicy[id]).filter((z) => z && !z.klubId);
  return (
    <View style={[st.karta, { borderColor: K.niebieski, borderWidth: 1 }]}>
      {przejscie && <PrzejscieDnia stary={przejscie.stary} nowy={przejscie.nowy} onKoniec={() => setPrzejscie(null)} />}
      <Text style={{ color: K.niebieski, fontWeight: "900", fontSize: 12, letterSpacing: 0.6, fontFamily: CZCIONKA }}>
        {o.rodzaj === "lato" ? "☀️ OKRES LETNI" : "❄️ PRZERWA ZIMOWA"} · {nazwaDnia(d).toUpperCase()} {fmtData(d)}
      </Text>
      <Pressable onPress={() => setMiesiac(true)} style={[st.przyciskMaly, { position: "absolute", right: 12, top: 10, paddingVertical: 6 }]}><Text style={st.przyciskMalyTekst}>📅 Miesiąc</Text></Pressable>
      <KalendarzMiesiac s={s} widoczny={miesiac} onClose={() => setMiesiac(false)} />
      <Text style={[st.tekst, { fontSize: 17, fontWeight: "900", marginTop: 2 }]}>
        {o.dzien < o.dniUrlopu ? `🏖 Urlop — dzień ${o.dzien + 1} z ${o.dniUrlopu}` : `🏃 Przygotowania — dzień ${o.dzien - o.dniUrlopu + 1} z ${o.dniPrzygotowan}`}
      </Text>
      <View style={{ height: 6, backgroundColor: K.karta2, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
        <View style={{ width: `${(o.dzien / razem) * 100}%`, height: 6, backgroundColor: K.niebieski }} />
      </View>
      <Text style={[st.maly, { marginTop: 4 }]}>Start {o.rodzaj === "lato" ? "sezonu" : "rundy wiosennej"} za {razem - o.dzien} dni.{o.skroconyUrlop ? ` Urlop skrócony o ${o.skroconyUrlop} dni.` : ""}</Text>

      {o.faza === "urlop" && o.dzien < o.dniUrlopu && (
        <View style={[st.wiersz, { gap: 6, marginTop: 8, flexWrap: "wrap" }]}>
          {[3, 7].map((n) => (
            <Pressable key={n} style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => {
              const ok = Platform.OS !== "web" || window.confirm(`Skrócić urlop o ${n} dni? Dłuższe przygotowania, ale zawodnicy będą niezadowoleni (morale ↓, zaufanie do trenera ↓).`);
              if (ok) { const b = skrocUrlop(s, n); odswiez(); if (b) komunikat(b); }
            }}>
              <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>✂ Skróć urlop o {n} dni</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={[st.naglowek, { marginTop: 12 }]}>⛺ Obóz</Text>
      {o.oboz ? (
        <Text style={st.maly}>{OBOZY_PRZYG.find((x) => x.id === o.oboz!.id)?.nazwa} — od dnia {o.oboz.od - o.dniUrlopu + 1} przygotowań, {o.oboz.dni} dni.</Text>
      ) : OBOZY_PRZYG.map((ob) => (
        <View key={ob.id} style={[st.wiersz, { paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia, gap: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[st.tekst, { fontSize: 13.5 }]}>{ob.nazwa} <Text style={st.maly}>({ob.dni} dni)</Text></Text>
            <Text style={st.maly}>{ob.opis}</Text>
          </View>
          <Pressable style={st.przyciskMaly} onPress={() => { const b = wybierzOboz(s, ob.id); odswiez(); if (b) komunikat(b); }}>
            <Text style={st.przyciskMalyTekst}>{kosztObozuPrzyg(s, ob.id) ? zl(kosztObozuPrzyg(s, ob.id)) : "za darmo"}</Text>
          </Pressable>
        </View>
      ))}

      <Text style={[st.naglowek, { marginTop: 12 }]}>🤝 Sparingi ({o.sparingi.length})</Text>
      {o.sparingi.map((sp, i) => (
        <Text key={i} style={st.maly}>• {nazwaDnia(dataOkresu(s, sp.dzien))} {fmtData(dataOkresu(s, sp.dzien))}: {sp.rywal}{sp.wynik ? ` — ${sp.wynik}` : ""}</Text>
      ))}
      <Pressable style={[st.przyciskMaly, { marginTop: 6, alignSelf: "flex-start" }]} onPress={() => { setPlan(!plan); setRywale(rywaleSparingowi(s)); }}>
        <Text style={st.przyciskMalyTekst}>{plan ? "Zamknij" : "＋ Zaplanuj sparing"} {plan ? "" : `(najbliższy wolny termin: ${fmtData(dataOkresu(s, dzienSparingu))})`}</Text>
      </Pressable>
      {plan && rywale.map((r, i) => (
        <Pressable key={i} style={[st.wiersz, { paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]} onPress={() => { const b = zaplanujSparing(s, r.nazwa, r.typ, dzienSparingu); setPlan(false); odswiez(); if (b) komunikat(b); }}>
          <Text style={{ width: 24 }}>{r.typ === "zagraniczny" ? "🌍" : r.typ === "orlik" ? "🏟" : r.typ === "test" ? "🧪" : "⚽"}</Text>
          <View style={{ flex: 1 }}><Text style={[st.tekst, { fontSize: 13.5 }]}>{r.nazwa}</Text><Text style={st.maly}>{r.opis}</Text></View>
        </Pressable>
      ))}
      {testySzczebel(s) && <Text style={[st.maly, { marginTop: 6 }]}>🧪 Zawodnicy na testach trenują i grają sparingi z drużyną — z każdym sparingiem ocena ich umiejętności jest dokładniejsza (Transfery → Testy).</Text>}

      {kand.length > 0 && (
        <>
          <Text style={[st.naglowek, { marginTop: 12 }]}>👀 Wyróżnieni do pozyskania (za darmo)</Text>
          {kand.map((z) => (
            <View key={z.id} style={[st.wiersz, { paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
              <Text style={[st.tekst, { flex: 1, fontSize: 13.5 }]}>{z.imie} {z.nazwisko} · {z.poz} · {z.wiek} l. · OVR ~{Math.floor(z.umiej)}</Text>
              <Pressable style={[st.przyciskMaly, { borderColor: K.zielony }]} onPress={() => { const b = pozyskajKandydata(s, z.id); odswiez(); komunikat(b ?? `${z.imie} ${z.nazwisko} dołącza do klubu.`); }}>
                <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>Podpisz</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}

      {raport && (
        <View style={{ marginTop: 10, backgroundColor: K.karta2, borderRadius: 10, padding: 10 }}>
          <Text style={[st.maly, { fontWeight: "800", color: K.tekst }]}>{raport.ikona} {raport.data} — {raport.tytul}</Text>
          {raport.wpisy.map((w, i) => <Text key={i} style={[st.maly, { marginTop: 3 }]}>{w}</Text>)}
        </View>
      )}
      <View style={[st.wiersz, { gap: 8, marginTop: 12 }]}>
        <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0, marginTop: 0 }]} onPress={() => {
          const urlop = (x: typeof o) => x.dzien < x.dniUrlopu;
          const stary = { data: d, nazwa: nazwaDnia(d), ikona: urlop(o) ? "🏖" : "🏃", tytul: urlop(o) ? "Urlop" : "Przygotowania" };
          dalejDzien(s); odswiez();
          if (s.okres) { const n = dataOkresu(s); setPrzejscie({ stary, nowy: { data: n, nazwa: nazwaDnia(n), ikona: urlop(s.okres) ? "🏖" : "🏃", tytul: urlop(s.okres) ? `Urlop — dzień ${s.okres.dzien + 1}` : `Przygotowania — dzień ${s.okres.dzien - s.okres.dniUrlopu + 1}` } }); }
        }}>
          <Text style={st.przyciskTekst}>Dalej ›</Text>
        </Pressable>
        <Pressable style={[st.przyciskMaly, { justifyContent: "center", borderColor: K.niebieski }]} onPress={() => {
          if (o.dzien < o.dniUrlopu) { let g = 0; while (s.okres && s.okres.dzien < s.okres.dniUrlopu && g++ < 200) dalejDzien(s); }
          else doMeczu(s);
          odswiez();
        }}>
          <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>{o.dzien < o.dniUrlopu ? "⏩ Koniec urlopu" : "⏩ Do startu rozgrywek"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
