// Historia transferów klubu (każdy klub: Ekstraklasa → klasa B): przyszli / odeszli w wybranym sezonie,
// skąd i dokąd, na jakich zasadach (kupno, wolny, wypożyczenie, powrót, klauzula, Bosman, akademia…), kwoty i bilans.
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { IKONA_TYPU, ileTransferow, OPIS_TYPU, sezonyTransferow, transferyKlubu, type TypTransferu, type WpisTransferu } from "../engine/rejestrTransferow";
import type { Klub, StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { K, st } from "./styl";

type Filtr = "wszystko" | "definitywne" | "wypozyczenia" | "wolne";
const FILTRY: [Filtr, string][] = [["wszystko", "Wszystkie"], ["definitywne", "💰 Kupno/sprzedaż"], ["wypozyczenia", "🔁 Wypożyczenia"], ["wolne", "🆓 Wolne / akademia"]];
const pasuje = (f: Filtr, t: TypTransferu) =>
  f === "wszystko" ? true
    : f === "definitywne" ? t === "kupno" || t === "klauzula" || t === "ekwiwalent"
      : f === "wypozyczenia" ? t === "wypozyczenie" || t === "powrot"
        : !["kupno", "klauzula", "ekwiwalent", "wypozyczenie", "powrot"].includes(t);

export function HistoriaTransferow({ s, klub, onZawodnik }: { s: StanGry; klub: Klub; onZawodnik?: (id: string) => void }) {
  const sezony = useMemo(() => { const x = sezonyTransferow(s, klub.nazwa); return x.length ? x : [s.sezon]; }, [s, klub.nazwa, ileTransferow(s)]);
  const [sezon, setSezon] = useState<number>(sezony[0]);
  const [okno, setOkno] = useState<"oba" | "L" | "Z">("oba");
  const [filtr, setFiltr] = useState<Filtr>("wszystko");
  const { przyszli, odeszli } = transferyKlubu(s, klub.nazwa, sezon);
  const f = (l: WpisTransferu[]) => l.filter((x) => (okno === "oba" || x.o === okno) && pasuje(filtr, x.t));
  const P = f(przyszli), O = f(odeszli);
  const wydane = przyszli.reduce((a, x) => a + (x.k ?? 0), 0);
  const zarobione = odeszli.reduce((a, x) => a + (x.k ?? 0), 0);
  const klubPo = (nazwa?: string) => (nazwa ? Object.values(s.kluby).find((k) => k.nazwa === nazwa) : undefined);
  const etykieta = `${sezon}/${String((sezon + 1) % 100).padStart(2, "0")}`;

  const Wiersz = ({ w, kierunek }: { w: WpisTransferu; kierunek: "in" | "out" }) => {
    const inny = kierunek === "in" ? w.od : w.do;
    const kInny = klubPo(inny);
    const zaw = s.zawodnicy[w.z];
    return (
      <Pressable disabled={!zaw || !onZawodnik} onPress={() => zaw && onZawodnik?.(w.z)} style={[st.wiersz, { paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia, gap: 8 }]}>
        <Text style={{ fontSize: 16, width: 22, textAlign: "center" }}>{IKONA_TYPU[w.t]}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[st.tekst, { fontSize: 13.5, fontWeight: "700" }]} numberOfLines={1}>{w.n} <Text style={st.maly}>· {w.p} · {w.w} l. · OVR {w.u}</Text></Text>
          <View style={[st.wiersz, { gap: 5, marginTop: 1 }]}>
            {kInny ? <Herb klub={kInny} rozmiar={14} /> : null}
            <Text style={st.maly} numberOfLines={1}>
              {kierunek === "in" ? (inny ? `z: ${inny}` : w.t === "akademia" ? "z: własna akademia" : w.t === "nowy" ? "z: niższe ligi / bez klubu" : "z: bez klubu") : (inny ? `do: ${inny}` : "do: bez klubu")}
              {" · "}{OPIS_TYPU[w.t]}{w.d ? ` · ${w.o === "Z" ? "zima" : "lato"}, ${w.d}` : ""}
            </Text>
          </View>
        </View>
        <Text style={{ color: w.k ? (kierunek === "in" ? K.czerwony : K.zielony) : K.szary, fontWeight: "800", fontSize: 12.5, minWidth: 64, textAlign: "right" }}>
          {w.k ? `${kierunek === "in" ? "−" : "+"}${zl(w.k)}` : ["wolny", "bosman", "koniec", "umowaWstepna", "akademia", "testy", "wyroznienie", "skauting", "nowy", "rozwiazanie"].includes(w.t) ? "0 zł" : "—"}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={st.naglowek}>🔄 Transfery {klub.nazwa}</Text>
      <Text style={st.maly}>Wszystkie ruchy kadrowe w sezonie: kto przyszedł i skąd, kto odszedł i dokąd, na jakich zasadach i za ile.</Text>
      <View style={[st.wiersz, { flexWrap: "wrap", gap: 6, marginTop: 8 }]}>
        {sezony.map((x) => (
          <Pressable key={x} onPress={() => setSezon(x)} style={[st.chip, x === sezon && st.chipAktywny]}>
            <Text style={{ color: x === sezon ? "#17310f" : K.tekst, fontWeight: "700", fontSize: 12.5 }}>{x}/{String((x + 1) % 100).padStart(2, "0")}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[st.wiersz, { flexWrap: "wrap", gap: 6, marginTop: 6 }]}>
        {([["oba", "Oba okna"], ["L", "☀️ Lato"], ["Z", "❄️ Zima"]] as const).map(([id, n]) => (
          <Pressable key={id} onPress={() => setOkno(id)} style={[st.chip, okno === id && st.chipAktywny]}><Text style={{ color: okno === id ? "#17310f" : K.tekst, fontWeight: "700", fontSize: 12 }}>{n}</Text></Pressable>
        ))}
        {FILTRY.map(([id, n]) => (
          <Pressable key={id} onPress={() => setFiltr(id)} style={[st.chip, filtr === id && st.chipAktywny]}><Text style={{ color: filtr === id ? "#17310f" : K.tekst, fontWeight: "700", fontSize: 12 }}>{n}</Text></Pressable>
        ))}
      </View>

      <View style={[st.karta, { marginHorizontal: 0, marginTop: 8 }]}>
        <Text style={[st.maly, { fontWeight: "800", color: K.tekst }]}>Bilans {etykieta}: przyszło {przyszli.length} · odeszło {odeszli.length}</Text>
        <Text style={st.maly}>Wydatki na transfery: <Text style={{ color: K.czerwony, fontWeight: "800" }}>{zl(wydane)}</Text> · wpływy: <Text style={{ color: K.zielony, fontWeight: "800" }}>{zl(zarobione)}</Text> · saldo: <Text style={{ color: zarobione - wydane >= 0 ? K.zielony : K.czerwony, fontWeight: "800" }}>{zarobione - wydane >= 0 ? "+" : "−"}{zl(Math.abs(zarobione - wydane))}</Text></Text>
        {[...przyszli, ...odeszli].some((x) => x.t === "transfer") && <Text style={st.maly}>➡️ Prawdziwe transfery z okna przed startem gry — kwoty nieujawnione (w bilansie liczone są tylko transfery z Twojej kariery).</Text>}
        <Text style={st.maly}>Wypożyczeni: do klubu {przyszli.filter((x) => x.t === "wypozyczenie").length} · z klubu {odeszli.filter((x) => x.t === "wypozyczenie").length} · wychowankowie z akademii: {przyszli.filter((x) => x.t === "akademia").length}</Text>
      </View>

      <Text style={[st.maly, { color: K.zielony, fontWeight: "800", marginTop: 10, letterSpacing: 0.5 }]}>⬇ PRZYSZLI ({P.length})</Text>
      {P.length ? P.map((w, i) => <Wiersz key={`p${i}`} w={w} kierunek="in" />) : <Text style={[st.maly, { marginTop: 4 }]}>Brak przyjść w tym okresie.</Text>}
      <Text style={[st.maly, { color: K.czerwony, fontWeight: "800", marginTop: 12, letterSpacing: 0.5 }]}>⬆ ODESZLI ({O.length})</Text>
      {O.length ? O.map((w, i) => <Wiersz key={`o${i}`} w={w} kierunek="out" />) : <Text style={[st.maly, { marginTop: 4 }]}>Brak odejść w tym okresie.</Text>}
      {!ileTransferow(s) && <Text style={[st.maly, { marginTop: 8 }]}>Historia transferów jest zapisywana od tej wersji gry — pierwsze wpisy pojawią się przy najbliższych ruchach kadrowych.</Text>}
    </View>
  );
}
