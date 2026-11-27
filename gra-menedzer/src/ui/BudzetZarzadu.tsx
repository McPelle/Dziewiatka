// Panel budżetu sezonu uzgodnionego z zarządem: wybór wariantu, limit płac vs obecne płace, rozliczenia kwartalne.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { budzetSezonu, placeTygodnia, WARIANTY, wybierzWariant, type Wariant } from "../engine/budzetZarzadu";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;
export function BudzetZarzadu({ s }: { s: StanGry }) {
  const [, setT] = useState(0);
  const b = budzetSezonu(s); const place = placeTygodnia(s);
  return (
    <View style={[st.karta, { marginBottom: 10 }]}>
      <Text style={st.naglowek}>🏛 Budżet sezonu z zarządem</Text>
      {!b.wariant && b.kwartaly.length === 0 ? (<>
        <Text style={[st.maly, { marginBottom: 6 }]}>Zarząd czeka na decyzję o budżecie (cel: {s.cel}). Do pierwszego rozliczenia kwartału możesz wybrać wariant:</Text>
        {(Object.keys(WARIANTY) as Wariant[]).map((w) => (
          <Pressable key={w} onPress={() => { s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: wybierzWariant(s, w) }); setT((x) => x + 1); }} style={[st.przyciskMaly, { alignItems: "flex-start", marginBottom: 6 }]}>
            <Text style={st.przyciskMalyTekst}>{WARIANTY[w].nazwa}</Text><Text style={[st.maly, { fontSize: 11.5 }]}>{WARIANTY[w].opis}</Text>
          </Pressable>))}
      </>) : <Text style={st.tekst}>Wariant: {WARIANTY[b.wariant ?? "zrownowazony"].nazwa}</Text>}
      <Text style={[st.tekst, { marginTop: 4, color: place > b.limitPlac * 1.1 ? K.czerwony : place > b.limitPlac ? K.akcent : K.zielony }]}>Płace: {zl(place)} / limit {zl(b.limitPlac)} tygodniowo</Text>
      <Text style={st.maly}>Budżet transferowy: {zl(b.transfery)} · zaufanie zarządu {Math.round(s.zarzad)}%</Text>
      {b.kwartaly.map((q) => <Text key={q.nr} style={[st.maly, { marginTop: 3 }]}>Q{q.nr}: {q.miejsce}. miejsce · płace {zl(q.place)} · kasa {zl(q.kasa)} — zarząd {q.ocena} ({q.zmiana >= 0 ? "+" : ""}{q.zmiana})</Text>)}
    </View>
  );
}
