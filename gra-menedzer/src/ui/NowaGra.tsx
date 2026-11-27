import { useRef, useState, type ReactNode } from "react";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SCIEZKI } from "../data/sciezki";
import { nowaGra, silaKlubu } from "../engine/swiat";
import { rozpocznijKariere } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { LogoLigi } from "./LogoLigi";
import Svg, { Path } from "react-native-svg";
import { kontur } from "../data/granice";
import { KreatorKlubu } from "./KreatorKlubu";
import { stworzWlasnyKlub } from "../engine/wlasnyKlub";
import { cien, CZCIONKA, ikona3D, K, st, szklo3D } from "./styl";
import { nazwaLigi } from "../data/nazwyLigOficjalne";

// Barwy oryginalnych herbów lig (wg szczebla) i województw (wg regionu) — własne, nie kopie logo.
const BARWY_LIGI: [string, string, string][] = [
  ["Ekstraklasa", "#123a22", "#ffce47"], // złoto-zielony premium
  ["Pierwsza Liga", "#263445", "#b9c6d6"], // srebrno-granatowy
  ["Druga Liga", "#2f2214", "#d9a066"], // brązowy
  ["Trzecia Liga", "#123320", "#36d989"], // szmaragdowy
];
const BARWY_WOJ: Record<string, [string, string]> = {
  "Małopolskie": ["#9c1b2e", "#ffffff"],
  "Pomorskie": ["#123a63", "#ffd34d"],
  "Zachodniopomorskie": ["#1b4b86", "#e24b4b"],
  "Kujawsko-pomorskie": ["#9c1b1b", "#f0c23a"],
  "Warmińsko-mazurskie": ["#a3172b", "#f2f2f2"],
  "Podlaskie": ["#b3122e", "#f5d36b"],
};
// Oryginalne logo lig (bez generowanych odznak) i kontury województw (prawdziwe granice) zamiast wymyślonych herbów.
const NAZWY_LOGO = ["PKO BP Ekstraklasa", "Betclic 1. Liga", "Betclic 2. Liga", "Betclic 3. Liga"];
const crestLigi = (idx: number, r = 38) => idx === 0
  ? <View style={{ width: r * 3.4, height: r, justifyContent: "center" }}><LogoLigi nazwa={NAZWY_LOGO[0]} poziom={1} rozmiar={r * 0.68} /></View> // pełne logo PKO BP Ekstraklasy
  : <View style={{ width: r * 1.25, height: r, alignItems: "center", justifyContent: "center" }}><LogoLigi nazwa={NAZWY_LOGO[Math.min(idx, 3)]} poziom={idx + 1} rozmiar={r * 0.9} /></View>;
const KLUCZ_WOJ: Record<string, string> = { "Małopolskie": "małopolskie", "Pomorskie": "pomorskie", "Zachodniopomorskie": "zachodniopomorskie", "Kujawsko-pomorskie": "kujawsko-pomorskie", "Warmińsko-mazurskie": "warmińsko-mazurskie", "Podlaskie": "podlaskie" };
// województwo = herb jego wojewódzkiego ZPN (oryginalne logo związku, bez tła)
const crestWoj = (label: string, r = 38) => <View style={{ width: r * 1.15, height: r * 1.15, alignItems: "center", justifyContent: "center" }}><LogoLigi nazwa={`${label} ZPN`} rozmiar={r * 1.1} /></View>;

/** Najniższa klasa rozgrywkowa województwa (podlaskie kończy się na klasie A — brak klasy B). */
const najnizsza = (label: string) => (label === "Podlaskie" ? "klasa A" : "klasa B");
// ——— Struktura wyboru: ligi krajowe + województwa (IV liga → najniższa klasa) ———
const PREF = (n: string) => n.split(" — ")[0].trim();
const WOJ_LABEL: Record<string, string> = {
  "Małopolska": "Małopolskie", "Pomorskie": "Pomorskie", "Zachodniopomorskie": "Zachodniopomorskie", "Kujawsko-Pomorskie": "Kujawsko-pomorskie",
  "Warmińsko-Mazurskie": "Warmińsko-mazurskie", "Podlaskie": "Podlaskie",
};
// Województwa (alfabetycznie) → ich ścieżki.
const WOJEWODZTWA = (() => {
  const m: Record<string, { label: string; sciezki: typeof SCIEZKI }> = {};
  for (const s of SCIEZKI) {
    const p = PREF(s.nazwa);
    const label = WOJ_LABEL[p];
    if (!label) continue; // pomijamy „Losowy region"
    (m[label] ??= { label, sciezki: [] as any }).sciezki.push(s);
  }
  return Object.values(m).sort((a, b) => a.label.localeCompare(b.label, "pl"));
})();
// Grupy III ligi (idx 3) — bez losowego regionu.
const TRZECIA_GRUPY = (() => {
  const seen = new Set<string>();
  const out: { nazwa: string; sciezkaId: string }[] = [];
  for (const s of SCIEZKI) {
    if (!WOJ_LABEL[PREF(s.nazwa)]) continue;
    const n = s.ligi[3]?.nazwa;
    if (n && !seen.has(n)) { seen.add(n); out.push({ nazwa: n, sciezkaId: s.id }); }
  }
  return out;
})();
// Klasyfikacja szczebla regionalnego po nazwie ligi.
function poziomLabel(nazwa: string): string {
  if (/IV liga/i.test(nazwa)) return "IV liga";
  if (/V liga/i.test(nazwa)) return "V liga";
  if (/okręgow/i.test(nazwa)) return "Klasa okręgowa";
  if (/Klasa A/i.test(nazwa)) return "Klasa A";
  if (/Klasa B/i.test(nazwa)) return "Klasa B";
  if (/Klasa C/i.test(nazwa)) return "Klasa C";
  return nazwa;
}
const KOLEJNOSC = ["IV liga", "V liga", "Klasa okręgowa", "Klasa A", "Klasa B", "Klasa C"];
// Dla województwa: szczeble (idx 4..8) → grupy (distinct nazwy).
function szczebleWoj(woj: { sciezki: typeof SCIEZKI }) {
  const seen = new Set<string>();
  const grupy: { label: string; nazwa: string; sciezkaId: string; idx: number }[] = [];
  for (const s of woj.sciezki) {
    for (let idx = 4; idx <= 8; idx++) {
      const n = s.ligi[idx]?.nazwa;
      if (n && !seen.has(n)) { seen.add(n); grupy.push({ label: poziomLabel(n), nazwa: n, sciezkaId: s.id, idx }); }
    }
  }
  // pogrupuj po szczeblu, zachowaj kolejność IV→C
  const poziomy: { label: string; grupy: typeof grupy }[] = [];
  for (const lab of KOLEJNOSC) {
    const g = grupy.filter((x) => x.label === lab);
    if (g.length) poziomy.push({ label: lab, grupy: g });
  }
  return poziomy;
}

const REPR = SCIEZKI[0]; // dowolna ścieżka ma ligi krajowe (te same kluby)

type Widok =
  | { typ: "root" }
  | { typ: "trzecia" }
  | { typ: "woj"; wi: number }
  | { typ: "wojLevel"; wi: number; label: string; grupy: { nazwa: string; sciezkaId: string; idx: number }[] }
  | { typ: "kluby"; sciezkaId: string; idx: number; tytul: string; powrot: Widok }
  | { typ: "kreator"; sciezkaId: string; idx: number; powrot: Widok };

export function NowaGra({ onStart }: { onStart: (s: StanGry) => void }) {
  const [trener, setTrener] = useState("");
  const [ziarno, setZiarno] = useState(0);
  const [widok, setWidok] = useState<Widok>({ typ: "root" });
  const cache = useRef<Map<string, StanGry>>(new Map());

  const budujSwiat = (sciezkaId: string) => {
    const key = sciezkaId + ":" + ziarno;
    if (!cache.current.has(key)) cache.current.set(key, nowaGra(trener || "Trener", SCIEZKI.find((x) => x.id === sciezkaId)!));
    return cache.current.get(key)!;
  };
  const otworzKluby = (sciezkaId: string, idx: number, tytul: string, powrot: Widok) => setWidok({ typ: "kluby", sciezkaId, idx, tytul, powrot });
  const wybierz = (sciezkaId: string, klubId: string) => {
    const sw = budujSwiat(sciezkaId);
    sw.trener = trener.trim() || "Trener";
    rozpocznijKariere(sw, klubId);
    onStart(sw);
  };

  const Pasek = ({ tytul, pod, onBack }: { tytul: string; pod?: string; onBack: () => void }) => (
    <View style={[st.wiersz, { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: K.pas, borderBottomWidth: 1, borderBottomColor: K.liniaMocna }]}>
      <Pressable onPress={onBack} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.linia, ...szklo3D, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={{ color: K.akcent, fontSize: 16, fontWeight: "900", marginRight: 4, fontFamily: CZCIONKA }}>‹</Text>
        <Text style={{ color: K.tekst, fontSize: 13, fontWeight: "700", fontFamily: CZCIONKA }}>Wstecz</Text>
      </Pressable>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={{ color: K.tekst, fontSize: 15, fontWeight: "800", fontFamily: CZCIONKA }}>{tytul}</Text>
        {pod ? <Text numberOfLines={1} style={{ color: K.szary, fontSize: 11.5, fontFamily: CZCIONKA }}>{pod}</Text> : null}
      </View>
    </View>
  );

  const Pozycja = ({ ikona, herb, tytul, pod, onPress, zlote }: { ikona?: string; herb?: ReactNode; tytul: string; pod?: string; onPress: () => void; zlote?: boolean }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [st.karta, st.wiersz, { marginTop: 8, paddingVertical: 14, opacity: pressed ? 0.85 : 1, borderColor: zlote ? "rgba(255,206,71,0.4)" : K.linia }]}>
      {herb ? <View style={{ marginRight: 12 }}>{herb}</View>
        : ikona ? <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.liniaMocna, ...ikona3D, alignItems: "center", justifyContent: "center", marginRight: 12 }}><Text style={{ fontSize: 20 }}>{ikona}</Text></View> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: K.tekst, fontSize: 15.5, fontWeight: "800", fontFamily: CZCIONKA }}>{tytul}</Text>
        {pod ? <Text style={{ color: K.szary, fontSize: 12, marginTop: 1, fontFamily: CZCIONKA }}>{pod}</Text> : null}
      </View>
      <Text style={{ color: K.akcent, fontSize: 20, fontWeight: "900" }}>›</Text>
    </Pressable>
  );

  // ——— Kreator własnego klubu ———
  if (widok.typ === "kreator") {
    const sw = budujSwiat(widok.sciezkaId);
    return <KreatorKlubu sw={sw} idx={widok.idx} onWstecz={() => setWidok(widok.powrot)} onUtworz={(o) => {
      sw.trener = trener.trim() || "Trener";
      const id = stworzWlasnyKlub(sw, o);
      rozpocznijKariere(sw, id);
      onStart(sw);
    }} />;
  }

  // ——— Ekran klubów ———
  if (widok.typ === "kluby") {
    const sw = budujSwiat(widok.sciezkaId);
    const liga = sw.ligi[widok.idx];
    const kluby = [...liga.kluby].sort((a, b) => sw.kluby[a].nazwa.localeCompare(sw.kluby[b].nazwa, "pl"));
    return (
      <View style={st.ekran}>
        <Pasek tytul="Wybierz klub" pod={`${nazwaLigi(widok.tytul)} · ${kluby.length} klubów`} onBack={() => setWidok(widok.powrot)} />
        <Pressable onPress={() => setWidok({ typ: "kreator", sciezkaId: widok.sciezkaId, idx: widok.idx, powrot: widok })}
          style={({ pressed }) => [st.karta, st.wiersz, { marginTop: 8, paddingVertical: 14, borderColor: K.akcent, borderWidth: 1, opacity: pressed ? 0.85 : 1 }]}>
          <Text style={{ fontSize: 26, marginRight: 12 }}>🏗</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: K.akcent, fontSize: 15.5, fontWeight: "900", fontFamily: CZCIONKA }}>＋ Stwórz własny klub w tej lidze</Text>
            <Text style={st.maly}>Nazwa, barwy, herb, stadion, właściciel, budżet — od zera</Text>
          </View>
        </Pressable>
        <FlatList
          data={kluby}
          keyExtractor={(id) => id}
          contentContainerStyle={{ paddingBottom: 28, paddingTop: 4 }}
          renderItem={({ item }) => {
            const k = sw.kluby[item];
            return (
              <Pressable onPress={() => wybierz(widok.sciezkaId, item)} style={({ pressed }) => [st.karta, st.wiersz, { marginTop: 8, paddingVertical: 12, opacity: pressed ? 0.85 : 1 }]}>
                <Herb klub={k} rozmiar={34} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: K.tekst, fontSize: 15.5, fontWeight: "700", fontFamily: CZCIONKA }}>{k.nazwa}</Text>
                  <Text style={st.maly}>{k.miasto} · OVR {silaKlubu(sw, item).toFixed(0)}</Text>
                </View>
                <View style={{ backgroundColor: "rgba(255,206,71,0.14)", borderRadius: 11, paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ color: K.akcent, fontWeight: "800", fontSize: 13, fontFamily: CZCIONKA }}>Wybierz ›</Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    );
  }

  // ——— Grupy III ligi ———
  if (widok.typ === "trzecia") {
    return (
      <View style={st.ekran}>
        <Pasek tytul="Betclic 3. Liga" pod="Wybierz grupę" onBack={() => setWidok({ typ: "root" })} />
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 26 }}>
          {TRZECIA_GRUPY.map((g) => (
            <Pozycja key={g.nazwa} herb={crestLigi(3)} tytul={nazwaLigi(g.nazwa)} pod="III liga" onPress={() => otworzKluby(g.sciezkaId, 3, g.nazwa, { typ: "trzecia" })} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // ——— Szczeble województwa ———
  if (widok.typ === "woj") {
    const woj = WOJEWODZTWA[widok.wi];
    const poziomy = szczebleWoj(woj);
    return (
      <View style={st.ekran}>
        <Pasek tytul={woj.label} pod={`Wybierz szczebel (IV liga → ${najnizsza(woj.label)})`} onBack={() => setWidok({ typ: "root" })} />
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 26 }}>
          {poziomy.map((p) => (
            <Pozycja key={p.label} herb={<View style={{ width: 46, height: 38, alignItems: "center", justifyContent: "center" }}><LogoLigi nazwa={`${p.label} ${woj.label}`} rozmiar={30} /></View>} tytul={p.label} pod={p.grupy.length > 1 ? `${p.grupy.length} grup` : nazwaLigi(p.grupy[0].nazwa)}
              onPress={() => p.grupy.length > 1 ? setWidok({ typ: "wojLevel", wi: widok.wi, label: p.label, grupy: p.grupy }) : otworzKluby(p.grupy[0].sciezkaId, p.grupy[0].idx, p.grupy[0].nazwa, { typ: "woj", wi: widok.wi })} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // ——— Grupy wewnątrz szczebla województwa ———
  if (widok.typ === "wojLevel") {
    const woj = WOJEWODZTWA[widok.wi];
    return (
      <View style={st.ekran}>
        <Pasek tytul={`${woj.label} · ${widok.label}`} pod="Wybierz grupę" onBack={() => setWidok({ typ: "woj", wi: widok.wi })} />
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 26 }}>
          {widok.grupy.map((g) => (
            <Pozycja key={g.nazwa} tytul={nazwaLigi(g.nazwa)} onPress={() => otworzKluby(g.sciezkaId, g.idx, g.nazwa, { typ: "wojLevel", wi: widok.wi, label: widok.label, grupy: widok.grupy })} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // ——— ROOT ———
  return (
    <ScrollView style={st.ekran} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={st.karta}>
        <Text style={st.naglowek}>Imię i nazwisko trenera</Text>
        <TextInput style={st.input} value={trener} onChangeText={setTrener} placeholder="np. Jan Kowalski" placeholderTextColor={K.szary} />
        <Pressable onPress={() => { cache.current.clear(); setZiarno(ziarno + 1); }} style={{ marginTop: 10 }}>
          <Text style={[st.maly, { color: K.niebieski, fontWeight: "700" }]}>↻ Wylosuj kadry od nowa</Text>
        </Pressable>
      </View>

      <Text style={[st.naglowek, { marginHorizontal: 16, marginTop: 14 }]}>Ligi krajowe</Text>
      <Pozycja herb={crestLigi(0)} tytul={REPR.ligi[0].nazwa} pod="Najwyższy poziom" zlote onPress={() => otworzKluby(REPR.id, 0, REPR.ligi[0].nazwa, { typ: "root" })} />
      <Pozycja herb={crestLigi(1)} tytul={REPR.ligi[1].nazwa} onPress={() => otworzKluby(REPR.id, 1, REPR.ligi[1].nazwa, { typ: "root" })} />
      <Pozycja herb={crestLigi(2)} tytul={REPR.ligi[2].nazwa} onPress={() => otworzKluby(REPR.id, 2, REPR.ligi[2].nazwa, { typ: "root" })} />
      <Pozycja herb={crestLigi(3)} tytul="Betclic 3. Liga" pod={`${TRZECIA_GRUPY.length} grupy`} onPress={() => setWidok({ typ: "trzecia" })} />

      <Text style={[st.naglowek, { marginHorizontal: 16, marginTop: 18 }]}>Województwa — IV liga i niżej</Text>
      {WOJEWODZTWA.map((w, i) => (
        <Pozycja key={w.label} herb={crestWoj(w.label)} tytul={w.label} pod={`IV liga → ${najnizsza(w.label)}`} onPress={() => setWidok({ typ: "woj", wi: i })} />
      ))}
      <View style={{ height: 8 }} />
    </ScrollView>
  );
}
