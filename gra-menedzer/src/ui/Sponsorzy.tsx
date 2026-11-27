import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import {
  blokadaSlotu, karaZaZerwanie, nazwaSponsora, ofertySponsorow, podpiszSponsora, przychodSponsorow, SPONSOR_GRUPY, umowaSponsora, zerwijSponsora,
} from "../engine/sezon";
import type { Sponsor, SponsorTyp, StanGry } from "../engine/types";
import { LogoMarki } from "./LogoMarki";
import { K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
const potwierdz = (t: string, ok: () => void) => {
  if (Platform.OS === "web") { if (window.confirm(t)) ok(); }
  else Alert.alert("Potwierdź", t, [{ text: "Anuluj", style: "cancel" }, { text: "Tak", onPress: ok }]);
};

export function Sponsorzy({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [otwarty, setOtwarty] = useState<SponsorTyp | null>(null);
  const [oferty, setOferty] = useState<Sponsor[]>([]);
  const klub = s.kluby[s.mojKlub];
  const wszystkie = SPONSOR_GRUPY.flatMap((g) => g.typy);
  const aktywne = wszystkie.filter((t) => umowaSponsora(s, t)).length;

  const pokazOferty = (typ: SponsorTyp) => {
    if (otwarty === typ) { setOtwarty(null); return; }
    setOferty(ofertySponsorow(s, typ));
    setOtwarty(typ);
  };
  const podpisz = (o: Sponsor) => {
    const kara = karaZaZerwanie(s, o.typ);
    const dalej = () => { const b = podpiszSponsora(s, o); setOtwarty(null); odswiez(); if (b) komunikat(b); };
    if (kara > 0) {
      const obecny = umowaSponsora(s, o.typ)!;
      potwierdz(`Umowa z ${obecny.nazwa} trwa do ${obecny.sezonDo}. Zerwanie przed terminem = kara umowna ${zl(kara)}.\n\nZapłacić karę i podpisać ${o.nazwa} (${zl(o.wartosc)}/sezon)?`, dalej);
    } else dalej();
  };
  const zerwij = (typ: SponsorTyp) => {
    const u = umowaSponsora(s, typ)!;
    potwierdz(`Zerwać umowę z ${u.nazwa}? Kara umowna: ${zl(karaZaZerwanie(s, typ))}.`, () => { const b = zerwijSponsora(s, typ); odswiez(); if (b) komunikat(b); });
  };

  return (
    <View style={{ marginTop: 6 }}>
      <Text style={st.naglowek}>🤝 Sponsorzy i partnerzy</Text>
      <Text style={st.maly}>Aktywne umowy: {aktywne}/{wszystkie.length} · razem {zl(przychodSponsorow(s))}/sezon</Text>
      {SPONSOR_GRUPY.map((g) => (
        <View key={g.nazwa} style={{ marginTop: 10 }}>
          <Text style={[st.maly, { color: K.akcent, fontWeight: "800", letterSpacing: 0.5 }]}>{g.nazwa.toUpperCase()}</Text>
          {g.typy.map((typ) => {
            const sp = umowaSponsora(s, typ);
            const blok = blokadaSlotu(klub, typ);
            const kara = karaZaZerwanie(s, typ);
            return (
              <View key={typ} style={{ borderTopWidth: 1, borderTopColor: K.linia, paddingVertical: 7 }}>
                <View style={[st.wiersz, { justifyContent: "space-between", gap: 8 }]}>
                  <View style={[st.wiersz, { flex: 1, gap: 8 }]}>
                    {sp ? <LogoMarki nazwa={sp.nazwa} rozmiar={28} /> : <View style={{ width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: K.linia, borderStyle: "dashed" }} />}
                    <View style={{ flex: 1 }}>
                      <Text style={st.maly}>{nazwaSponsora(typ)}{sp?.patron ? " · patron" : ""}</Text>
                      {sp ? (
                        <Text style={st.tekst}>{sp.nazwa} <Text style={st.maly}>· {zl(sp.wartosc)}/sezon · do {sp.sezonDo}</Text></Text>
                      ) : blok ? (
                        <Text style={[st.maly, { color: K.szary }]}>🔒 {blok}</Text>
                      ) : (
                        <Text style={{ color: K.czerwony }}>wolne miejsce — podpisz partnera</Text>
                      )}
                      {sp ? <Text style={[st.maly, { fontSize: 10 }]}>Zerwanie przed terminem: kara {zl(kara)}</Text> : null}
                    </View>
                  </View>
                  {!blok && (
                    <View style={{ gap: 4 }}>
                      <Pressable style={[st.przyciskMaly, otwarty === typ && { borderColor: K.akcent }]} onPress={() => pokazOferty(typ)}>
                        <Text style={[st.przyciskMalyTekst, otwarty === typ && { color: K.akcent }]}>{sp ? "Oferty" : "Podpisz"}</Text>
                      </Pressable>
                      {sp && (
                        <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => zerwij(typ)}>
                          <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Zerwij</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
                {otwarty === typ && (
                  <View style={{ marginTop: 6, backgroundColor: K.karta, borderRadius: 8, padding: 6 }}>
                    {sp ? <Text style={[st.maly, { color: K.akcent, marginBottom: 4 }]}>⚠ Trwa umowa z {sp.nazwa} — nowa oferta oznacza karę {zl(kara)}.</Text> : null}
                    {oferty.map((o, i) => (
                      <View key={i} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 4, gap: 6 }]}>
                        <View style={[st.wiersz, { gap: 6, flex: 1 }]}>
                          <LogoMarki nazwa={o.nazwa} rozmiar={20} />
                          <Text style={st.maly}>{o.nazwa} — {zl(o.wartosc)}/sezon, {o.sezonDo - s.sezon + 1} sez. (do {o.sezonDo})</Text>
                        </View>
                        <Pressable style={st.przyciskMaly} onPress={() => podpisz(o)}>
                          <Text style={st.przyciskMalyTekst}>Podpisz</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
      <Text style={[st.maly, { marginTop: 6 }]}>Kluczowi sponsorzy odnawiają się co sezon automatycznie; partnerów dodatkowych pozyskujesz sam. Zerwanie trwającej umowy kosztuje 50% wartości pozostałych sezonów.</Text>
    </View>
  );
}
