import { ScrollView, Text, View } from "react-native";
import { mojaLiga } from "../engine/sezon";
import type { StanGry, Wynik } from "../engine/types";
import { Herb } from "./Herb";
import { K, KOLOR_POZ, st } from "./styl";
import { nazwaLigi } from "../data/nazwyLigOficjalne";

const KOLOR_OCENY = (o: number) => (o >= 8.5 ? "#36d989" : o >= 7 ? "#ffce47" : o >= 5.5 ? "#8fb6a1" : "#ff6470");

/** Relacja z ostatniego meczu + terminarz sezonu. */
export function Terminarz({ s }: { s: StanGry }) {
  const liga = mojaLiga(s);
  const ostatni = ostatniMecz(s);

  return (
    <ScrollView style={st.ekran} contentContainerStyle={{ paddingBottom: 30 }}>
      {ostatni && <Relacja s={s} w={ostatni} />}
      <View style={st.karta}>
        <Text style={st.naglowek}>Terminarz — {nazwaLigi(liga.nazwa)}</Text>
        {liga.terminarz.map((pary, r) => {
          const para = pary.find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
          const wynik = liga.wyniki[r]?.find((w) => w.dom === s.mojKlub || w.gosc === s.mojKlub);
          if (!para) {
            return <Text key={r} style={[st.maly, { paddingVertical: 6 }]}>{r + 1}. kolejka — pauza</Text>;
          }
          const dom = s.kluby[para[0]];
          const gosc = s.kluby[para[1]];
          let kolor = K.szary;
          if (wynik) {
            const moje = wynik.dom === s.mojKlub ? wynik.gd : wynik.gg;
            const ich = wynik.dom === s.mojKlub ? wynik.gg : wynik.gd;
            kolor = moje > ich ? K.zielony : moje < ich ? K.czerwony : K.akcent;
          }
          return (
            <View key={r} style={[st.wiersz, { paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia, opacity: r === s.kolejka ? 1 : wynik ? 0.9 : 0.6 }]}>
              <Text style={[st.maly, { width: 24 }]}>{r + 1}.</Text>
              <Text numberOfLines={1} style={[st.tekst, { flex: 1, fontSize: 14, textAlign: "right" }]}>{dom.nazwa}</Text>
              <Text style={{ color: kolor, fontWeight: "800", width: 52, textAlign: "center" }}>{wynik ? `${wynik.gd}:${wynik.gg}` : r === s.kolejka ? "▶" : "–"}</Text>
              <Text numberOfLines={1} style={[st.tekst, { flex: 1, fontSize: 14 }]}>{gosc.nazwa}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function ostatniMecz(s: StanGry): Wynik | null {
  const liga = mojaLiga(s);
  for (let r = liga.wyniki.length - 1; r >= 0; r--) {
    const w = liga.wyniki[r]?.find((x) => x.dom === s.mojKlub || x.gosc === s.mojKlub);
    if (w?.zdarzenia) return w;
  }
  return null;
}

export function Relacja({ s, w }: { s: StanGry; w: Wynik }) {
  const dom = s.kluby[w.dom];
  const gosc = s.kluby[w.gosc];
  return (
    <View style={st.karta}>
      <Text style={st.naglowek}>Ostatni mecz</Text>
      <View style={[st.wiersz, { justifyContent: "space-between" }]}>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Herb klub={dom} rozmiar={44} />
          <Text numberOfLines={2} style={[st.maly, { textAlign: "center", marginTop: 4 }]}>{dom.nazwa}</Text>
        </View>
        <Text style={{ color: K.tekst, fontSize: 36, fontWeight: "900", marginHorizontal: 10 }}>{w.gd}:{w.gg}</Text>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Herb klub={gosc} rozmiar={44} />
          <Text numberOfLines={2} style={[st.maly, { textAlign: "center", marginTop: 4 }]}>{gosc.nazwa}</Text>
        </View>
      </View>
      <View style={{ marginTop: 10 }}>
        {(() => {
          // Relacja chronologiczna (minuta po minucie) z narastającym wynikiem.
          const zdarz = [...(w.zdarzenia ?? [])].filter((z) => z.typ !== "zawieszenie" && z.typ !== "karny").sort((a, b) => a.min - b.min);
          let gd = 0, gg = 0;
          return zdarz.map((z, i) => {
            const zaw = s.zawodnicy[z.zawodnikId];
            const nazw = zaw ? `${zaw.imie[0]}. ${zaw.nazwisko}` : "—";
            const lewo = z.klubId === w.dom;
            const ikona = { gol: "⚽", samoboj: "⚽", var: "📺", kontuzja: "🚑", zolta: "🟨", czerwona: "🟥", zawieszenie: "⛔", zmiana: "🔄", karny: "🎯" }[z.typ] ?? "•";
            if (z.typ === "gol" || z.typ === "samoboj") { if (lewo) gd++; else gg++; }
            const wynikTxt = z.typ === "gol" || z.typ === "samoboj" ? `  ${gd}:${gg}` : "";
            const opis = z.typ === "gol" ? `${ikona} ${nazw}${z.opis === "rzut karny" ? " (k.)" : ""}`
              : z.typ === "samoboj" ? `${ikona} ${z.opis}`
              : z.typ === "var" ? `${ikona} ${z.opis}`
              : `${ikona} ${nazw}`;
            return (
              <View key={i} style={[st.wiersz, { paddingVertical: 3 }]}>
                <Text style={[st.tekst, { flex: 1, textAlign: "right", opacity: lewo ? 1 : 0.25 }]}>{lewo ? opis : ""}</Text>
                <Text style={[st.maly, { width: 58, textAlign: "center" }]}>{z.min}'{z.typ === "gol" ? <Text style={{ color: K.akcent, fontWeight: "800" }}>{wynikTxt}</Text> : null}</Text>
                <Text style={[st.tekst, { flex: 1, opacity: lewo ? 0.25 : 1 }]}>{lewo ? "" : opis}</Text>
              </View>
            );
          });
        })()}
        {(w.zdarzenia ?? []).length === 0 && <Text style={[st.maly, { textAlign: "center" }]}>Bez bramek i kontuzji.</Text>}
        {w.kara ? <Text style={[st.maly, { textAlign: "center", marginTop: 6, color: K.czerwony }]}>Kary dyscyplinarne PZPN za kartki: −{w.kara.toLocaleString("pl")} zł</Text> : null}
      </View>
      {w.sedzia && (
        <View style={{ marginTop: 6 }}>
          <Text style={[st.maly, { textAlign: "center" }]}>🧑‍⚖️ Sędzia: {w.sedzia.glowny}{w.sedzia.fifa ? " 🌐FIFA" : ""} ({w.sedzia.styl})</Text>
          {w.sedzia.klasa && <Text style={[st.maly, { textAlign: "center", color: w.sedzia.real ? K.zielony : K.szary }]}>{w.sedzia.real ? "✓ " : ""}{w.sedzia.klasa}</Text>}
          {w.sedzia.asystenci.length > 0 && <Text style={[st.maly, { textAlign: "center" }]}>Asystenci: {w.sedzia.asystenci.join(", ")}</Text>}
          {w.sedzia.techniczny && <Text style={[st.maly, { textAlign: "center" }]}>Techniczny (4.): {w.sedzia.techniczny}</Text>}
          {w.sedzia.var && (
            <Text style={[st.maly, { textAlign: "center" }]}>
              VAR: {w.sedzia.varSedzia ?? "tak"}{w.sedzia.avar ? ` · AVAR: ${w.sedzia.avarSedzia ?? "tak"}` : ""}
            </Text>
          )}
        </View>
      )}
      {w.staty && (
        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: K.linia, paddingTop: 8 }}>
          {([
            ["Posiadanie", `${w.staty.pos[0]}%`, `${w.staty.pos[1]}%`],
            ...(w.staty.xg ? [["xG (oczek. gole)", w.staty.xg[0].toFixed(1), w.staty.xg[1].toFixed(1)] as const] : []),
            ["Strzały", w.staty.strz[0], w.staty.strz[1]],
            ["Celne", w.staty.celne[0], w.staty.celne[1]],
            ...(w.staty.obronione ? [["Obrony bramkarza", w.staty.obronione[0], w.staty.obronione[1]] as const] : []),
            ...(w.staty.slupki && (w.staty.slupki[0] || w.staty.slupki[1]) ? [["Słupki/poprzeczki", w.staty.slupki[0], w.staty.slupki[1]] as const] : []),
            ["Rożne", w.staty.rozne[0], w.staty.rozne[1]],
            ...(w.staty.spalone ? [["Spalone", w.staty.spalone[0], w.staty.spalone[1]] as const] : []),
            ...(w.staty.faule ? [["Faule", w.staty.faule[0], w.staty.faule[1]] as const] : []),
          ] as const).map(([et, a, b], i) => (
            <View key={i} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 2 }]}>
              <Text style={[st.tekst, { width: 40, textAlign: "left", fontWeight: "700" }]}>{a}</Text>
              <Text style={[st.maly, { flex: 1, textAlign: "center" }]}>{et}</Text>
              <Text style={[st.tekst, { width: 40, textAlign: "right", fontWeight: "700" }]}>{b}</Text>
            </View>
          ))}
        </View>
      )}
      <OcenyMeczu s={s} />
    </View>
  );
}

/** Oceny Twoich zawodników z ostatniego meczu (1–10) + zawodnik meczu. */
function OcenyMeczu({ s }: { s: StanGry }) {
  const oceny = (s.ostatnieOceny ?? []).filter((o) => s.zawodnicy[o.id]).sort((a, b) => b.ocena - a.ocena);
  if (!oceny.length) return null;
  const best = oceny[0];
  return (
    <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: K.linia, paddingTop: 10 }}>
      <Text style={st.naglowek}>Oceny zawodników</Text>
      {best && (
        <View style={[st.wiersz, { backgroundColor: "rgba(255,206,71,0.14)", borderRadius: 10, padding: 8, marginBottom: 6 }]}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>⭐</Text>
          <Text style={[st.tekst, { flex: 1, fontWeight: "800" }]}>Zawodnik meczu: {s.zawodnicy[best.id].imie} {s.zawodnicy[best.id].nazwisko}</Text>
          <Text style={{ color: KOLOR_OCENY(best.ocena), fontWeight: "900", fontSize: 18 }}>{best.ocena.toFixed(1)}</Text>
        </View>
      )}
      {oceny.map((o) => {
        const z = s.zawodnicy[o.id];
        return (
          <View key={o.id} style={[st.wiersz, { paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
            <Text style={{ color: KOLOR_POZ[z.poz], width: 36, fontWeight: "700", fontSize: 12 }}>{z.poz}</Text>
            <Text style={[st.tekst, { flex: 1, fontSize: 14 }]} numberOfLines={1}>{z.imie} {z.nazwisko}</Text>
            <View style={{ width: 40, height: 24, borderRadius: 6, backgroundColor: KOLOR_OCENY(o.ocena), alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#10231a", fontWeight: "900", fontSize: 13 }}>{o.ocena.toFixed(1)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
