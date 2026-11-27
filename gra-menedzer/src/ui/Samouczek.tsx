// Samouczek na start kariery — krótki przewodnik po najważniejszych funkcjach (można pominąć i włączyć ponownie w Centrum klubu).
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";

const KROKI: [string, string, string][] = [
  ["👋", "Witaj, trenerze!", "Prowadzisz polski klub — od B-klasy po Ekstraklasę. Grasz dzień po dniu: treningi, mecze, transfery, budowy, kibice, media."],
  ["📅", "Kalendarz jak w Football Managerze", "Pasek tygodnia na pulpicie i 📅 Miesiąc. Dotknij dnia, by zaplanować zajęcia (trening, odnowa, wideo, sparing, integracja…). Widok roku i kolejne sezony — dotknij nazwy miesiąca."],
  ["🏋", "Trening — na żywo albo symulacja", "W dzień treningu wybierz 📺 Trening na żywo: boisko 3D, cały sztab, ćwiczenia, intensywność, pochwały i decyzje. Albo po prostu „Dalej” — sztab poprowadzi zajęcia."],
  ["⏳", "Przed meczem", "📺 Na żywo → szatnia (przebranie, rozmowy), rozgrzewka 3D, Twoja mowa — albo „Zasymuluj przedmecz”. Potem wyjście z tunelu i mecz w 3D."],
  ["⚽", "Mecz na żywo", "Zmiany, taktyka, okrzyki z ławki, mowa w przerwie, kamery TV. Puchar ma dogrywkę i karne. Wynik zapisuje się do ligi."],
  ["🗣", "Języki i tłumacze", "Cudzoziemcy mówią w swoim języku i uczą się polskiego. Zatrudnij tłumacza, zapisz ich na kurs albo sam ucz się języków (Sztab → Języki)."],
  ["🛡", "Kibice, ochrona, policja", "Wybierz firmę ochroniarską i obsadę (Klub → Bezpieczeństwo). Kibice mają flagi, oprawy (każda inna), zgody i kosy. Zadymy kosztują — kary, zakazy, wojewoda."],
  ["🏅", "Osiągnięcia i trudność", "W Centrum klubu (Więcej) zobaczysz osiągnięcia i zmienisz poziom trudności. Powodzenia!"],
];

export function Samouczek({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [krok, setKrok] = useState(0);
  if (s.samouczekZrobiony) return null;
  const [ik, tyt, opis] = KROKI[krok];
  const koniec = () => { s.samouczekZrobiony = true; odswiez(); };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={koniec}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", padding: 22 }}>
        <View style={[st.karta, { marginHorizontal: 0, borderColor: K.akcent, borderWidth: 1 }]}>
          <Text style={{ fontSize: 44, textAlign: "center" }}>{ik}</Text>
          <Text style={[st.tytul, { textAlign: "center", fontFamily: CZCIONKA }]}>{tyt}</Text>
          <Text style={[st.tekst, { textAlign: "center", marginTop: 8, lineHeight: 20 }]}>{opis}</Text>
          <Text style={[st.maly, { textAlign: "center", marginTop: 10 }]}>{krok + 1} / {KROKI.length}</Text>
          <View style={[st.wiersz, { gap: 8, marginTop: 6 }]}>
            {krok > 0 && <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center" }]} onPress={() => setKrok(krok - 1)}><Text style={st.przyciskMalyTekst}>‹ Wstecz</Text></Pressable>}
            <Pressable style={[st.przycisk, { flex: 2, marginHorizontal: 0 }]} onPress={() => (krok + 1 < KROKI.length ? setKrok(krok + 1) : koniec())}><Text style={st.przyciskTekst}>{krok + 1 < KROKI.length ? "Dalej ›" : "Zaczynamy!"}</Text></Pressable>
          </View>
          <Pressable onPress={koniec} style={{ alignItems: "center", marginTop: 8 }}><Text style={[st.maly, { color: K.niebieski }]}>Pomiń samouczek</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}
