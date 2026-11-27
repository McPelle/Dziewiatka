import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { nazwaSponsora, ofertySponsorow, podpiszSponsora } from "../engine/sezon";
import type { Sponsor, SponsorTyp, StanGry } from "../engine/types";
import { LogoMarki } from "./LogoMarki";
import { K, st } from "./styl";

const ROLE: SponsorTyp[] = ["glowny", "techniczny", "stadionowy", "producent"];

export function Sponsorzy({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [otwarty, setOtwarty] = useState<SponsorTyp | null>(null);
  const [oferty, setOferty] = useState<Sponsor[]>([]);

  const pokazOferty = (typ: SponsorTyp) => {
    if (otwarty === typ) { setOtwarty(null); return; }
    setOferty(ofertySponsorow(s, typ));
    setOtwarty(typ);
  };

  return (
    <View style={{ marginTop: 6 }}>
      <Text style={st.naglowek}>Sponsorzy i kontrakty</Text>
      {ROLE.map((typ) => {
        const sp = s.sponsorzy.find((x) => x.typ === typ);
        const wazny = sp && sp.sezonDo >= s.sezon;
        return (
          <View key={typ} style={{ borderTopWidth: 1, borderTopColor: K.linia, paddingVertical: 6 }}>
            <View style={[st.wiersz, { justifyContent: "space-between" }]}>
              <View style={[st.wiersz, { flex: 1, gap: 8 }]}>
                {wazny && <LogoMarki nazwa={sp!.nazwa} rozmiar={28} />}
                <View style={{ flex: 1 }}>
                  <Text style={st.maly}>{nazwaSponsora(typ)}</Text>
                  <Text style={st.tekst}>
                    {wazny ? `${sp!.nazwa} · ${zl(sp!.wartosc)}/sezon · do ${sp!.sezonDo}` : <Text style={{ color: K.czerwony }}>brak / wygasł</Text>}
                  </Text>
                </View>
              </View>
              <Pressable style={[st.przyciskMaly, otwarty === typ && { borderColor: K.akcent }]} onPress={() => pokazOferty(typ)}>
                <Text style={[st.przyciskMalyTekst, otwarty === typ && { color: K.akcent }]}>{wazny ? "Zmień" : "Podpisz"}</Text>
              </Pressable>
            </View>
            {otwarty === typ && (
              <View style={{ marginTop: 6 }}>
                {oferty.map((o, i) => (
                  <View key={i} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 4 }]}>
                    <View style={[st.wiersz, { gap: 6, flex: 1 }]}><LogoMarki nazwa={o.nazwa} rozmiar={20} /><Text style={st.maly}>{o.nazwa} — {zl(o.wartosc)}/sezon, {o.sezonDo - s.sezon} sez.</Text></View>
                    <Pressable style={st.przyciskMaly} onPress={() => { const b = podpiszSponsora(s, o); setOtwarty(null); odswiez(); if (b && typeof window !== "undefined") window.alert(b); }}>
                      <Text style={st.przyciskMalyTekst}>Podpisz</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
      <Text style={[st.maly, { marginTop: 4 }]}>Aktywni sponsorzy są na strojach i dają przychód. Gdy kontrakt wygaśnie, sponsor znika — podpisz nowego.</Text>
    </View>
  );
}
