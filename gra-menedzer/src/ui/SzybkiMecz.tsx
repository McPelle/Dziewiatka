// Tryb „Szybki mecz": dowolne dwie drużyny (Ekstraklasa → B-klasa, 4 województwa), mecz na żywo w 3D z całą otoczką
// (przedmecz, kibice, oprawy, ochrona), opcjonalnie jak w pucharze (dogrywka i karne). Nie wpływa na karierę.
import { useMemo, useRef, useState } from "react";
import { SCIEZKI } from "../data/sciezki";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { nowaGra } from "../engine/swiat";
import { rozpocznijKariere } from "../engine/sezon";
import type { MeczLive } from "../engine/meczNaZywo";
import type { StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { MeczNaZywo } from "./MeczNaZywo";
import { CZCIONKA, K, st } from "./styl";

export function SzybkiMecz({ onWstecz }: { onWstecz: () => void }) {
  // świat gry per region (podokręg) — prawdziwe kluby od Ekstraklasy po B-klasę z oryginalnymi herbami; tworzony na żądanie
  const swiaty = useRef(new Map<number, StanGry>());
  const [region, setRegion] = useState(() => Math.max(0, SCIEZKI.findIndex((x) => x.nazwa.startsWith("Pomorskie"))));
  const swiat = (i: number) => { let w = swiaty.current.get(i); if (!w) { w = nowaGra("Trener", SCIEZKI[i]); swiaty.current.set(i, w); } return w; };
  const s = useMemo(() => swiat(region), [region]);
  const [domR, setDomR] = useState<number>(region), [goscR, setGoscR] = useState<number>(region);
  const [gra, setGra] = useState<StanGry | null>(null);
  const [liga, setLiga] = useState<number>(0);
  const [szukaj, setSzukaj] = useState("");
  const [dom, setDom] = useState<string | null>(null);
  const [gosc, setGosc] = useState<string | null>(null);
  const [puchar, setPuchar] = useState(false);
  const [gram, setGram] = useState<[string, string] | null>(null);
  const [wynik, setWynik] = useState<MeczLive | null>(null);
  const kluby = useMemo(() => {
    const f = szukaj.trim().toLowerCase();
    const wszystkie = f ? Object.values(s.kluby).filter((k) => k.nazwa.toLowerCase().includes(f) || k.miasto.toLowerCase().includes(f)) : (s.ligi[liga]?.kluby ?? []).map((id) => s.kluby[id]);
    return wszystkie.filter(Boolean).slice(0, 60);
  }, [liga, szukaj, s]);
  const wybierz = (id: string) => { if (!dom || (dom && gosc)) { setDom(id); setDomR(region); setGosc(null); } else if (id !== dom || goscR !== region) { setGosc(id); setGoscR(region); } };
  const start = () => {
    if (!dom || !gosc) return;
    const w = swiat(domR); let g = gosc;
    if (goscR !== domR) { // drużyna z innego regionu — „dowozimy" ją (kopia klubu i zawodników z nowymi id)
      const src = swiat(goscR), k = src.kluby[gosc], nowyId = `q_${gosc}_${Date.now() % 100000}`;
      const mapa = new Map<string, string>();
      for (const zid of k.zawodnicy) { const z = src.zawodnicy[zid]; if (!z) continue; const nid = `q_${zid}_${nowyId}`; mapa.set(zid, nid); w.zawodnicy[nid] = { ...JSON.parse(JSON.stringify(z)), id: nid, klubId: nowyId }; }
      w.kluby[nowyId] = { ...JSON.parse(JSON.stringify(k)), id: nowyId, zawodnicy: k.zawodnicy.map((x) => mapa.get(x)!).filter(Boolean) };
      g = nowyId;
    }
    rozpocznijKariere(w, dom); // „Twoja" drużyna = gospodarz (sterujesz nią w meczu)
    w.okres = undefined;
    setGra(w); setWynik(null); setGram([dom, g]);
  };
  const Klub = ({ id, r }: { id: string | null; r: number }) => { const k = id ? swiat(r).kluby[id] : null; return (
    <View style={{ flex: 1, alignItems: "center", padding: 8, backgroundColor: K.karta, borderRadius: 12, borderWidth: 1, borderColor: k ? K.akcent : K.linia }}>
      {k ? <Herb klub={k} rozmiar={44} /> : <Text style={{ fontSize: 30 }}>❔</Text>}
      <Text style={[st.tekst, { fontSize: 13, textAlign: "center", marginTop: 4 }]} numberOfLines={2}>{k ? k.nazwa : "wybierz"}</Text>
      {k && <Text style={[st.maly, { fontSize: 10.5 }]}>{swiat(r).ligi[k.poziom - 1]?.nazwa ?? ""}</Text>}
    </View>); };

  return (
    <View style={{ flex: 1, backgroundColor: K.tlo }}>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Pressable onPress={onWstecz} style={{ marginBottom: 8 }}><Text style={[st.maly, { color: K.akcent, fontSize: 14 }]}>‹ Wstecz</Text></Pressable>
        <Text style={[st.tytul, { fontSize: 22, fontFamily: CZCIONKA }]}>⚡ Szybki mecz</Text>
        <Text style={st.maly}>Dowolne dwie drużyny — mecz na żywo w 3D z przedmeczem, kibicami i oprawami. Bez wpływu na karierę.</Text>
        <View style={[st.wiersz, { gap: 8, marginTop: 12, alignItems: "center" }]}>
          <Klub id={dom} r={domR} /><Text style={[st.tytul, { fontSize: 18 }]}>vs</Text><Klub id={gosc} r={goscR} />
        </View>
        <Text style={[st.maly, { marginTop: 6 }]}>{!dom ? "Dotknij drużyny gospodarzy (nią sterujesz)." : !gosc ? "Teraz drużyna gości." : "Gotowe — możesz zmienić wybór, dotykając innej drużyny."}</Text>
        <Pressable onPress={() => setPuchar(!puchar)} style={[st.przyciskMaly, { marginTop: 8, alignItems: "flex-start", borderColor: puchar ? K.akcent : K.linia }]}>
          <Text style={st.przyciskMalyTekst}>{puchar ? "✅" : "⬜"} Mecz pucharowy (przy remisie dogrywka i rzuty karne)</Text>
        </Pressable>
        <Pressable disabled={!dom || !gosc} onPress={start} style={[st.przycisk, { opacity: dom && gosc ? 1 : 0.4 }]}><Text style={st.przyciskTekst}>▶ Graj mecz</Text></Pressable>
        <Text style={[st.naglowek, { marginTop: 12 }]}>Region (województwo / podokręg)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
          {SCIEZKI.map((x, i) => x.nazwa).map((n, i) => <Pressable key={i} onPress={() => { setRegion(i); setLiga(0); }} style={[st.chip, { marginBottom: 0, paddingVertical: 4 }, region === i && st.chipAktywny]}><Text style={{ color: region === i ? "#17310f" : K.tekst, fontSize: 10.5 }}>{n}</Text></Pressable>)}
        </View>
        <TextInput value={szukaj} onChangeText={setSzukaj} placeholder="Szukaj klubu lub miasta…" placeholderTextColor={K.szary} style={{ backgroundColor: K.karta, color: K.tekst, borderRadius: 10, padding: 10, marginTop: 12, borderWidth: 1, borderColor: K.linia }} />
        {!szukaj && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
          {s.ligi.map((l, i) => <Pressable key={i} onPress={() => setLiga(i)} style={[st.chip, { marginBottom: 0 }, liga === i && st.chipAktywny]}><Text style={{ color: liga === i ? "#17310f" : K.tekst, fontSize: 11.5 }}>{l.nazwa}</Text></Pressable>)}
        </View>}
        {kluby.map((k) => (
          <Pressable key={k.id} onPress={() => wybierz(k.id)} style={[st.wiersz, { gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: K.linia, backgroundColor: k.id === dom || k.id === gosc ? "rgba(255,206,71,0.12)" : "transparent" }]}>
            <Herb klub={k} rozmiar={28} />
            <View style={{ flex: 1 }}><Text style={[st.tekst, { fontSize: 13.5 }]}>{k.nazwa}</Text><Text style={st.maly}>{k.miasto} · {s.ligi[k.poziom - 1]?.nazwa ?? ""}</Text></View>
            <Text style={{ color: K.akcent }}>{k.id === dom && domR === region ? "🏠" : k.id === gosc && goscR === region ? "🚌" : "›"}</Text>
          </Pressable>))}
      </ScrollView>
      {gram && gra && <MeczNaZywo s={gra} para={gram} puchar={puchar ? { nazwa: "Szybki mecz — puchar", dogrywka: true, neutralny: false } : undefined}
        onAnuluj={() => setGram(null)} onKoniec={(m) => { setGram(null); setWynik(m); }} />}
      <Modal visible={!!wynik} transparent animationType="fade" onRequestClose={() => setWynik(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 24 }}>
          {wynik && <View style={[st.karta, { marginHorizontal: 0 }]}>
            <Text style={[st.tytul, { textAlign: "center" }]}>🏁 Koniec meczu</Text>
            <Text style={[st.tytul, { fontSize: 26, textAlign: "center", marginVertical: 8 }]}>{gra?.kluby[wynik.dom.klubId]?.nazwa} {wynik.gd}:{wynik.gg} {gra?.kluby[wynik.gosc.klubId]?.nazwa}</Text>
            {wynik.karne && <Text style={[st.tekst, { textAlign: "center" }]}>Karne {wynik.karne.d.filter(Boolean).length}:{wynik.karne.g.filter(Boolean).length}</Text>}
            <Text style={[st.maly, { textAlign: "center" }]}>Strzały {wynik.staty.strz[0]}:{wynik.staty.strz[1]} · xG {wynik.staty.xg[0].toFixed(1)}:{wynik.staty.xg[1].toFixed(1)}</Text>
            <Pressable style={st.przycisk} onPress={() => { setWynik(null); }}><Text style={st.przyciskTekst}>Rewanż / inny mecz</Text></Pressable>
            <Pressable style={[st.przycisk, { backgroundColor: "transparent", borderWidth: 1, borderColor: K.linia }]} onPress={onWstecz}><Text style={[st.przyciskTekst, { color: K.tekst }]}>Menu główne</Text></Pressable>
          </View>}
        </View>
      </Modal>
    </View>
  );
}
