import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Rozmowa3D } from "./three/Rozmowa3D";
import { grafika3D } from "./three/Stadion3DWidok";
import { mow, plecZImienia, zamilknij } from "./three/glos";
import { OpcjaRozmowy, TematRozmowy, TON_ETYKIETA, tematyRozmowy, zastosujRozmowe } from "../engine/rozmowy";
import type { StanGry, Zawodnik } from "../engine/types";
import { Twarz } from "./Twarz";
import { K, st } from "./styl";

export function Rozmowa({ s, z, widoczny, onClose, odswiez }: { s: StanGry; z: Zawodnik | undefined; widoczny: boolean; onClose: () => void; odswiez: () => void }) {
  const [temat, setTemat] = useState<TematRozmowy | null>(null);
  const [reakcja, setReakcja] = useState<string | null>(null);
  const [wynik, setWynik] = useState<{ delta: number; uwaga?: string } | null>(null);

  const [mowi, setMowi] = useState<"trener" | "zawodnik" | null>(null);
  useEffect(() => { if (!widoczny) { setTemat(null); setReakcja(null); setWynik(null); zamilknij(); } }, [widoczny]);
  // zawodnik zaczyna rozmowę na głos
  useEffect(() => { if (temat && !reakcja) { setMowi("zawodnik"); mow(temat.kwestia, "zawodnik", { przerwij: true, kto: z ? z.imie + z.nazwisko : "zawodnik", plec: "M" }); const t = setTimeout(() => setMowi(null), 3500); return () => clearTimeout(t); } }, [temat?.id]);

  if (!z) return null;
  const tematy = tematyRozmowy(s, z);

  const wybierzOpcje = (o: OpcjaRozmowy) => {
    const r = zastosujRozmowe(s, z, o);
    setMowi("trener"); mow(o.tekst, "trener", { przerwij: true, kto: s.trener, plec: plecZImienia(s.trener) });
    // odpowiedź zawodnika po wypowiedzi trenera — z emocją wynikającą z rozmowy
    setTimeout(() => { setReakcja(r.reakcja); setWynik({ delta: r.delta, uwaga: r.uwaga }); setMowi("zawodnik"); mow(r.reakcja, "zawodnik", { kto: z.imie + z.nazwisko, plec: "M" }); setTimeout(() => setMowi(null), 3500); }, Platform.OS === "web" && grafika3D() ? 1800 : 0);
    odswiez();
  };
  const emocja = wynik ? Math.max(-1, Math.min(1, wynik.delta / 6)) : temat ? ((z.morale ?? 60) - 60) / 60 : 0;

  const Dymek = ({ tekst, trenera }: { tekst: string; trenera?: boolean }) => (
    <View style={[st.wiersz, { gap: 8, marginTop: 8, flexDirection: trenera ? "row-reverse" : "row" }]}>
      {trenera ? <Twarz seed={s.trener} rozmiar={32} zdjecie={s.trenerZdjecie} jersey="#2b2f45" /> : <Twarz seed={z.imie + z.nazwisko} rozmiar={32} zdjecie={z.zdjecie} cechy={z.twarz} kraj={z.kraj} />}
      <View style={{ flex: 1, backgroundColor: trenera ? K.karta2 : "rgba(90,169,255,0.14)", borderRadius: 12, padding: 10, maxWidth: "85%" }}>
        <Text style={st.tekst}>{tekst}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "88%", paddingBottom: 20 }}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            {Platform.OS === "web" && grafika3D() && <View style={{ marginBottom: 12 }}><Rozmowa3D klub={s.kluby[s.mojKlub]} z={z} emocja={emocja} mowi={mowi} trofea={0} /></View>}
            <View style={[st.wiersz, { gap: 12 }]}>
              <Twarz seed={z.imie + z.nazwisko} rozmiar={44} zdjecie={z.zdjecie} cechy={z.twarz} kraj={z.kraj} />
              <View style={{ flex: 1 }}>
                <Text style={st.tytul}>Rozmowa: {z.imie} {z.nazwisko}</Text>
                <Text style={st.maly}>morale {Math.round(z.morale)}% · zaufanie do trenera {Math.round(z.relacja ?? 60)}%{z.prosiOTransfer ? " · chce odejść" : ""}{z.obietnica ? ` · 🤞 obietnica: ${z.obietnica.typ === "minuty" ? "minuty" : "kontrakt"}` : ""}</Text>
              </View>
            </View>

            {!temat ? (
              <View style={{ marginTop: 14 }}>
                <Text style={st.naglowek}>O czym porozmawiacie?</Text>
                {tematy.map((t) => (
                  <Pressable key={t.id} style={[st.przyciskMaly, { marginTop: 8, alignItems: "flex-start" }]} onPress={() => { setTemat(t); setReakcja(null); }}>
                    <Text style={st.przyciskMalyTekst}>{t.ikona} {t.etykieta}</Text>
                  </Pressable>
                ))}
                {tematy.length === 0 && <Text style={st.maly}>Brak tematów do omówienia w tej chwili.</Text>}
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                <Dymek tekst={temat.kwestia} />
                {reakcja ? (
                  <>
                    <Dymek tekst={reakcja} />
                    {wynik ? (
                      <Text style={[st.maly, { marginTop: 8, color: wynik.delta > 0 ? K.zielony : wynik.delta < 0 ? K.czerwony : K.szary, fontWeight: "800" }]}>
                        Morale {wynik.delta > 0 ? "+" : ""}{wynik.delta} → {Math.round(z.morale)}%{wynik.uwaga ? ` · ${wynik.uwaga}` : ""}
                      </Text>
                    ) : null}
                    <View style={[st.wiersz, { gap: 10, marginTop: 14 }]}>
                      <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.niebieski }]} onPress={() => { setTemat(null); setReakcja(null); setWynik(null); }}>
                        <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>← Inny temat</Text>
                      </Pressable>
                      <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0, marginTop: 0 }]} onPress={onClose}>
                        <Text style={st.przyciskTekst}>Zakończ</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[st.maly, { marginBottom: 2 }]}>Twoja odpowiedź:</Text>
                    {temat.opcje.map((o, i) => (
                      <Pressable key={i} style={[st.karta, { marginHorizontal: 0, marginTop: 8 }]} onPress={() => wybierzOpcje(o)}>
                        <Text style={[st.tekst, { fontSize: 15 }]}>{o.tekst}</Text>
                        <Text style={[st.maly, { marginTop: 4, color: K.akcent }]}>{TON_ETYKIETA[o.ton]}{o.obietnica ? " · zobowiązanie do rozliczenia" : ""}{o.podwyzka ? ` · koszt: +${Math.round(o.podwyzka * 100)}% pensji` : ""}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
