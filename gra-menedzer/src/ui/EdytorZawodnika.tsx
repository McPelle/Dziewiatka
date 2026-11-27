import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { Noga, Pozycja, StanGry, TwarzCechy } from "../engine/types";
import { domyslneCechy, LICZBA, SKORY, Twarz, WLOSY } from "./Twarz";
import { nowyZawodnik } from "../engine/swiat";
import type { Zawodnik } from "../engine/types";
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

const STYLE = ["Krótkie", "Bardzo krótkie", "Z przedziałkiem", "Łysy", "Kręcone"];
const ZAROST = ["Bez zarostu", "Broda"];
const KRAJE = ["Polska", "Ukraina", "Czechy", "Słowacja", "Litwa", "Hiszpania", "Portugalia", "Brazylia", "Nigeria", "Gruzja", "Serbia", "Niemcy"];

/** Edytor zawodnika — edycja istniejącego albo tworzenie nowego (`nowy`). Twarz: kreator (skóra, włosy, fryzura, zarost)
 *  ALBO własne zdjęcie wgrane z telefonu/komputera — oba tryby dostępne zawsze, można przełączać. */
export function EdytorZawodnika({ s, zawodnikId, onClose, odswiez, nowy }: { s: StanGry; zawodnikId: string | null; onClose: () => void; odswiez: () => void; nowy?: boolean }) {
  const [szkic] = useState<Zawodnik | null>(() => (nowy ? nowyZawodnik(s, s.kluby[s.mojKlub].poziom, "POM", { wiek: 19 }) : null));
  const z = nowy ? szkic ?? undefined : zawodnikId ? s.zawodnicy[zawodnikId] : undefined;
  const [tryb, setTryb] = useState<"kreator" | "zdjecie">("kreator");
  const [kraj, setKraj] = useState("Polska");
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
    setZdjecie(z.zdjecie); setCechy(z.twarz ?? domyslneCechy(z.imie + z.nazwisko, z.kraj)); setTryb(z.zdjecie ? "zdjecie" : "kreator"); setKraj(z.kraj ?? "Polska");
  }, [zawodnikId, szkic]);

  const krokCechy = (klucz: keyof TwarzCechy, ile: number) => setCechy((c) => ({ ...c, [klucz]: (c[klucz] + 1) % ile }));
  const wgraj = async () => {
    const r = await wybierzZdjecie();
    if (r === "BRAK_PICKERA") { komunikat("Wgrywanie zdjęcia z telefonu wymaga dodania pakietu expo-image-picker. Na komputerze (wersja web) działa od razu."); return; }
    if (r) { setZdjecie(r); setTryb("zdjecie"); }
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
    z.zdjecie = tryb === "zdjecie" ? zdjecie : undefined; // aktywny tryb decyduje: zdjęcie albo twarz z kreatora
    z.twarz = cechy;
    z.kraj = kraj === "Polska" ? undefined : kraj;
    if (nowy) { // nowy zawodnik trafia do Twojej kadry (umowa wg szczebla klubu)
      const k = s.kluby[s.mojKlub]; z.klubId = k.id; s.zawodnicy[z.id] = z; k.zawodnicy.push(z.id);
      if (!z.numer || k.zawodnicy.some((id) => id !== z.id && s.zawodnicy[id]?.numer === z.numer)) { for (let n = 2; n < 100; n++) if (!k.zawodnicy.some((id) => s.zawodnicy[id]?.numer === n)) { z.numer = n; break; } }
      s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: `✍️ ${z.imie} ${z.nazwisko} (${z.poz}, ${z.wiek} l.) dołącza do kadry — zawodnik stworzony przez Ciebie.` });
    }
    odswiez();
    onClose();
  };

  return (
    <Modal visible={!!z} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", paddingBottom: 20 }}>
          {z && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <Text style={st.tytul}>{nowy ? "➕ Nowy zawodnik" : "Edytor zawodnika"}</Text>
              <View style={[st.wiersz, { gap: 10, marginTop: 4 }]}>
                <View style={{ flex: 1 }}><Pole etyk="Imię" wartosc={imie} onZmien={setImie} /></View>
                <View style={{ flex: 1 }}><Pole etyk="Nazwisko" wartosc={nazwisko} onZmien={setNazwisko} /></View>
              </View>

              <Text style={[st.naglowek, { marginTop: 14 }]}>Wygląd</Text>
              <View style={[st.wiersz, { gap: 8, marginBottom: 10 }]}>
                {([["kreator", "🎨 Kreator twarzy"], ["zdjecie", "📷 Własne zdjęcie"]] as const).map(([k, n]) => (
                  <Pressable key={k} onPress={() => (k === "zdjecie" && !zdjecie ? wgraj() : setTryb(k))} style={[st.chip, { flex: 1, alignItems: "center", marginRight: 0 }, tryb === k && st.chipAktywny]}>
                    <Text style={{ color: tryb === k ? "#17310f" : K.tekst, fontWeight: "800", fontSize: 12.5 }}>{n}</Text>
                  </Pressable>))}
              </View>
              <View style={[st.wiersz, { gap: 14, alignItems: "flex-start" }]}>
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Twarz seed={imie + nazwisko} rozmiar={88} zdjecie={tryb === "zdjecie" ? zdjecie : undefined} cechy={cechy} kraj={kraj} />
                  <Text style={[st.maly, { fontSize: 10.5 }]}>podgląd</Text>
                </View>
                {tryb === "kreator" ? (
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text style={[st.maly, { fontWeight: "800" }]}>Karnacja</Text>
                    <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>{SKORY.map((c, i) => <Pressable key={c} onPress={() => setCechy({ ...cechy, skora: i })} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c, borderWidth: cechy.skora === i ? 3 : 1, borderColor: cechy.skora === i ? K.akcent : K.liniaMocna }} />)}</View>
                    <Text style={[st.maly, { fontWeight: "800" }]}>Kolor włosów</Text>
                    <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>{WLOSY.map((c, i) => <Pressable key={c} onPress={() => setCechy({ ...cechy, wlosy: i })} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c, borderWidth: cechy.wlosy === i ? 3 : 1, borderColor: cechy.wlosy === i ? K.akcent : K.liniaMocna }} />)}</View>
                    <Text style={[st.maly, { fontWeight: "800" }]}>Fryzura</Text>
                    <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>{STYLE.slice(0, LICZBA.style).map((n, i) => <Pressable key={n} onPress={() => setCechy({ ...cechy, stylWlosow: i })} style={[st.chip, { marginBottom: 0, marginRight: 0, paddingVertical: 4, paddingHorizontal: 10 }, cechy.stylWlosow === i && st.chipAktywny]}><Text style={{ color: cechy.stylWlosow === i ? "#17310f" : K.tekst, fontSize: 11.5 }}>{n}</Text></Pressable>)}</View>
                    <Text style={[st.maly, { fontWeight: "800" }]}>Zarost</Text>
                    <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>{ZAROST.slice(0, LICZBA.zarost).map((n, i) => <Pressable key={n} onPress={() => setCechy({ ...cechy, zarost: i })} style={[st.chip, { marginBottom: 0, marginRight: 0, paddingVertical: 4, paddingHorizontal: 10 }, cechy.zarost === i && st.chipAktywny]}><Text style={{ color: cechy.zarost === i ? "#17310f" : K.tekst, fontSize: 11.5 }}>{n}</Text></Pressable>)}</View>
                    <Pressable onPress={() => setCechy(domyslneCechy(imie + nazwisko + Math.random(), kraj))} style={[st.przyciskMaly, { alignSelf: "flex-start" }]}><Text style={st.przyciskMalyTekst}>🎲 Losuj twarz</Text></Pressable>
                  </View>
                ) : (
                  <View style={{ flex: 1, gap: 8 }}>
                    <Pressable style={[st.przyciskMaly, { alignItems: "center", borderColor: K.niebieski }]} onPress={wgraj}>
                      <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>📷 {zdjecie ? "Zmień zdjęcie" : "Wgraj zdjęcie"}</Text>
                    </Pressable>
                    {zdjecie && <Pressable style={[st.przyciskMaly, { alignItems: "center", borderColor: K.czerwony }]} onPress={() => { setZdjecie(undefined); setTryb("kreator"); }}><Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Usuń zdjęcie</Text></Pressable>}
                    <Text style={st.maly}>Zdjęcie z telefonu lub komputera (najlepiej twarz na wprost). Trzymane tylko na tym urządzeniu. Twarz z kreatora zostaje zapamiętana — możesz do niej wrócić.</Text>
                  </View>
                )}
              </View>
              <Text style={[st.naglowek, { marginTop: 14 }]}>Narodowość</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>
                {KRAJE.map((k) => <Pressable key={k} onPress={() => setKraj(k)} style={[st.chip, kraj === k && st.chipAktywny]}><Text style={{ color: kraj === k ? "#17310f" : K.tekst, fontSize: 12 }}>{k}</Text></Pressable>)}
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
