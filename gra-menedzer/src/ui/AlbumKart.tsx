// Album kart kolekcjonerskich: karty całej kadry (wg rangi) + karty specjalne zdobyte w karierze.
import { useMemo, useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { INFO_SPECJALNEJ, kartySpecjalne, NAZWA_RANGI, rangaKarty, statystykiAlbumu, zawodnikZKarty, type KartaSpecjalna, type RangaKarty, type TypKartySpecjalnej } from "../engine/karty";
import type { StanGry, Zawodnik } from "../engine/types";
import { KartaKolekcjonerska } from "./KartaKolekcjonerska";
import { K, st } from "./styl";

type Zakladka = "kadra" | "specjalne";
type Filtr = "wszystkie" | TypKartySpecjalnej;

export function AlbumKart({ s }: { s: StanGry }) {
  const [zakl, setZakl] = useState<Zakladka>("kadra");
  const [filtr, setFiltr] = useState<Filtr>("wszystkie");
  const [podglad, setPodglad] = useState<{ z: Zawodnik; k?: KartaSpecjalna } | null>(null);
  const klub = s.kluby[s.mojKlub];
  const kadra = useMemo(() => klub.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.umiej - a.umiej), [s, klub.zawodnicy.length]);
  const spec = kartySpecjalne(s);
  const stat = statystykiAlbumu(s);
  const rangi: Record<RangaKarty, number> = { zloto: 0, srebro: 0, braz: 0 };
  for (const z of kadra) rangi[rangaKarty(z.umiej)]++;
  const widoczne = [...spec].filter((k) => filtr === "wszystkie" || k.typ === filtr).sort((a, b) => b.sezon - a.sezon || b.kolejka - a.kolejka);

  const siatka = (dzieci: ReactNode) => <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingTop: 12 }}>{dzieci}</View>;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={st.karta}>
        <Text style={st.naglowek}>🃏 Album kart — {klub.nazwa}</Text>
        <Text style={st.maly}>Kadra: {kadra.length} kart · 🥇 {rangi.zloto} · 🥈 {rangi.srebro} · 🥉 {rangi.braz}</Text>
        <Text style={st.maly}>Karty specjalne: {stat.razem} · ⭐ {stat.kolejki} · 🏅 {stat.miesiaca} · 👑 {stat.legenda} · 🌱 {stat.wychowanek} · 🆕 {stat.debiutant}</Text>
        <View style={[st.wiersz, { marginTop: 10 }]}>
          {(["kadra", "specjalne"] as Zakladka[]).map((t) => (
            <Pressable key={t} onPress={() => setZakl(t)} style={[st.chip, zakl === t && st.chipAktywny]}>
              <Text style={{ color: zakl === t ? "#17310f" : K.tekst, fontWeight: "700" }}>{t === "kadra" ? "Kadra" : `Specjalne (${stat.razem})`}</Text>
            </Pressable>
          ))}
        </View>
        {zakl === "specjalne" && (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {(["wszystkie", "kolejki", "miesiaca", "legenda", "wychowanek", "debiutant"] as Filtr[]).map((f) => (
              <Pressable key={f} onPress={() => setFiltr(f)} style={[st.chip, filtr === f && st.chipAktywny, { paddingVertical: 5, paddingHorizontal: 10 }]}>
                <Text style={{ color: filtr === f ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{f === "wszystkie" ? "Wszystkie" : `${INFO_SPECJALNEJ[f].ikona} ${INFO_SPECJALNEJ[f].nazwa}`}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {zakl === "kadra" && (["zloto", "srebro", "braz"] as RangaKarty[]).filter((r) => rangi[r]).map((r) => (
        <View key={r} style={{ marginTop: 14 }}>
          <Text style={[st.naglowek, { marginLeft: 14 }]}>{NAZWA_RANGI[r]} ({rangi[r]})</Text>
          {siatka(kadra.filter((z) => rangaKarty(z.umiej) === r).map((z) => (
            <KartaKolekcjonerska key={z.id} zawodnik={z} s={s} szerokosc={112} onPress={() => setPodglad({ z })} />
          )))}
        </View>
      ))}

      {zakl === "specjalne" && (widoczne.length
        ? siatka(widoczne.map((k) => (
          <View key={k.klucz} style={{ alignItems: "center", width: 112 }}>
            <KartaKolekcjonerska zawodnik={zawodnikZKarty(s, k)} s={s} specjalna={k} szerokosc={112} onPress={() => setPodglad({ z: zawodnikZKarty(s, k), k })} />
            <Text numberOfLines={2} style={[st.maly, { fontSize: 10.5, textAlign: "center", marginTop: 3 }]}>{k.opis}</Text>
          </View>
        )))
        : <View style={st.karta}><Text style={st.maly}>Brak kart specjalnych. Zdobywasz je, gdy Twoi zawodnicy trafiają do jedenastki kolejki, zostają Zawodnikiem Miesiąca, debiutują, przebijają się z akademii lub stają się legendami klubu.</Text></View>)}

      <Modal visible={!!podglad} transparent animationType="fade" onRequestClose={() => setPodglad(null)}>
        <Pressable onPress={() => setPodglad(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", alignItems: "center", justifyContent: "center" }}>
          {podglad && <KartaKolekcjonerska zawodnik={podglad.z} s={s} specjalna={podglad.k} szerokosc={260} />}
          {podglad && <Text style={[st.tekst, { marginTop: 14, fontWeight: "800" }]}>{podglad.z.imie} {podglad.z.nazwisko}</Text>}
          {podglad?.k && <Text style={st.maly}>{INFO_SPECJALNEJ[podglad.k.typ].nazwa} · {podglad.k.klubNazwa} · {podglad.k.opis}</Text>}
          <Text style={[st.maly, { marginTop: 8 }]}>Dotknij, aby zamknąć</Text>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
