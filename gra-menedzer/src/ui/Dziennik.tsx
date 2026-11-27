// Dziennik kariery trenera — oś czasu kluczowych momentów (dane: src/engine/dziennik.ts).
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { aktualizujKronike, momentyDziennika, type MomentKariery, type TypMomentu } from "../engine/dziennik";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

const sezTxt = (r: number) => `${r}/${String((r + 1) % 100).padStart(2, "0")}`;
const kiedy = (m: MomentKariery) => (m.kolejka <= 0 ? "przed sezonem" : m.kolejka >= 98 ? "koniec sezonu" : `${m.kolejka}. kolejka`);

const FILTRY: { id: string; nazwa: string; typy?: TypMomentu[]; waga?: number }[] = [
  { id: "wszystko", nazwa: "Wszystko" },
  { id: "milowe", nazwa: "⭐ Kamienie milowe", waga: 3 },
  { id: "mecze", nazwa: "⚽ Mecze", typy: ["debiut", "pierwszaWygrana", "pierwszyMecz", "derby", "pogrom", "jubileusz"] },
  { id: "trofea", nazwa: "🏆 Trofea", typy: ["tytul", "puchar", "awans", "spadek", "europa"] },
  { id: "kariera", nazwa: "💼 Kariera", typy: ["start", "nowyKlub", "odejscie", "zwolnienie", "kontrakt", "licencja"] },
  { id: "transfery", nazwa: "💰 Transfery", typy: ["kupno", "sprzedaz", "legenda"] },
  { id: "osiag", nazwa: "🏅 Osiągnięcia", typy: ["osiagniecie"] },
];

function kolorTypu(t: TypMomentu): string {
  if (t === "tytul" || t === "puchar" || t === "europa") return K.akcent;
  if (t === "awans" || t === "pierwszaWygrana" || t === "derby" || t === "pogrom") return K.zielony;
  if (t === "spadek" || t === "zwolnienie") return K.czerwony;
  if (t === "kupno" || t === "sprzedaz" || t === "kontrakt" || t === "licencja") return K.niebieski;
  return K.szary;
}

function WierszMomentu({ m, ostatni }: { m: MomentKariery; ostatni: boolean }) {
  const kol = kolorTypu(m.typ);
  const mocny = (m.waga ?? 1) >= 3;
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <View style={{ width: 30, alignItems: "center" }}>
        <View style={{ width: mocny ? 30 : 24, height: mocny ? 30 : 24, borderRadius: 15, backgroundColor: K.karta2, borderWidth: 2, borderColor: kol, alignItems: "center", justifyContent: "center", marginTop: mocny ? 0 : 3 }}>
          <Text style={{ fontSize: mocny ? 14 : 11 }}>{m.ikona}</Text>
        </View>
        {!ostatni && <View style={{ flex: 1, width: 2, backgroundColor: K.liniaMocna, marginTop: 2 }} />}
      </View>
      <View style={{ flex: 1, paddingBottom: 12 }}>
        <Text style={[st.tekst, { fontSize: mocny ? 15 : 13.5, fontWeight: mocny ? "800" : "700", color: mocny ? K.tekst : K.tekst }]}>{m.tytul}</Text>
        {m.opis ? <Text style={[st.maly, { fontSize: 12.5 }]}>{m.opis}</Text> : null}
        <Text style={[st.maly, { fontSize: 11, color: kol, marginTop: 1 }]}>{kiedy(m)}{m.klub ? ` · ${m.klub}` : ""}</Text>
      </View>
    </View>
  );
}

/** Oś czasu (bez okna) — do osadzania w innych widokach. */
export function OsCzasu({ momenty }: { momenty: MomentKariery[] }) {
  const sezony = useMemo(() => {
    const m = new Map<number, MomentKariery[]>();
    for (const x of momenty) m.set(x.sezon, [...(m.get(x.sezon) ?? []), x]);
    return [...m.entries()].sort((a, b) => b[0] - a[0]); // najnowszy sezon na górze
  }, [momenty]);
  if (!momenty.length) return <Text style={st.maly}>Dziennik jest jeszcze pusty — pierwsze wpisy pojawią się po rozegraniu meczu.</Text>;
  return (
    <View>
      {sezony.map(([sezon, lista]) => (
        <View key={sezon} style={{ marginBottom: 6 }}>
          <View style={[st.wiersz, { gap: 8, marginBottom: 8 }]}>
            <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 15 }}>Sezon {sezTxt(sezon)}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: K.linia }} />
            <Text style={[st.maly, { fontSize: 11 }]}>{lista.length} {lista.length === 1 ? "wpis" : "wpisów"}</Text>
          </View>
          {lista.map((m, i) => <WierszMomentu key={m.klucz} m={m} ostatni={i === lista.length - 1} />)}
        </View>
      ))}
    </View>
  );
}

/** Skrót dziennika: ostatnie kamienie milowe (np. w Karierze trenera). */
export function DziennikSkrot({ s, ile = 4, onWiecej }: { s: StanGry; ile?: number; onWiecej?: () => void }) {
  const ost = momentyDziennika(s).filter((m) => (m.waga ?? 1) >= 2).slice(-ile).reverse();
  return (
    <View>
      <Text style={st.naglowek}>📖 Dziennik kariery</Text>
      {ost.length === 0 ? <Text style={st.maly}>Brak wpisów.</Text> : ost.map((m) => (
        <View key={m.klucz} style={[st.wiersz, { gap: 8, paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]}>
          <Text style={{ fontSize: 16 }}>{m.ikona}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.tekst, { fontSize: 13.5, fontWeight: "700" }]} numberOfLines={1}>{m.tytul}</Text>
            <Text style={[st.maly, { fontSize: 11 }]}>{sezTxt(m.sezon)} · {kiedy(m)}</Text>
          </View>
        </View>
      ))}
      {onWiecej && (
        <Pressable onPress={onWiecej} style={{ marginTop: 6 }}><Text style={[st.maly, { color: K.niebieski }]}>Cały dziennik ({momentyDziennika(s).length} wpisów) →</Text></Pressable>
      )}
    </View>
  );
}

export function Dziennik({ s, widoczny, onClose }: { s: StanGry; widoczny: boolean; onClose: () => void }) {
  const [filtr, setFiltr] = useState("wszystko");
  const [wersja, setWersja] = useState(0);
  useEffect(() => { if (widoczny) { aktualizujKronike(s); setWersja((v) => v + 1); } }, [widoczny, s]);
  const f = FILTRY.find((x) => x.id === filtr) ?? FILTRY[0];
  const momenty = useMemo(() => momentyDziennika(s).filter((m) => (!f.typy || f.typy.includes(m.typ)) && (!f.waga || (m.waga ?? 1) >= f.waga)), [s, f, wersja]);
  const wszystkie = momentyDziennika(s);
  const ile = (t: TypMomentu[]) => wszystkie.filter((m) => t.includes(m.typ)).length;

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "92%", paddingBottom: 20 }]}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={st.tytul}>📖 Dziennik kariery</Text>
            <Text style={[st.maly, { marginBottom: 10 }]}>{s.trener} — najważniejsze chwile na ławce trenerskiej.</Text>
            <View style={[st.wiersz, { justifyContent: "space-between", marginBottom: 12 }]}>
              {([["🏆", ile(["tytul", "puchar"]), "trofea"], ["⬆", ile(["awans"]), "awanse"], ["⚔️", ile(["derby"]), "derby"], ["🤝", ile(["start", "nowyKlub"]), "kluby"], ["🏅", ile(["osiagniecie"]), "osiągn."]] as const).map(([ik, n, et]) => (
                <View key={et} style={{ alignItems: "center", flex: 1 }}>
                  <Text style={{ fontSize: 16 }}>{ik}</Text>
                  <Text style={{ color: K.tekst, fontSize: 18, fontWeight: "900" }}>{n}</Text>
                  <Text style={[st.maly, { fontSize: 10.5 }]}>{et}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
              {FILTRY.map((x) => (
                <Pressable key={x.id} onPress={() => setFiltr(x.id)} style={[st.chip, filtr === x.id && st.chipAktywny]}>
                  <Text style={{ color: filtr === x.id ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{x.nazwa}</Text>
                </Pressable>
              ))}
            </View>
            <OsCzasu momenty={momenty} />
            <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 16 }]} onPress={onClose}>
              <Text style={st.przyciskTekst}>Zamknij</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
