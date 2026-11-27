import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { dateKolejki, kalendarzSzczebla, oknoTransferowe } from "../engine/kalendarz";
import { dzisiaj } from "../engine/dzien";
import { dataOkresu } from "../engine/okres";
import { ileKolejek } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";

const MIES = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
const klucz = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
type Wpis = { ikona: string; tekst: string; kolor?: string };

/** Kalendarz miesiąca: mecze ligowe (u siebie / wyjazd), okresy przygotowawcze, sparingi i obozy, okna transferowe,
 *  zakończenia budów, odpowiedzi w negocjacjach. Przewijanie miesięcy. */
export function KalendarzMiesiac({ s, widoczny, onClose }: { s: StanGry; widoczny: boolean; onClose: () => void }) {
  const dzis = s.okres ? dataOkresu(s) : dzisiaj(s).data;
  const [mies, setMies] = useState(() => new Date(dzis.getFullYear(), dzis.getMonth(), 1));
  const [wybrany, setWybrany] = useState<string | null>(klucz(dzis));
  const k = s.kluby[s.mojKlub];
  const liga = s.ligi[k.poziom - 1];
  const zdarzenia = useMemo(() => {
    const m = new Map<string, Wpis[]>();
    const dodaj = (d: Date, w: Wpis) => { const x = klucz(d); m.set(x, [...(m.get(x) ?? []), w]); };
    const n = ileKolejek(s);
    const kal = kalendarzSzczebla(liga?.nazwa ?? "", liga?.poziom ?? 1);
    for (let kol = 0; kol < (liga?.terminarz.length ?? 0); kol++) {
      const para = liga.terminarz[kol].find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
      const d = dateKolejki(s.sezon, n, kol, kal);
      if (!para) { dodaj(d, { ikona: "⏸", tekst: `${kol + 1}. kolejka — pauza` }); continue; }
      // dzień meczu (sobota/niedziela) jak w planie tygodnia
      let h = 0; for (const c of para[0]) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const dzien = (h + (liga.poziom <= 3 ? kol : 0)) % 2 === 0 ? 5 : 6;
      const sob = new Date(d); void dzien; // data meczu = data kolejki (tak samo liczy plan tygodnia)
      const dom = para[0] === s.mojKlub, rywal = s.kluby[dom ? para[1] : para[0]];
      const w = liga.wyniki[kol]?.find((x) => x && (x.dom === s.mojKlub || x.gosc === s.mojKlub));
      const wynik = w ? ` — ${w.gd}:${w.gg}` : "";
      dodaj(sob, { ikona: dom ? "🏟" : "🚌", tekst: `${kol + 1}. kolejka: ${dom ? "u siebie z" : "na wyjeździe:"} ${rywal?.nazwa ?? "?"}${wynik}`, kolor: w ? (dom ? (w.gd > w.gg ? K.zielony : w.gd < w.gg ? K.czerwony : K.akcent) : (w.gg > w.gd ? K.zielony : w.gg < w.gd ? K.czerwony : K.akcent)) : undefined });
      if (oknoTransferowe(s.sezon, n, kol, false, k.poziom).otwarte && !oknoTransferowe(s.sezon, n, kol + 1, false, k.poziom).otwarte) dodaj(sob, { ikona: "🔒", tekst: "Ostatni tydzień okna transferowego" });
    }
    if (s.okres) {
      const o = s.okres;
      for (let d = 0; d < o.dniUrlopu + o.dniPrzygotowan; d++) {
        const dt = dataOkresu(s, d);
        if (d === 0) dodaj(dt, { ikona: "🏖", tekst: `Początek ${o.rodzaj === "lato" ? "letniego" : "zimowego"} okresu — urlop` });
        if (d === o.dniUrlopu) dodaj(dt, { ikona: "🏃", tekst: "Start przygotowań" });
      }
      if (o.oboz) for (let d = 0; d < o.oboz.dni; d++) dodaj(dataOkresu(s, o.oboz.od + d), { ikona: "⛺", tekst: d === 0 ? "Obóz — wyjazd" : "Obóz" });
      for (const sp of o.sparingi as any[]) dodaj(dataOkresu(s, sp.dzien), { ikona: "🤝", tekst: `Sparing: ${sp.rywal}${sp.wynik ? ` — ${sp.wynik}` : ""}` });
    }
    for (const b of s.budowy ?? []) { const d = new Date(dzis); d.setDate(d.getDate() + Math.max(0, b.dniRazem + b.opoznienie - b.dniMinelo)); dodaj(d, { ikona: "🏗", tekst: `Planowany odbiór: ${b.nazwa}` }); }
    for (const ng of s.negocjacje ?? []) if (ng.odpowiedz < 1e6 && ng.etap !== "zakonczona" && ng.etap !== "zerwana") {
      const d = new Date(dzis); d.setDate(d.getDate() + Math.max(0, ng.odpowiedz - (s.licznikDni ?? 0)));
      const z = s.zawodnicy[ng.zawodnikId]; dodaj(d, { ikona: "📨", tekst: `Odpowiedź w negocjacjach: ${z?.imie} ${z?.nazwisko}` });
    }
    return m;
  }, [s.kolejka, s.sezon, s.okres?.dzien, widoczny]);

  const pierwszy = (mies.getDay() + 6) % 7, dniW = new Date(mies.getFullYear(), mies.getMonth() + 1, 0).getDate();
  const komorki: (Date | null)[] = [...Array(pierwszy).fill(null), ...Array.from({ length: dniW }, (_, i) => new Date(mies.getFullYear(), mies.getMonth(), i + 1))];
  while (komorki.length % 7) komorki.push(null);
  const zmien = (d: number) => setMies(new Date(mies.getFullYear(), mies.getMonth() + d, 1));
  const lista = wybrany ? zdarzenia.get(wybrany) ?? [] : [];
  const okno = (d: Date) => { // tło: okno transferowe (wg miesiąca i szczebla)
    const m = d.getMonth(), dz = d.getDate(), zaw = k.poziom <= 3;
    return m === 6 || m === 7 || (m === 8 && (!zaw || dz <= 8)) || m === 0 || m === 1 || (m === 2 && (!zaw || dz <= 15)) || (!zaw && m === 3 && dz <= 10);
  };
  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", borderTopWidth: 2, borderColor: K.akcent }}>
          <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 28 }}>
            <View style={[st.wiersz, { justifyContent: "space-between", marginBottom: 8 }]}>
              <Pressable onPress={() => zmien(-1)} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>‹</Text></Pressable>
              <Text style={[st.tytul, { fontSize: 19 }]}>📅 {MIES[mies.getMonth()]} {mies.getFullYear()}</Text>
              <Pressable onPress={() => zmien(1)} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>›</Text></Pressable>
            </View>
            <View style={{ flexDirection: "row" }}>{["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((d) => <Text key={d} style={[st.maly, { flex: 1, textAlign: "center", fontWeight: "800" }]}>{d}</Text>)}</View>
            {Array.from({ length: komorki.length / 7 }, (_, r) => (
              <View key={r} style={{ flexDirection: "row" }}>
                {komorki.slice(r * 7, r * 7 + 7).map((d, i) => {
                  if (!d) return <View key={i} style={{ flex: 1, aspectRatio: 1, margin: 1.5 }} />;
                  const kl = klucz(d), z = zdarzenia.get(kl) ?? [], teraz = kl === klucz(dzis), wyb = kl === wybrany;
                  return (
                    <Pressable key={i} onPress={() => setWybrany(kl)} style={{ flex: 1, aspectRatio: 1, margin: 1.5, borderRadius: 7, padding: 2, backgroundColor: okno(d) ? "rgba(90,169,255,0.10)" : K.karta, borderWidth: teraz || wyb ? 2 : 1, borderColor: teraz ? K.akcent : wyb ? K.niebieski : K.linia }}>
                      <Text style={{ color: d < dzis && !teraz ? K.szary : K.tekst, fontSize: 11, fontWeight: "800", fontFamily: CZCIONKA }}>{d.getDate()}</Text>
                      <Text style={{ fontSize: 12, textAlign: "center" }}>{z.slice(0, 2).map((x) => x.ikona).join("")}</Text>
                      {z[0]?.kolor ? <View style={{ height: 3, borderRadius: 2, backgroundColor: z[0].kolor, marginTop: 1 }} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
            <Text style={[st.maly, { marginTop: 6, fontSize: 10.5 }]}>🏟 u siebie · 🚌 wyjazd · 🤝 sparing · ⛺ obóz · 🏗 budowa · 📨 negocjacje · niebieskie tło = okno transferowe ({k.poziom <= 3 ? "szczebel centralny" : "szczebel amatorski"})</Text>
            <View style={[st.karta, { marginHorizontal: 0, marginTop: 10 }]}>
              <Text style={st.naglowek}>{wybrany ? wybrany.split("-").reverse().map((x, i) => (i === 1 ? String(Number(x) + 1).padStart(2, "0") : x.padStart(2, "0"))).join(".") : "Wybierz dzień"}</Text>
              {lista.length ? lista.map((w, i) => <Text key={i} style={[st.tekst, { fontSize: 13.5, marginVertical: 2, color: w.kolor ?? K.tekst }]}>{w.ikona} {w.tekst}</Text>) : <Text style={st.maly}>Brak wydarzeń.</Text>}
            </View>
            <Pressable style={st.przycisk} onPress={onClose}><Text style={st.przyciskTekst}>Zamknij</Text></Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
