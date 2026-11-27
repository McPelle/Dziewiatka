import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { Noga, Pozycja, StanGry, TwarzCechy } from "../engine/types";
import { domyslneCechy, LICZBA, Twarz } from "./Twarz";
import { wybierzZdjecie } from "./zdjecie";
import { K, KOLOR_POZ, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));

const POZ: Pozycja[] = ["BR", "OBR", "POM", "NAP"];
const NOGI: Noga[] = ["prawa", "lewa", "obie"];

function Pole({ etyk, wartosc, onZmien, numer }: { etyk: string; wartosc: string; onZmien: (t: string) => void; numer?: boolean }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={st.naglowek}>{etyk}</Text>
      <TextInput
        style={st.input}
        value={wartosc}
        onChangeText={onZmien}
        keyboardType={numer ? "numeric" : "default"}
        placeholderTextColor={K.szary}
      />
    </View>
  );
}

export function EdytorZawodnika({ s, zawodnikId, onClose, odswiez }: { s: StanGry; zawodnikId: string | null; onClose: () => void; odswiez: () => void }) {
  const z = zawodnikId ? s.zawodnicy[zawodnikId] : undefined;
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [poz, setPoz] = useState<Pozycja>("POM");
  const [noga, setNoga] = useState<Noga>("prawa");
  const [wiek, setWiek] = useState("");
  const [numer, setNumer] = useState("");
  const [umiej, setUmiej] = useState("");
  const [potencjal, setPotencjal] = useState("");
  const [kontraktDo, setKontraktDo] = useState("");
  const [zdjecie, setZdjecie] = useState<string | undefined>(undefined);
  const [cechy, setCechy] = useState<TwarzCechy>({ skora: 0, wlosy: 0, stylWlosow: 0, zarost: 0 });

  useEffect(() => {
    if (!z) return;
    setImie(z.imie); setNazwisko(z.nazwisko); setPoz(z.poz); setNoga(z.noga);
    setWiek(String(z.wiek)); setNumer(String(z.numer)); setUmiej(String(Math.round(z.umiej)));
    setPotencjal(String(Math.round(z.potencjal))); setKontraktDo(String(z.kontraktDo));
    setZdjecie(z.zdjecie); setCechy(z.twarz ?? domyslneCechy(z.imie + z.nazwisko));
  }, [zawodnikId]);

  const krokCechy = (klucz: keyof TwarzCechy, ile: number) => setCechy((c) => ({ ...c, [klucz]: (c[klucz] + 1) % ile }));
  const wgraj = async () => {
    const r = await wybierzZdjecie();
    if (r === "BRAK_PICKERA") { komunikat("Wgrywanie zdjęcia z telefonu wymaga dodania pakietu expo-image-picker. Na komputerze (wersja web) działa od razu."); return; }
    if (r) setZdjecie(r);
  };

  const liczba = (t: string, min: number, max: number, dom: number) => {
    const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? dom : Math.max(min, Math.min(max, n));
  };

  const zapisz = () => {
    if (!z) return;
    z.imie = imie.trim() || z.imie;
    z.nazwisko = nazwisko.trim() || z.nazwisko;
    z.poz = poz;
    z.noga = noga;
    z.wiek = liczba(wiek, 15, 45, z.wiek);
    z.numer = liczba(numer, 0, 99, z.numer);
    z.umiej = liczba(umiej, 1, 99, Math.round(z.umiej));
    z.potencjal = Math.max(z.umiej, liczba(potencjal, 1, 99, Math.round(z.potencjal)));
    z.kontraktDo = liczba(kontraktDo, s.sezon, s.sezon + 6, z.kontraktDo);
    z.zdjecie = zdjecie;
    z.twarz = cechy;
    odswiez();
    onClose();
  };

  return (
    <Modal visible={!!z} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", paddingBottom: 20 }}>
          {z && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <Text style={st.tytul}>Edytor zawodnika</Text>
              <View style={[st.wiersz, { gap: 10, marginTop: 4 }]}>
                <View style={{ flex: 1 }}><Pole etyk="Imię" wartosc={imie} onZmien={setImie} /></View>
                <View style={{ flex: 1 }}><Pole etyk="Nazwisko" wartosc={nazwisko} onZmien={setNazwisko} /></View>
              </View>

              <Text style={[st.naglowek, { marginTop: 14 }]}>Twarz</Text>
              <View style={[st.wiersz, { gap: 14, alignItems: "flex-start" }]}>
                <Twarz seed={imie + nazwisko} rozmiar={72} zdjecie={zdjecie} cechy={cechy} />
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={[st.wiersz, { gap: 8 }]}>
                    <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.niebieski }]} onPress={wgraj}>
                      <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>📷 Wgraj zdjęcie</Text>
                    </Pressable>
                    {zdjecie ? (
                      <Pressable style={[st.przyciskMaly, { alignItems: "center", borderColor: K.czerwony }]} onPress={() => setZdjecie(undefined)}>
                        <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Usuń</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  {zdjecie ? (
                    <Text style={st.maly}>Twoje zdjęcie — trzymane lokalnie na tym urządzeniu.</Text>
                  ) : (
                    <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>
                      <Pressable style={st.przyciskMaly} onPress={() => krokCechy("skora", LICZBA.skory)}><Text style={st.przyciskMalyTekst}>Skóra</Text></Pressable>
                      <Pressable style={st.przyciskMaly} onPress={() => krokCechy("wlosy", LICZBA.wlosy)}><Text style={st.przyciskMalyTekst}>Włosy</Text></Pressable>
                      <Pressable style={st.przyciskMaly} onPress={() => krokCechy("stylWlosow", LICZBA.style)}><Text style={st.przyciskMalyTekst}>Fryzura</Text></Pressable>
                      <Pressable style={st.przyciskMaly} onPress={() => krokCechy("zarost", LICZBA.zarost)}><Text style={st.przyciskMalyTekst}>Zarost</Text></Pressable>
                    </View>
                  )}
                </View>
              </View>

              <Text style={[st.naglowek, { marginTop: 14 }]}>Pozycja</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>
                {POZ.map((p) => (
                  <Pressable key={p} onPress={() => setPoz(p)} style={[st.chip, poz === p && { backgroundColor: KOLOR_POZ[p], borderColor: KOLOR_POZ[p] }]}>
                    <Text style={{ color: poz === p ? "#17310f" : K.tekst, fontWeight: "700" }}>{{ BR: "Bramkarz", OBR: "Obrońca", POM: "Pomocnik", NAP: "Napastnik" }[p]}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[st.naglowek, { marginTop: 8 }]}>Lepsza noga</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>
                {NOGI.map((n) => (
                  <Pressable key={n} onPress={() => setNoga(n)} style={[st.chip, noga === n && st.chipAktywny]}>
                    <Text style={{ color: noga === n ? "#17310f" : K.tekst, fontWeight: "600" }}>{n}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={[st.wiersz, { gap: 10 }]}>
                <View style={{ flex: 1 }}><Pole etyk="Wiek" wartosc={wiek} onZmien={setWiek} numer /></View>
                <View style={{ flex: 1 }}><Pole etyk="Numer" wartosc={numer} onZmien={setNumer} numer /></View>
              </View>
              <View style={[st.wiersz, { gap: 10 }]}>
                <View style={{ flex: 1 }}><Pole etyk="Umiejętności (1–99)" wartosc={umiej} onZmien={setUmiej} numer /></View>
                <View style={{ flex: 1 }}><Pole etyk="Potencjał (1–99)" wartosc={potencjal} onZmien={setPotencjal} numer /></View>
              </View>
              <Pole etyk="Kontrakt do (rok)" wartosc={kontraktDo} onZmien={setKontraktDo} numer />

              <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 18 }]} onPress={zapisz}>
                <Text style={st.przyciskTekst}>Zapisz zmiany</Text>
              </Pressable>
              <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center" }]} onPress={onClose}>
                <Text style={st.przyciskMalyTekst}>Anuluj</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
