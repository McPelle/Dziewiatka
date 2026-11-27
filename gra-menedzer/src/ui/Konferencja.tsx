import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Konferencja3D } from "./three/Konferencja3D";
import { grafika3D } from "./three/Stadion3DWidok";
import { glosDostepny, glosWlaczony, mow, ustawGlos, zamilknij } from "./three/glos";
import { odpowiedzKonferencja } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";

const Efekt = ({ et, v }: { et: string; v?: number }) => (!v ? null : (
  <Text style={[st.maly, { color: v > 0 ? K.zielony : K.czerwony, marginRight: 10 }]}>{et} {v > 0 ? "▲" : "▼"}</Text>
));

/** Konferencja prasowa (przed- lub pomeczowa): kolejne pytania dziennikarzy, każda odpowiedź ma skutki. */
export function KonferencjaEkran({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const k = s.konferencja;
  const [nrOdp, setNrOdp] = useState(0);
  const [glos, setGlos] = useState(glosWlaczony());
  // dziennikarz zadaje pytanie na głos
  useEffect(() => { if (k) mow(`${k.media ? k.media + ". " : ""}${k.pytanie}`, "dziennikarz", { przerwij: true }); }, [k?.pytanie]);
  useEffect(() => () => zamilknij(), []);
  const mojKlub = s.kluby[s.mojKlub];
  const liga = s.ligi[mojKlub.poziom - 1];
  const om = liga?.wyniki.slice(0, s.kolejka).reverse().flat().find((w) => w && (w.dom === s.mojKlub || w.gosc === s.mojKlub));
  const nastroj = !om ? 0 : om.dom === s.mojKlub ? om.gd - om.gg : om.gg - om.gd;
  const odpowiedz = (i: number) => {
    if (i >= 0 && k) mow(k.opcje[i].tekst, "trener", { przerwij: true });
    setNrOdp((n) => n + 1);
    odpowiedzKonferencja(s, i); odswiez();
  };
  return (
    <Modal visible={!!k} transparent animationType="slide" onRequestClose={() => { odpowiedzKonferencja(s, -1); odswiez(); }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "90%", paddingBottom: 20, borderTopWidth: 2, borderColor: K.akcent }}>
          {k && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              {Platform.OS === "web" && grafika3D() && (
                <View style={{ marginBottom: 12 }}>
                  <Konferencja3D klub={mojKlub} sponsorzy={(s.sponsorzy ?? []).map((x) => x.nazwa)} typ={k.typ ?? "przed"} nastroj={k.typ === "po" ? nastroj : 0} nrPytania={(k.nr ?? 0) * 100 + k.pytanie.length} nrOdpowiedzi={nrOdp} />
                  <View style={{ position: "absolute", left: 8, bottom: 8, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                    <Text style={{ color: "#fff", fontSize: 10.5, fontWeight: "800", fontFamily: CZCIONKA }}>🔴 NA ŻYWO · {k.media ?? "Media"}</Text>
                  </View>
                  {glosDostepny() && <Pressable onPress={() => { ustawGlos(!glos); setGlos(!glos); }} style={{ position: "absolute", right: 8, bottom: 8, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                    <Text style={{ color: "#fff", fontSize: 11 }}>{glos ? "🗣 Głos wł." : "🔇 Głos wył."}</Text>
                  </Pressable>}
                </View>
              )}
              <View style={[st.wiersz, { justifyContent: "space-between" }]}>
                <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 12, letterSpacing: 0.6, fontFamily: CZCIONKA }}>
                  🎙 {k.typ === "przed" ? "KONFERENCJA PRZEDMECZOWA" : "KONFERENCJA POMECZOWA"}
                </Text>
                {k.ile ? <Text style={st.maly}>pytanie {k.nr}/{k.ile}</Text> : null}
              </View>
              <Text style={[st.maly, { marginTop: 4 }]}>{k.media ? `${k.media} · ` : ""}{k.kontekst}</Text>
              <View style={{ marginTop: 10, backgroundColor: K.karta2, borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: K.niebieski }}>
                <Text style={[st.tekst, { fontSize: 16.5, fontWeight: "800", lineHeight: 22 }]}>„{k.pytanie}"</Text>
              </View>
              <Text style={[st.maly, { marginTop: 10 }]}>Twoja odpowiedź:</Text>
              {k.opcje.map((o, i) => (
                <Pressable key={i} style={({ pressed }) => [st.karta, { marginHorizontal: 0, marginTop: 8, opacity: pressed ? 0.85 : 1 }]} onPress={() => odpowiedz(i)}>
                  <Text style={[st.tekst, { fontSize: 15, fontWeight: "600" }]}>{o.tekst}</Text>
                  <View style={[st.wiersz, { marginTop: 6, flexWrap: "wrap" }]}>
                    <Efekt et="Szatnia" v={o.morale} />
                    <Efekt et="Zarząd" v={o.zarzad} />
                    <Efekt et="Kibice" v={o.kibice} />
                    <Efekt et="Motywacja na mecz" v={o.motywacja} />
                    {o.zawodnik ? <Efekt et={s.zawodnicy[o.zawodnik.id]?.nazwisko ?? "Zawodnik"} v={o.zawodnik.morale} /> : null}
                  </View>
                </Pressable>
              ))}
              <Pressable style={{ marginTop: 14, alignItems: "center" }} onPress={() => { zamilknij(); odpowiedz(-1); }}>
                <Text style={[st.maly, { color: K.czerwony }]}>Odmów dalszych odpowiedzi (media i zarząd będą niezadowoleni)</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
