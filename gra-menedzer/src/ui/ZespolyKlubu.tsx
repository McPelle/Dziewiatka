import { Alert, Platform, Pressable, Text, View } from "react-native";
import { blokadaPowolania, kandydaciZespolow, odeslijDoZespolu, powolajZZespolu } from "../engine/rezerwy";
import { jestMlodziezowcem } from "../engine/swiat";
import type { StanGry } from "../engine/types";
import { SKROT_POZ } from "../data/pozycje";
import { Herb } from "./Herb";
import { K, KOLOR_POZ, st } from "./styl";
import { nazwaLigi } from "../data/nazwyLigOficjalne";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));

/** Kadra klubu wielozespołowego: powołania zawodników z I/II/III zespołu na najbliższy mecz (zasady ZPN). */
export function ZespolyKlubu({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const grupy = kandydaciZespolow(s);
  if (!grupy.length) return null;
  const powolani = s.powolaniKlubowi ?? [];
  return (
    <View style={[st.karta, { marginHorizontal: 0, marginTop: 12 }]}>
      <Text style={st.naglowek}>🔁 Zespoły klubu — powołania na mecz</Text>
      <Text style={[st.maly, { marginBottom: 6 }]}>
        Zasady PZPN (uchwała IX/140 §4): w górę bez ograniczeń. W dół — klub z drużyną w Ekstraklasie/I/II lidze: do 22 lat bez limitu, starsi do 450 min w rundzie w wyższym zespole; klub z III ligi i niżej: kto rozegrał 2/3 meczów wyższego zespołu, nie zagra w niższym{/^Pomorskie/.test(s.sciezka ?? "") ? " (Pomorski ZPN: do 21 lat zwolnieni)" : ""}. Zasada 48 h: powołany nie zagra w tej kolejce w swoim zespole.
      </Text>
      {grupy.map(({ zespol, zawodnicy }) => (
        <View key={zespol.id} style={{ marginTop: 8 }}>
          <View style={[st.wiersz, { gap: 8 }]}>
            <Herb klub={zespol} rozmiar={22} />
            <Text style={[st.tekst, { fontWeight: "800" }]}>{zespol.nazwa}</Text>
            <Text style={st.maly}>· {nazwaLigi(s.ligi[zespol.poziom - 1]?.nazwa)}</Text>
          </View>
          {zawodnicy.slice(0, 14).map((z) => {
            const jest = powolani.includes(z.id);
            const blok = jest ? null : blokadaPowolania(s, z, s.mojKlub, powolani);
            return (
              <View key={z.id} style={[st.wiersz, { paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
                <Text style={{ color: KOLOR_POZ[z.poz], width: 34, fontWeight: "700", fontSize: 12 }}>{z.pozS ? SKROT_POZ[z.pozS] : z.poz}</Text>
                <Text style={[st.tekst, { flex: 1, fontSize: 13.5 }]} numberOfLines={1}>{z.imie[0]}. {z.nazwisko}{jestMlodziezowcem(z) ? " (U-21)" : ""}</Text>
                <Text style={{ color: K.tekst, fontWeight: "800", width: 30 }}>{Math.floor(z.umiej)}</Text>
                {jest ? (
                  <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => { odeslijDoZespolu(s, z.id); odswiez(); }}>
                    <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Odeślij</Text>
                  </Pressable>
                ) : (
                  <Pressable style={[st.przyciskMaly, { borderColor: blok ? K.szary : K.zielony, opacity: blok ? 0.5 : 1 }]} onPress={() => { const b = powolajZZespolu(s, z.id); odswiez(); if (b) komunikat(b); }}>
                    <Text style={[st.przyciskMalyTekst, { color: blok ? K.szary : K.zielony }]}>Powołaj</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
