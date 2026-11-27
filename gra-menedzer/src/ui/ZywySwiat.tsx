import { Pressable, Text, View } from "react-native";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

/** Lokalna prasa i media społecznościowe kibiców. */
export function PrasaKibice({ s }: { s: StanGry }) {
  const prasa = s.prasa ?? [], social = s.social ?? [];
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Text style={st.naglowek}>📰 Prasa</Text>
      {prasa.length === 0 ? <Text style={st.maly}>Pierwszy artykuł po najbliższym meczu.</Text> : prasa.slice(0, 6).map((a, i) => (
        <View key={i} style={{ paddingVertical: 7, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }}>
          <Text style={[st.maly, { color: K.akcent, fontWeight: "800" }]}>{a.gazeta} · kolejka {a.kolejka + 1} · ocena drużyny {a.ocena}/10</Text>
          <Text style={[st.tekst, { fontWeight: "900", fontSize: 15, marginTop: 2 }]}>{a.tytul}</Text>
          <Text style={[st.maly, { marginTop: 2 }]}>{a.lead}</Text>
        </View>))}
      <Text style={[st.naglowek, { marginTop: 12 }]}>💬 Kibice w sieci</Text>
      {social.length === 0 ? <Text style={st.maly}>Kibice odezwą się po meczu.</Text> : social.slice(0, 8).map((w, i) => (
        <View key={i} style={{ paddingVertical: 5, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }}>
          <Text style={[st.maly, { fontWeight: "800", color: K.niebieski }]}>@{w.autor}</Text>
          <Text style={[st.tekst, { fontSize: 13.5 }]}>{w.tekst} <Text style={st.maly}>  ❤️ {w.serca}</Text></Text>
        </View>))}
    </View>
  );
}

/** „Co dziś ważne" — sprawy czekające na decyzję trenera, w jednym miejscu. */
export function CoDzisWazne({ s, onPrzejdz }: { s: StanGry; onPrzejdz?: (gdzie: "transfery" | "sklad" | "klub") => void }) {
  const k = s.kluby[s.mojKlub];
  const wpisy: { ikona: string; tekst: string; gdzie?: "transfery" | "sklad" | "klub"; pilne?: boolean }[] = [];
  const czeka = (s.negocjacje ?? []).filter((n) => n.odpowiedz > (s.licznikDni ?? 0) + 1e6 && n.etap !== "zakonczona" && n.etap !== "zerwana");
  if (czeka.length) wpisy.push({ ikona: "📨", tekst: `Negocjacje czekają na Twoją decyzję: ${czeka.length}`, gdzie: "transfery", pilne: true });
  if (s.oferty?.length) wpisy.push({ ikona: "💰", tekst: `Oferty za Twoich zawodników: ${s.oferty.length}`, gdzie: "transfery", pilne: true });
  const kontuzje = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kontuzja > 0);
  if (kontuzje.length) wpisy.push({ ikona: "🚑", tekst: `Kontuzjowani: ${kontuzje.map((z) => `${z.nazwisko} (${z.kontuzja} kol.)`).join(", ")}`, gdzie: "sklad" });
  const zaw = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.zawieszenie > 0);
  if (zaw.length) wpisy.push({ ikona: "⛔", tekst: `Zawieszeni: ${zaw.map((z) => z.nazwisko).join(", ")}`, gdzie: "sklad" });
  const kartki = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kartki % 4 === 3);
  if (kartki.length) wpisy.push({ ikona: "🟨", tekst: `Jedna żółta do pauzy: ${kartki.map((z) => z.nazwisko).join(", ")}`, gdzie: "sklad" });
  const wygasa = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kontraktDo <= s.sezon && z.kontraktTyp !== "amator");
  if (wygasa.length) wpisy.push({ ikona: "📝", tekst: `Kontrakty kończą się po sezonie: ${wygasa.length} (np. ${wygasa.slice(0, 3).map((z) => z.nazwisko).join(", ")})`, gdzie: "transfery" });
  const chceOdejsc = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z?.prosiOTransfer);
  if (chceOdejsc.length) wpisy.push({ ikona: "✈", tekst: `Chcą odejść: ${chceOdejsc.map((z) => z.nazwisko).join(", ")} — porozmawiaj z nimi`, gdzie: "sklad" });
  const niezadowoleni = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.morale < 40);
  if (niezadowoleni.length) wpisy.push({ ikona: "😠", tekst: `Niskie morale: ${niezadowoleni.slice(0, 4).map((z) => z.nazwisko).join(", ")}`, gdzie: "sklad" });
  for (const b of s.budowy ?? []) wpisy.push({ ikona: "🏗", tekst: `${b.nazwa}: zostało ${Math.max(0, b.dniRazem + b.opoznienie - b.dniMinelo)} dni`, gdzie: "klub" });
  if (s.przetarg) wpisy.push({ ikona: "📑", tekst: `Otwarty przetarg: ${s.przetarg.nazwa} — wybierz firmę`, gdzie: "klub", pilne: true });
  if (k.kasa < 0) wpisy.push({ ikona: "⚠️", tekst: `Ujemne saldo klubu — zarząd się niecierpliwi`, pilne: true });
  if (s.taktyka.sklad.length < 11) wpisy.push({ ikona: "👕", tekst: `Skład niekompletny (${s.taktyka.sklad.length}/11)`, gdzie: "sklad", pilne: true });
  if (!wpisy.length) return null;
  return (
    <View style={[st.karta, { borderColor: K.akcent, borderWidth: 1 }]}>
      <Text style={st.naglowek}>📌 Co dziś ważne</Text>
      {wpisy.slice(0, 8).map((w, i) => (
        <Pressable key={i} disabled={!w.gdzie || !onPrzejdz} onPress={() => w.gdzie && onPrzejdz?.(w.gdzie)} style={{ paddingVertical: 5, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }}>
          <Text style={[st.tekst, { fontSize: 13.5, color: w.pilne ? K.akcent : K.tekst }]}>{w.ikona} {w.tekst}{w.gdzie && onPrzejdz ? <Text style={{ color: K.szary }}>  ›</Text> : null}</Text>
        </Pressable>))}
    </View>
  );
}
