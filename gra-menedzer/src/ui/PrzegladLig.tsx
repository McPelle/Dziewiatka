import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SCIEZKI } from "../data/sciezki";
import type { KlubDane } from "../data/kluby";
import { POZYCJE } from "../engine/mecz";
import { KADRA, nowyZawodnik, tabelaLigi } from "../engine/swiat";
import type { Klub, Pozycja, StanGry, Zawodnik } from "../engine/types";
import { SKROT_POZ } from "../data/pozycje";
import { Herb } from "./Herb";
import { ProfilZawodnika } from "./ProfilZawodnika";
import { WidokKlubu } from "./WidokKlubu";
import { CZCIONKA, K, KOLOR_POZ, st, szklo3D } from "./styl";

// „Wszystkie ligi" — podgląd całej gry z dowolnej kariery: ligi centralne, III liga (grupy) i 4 województwa (IV liga → klasa B/C).
// Ligi z Twojej piramidy są symulowane (żywa tabela, pełne kluby, oferty za zawodników).
// Pozostałe grupy/województwa: lista klubów z herbami i podgląd kadry (bez symulacji wyników — gra liczy tylko Twoją piramidę).

type LigaKat = { nazwa: string; poziom: number; kluby: KlubDane[] };
const WOJ = ["Małopolska", "Pomorskie", "Zachodniopomorskie", "Kujawsko-Pomorskie"];
const WOJ_ETYK: Record<string, string> = { "Małopolska": "Małopolskie", "Pomorskie": "Pomorskie", "Zachodniopomorskie": "Zachodniopomorskie", "Kujawsko-Pomorskie": "Kujawsko-pomorskie" };

/** Katalog wszystkich lig w danych gry (bez duplikatów). */
function katalog() {
  const centralne: LigaKat[] = [];
  const trzecia: LigaKat[] = [];
  const woj: Record<string, Record<string, LigaKat[]>> = {};
  const seen = new Set<string>();
  for (const sc of SCIEZKI) {
    const w = WOJ.find((x) => sc.nazwa.startsWith(x));
    sc.ligi.forEach((l, i) => {
      const poziom = i + 1;
      const klucz = `${poziom}|${l.nazwa}`;
      if (seen.has(klucz) || !l.kluby?.length) return;
      seen.add(klucz);
      const lk = { nazwa: l.nazwa, poziom, kluby: l.kluby };
      if (poziom <= 3) { if (!centralne.some((c) => c.poziom === poziom)) centralne.push(lk); return; }
      if (poziom === 4) { trzecia.push(lk); return; }
      if (!w) return;
      const szczebel = szczebelNazwy(l.nazwa);
      ((woj[w] ??= {})[szczebel] ??= []).push(lk);
    });
  }
  return { centralne: centralne.sort((a, b) => a.poziom - b.poziom), trzecia, woj };
}
function szczebelNazwy(n: string): string {
  const m = n.toLowerCase();
  if (m.includes("iv liga")) return "IV liga";
  if (m.includes("v liga")) return "V liga";
  if (m.includes("okręgow")) return "Klasa okręgowa";
  if (m.includes("klasa a")) return "Klasa A";
  if (m.includes("klasa b")) return "Klasa B";
  if (m.includes("klasa c")) return "Klasa C";
  return "Inne";
}
const KOLEJNOSC = ["IV liga", "V liga", "Klasa okręgowa", "Klasa A", "Klasa B", "Klasa C", "Inne"];

// Kadry klubów spoza symulacji — generowane raz na sesję (podgląd).
const cacheKadr = new Map<string, Zawodnik[]>();
function kadraPodgladu(s: StanGry, d: KlubDane, poziom: number): Zawodnik[] {
  const klucz = `${poziom}|${d.nazwa}`;
  const c = cacheKadr.get(klucz);
  if (c) return c;
  const tmp = { ...s, kluby: {}, zawodnicy: {}, licznikId: 0 } as StanGry;
  const lista = KADRA.map((poz) => nowyZawodnik(tmp, poziom, poz as Pozycja));
  lista.forEach((z, i) => { z.numer = i + 1; });
  cacheKadr.set(klucz, lista);
  return lista;
}

type Widok =
  | { t: "root" }
  | { t: "woj"; w: string }
  | { t: "szczebel"; w: string; sz: string }
  | { t: "liga"; l: LigaKat }
  | { t: "klubPodglad"; l: LigaKat; d: KlubDane };

export function PrzegladLig({ s, widoczny, onClose, odswiez }: { s: StanGry; widoczny: boolean; onClose: () => void; odswiez: () => void }) {
  const kat = useMemo(katalog, []);
  const [hist, setHist] = useState<Widok[]>([{ t: "root" }]);
  const [klubId, setKlubId] = useState<string | null>(null);
  const [zawId, setZawId] = useState<string | null>(null);
  const w = hist[hist.length - 1];
  const idz = (x: Widok) => setHist([...hist, x]);
  const wstecz = () => (hist.length > 1 ? setHist(hist.slice(0, -1)) : onClose());
  const zyjaca = (l: LigaKat) => s.ligi.find((x) => x.nazwa === l.nazwa || (l.poziom <= 3 && x.poziom === l.poziom));

  const Wiersz = ({ tytul, pod, onPress, herb, zlote }: { tytul: string; pod?: string; onPress: () => void; herb?: Klub; zlote?: boolean }) => (
    <Pressable onPress={onPress} style={[st.karta, st.wiersz, { marginTop: 6, paddingVertical: 10, borderColor: zlote ? K.akcent : K.linia, borderWidth: zlote ? 1 : 0 }]}>
      {herb ? <View style={{ marginRight: 10 }}><Herb klub={herb} rozmiar={32} /></View> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: K.tekst, fontWeight: "800", fontSize: 14.5, fontFamily: CZCIONKA }} numberOfLines={1}>{tytul}</Text>
        {pod ? <Text style={st.maly} numberOfLines={1}>{pod}</Text> : null}
      </View>
      <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 18 }}>›</Text>
    </Pressable>
  );
  const pseudoKlub = (d: KlubDane, poziom: number): Klub => ({ id: "p-" + d.nazwa, nazwa: d.nazwa, skrot: d.skrot, miasto: d.miasto, poziom, herb: (d as { herb?: string }).herb } as unknown as Klub);

  let tresc: React.ReactNode = null;
  let tytul = "🌍 Wszystkie ligi";
  if (w.t === "root") {
    tresc = (
      <View>
        <Text style={[st.maly, { marginBottom: 4 }]}>Ligi z Twojej piramidy są rozgrywane na żywo (★). Pozostałe — podgląd klubów i kadr.</Text>
        <Text style={st.naglowek}>Ligi centralne</Text>
        {kat.centralne.map((l) => <Wiersz key={l.nazwa} tytul={l.nazwa} pod={`${l.kluby.length} klubów ★`} onPress={() => idz({ t: "liga", l })} zlote={l.poziom === 1} />)}
        <Text style={[st.naglowek, { marginTop: 12 }]}>Betclic 3. Liga</Text>
        {kat.trzecia.map((l) => <Wiersz key={l.nazwa} tytul={l.nazwa} pod={`${l.kluby.length} klubów${zyjaca(l) ? " ★ Twoja grupa" : ""}`} onPress={() => idz({ t: "liga", l })} />)}
        <Text style={[st.naglowek, { marginTop: 12 }]}>Województwa — IV liga → klasa B</Text>
        {WOJ.filter((x) => kat.woj[x]).map((x) => <Wiersz key={x} tytul={WOJ_ETYK[x]} pod={`${Object.values(kat.woj[x]).flat().length} lig`} onPress={() => idz({ t: "woj", w: x })} />)}
      </View>
    );
  } else if (w.t === "woj") {
    tytul = WOJ_ETYK[w.w];
    tresc = <View>{KOLEJNOSC.filter((sz) => kat.woj[w.w]?.[sz]).map((sz) => <Wiersz key={sz} tytul={sz} pod={`${kat.woj[w.w][sz].length} ${kat.woj[w.w][sz].length === 1 ? "liga" : "grup"}`} onPress={() => idz({ t: "szczebel", w: w.w, sz })} />)}</View>;
  } else if (w.t === "szczebel") {
    tytul = `${WOJ_ETYK[w.w]} · ${w.sz}`;
    tresc = <View>{kat.woj[w.w][w.sz].map((l) => <Wiersz key={l.nazwa} tytul={l.nazwa} pod={`${l.kluby.length} klubów${zyjaca(l) ? " ★ Twoja piramida" : ""}`} onPress={() => idz({ t: "liga", l })} />)}</View>;
  } else if (w.t === "liga") {
    tytul = w.l.nazwa;
    const live = zyjaca(w.l);
    if (live) {
      const tab = tabelaLigi(s, live);
      tresc = (
        <View>
          <Text style={[st.maly, { color: K.zielony }]}>★ Liga rozgrywana — tabela na żywo. Dotknij klubu, by zobaczyć kadrę, stadion i złożyć ofertę za zawodnika.</Text>
          {tab.map((r, i) => {
            const k = s.kluby[r.klubId];
            return (
              <Pressable key={r.klubId} onPress={() => setKlubId(r.klubId)} style={[st.wiersz, { paddingVertical: 7, borderTopWidth: 1, borderTopColor: K.linia, backgroundColor: r.klubId === s.mojKlub ? "rgba(255,206,71,0.08)" : undefined }]}>
                <Text style={{ color: K.szary, width: 24, fontWeight: "700" }}>{i + 1}</Text>
                <Herb klub={k} rozmiar={24} />
                <Text style={[st.tekst, { flex: 1, marginLeft: 8, fontSize: 14 }]} numberOfLines={1}>{k.nazwa}</Text>
                <Text style={[st.maly, { width: 46, textAlign: "right" }]}>{r.m} m.</Text>
                <Text style={{ color: K.tekst, fontWeight: "900", width: 34, textAlign: "right" }}>{r.pkt}</Text>
              </Pressable>
            );
          })}
        </View>
      );
    } else {
      tresc = (
        <View>
          <Text style={[st.maly, { color: K.szary }]}>Liga spoza Twojej piramidy — gra nie symuluje tu wyników. Podgląd klubów, herbów, stadionów i kadr.</Text>
          {w.l.kluby.map((d) => <Wiersz key={d.nazwa} tytul={d.nazwa} pod={[d.miasto, (d as { stadion?: string }).stadion].filter(Boolean).join(" · ")} herb={pseudoKlub(d, w.l.poziom)} onPress={() => idz({ t: "klubPodglad", l: w.l, d })} />)}
        </View>
      );
    }
  } else if (w.t === "klubPodglad") {
    tytul = w.d.nazwa;
    const kadra = [...kadraPodgladu(s, w.d, w.l.poziom)].sort((a, b) => POZYCJE.indexOf(a.poz) - POZYCJE.indexOf(b.poz) || b.umiej - a.umiej);
    const dd = w.d as KlubDane & { stadion?: string; adres?: string };
    tresc = (
      <View>
        <View style={[st.karta, st.wiersz, { gap: 14 }]}>
          <Herb klub={pseudoKlub(w.d, w.l.poziom)} rozmiar={64} />
          <View style={{ flex: 1 }}>
            <Text style={st.tytul}>{w.d.nazwa}</Text>
            <Text style={st.maly}>{w.l.nazwa}</Text>
            <Text style={st.maly}>{w.d.miasto}{dd.stadion ? ` · ${dd.stadion}` : ""}</Text>
            {dd.adres ? <Text style={st.maly}>{dd.adres}</Text> : null}
          </View>
        </View>
        <Text style={[st.naglowek, { marginTop: 10 }]}>Kadra ({kadra.length}) — podgląd</Text>
        <Text style={[st.maly, { marginBottom: 4 }]}>Amatorzy spoza symulacji: składy generowane (podgląd), bez transferów.</Text>
        {kadra.map((z) => (
          <View key={z.id} style={[st.wiersz, { paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]}>
            <Text style={{ color: KOLOR_POZ[z.poz], width: 34, fontWeight: "800", fontSize: 12 }}>{z.pozS ? SKROT_POZ[z.pozS] : z.poz}</Text>
            <Text style={[st.tekst, { flex: 1, fontSize: 14 }]} numberOfLines={1}>{z.imie} {z.nazwisko}</Text>
            <Text style={[st.maly, { width: 40 }]}>{z.wiek} l.</Text>
            <Text style={{ color: K.tekst, fontWeight: "800", width: 28, textAlign: "right" }}>{Math.floor(z.umiej)}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Modal visible={widoczny} animationType="slide" onRequestClose={wstecz}>
      <View style={st.ekran}>
        <View style={[st.wiersz, { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: K.pas, borderBottomWidth: 1, borderBottomColor: K.liniaMocna }]}>
          <Pressable onPress={wstecz} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.linia, ...szklo3D }}>
            <Text style={{ color: K.akcent, fontSize: 16, fontWeight: "900", marginRight: 4 }}>‹</Text>
            <Text style={{ color: K.tekst, fontSize: 13, fontWeight: "700", fontFamily: CZCIONKA }}>{hist.length > 1 ? "Wstecz" : "Zamknij"}</Text>
          </Pressable>
          <Text style={{ color: K.tekst, fontSize: 15, fontWeight: "800", marginLeft: 12, flex: 1, fontFamily: CZCIONKA }} numberOfLines={1}>{tytul}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 30 }}>{tresc}</ScrollView>
      </View>
      <WidokKlubu s={s} klubId={klubId} onClose={() => setKlubId(null)} odswiez={odswiez} onZawodnik={(id) => setZawId(id)} />
      <ProfilZawodnika s={s} zawodnikId={zawId} onClose={() => setZawId(null)} odswiez={odswiez} />
    </Modal>
  );
}
