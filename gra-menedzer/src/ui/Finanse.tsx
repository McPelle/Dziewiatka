import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { aktywniSponsorzy, bilansKolejki, ileKolejek, nazwaSponsora } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";
import { BudzetZarzadu } from "./BudzetZarzadu";

/** Centrum finansów klubu (R1): kasa, przychody/koszty na kolejkę, sponsorzy, bilety/karnety, kara PZPN, prognoza sezonu. */
export function Finanse({ s, widoczny, onClose }: { s: StanGry; widoczny: boolean; onClose: () => void }) {
  const k = s.kluby[s.mojKlub];
  if (!k) return null;
  const b = bilansKolejki(s);
  const kolejek = ileKolejek(s);
  const sponsorzy = aktywniSponsorzy(s);
  const cena = s.cenaBiletu ?? 1;
  const karnety = s.karnety ?? 0;
  const prognozaSezon = Math.round(b.bilans * kolejek);
  const wiersz = (etyk: string, wart: string, kolor = K.tekst) => (
    <View style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
      <Text style={st.tekst}>{etyk}</Text>
      <Text style={[st.tekst, { fontWeight: "800", color: kolor }]}>{wart}</Text>
    </View>
  );

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "90%", paddingBottom: 20 }}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <View style={[st.wiersz, { justifyContent: "space-between", marginBottom: 6 }]}>
              <Text style={st.tytul}>💰 Finanse</Text>
              <Pressable onPress={onClose}><Text style={{ color: K.szary, fontSize: 22 }}>✕</Text></Pressable>
            </View>

            <View style={[st.karta, { marginBottom: 10 }]}>
              <Text style={[st.maly, { marginBottom: 2 }]}>Stan konta</Text>
              <Text style={{ fontSize: 24, fontWeight: "900", color: k.kasa < 0 ? K.czerwony : K.zielony }}>{zl(k.kasa)}</Text>
              {k.karaPunktowa ? <Text style={[st.maly, { color: K.czerwony, marginTop: 4 }]}>⚖️ Kara PZPN: −{k.karaPunktowa} pkt w tym sezonie (za zadłużenie). Ureguluj finanse, by ją cofnąć.</Text> : null}
            </View>

            <BudzetZarzadu s={s} />
            <Text style={[st.naglowek, { marginTop: 4 }]}>Bilans na kolejkę</Text>
            {wiersz("Sponsorzy", `+${zl(Math.round(b.sponsor))}`, K.zielony)}
            {wiersz("Bilety (dzień meczowy)", `+${zl(Math.round(b.bilety))}`, K.zielony)}
            {wiersz("Pensje i dopłaty", `−${zl(Math.round(b.pensje))}`, K.czerwony)}
            {wiersz("Bilans", `${b.bilans >= 0 ? "+" : ""}${zl(Math.round(b.bilans))}/kolejkę`, b.bilans >= 0 ? K.zielony : K.czerwony)}
            {wiersz("Prognoza na sezon", `${prognozaSezon >= 0 ? "+" : ""}${zl(prognozaSezon)}`, prognozaSezon >= 0 ? K.zielony : K.czerwony)}

            <Text style={[st.naglowek, { marginTop: 14 }]}>Sponsorzy</Text>
            {sponsorzy.length === 0 ? <Text style={st.maly}>Brak aktywnych sponsorów.</Text> : sponsorzy.map((sp, i) => (
              <View key={i} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
                <Text style={st.tekst}>{sp.nazwa} <Text style={st.maly}>({nazwaSponsora(sp.typ)})</Text></Text>
                <Text style={[st.tekst, { fontWeight: "700" }]}>{zl(sp.wartosc)}/sezon</Text>
              </View>
            ))}

            <Text style={[st.naglowek, { marginTop: 14 }]}>Bilety i karnety</Text>
            {wiersz("Cena biletu", cena === 0.7 ? "Tani" : cena === 1.3 ? "Drożej" : cena === 1.6 ? "Premium" : "Normalny")}
            {wiersz("Karnety", karnety ? `${Math.round(karnety * 100)}% pojemności` : "Brak")}
            <Text style={[st.maly, { marginTop: 6 }]}>Ceny biletów i karnety ustawiasz w: Klub → Widok klubu → „🎟 Bilety i karnety".</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
