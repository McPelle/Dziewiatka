import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { silaKlubu } from "../engine/swiat";
import type { StanGry, WlasnoscKlubu } from "../engine/types";
import { ligaOtwarta, type OpcjeKlubu } from "../engine/wlasnyKlub";
import { HerbGenerowany } from "./HerbGen";
import { Herb } from "./Herb";
import { CZCIONKA, K, st } from "./styl";

// Kreator własnego klubu: nazwa, miasto, rok, barwy, stadion, właściciel, budżet i drużyna, której miejsce zajmie.
const PALETA = ["#c8102e", "#0033a0", "#006a3c", "#ffd100", "#000000", "#ffffff", "#6a1b9a", "#ff6f00", "#00a3e0", "#7b1e1e", "#2e7d32", "#9e9e9e", "#1a237e", "#f06292"];
const WLASCICIELE: [WlasnoscKlubu, string, string][] = [
  ["stowarzyszenie", "Stowarzyszenie kibiców", "mało kasy, ogromne wsparcie trybun"],
  ["samorzad", "Gmina / miasto", "stabilna dotacja, małe ambicje"],
  ["inwestor", "Prywatny inwestor", "pieniądze są, ale cierpliwość krótka"],
  ["spolka", "Spółka akcyjna", "profesjonalne zarządzanie"],
];
const POJEMNOSCI = (poziom: number) => poziom <= 1 ? [8000, 15000, 25000] : poziom <= 3 ? [2000, 4000, 8000] : poziom <= 5 ? [500, 1000, 2500] : [100, 200, 500];

function Pole({ etyk, v, set, ph, max }: { etyk: string; v: string; set: (x: string) => void; ph: string; max?: number }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={st.maly}>{etyk}</Text>
      <TextInput value={v} onChangeText={set} placeholder={ph} placeholderTextColor={K.szary} maxLength={max ?? 40}
        style={{ color: K.tekst, backgroundColor: K.karta, borderRadius: 10, borderWidth: 1, borderColor: K.linia, paddingHorizontal: 12, paddingVertical: 10, marginTop: 4, fontFamily: CZCIONKA, fontSize: 15 }} />
    </View>
  );
}

export function KreatorKlubu({ sw, idx, onUtworz, onWstecz }: { sw: StanGry; idx: number; onUtworz: (o: OpcjeKlubu) => void; onWstecz: () => void }) {
  const liga = sw.ligi[idx];
  const kluby = [...liga.kluby].sort((a, b) => silaKlubu(sw, a) - silaKlubu(sw, b));
  const [nazwa, setNazwa] = useState("");
  const [skrot, setSkrot] = useState("");
  const [miasto, setMiasto] = useState("");
  const [rok, setRok] = useState("2026");
  const [b1, setB1] = useState(PALETA[0]);
  const [b2, setB2] = useState(PALETA[5]);
  const [stadion, setStadion] = useState("");
  const [poj, setPoj] = useState(POJEMNOSCI(liga.poziom)[0]);
  const [wl, setWl] = useState<WlasnoscKlubu>("stowarzyszenie");
  const [budzet, setBudzet] = useState<OpcjeKlubu["budzet"]>("sredni");
  const [zastep, setZastep] = useState(kluby[0]);
  const ok = nazwa.trim().length >= 3 && miasto.trim().length >= 2;
  const otwarta = ligaOtwarta(liga.nazwa); // klasa A/B: dołączenie jako dodatkowa drużyna

  const Chip = ({ akt, t, onPress, pod }: { akt: boolean; t: string; onPress: () => void; pod?: string }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: akt ? K.akcent : K.linia, backgroundColor: akt ? "rgba(255,206,71,0.14)" : K.karta, marginRight: 6, marginTop: 6 }}>
      <Text style={{ color: akt ? K.akcent : K.tekst, fontWeight: "800", fontFamily: CZCIONKA }}>{t}</Text>
      {pod ? <Text style={[st.maly, { fontSize: 10.5 }]}>{pod}</Text> : null}
    </Pressable>
  );
  const Paleta = ({ v, set }: { v: string; set: (x: string) => void }) => (
    <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 4 }]}>
      {PALETA.map((c) => (
        <Pressable key={c} onPress={() => set(c)} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, margin: 3, borderWidth: v === c ? 3 : 1, borderColor: v === c ? K.akcent : "rgba(255,255,255,0.3)" }} />
      ))}
    </View>
  );

  return (
    <View style={st.ekran}>
      <View style={[st.wiersz, { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: K.pas, borderBottomWidth: 1, borderBottomColor: K.liniaMocna }]}>
        <Pressable onPress={onWstecz} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.linia }}>
          <Text style={{ color: K.akcent, fontSize: 16, fontWeight: "900", marginRight: 4 }}>‹</Text>
          <Text style={{ color: K.tekst, fontSize: 13, fontWeight: "700", fontFamily: CZCIONKA }}>Wstecz</Text>
        </Pressable>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: K.tekst, fontSize: 15, fontWeight: "800", fontFamily: CZCIONKA }}>🏗 Załóż własny klub</Text>
          <Text style={{ color: K.szary, fontSize: 11.5, fontFamily: CZCIONKA }} numberOfLines={1}>Start: {liga.nazwa}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <View style={[st.karta, st.wiersz, { gap: 14 }]}>
          <HerbGenerowany nazwa={nazwa.trim() || "Nowy Klub"} tlo={b1} akcent={b2} rok={Number(rok) || 2026} rozmiar={72} />
          <View style={{ flex: 1 }}>
            <Text style={st.tytul} numberOfLines={2}>{nazwa.trim() || "Twój klub"}</Text>
            <Text style={st.maly}>{miasto.trim() || "miasto"} · zał. {rok || "2026"}</Text>
            <Text style={st.maly}>{stadion.trim() || "Stadion Miejski"} · {poj.toLocaleString("pl")} miejsc</Text>
          </View>
        </View>

        <Pole etyk="Nazwa klubu" v={nazwa} set={setNazwa} ph="np. KS Orły Zalesie" />
        <Pole etyk="Skrót (3–4 litery)" v={skrot} set={setSkrot} ph="np. ORZ" max={4} />
        <Pole etyk="Miasto / miejscowość" v={miasto} set={setMiasto} ph="np. Zalesie" />
        <Pole etyk="Rok założenia" v={rok} set={(x) => setRok(x.replace(/\D/g, "").slice(0, 4))} ph="2026" max={4} />
        <Pole etyk="Nazwa stadionu" v={stadion} set={setStadion} ph="np. Stadion Gminny w Zalesiu" />

        <Text style={[st.naglowek, { marginTop: 14 }]}>Barwy</Text>
        <Text style={st.maly}>Podstawowa</Text><Paleta v={b1} set={setB1} />
        <Text style={[st.maly, { marginTop: 6 }]}>Dodatkowa</Text><Paleta v={b2} set={setB2} />

        <Text style={[st.naglowek, { marginTop: 14 }]}>Pojemność stadionu</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>{POJEMNOSCI(liga.poziom).map((p) => <Chip key={p} akt={poj === p} t={`${p.toLocaleString("pl")} miejsc`} onPress={() => setPoj(p)} />)}</View>

        <Text style={[st.naglowek, { marginTop: 14 }]}>Właściciel</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>{WLASCICIELE.map(([k, t, pod]) => <Chip key={k} akt={wl === k} t={t} pod={pod} onPress={() => setWl(k)} />)}</View>

        <Text style={[st.naglowek, { marginTop: 14 }]}>Budżet na start</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          <Chip akt={budzet === "skromny"} t="Skromny" pod="60% typowego dla ligi" onPress={() => setBudzet("skromny")} />
          <Chip akt={budzet === "sredni"} t="Średni" pod="typowy dla ligi" onPress={() => setBudzet("sredni")} />
          <Chip akt={budzet === "bogaty"} t="Bogaty sponsor" pod="180% typowego" onPress={() => setBudzet("bogaty")} />
        </View>

        {otwarta ? (
          <View style={[st.karta, { marginHorizontal: 0, borderColor: K.akcent }]}>
            <Text style={st.naglowek}>Zgłoszenie do {liga.nazwa}</Text>
            <Text style={st.tekst}>➕ Twój klub dołączy jako NOWA, dodatkowa drużyna — nikogo nie zastępuje.</Text>
            <Text style={[st.maly, { marginTop: 4 }]}>W klasach A i B liczba drużyn nie jest stała (nowe zgłoszenia do ZPN): grupa powiększy się z {kluby.length} do {kluby.length + 1} zespołów, a terminarz zostanie ułożony od nowa.</Text>
          </View>
        ) : (<>
          <Text style={[st.naglowek, { marginTop: 14 }]}>Którą drużynę zastępujesz w lidze?</Text>
          <Text style={st.maly}>Od Ekstraklasy do klasy okręgowej liczba drużyn jest stała — Twój klub zajmie miejsce wybranej drużyny w terminarzu (np. wycofała się z rozgrywek).</Text>
          {kluby.map((id) => (
            <Pressable key={id} onPress={() => setZastep(id)} style={[st.karta, st.wiersz, { marginTop: 6, paddingVertical: 8, borderColor: zastep === id ? K.akcent : K.linia, borderWidth: 1 }]}>
              <Herb klub={sw.kluby[id]} rozmiar={26} />
              <Text style={[st.tekst, { flex: 1, marginLeft: 10 }]} numberOfLines={1}>{sw.kluby[id].nazwa}</Text>
              {zastep === id ? <Text style={{ color: K.akcent, fontWeight: "900" }}>✓</Text> : null}
            </Pressable>
          ))}
        </>)}

        <Pressable disabled={!ok} onPress={() => onUtworz({ nazwa, skrot, miasto, rokZalozenia: Number(rok) || 2026, barwy: [b1, b2], stadion, pojemnosc: poj, wlasciciel: wl, budzet, zastepujeId: zastep, dolacz: otwarta })}
          style={[st.przycisk, { marginHorizontal: 0, marginTop: 18, opacity: ok ? 1 : 0.4 }]}>
          <Text style={st.przyciskTekst}>⚽ Zakładamy klub!</Text>
        </Pressable>
        {!ok ? <Text style={[st.maly, { textAlign: "center", marginTop: 6 }]}>Podaj nazwę (min. 3 znaki) i miasto.</Text> : null}
      </ScrollView>
    </View>
  );
}
