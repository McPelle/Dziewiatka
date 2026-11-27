import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { treningiMoje, treningiWTygodniu, zakresTreningow } from "../engine/sezon";
import {
  FOKUSY, INTENSYWNOSCI, autoFokus, fokus, ileIndywidualnych, ileNauki, intensywnosc,
  limitIndywidualnych, limitNauki, ustawAuto, ustawFokus, ustawIntensywnosc, usunTreningIndywidualny, przerwijNauke,
} from "../engine/trening";
import { ETYKIETA_ATRYB } from "../engine/atrybuty";
import { ETYKIETA_POZ, SKROT_POZ } from "../data/pozycje";
import type { FokusMeta } from "../engine/trening";
import type { StanGry, Trening as TreningT } from "../engine/types";
import { K, st } from "./styl";

const GRUPY: { grupa: FokusMeta["grupa"]; tytul: string }[] = [
  { grupa: "ogolny", tytul: "Ogólny" },
  { grupa: "gra", tytul: "Elementy gry" },
  { grupa: "umiejetnosc", tytul: "Pojedyncze umiejętności" },
  { grupa: "specjalny", tytul: "Specjalne" },
];
const ETYK_POZ_KROTKA: Record<string, string> = { BR: "bramkarze", OBR: "obrona", POM: "pomoc", NAP: "atak" };

export function Trening({ s, widoczny, onClose, odswiez, otworzProfil }: {
  s: StanGry; widoczny: boolean; onClose: () => void; odswiez: () => void; otworzProfil?: (id: string) => void;
}) {
  const f = fokus(s);
  const auto = !!s.treningAuto;
  const intens = intensywnosc(s);
  const poziom = s.kluby[s.mojKlub].poziom;
  const [minT, maxT] = zakresTreningow(poziom);
  const ile = treningiMoje(s);
  const std = treningiWTygodniu(poziom);
  const ustawTren = (v: number) => { s.treningiTydzien = Math.max(minT, Math.min(maxT, v)); odswiez(); };

  const indyw = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z?.treningIndywidualny);
  const nauka = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z?.naukaPozycji);

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "92%", paddingBottom: 20 }]}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={st.tytul}>🏋 Centrum treningowe</Text>
            <Text style={[st.maly, { marginTop: 2, marginBottom: 10 }]}>Fokus i intensywność kształtują rozwój kadry. Trening indywidualny i naukę pozycji ustawiasz w profilu zawodnika.</Text>

            {/* ——— Tryb automatyczny ——— */}
            <View style={[st.karta, { marginBottom: 8 }]}>
              <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "center" }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[st.tekst, { fontWeight: "800" }]}>🧠 Prowadzi sztab (asystent)</Text>
                  <Text style={st.maly}>Asystent sam dobiera fokus wg słabości kadry. Wyłącz, by decydować samodzielnie.</Text>
                </View>
                <Pressable onPress={() => { ustawAuto(s, !auto); odswiez(); }}
                  style={{ width: 52, height: 30, borderRadius: 15, backgroundColor: auto ? K.zielony : K.linia, justifyContent: "center", padding: 3 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignSelf: auto ? "flex-end" : "flex-start" }} />
                </Pressable>
              </View>
              {auto && <Text style={[st.maly, { marginTop: 6, color: K.zielony }]}>Asystent trenuje teraz: <Text style={{ fontWeight: "800" }}>{f.ikona} {f.etykieta}</Text></Text>}
            </View>

            {/* ——— Fokus ——— */}
            <Text style={[st.naglowek, { opacity: auto ? 0.45 : 1 }]}>Fokus treningu</Text>
            {GRUPY.map(({ grupa, tytul }) => (
              <View key={grupa} style={{ marginBottom: 6, opacity: auto ? 0.45 : 1 }}>
                <Text style={[st.maly, { marginBottom: 3 }]}>{tytul}</Text>
                <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>
                  {FOKUSY.filter((x) => x.grupa === grupa).map((x) => {
                    const akt = !auto && s.trening === x.klucz;
                    return (
                      <Pressable key={x.klucz} disabled={auto} onPress={() => { ustawFokus(s, x.klucz as TreningT); odswiez(); }}
                        style={[st.chip, akt && st.chipAktywny]}>
                        <Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600", fontSize: 13 }}>{x.ikona} {x.etykieta}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            <View style={[st.karta, { marginTop: 2, marginBottom: 8 }]}>
              <Text style={[st.tekst, { fontWeight: "700" }]}>{f.ikona} {f.etykieta}</Text>
              <Text style={st.maly}>{f.opis}</Text>
              <Text style={[st.maly, { marginTop: 4 }]}>
                Rozwija: <Text style={{ color: K.akcent }}>{f.atrybuty.map((a) => ETYKIETA_ATRYB[a]).join(", ")}</Text>
                {f.pozycje !== "all" && <> · najbardziej: {f.pozycje.map((p) => ETYK_POZ_KROTKA[p]).join(", ")}</>}
                {f.meczowy && <> · dodatkowo przewaga w meczu</>}
                {f.mlodziez && <> · tylko U-21</>}
              </Text>
            </View>

            {/* ——— Intensywność ——— */}
            <Text style={st.naglowek}>Intensywność</Text>
            <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>
              {INTENSYWNOSCI.map((i) => {
                const akt = (s.treningIntensywnosc ?? "normalny") === i.klucz;
                return (
                  <Pressable key={i.klucz} onPress={() => { ustawIntensywnosc(s, i.klucz); odswiez(); }} style={[st.chip, akt && st.chipAktywny]}>
                    <Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600", fontSize: 13 }}>{i.ikona} {i.etykieta}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[st.maly, { marginTop: 4, marginBottom: 8 }]}>{intens.opis}</Text>

            {/* ——— Treningi w tygodniu ——— */}
            <Text style={st.naglowek}>Treningi w tygodniu</Text>
            <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "center" }]}>
              <Text style={st.tekst}><Text style={{ fontWeight: "800" }}>{ile}×</Text> <Text style={st.maly}>(standard poziomu: {std}×)</Text></Text>
              <View style={[st.wiersz, { gap: 8 }]}>
                <Pressable style={[st.przyciskMaly, { opacity: ile <= minT ? 0.3 : 1 }]} disabled={ile <= minT} onPress={() => ustawTren(ile - 1)}><Text style={st.przyciskMalyTekst}>−</Text></Pressable>
                <Pressable style={[st.przyciskMaly, { opacity: ile >= maxT ? 0.3 : 1 }]} disabled={ile >= maxT} onPress={() => ustawTren(ile + 1)}><Text style={st.przyciskMalyTekst}>+</Text></Pressable>
              </View>
            </View>
            <Text style={[st.maly, { marginBottom: 8 }]}>{ile > std ? "Częściej = szybszy rozwój, większe zmęczenie." : ile < std ? "Rzadziej = świeższa kadra, wolniejszy rozwój." : "Standardowy rytm dla tego poziomu."}</Text>

            {/* ——— Podopieczni: trening indywidualny ——— */}
            <Text style={[st.naglowek, { marginTop: 6 }]}>Trening indywidualny ({ileIndywidualnych(s)}/{limitIndywidualnych(s)})</Text>
            {indyw.length === 0 ? (
              <Text style={[st.maly, { marginBottom: 6 }]}>Nikt nie trenuje indywidualnie. Otwórz profil zawodnika → „Trening indywidualny".</Text>
            ) : indyw.map((z) => (
              <View key={z.id} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
                <Pressable style={{ flex: 1 }} onPress={() => otworzProfil?.(z.id)}>
                  <Text style={[st.tekst, { fontSize: 14 }]} numberOfLines={1}>{z.imie} {z.nazwisko}</Text>
                  <Text style={st.maly}>rozwija: <Text style={{ color: K.akcent }}>{ETYKIETA_ATRYB[z.treningIndywidualny!]}</Text></Text>
                </Pressable>
                <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => { usunTreningIndywidualny(s, z.id); odswiez(); }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Zakończ</Text>
                </Pressable>
              </View>
            ))}

            {/* ——— Podopieczni: nauka pozycji ——— */}
            <Text style={[st.naglowek, { marginTop: 10 }]}>Nauka nowej pozycji ({ileNauki(s)}/{limitNauki(s)})</Text>
            {nauka.length === 0 ? (
              <Text style={[st.maly, { marginBottom: 6 }]}>Nikt nie uczy się nowej pozycji. Otwórz profil zawodnika → „Naucz nowej pozycji".</Text>
            ) : nauka.map((z) => (
              <View key={z.id} style={{ paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }}>
                <View style={[st.wiersz, { justifyContent: "space-between" }]}>
                  <Pressable style={{ flex: 1 }} onPress={() => otworzProfil?.(z.id)}>
                    <Text style={[st.tekst, { fontSize: 14 }]} numberOfLines={1}>{z.imie} {z.nazwisko}</Text>
                    <Text style={st.maly}>uczy się: <Text style={{ color: K.niebieski }}>{ETYKIETA_POZ[z.naukaPozycji!.poz]} ({SKROT_POZ[z.naukaPozycji!.poz]})</Text> · {Math.floor(z.naukaPozycji!.postep)}%</Text>
                  </Pressable>
                  <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => { przerwijNauke(s, z.id); odswiez(); }}>
                    <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Przerwij</Text>
                  </Pressable>
                </View>
                <View style={{ height: 6, backgroundColor: K.linia, borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                  <View style={{ width: `${Math.min(100, Math.floor(z.naukaPozycji!.postep))}%`, height: 6, backgroundColor: K.niebieski }} />
                </View>
              </View>
            ))}

            <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 14 }]} onPress={onClose}>
              <Text style={st.przyciskTekst}>Zamknij</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
