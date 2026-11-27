// Trening na żywo (dla chętnych): ok. 2 godziny zajęć w 2–3 minuty. Boisko 3D, cały sztab, program ćwiczeń,
// intensywność, pochwały / upomnienia, indywidualna praca z zawodnikiem i zdarzenia z decyzjami trenera.
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { fmtData, type Dzien } from "../engine/dzien";
import { NAZWA_ROLI } from "../engine/sztab";
import { CWICZENIA, programDnia, uwagaTrenera, zdarzenieTreningu, type Cwiczenie, type SesjaTreningu, type ZdarzenieTr } from "../engine/treningLive";
import { FOKUSY, INTENSYWNOSCI, kluczDnia } from "../engine/planDnia";
import type { Intensywnosc, StanGry, Trening } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";
import { kity } from "./strojeDane";
import { Cwiczenia3D } from "./three/Cwiczenia3D";
import { grafika3D } from "./three/Stadion3DWidok";
import { mow, plecZImienia, zamilknij } from "./three/glos";
import { gwizdek } from "./three/dzwiek";

const CZAS_BLOKU = 26; // sekund na ćwiczenie przy 1× (cały trening ≈ 2–2,5 min)

export function TreningNaZywo({ s, dzien, onKoniec, onAnuluj }: { s: StanGry; dzien: Dzien; onKoniec: (ses: SesjaTreningu) => void; onAnuluj: () => void }) {
  const klub = s.kluby[s.mojKlub];
  const fokus: Trening = dzien.akt?.rodzaj === "trening" && dzien.akt.fokus ? dzien.akt.fokus : s.trening;
  const [ses] = useState<SesjaTreningu>(() => ({ klucz: kluczDnia(dzien.data), intens: (dzien.akt?.intens ?? s.treningIntensywnosc ?? "normalny") as Intensywnosc, bloki: programDnia(fokus), wyroznieni: [], zdjeci: [], wpisy: [] }));
  const [blok, setBlok] = useState(0);
  const [postep, setPostep] = useState(0); // 0..1 w bloku
  const [pr, setPr] = useState(1);
  const [, setW] = useState(0); const odsw = () => setW((v) => v + 1);
  const [wybrany, setWybrany] = useState<string | null>(null);
  const [zd, setZd] = useState<ZdarzenieTr | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [koniec, setKoniec] = useState(false);
  const [mowi, setMowi] = useState(false);
  const zdarzeniaBlok = useRef<Set<number>>(new Set());
  const k = kity(klub);
  const obecni = useMemo(() => klub.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kontuzja === 0 && !s.niedostepni?.[z.id]).slice(0, 24).map((z) => z!.id), []);
  const naBoisku = obecni.filter((id) => !ses.zdjeci.includes(id));
  const cw = ses.bloki[Math.min(blok, ses.bloki.length - 1)];
  const dopisz = (t: string) => setLog((l) => [t, ...l].slice(0, 30));
  const trener = s.trener ?? "Trener";
  const sztab = klub.sztab ? Object.entries(klub.sztab).filter(([, p]) => p).map(([r, p]) => `${NAZWA_ROLI[r as keyof typeof NAZWA_ROLI] ?? r}: ${p!.imie} ${p!.nazwisko}`) : [];

  // zegar zajęć
  useEffect(() => {
    if (koniec || zd || pr <= 0) return;
    const t = setInterval(() => {
      setPostep((p) => {
        const n = p + (0.25 * pr) / CZAS_BLOKU;
        if (n > 0.35 && !zdarzeniaBlok.current.has(blok)) { zdarzeniaBlok.current.add(blok); const z = zdarzenieTreningu(s, ses, cw); if (z) { setZd(z); gwizdek(); } }
        if (n >= 1) { if (blok + 1 >= ses.bloki.length) { setKoniec(true); gwizdek(true, 3); return 1; } setBlok((b) => b + 1); return 0; }
        return n;
      });
    }, 250);
    return () => clearInterval(t);
  }, [koniec, zd, pr, blok]);
  useEffect(() => { if (!koniec) { const n = CWICZENIA[cw]; dopisz(`${n.ikona} ${n.nazwa} — ${n.opis}`); } }, [blok]);
  useEffect(() => () => zamilknij(), []);

  const powiedz = (t: string) => { setMowi(true); mow(t.replace(/^\S+\s/, ""), "trener", { kto: trener, plec: plecZImienia(trener), przerwij: true }); setTimeout(() => setMowi(false), 2500); };
  const minuty = Math.round(((blok + postep) / ses.bloki.length) * 110);
  const zakoncz = () => { ses.wpisy.unshift(...log.filter((x) => /^(✅|👏|📢|🎯|⚠)/.test(x)).slice(0, 8)); onKoniec(ses); };

  return (
    <Modal visible animationType="slide" onRequestClose={onAnuluj}>
      <View style={{ flex: 1, backgroundColor: K.tlo }}>
        <View style={{ padding: 10, paddingTop: 14, backgroundColor: "#0a1f14", borderBottomWidth: 1, borderBottomColor: K.linia }}>
          <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 12, fontFamily: CZCIONKA }}>🏋 TRENING · {fmtData(dzien.data).toUpperCase()}</Text>
          <Text style={[st.tytul, { fontSize: 17 }]}>{FOKUSY.find(([f]) => f === fokus)?.[1] ?? "Trening"} · {minuty}' / 110'</Text>
          <View style={{ height: 4, backgroundColor: "#173126", borderRadius: 2, marginTop: 4 }}><View style={{ width: `${Math.min(100, ((blok + postep) / ses.bloki.length) * 100)}%`, height: 4, backgroundColor: K.akcent, borderRadius: 2 }} /></View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 40 }}>
          {Platform.OS === "web" && grafika3D() ? (
            <Cwiczenia3D s={s} klub={klub} widzowie={0} tempo={(ses.intens === "lekki" ? 0.8 : ses.intens === "intensywny" ? 1.3 : 1) * Math.max(0.5, pr)} wyroznij={wybrany} mowi={mowi}
              grupy={[{ ids: naBoisku, kit: k.pole[0], kitBr: k.bramkarz[0], strona: -1, cwiczenie: koniec ? "rozciaganie" : cw }]} />
          ) : <View style={[st.karta, { marginHorizontal: 0 }]}><Text style={st.tekst}>{CWICZENIA[cw].ikona} {CWICZENIA[cw].nazwa}</Text></View>}
          {/* program zajęć */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {ses.bloki.map((b, i) => (
              <View key={i} style={[st.chip, { marginBottom: 0, paddingVertical: 4 }, i === blok && !koniec && st.chipAktywny, i < blok || koniec ? { opacity: 0.5 } : null]}>
                <Text style={{ color: i === blok && !koniec ? "#17310f" : K.tekst, fontSize: 11.5, fontWeight: "700" }}>{i < blok || koniec ? "✓ " : ""}{CWICZENIA[b].ikona} {CWICZENIA[b].nazwa}</Text>
              </View>))}
          </View>
          {!koniec && (<>
            <View style={[st.wiersz, { gap: 6, marginTop: 8, flexWrap: "wrap" }]}>
              {[0, 1, 2, 4].map((v) => <Pressable key={v} onPress={() => setPr(v)} style={[st.chip, { marginBottom: 0 }, pr === v && st.chipAktywny]}><Text style={{ color: pr === v ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{v === 0 ? "⏸ Pauza" : `${v}×`}</Text></Pressable>)}
              <Pressable onPress={() => { if (blok + 1 >= ses.bloki.length) setKoniec(true); else { setBlok(blok + 1); setPostep(0); } }} style={[st.chip, { marginBottom: 0 }]}><Text style={{ color: K.tekst, fontSize: 12 }}>⏭ Następne ćwiczenie</Text></Pressable>
            </View>
            <Text style={[st.naglowek, { marginTop: 10 }]}>Intensywność</Text>
            <View style={[st.wiersz, { gap: 6 }]}>{INTENSYWNOSCI.map(([i, n]) => <Pressable key={i} onPress={() => { ses.intens = i; dopisz(`⚙ Intensywność: ${n}`); powiedz(i === "intensywny" ? "Podkręcamy tempo, panowie! Szybciej!" : i === "lekki" ? "Spokojnie, dziś lżej — jakość, nie ilość." : "Normalne tempo, skupienie."); odsw(); }} style={[st.chip, { marginBottom: 0 }, ses.intens === i && st.chipAktywny]}><Text style={{ color: ses.intens === i ? "#17310f" : K.tekst, fontSize: 12 }}>{n}</Text></Pressable>)}</View>
            <Text style={[st.naglowek, { marginTop: 10 }]}>Zmień bieżące ćwiczenie</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>{(Object.keys(CWICZENIA) as Cwiczenie[]).map((c) => <Pressable key={c} onPress={() => { ses.bloki[blok] = c; dopisz(`🔁 Zmiana: ${CWICZENIA[c].nazwa}`); odsw(); }} style={[st.chip, { marginBottom: 0, paddingVertical: 4 }, cw === c && st.chipAktywny]}><Text style={{ color: cw === c ? "#17310f" : K.tekst, fontSize: 11.5 }}>{CWICZENIA[c].ikona} {CWICZENIA[c].nazwa}</Text></Pressable>)}</View>
          </>)}
          {/* zawodnicy: pochwała / upomnienie / indywidualna praca */}
          <Text style={[st.naglowek, { marginTop: 10 }]}>Zawodnicy na zajęciach ({naBoisku.length})</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {obecni.map((id) => { const z = s.zawodnicy[id]; const zdj = ses.zdjeci.includes(id); return (
              <Pressable key={id} onPress={() => setWybrany(wybrany === id ? null : id)} style={[st.chip, { marginBottom: 0, paddingVertical: 4 }, wybrany === id && st.chipAktywny, zdj && { opacity: 0.4 }]}>
                <Text style={{ color: wybrany === id ? "#17310f" : K.tekst, fontSize: 11.5 }}>{ses.wyroznieni.includes(id) ? "🎯 " : ""}{z?.numer} {z?.nazwisko}{zdj ? " ✖" : ""}</Text>
              </Pressable>); })}
          </View>
          {wybrany && (
            <View style={[st.wiersz, { gap: 6, marginTop: 8, flexWrap: "wrap" }]}>
              <Pressable style={st.przyciskMaly} onPress={() => { const t = uwagaTrenera(s, wybrany, true); dopisz(t); powiedz(t); }}><Text style={st.przyciskMalyTekst}>👏 Pochwal</Text></Pressable>
              <Pressable style={st.przyciskMaly} onPress={() => { const t = uwagaTrenera(s, wybrany, false); dopisz(t); powiedz(t); }}><Text style={st.przyciskMalyTekst}>📢 Upomnij</Text></Pressable>
              <Pressable style={st.przyciskMaly} onPress={() => { if (ses.wyroznieni.includes(wybrany)) return; if (ses.wyroznieni.length >= 3) { dopisz("⚠ Najwyżej trzech zawodników na indywidualne zajęcia."); return; } ses.wyroznieni.push(wybrany); dopisz(`🎯 Indywidualna praca: ${s.zawodnicy[wybrany]?.nazwisko} — szybszy rozwój po tych zajęciach.`); odsw(); }}><Text style={st.przyciskMalyTekst}>🎯 Indywidualnie</Text></Pressable>
            </View>
          )}
          {/* dziennik zajęć */}
          <View style={[st.karta, { marginHorizontal: 0, marginTop: 10 }]}>
            <Text style={st.naglowek}>Dziennik zajęć</Text>
            {log.slice(0, 8).map((t, i) => <Text key={i} style={[st.maly, { color: i === 0 ? K.tekst : K.szary, marginVertical: 1 }]}>{t}</Text>)}
            {!!sztab.length && <Text style={[st.maly, { marginTop: 6, fontSize: 10.5 }]}>Sztab na boisku: {sztab.join(" · ")}</Text>}
          </View>
          {koniec ? (
            <Pressable style={st.przycisk} onPress={zakoncz}><Text style={st.przyciskTekst}>✅ Koniec zajęć — raport dnia</Text></Pressable>
          ) : (
            <Pressable onPress={() => { setZd(null); setKoniec(true); dopisz("⏩ Resztę zajęć prowadzi asystent."); }} style={{ alignItems: "center", marginTop: 10 }}><Text style={[st.maly, { color: K.niebieski }]}>⏩ Zasymuluj resztę zajęć</Text></Pressable>
          )}
          <Pressable onPress={onAnuluj} style={{ alignItems: "center", marginTop: 8 }}><Text style={[st.maly, { color: K.czerwony }]}>Wyjdź (trening odbędzie się bez Ciebie)</Text></Pressable>
        </ScrollView>
        {/* zdarzenie z decyzją */}
        {zd && !koniec && (
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: K.tlo, borderTopWidth: 2, borderColor: K.akcent, padding: 14, paddingBottom: 26 }}>
            <Text style={[st.tekst, { fontWeight: "800", marginBottom: 8 }]}>{zd.tekst}</Text>
            {zd.opcje.map((o, i) => <Pressable key={i} style={[st.przycisk, { marginHorizontal: 0, marginTop: 6 }]} onPress={() => { const w = o.skutek(); dopisz(`✅ ${o.nazwa}: ${w}`); setZd(null); odsw(); }}><Text style={st.przyciskTekst}>{o.nazwa}</Text></Pressable>)}
          </View>
        )}
      </View>
    </Modal>
  );
}
