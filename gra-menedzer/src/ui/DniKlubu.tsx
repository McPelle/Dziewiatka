// Panel „Dni klubu”: festyn, dzień otwarty, turniej dla dzieci (raz na rundę).
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ileKolejek } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { DNI_KLUBU, moznaDzienKlubu, organizujDzienKlubu, type DzienKlubu } from "../engine/wydarzeniaKlubu";
import { dzwiekUI } from "./muzyka";
import { K, st } from "./styl";

export function DniKlubu({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [info, setInfo] = useState<string | null>(null);
  const n = ileKolejek(s); const mozna = moznaDzienKlubu(s, n);
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Text style={st.naglowek}>🎪 Dni klubu</Text>
      <Text style={[st.maly, { marginBottom: 6 }]}>{mozna ? "Raz na rundę możesz zorganizować wydarzenie dla społeczności — przychód i zaufanie kibiców." : "W tej rundzie wydarzenie już się odbyło — kolejne w następnej rundzie."}</Text>
      {(Object.keys(DNI_KLUBU) as DzienKlubu[]).map((t) => (
        <Pressable key={t} disabled={!mozna} onPress={() => { const m = organizujDzienKlubu(s, t, n); setInfo(m); s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: m }); dzwiekUI("kasa"); odswiez(); }} style={[st.przyciskMaly, { alignItems: "flex-start", marginBottom: 6, opacity: mozna ? 1 : 0.45 }]}>
          <Text style={st.przyciskMalyTekst}>{DNI_KLUBU[t].ikona} {DNI_KLUBU[t].nazwa}</Text>
          <Text style={[st.maly, { fontSize: 11.5 }]}>{DNI_KLUBU[t].opis}</Text>
        </Pressable>))}
      {info && <Text style={[st.tekst, { color: K.akcent, marginTop: 4 }]}>{info}</Text>}
    </View>
  );
}
