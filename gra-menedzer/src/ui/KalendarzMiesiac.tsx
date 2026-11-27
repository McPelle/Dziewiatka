import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { dateKolejki, kalendarzSzczebla, oknoTransferowe } from "../engine/kalendarz";
import { dzisiaj } from "../engine/dzien";
import { dataOkresu } from "../engine/okres";
import { ileKolejek } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st, web } from "./styl";
import { KartaDnia } from "./KartaDnia";
import { KATALOG, planNa } from "../engine/planDnia";

const MIES = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
const klucz = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
type Wpis = { ikona: string; tekst: string; kolor?: string };

/** Kalendarz miesiąca: mecze ligowe (u siebie / wyjazd), okresy przygotowawcze, sparingi i obozy, okna transferowe,
 *  zakończenia budów, odpowiedzi w negocjacjach. Przewijanie miesięcy. */
export function KalendarzMiesiac({ s, widoczny, onClose }: { s: StanGry; widoczny: boolean; onClose: () => void }) {
  const dzis = s.okres ? dataOkresu(s) : dzisiaj(s).data;
  const [mies, setMies] = useState(() => new Date(dzis.getFullYear(), dzis.getMonth(), 1));
  const [wybrany, setWybrany] = useState<string | null>(klucz(dzis));
  const [karta, setKarta] = useState<Date | null>(null);
  const [widokRoku, setWidokRoku] = useState(false);
  const [, setW] = useState(0);
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
    // kolejne sezony: planowe terminy kolejek (wg kalendarza szczebla) — pary po losowaniu terminarza
    for (let dz = 1; dz <= 3; dz++) {
      for (let kol = 0; kol < n; kol++) {
        const d = dateKolejki(s.sezon + dz, n, kol, kal);
        if (!m.has(klucz(d))) dodaj(d, { ikona: "⚽", tekst: `${kol + 1}. kolejka sezonu ${s.sezon + dz}/${String((s.sezon + dz + 1) % 100).padStart(2, "0")} (planowo; rywal po losowaniu terminarza)`, kolor: K.szary });
      }
    }
    // przerwy na kadrę (FIFA): wrzesień, październik, listopad, marzec — orientacyjnie
    for (let r = s.sezon; r <= s.sezon + 4; r++) for (const mm of [8, 9, 10, 14]) {
      const rok = mm > 11 ? r + 1 : r, mies = mm % 12; const d = new Date(rok, mies, 1);
      while (d.getDay() !== 4) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + 7 * (mies === 2 ? 3 : 1));
      dodaj(d, { ikona: "🇵🇱", tekst: "Przerwa na kadrę (FIFA) — powołania reprezentantów (orientacyjnie)" });
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
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "92%" }]}>
          <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 28 }}>
            <View style={[st.wiersz, { justifyContent: "space-between", marginBottom: 8, gap: 4 }]}>
              <Pressable onPress={() => zmien(-12)} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>«</Text></Pressable>
              {!widokRoku && <Pressable onPress={() => zmien(-1)} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>‹</Text></Pressable>}
              <Pressable onPress={() => setWidokRoku(!widokRoku)} style={{ flex: 1, alignItems: "center" }}>
                <Text style={[st.tytul, { fontSize: 18 }]}>📅 {widokRoku ? `Rok ${mies.getFullYear()}` : `${MIES[mies.getMonth()]} ${mies.getFullYear()}`}</Text>
                <Text style={[st.maly, { fontSize: 10 }]}>{widokRoku ? "dotknij miesiąca" : "dotknij — widok roku"}</Text>
              </Pressable>
              {!widokRoku && <Pressable onPress={() => zmien(1)} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>›</Text></Pressable>}
              <Pressable onPress={() => zmien(12)} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>»</Text></Pressable>
            </View>
            <Pressable onPress={() => { setMies(new Date(dzis.getFullYear(), dzis.getMonth(), 1)); setWidokRoku(false); }} style={{ alignSelf: "center", marginBottom: 6 }}><Text style={[st.maly, { color: K.akcent }]}>⟲ Dziś</Text></Pressable>
            {widokRoku && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {Array.from({ length: 12 }, (_, mi) => {
                  const pm = new Date(mies.getFullYear(), mi, 1), dni = new Date(mies.getFullYear(), mi + 1, 0).getDate(), off = (pm.getDay() + 6) % 7;
                  return (
                    <Pressable key={mi} onPress={() => { setMies(pm); setWidokRoku(false); }} style={{ width: "31.5%", backgroundColor: K.karta, borderRadius: 8, padding: 4, borderWidth: 1, borderColor: pm.getMonth() === dzis.getMonth() && pm.getFullYear() === dzis.getFullYear() ? K.akcent : K.linia }}>
                      <Text style={[st.maly, { fontWeight: "800", textAlign: "center", color: K.tekst }]}>{MIES[mi]}</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {Array.from({ length: off + dni }, (_, i) => {
                          if (i < off) return <View key={i} style={{ width: "14.28%", height: 9 }} />;
                          const d = new Date(mies.getFullYear(), mi, i - off + 1), z = zdarzenia.get(klucz(d)) ?? [];
                          const kol = z.find((x) => x.ikona === "🏟") ? K.zielony : z.find((x) => x.ikona === "🚌") ? K.niebieski : z.find((x) => x.ikona === "⚽") ? "#7d8a84" : z.length ? K.akcent : planNa(s, d) ? "#a77bd6" : "transparent";
                          return <View key={i} style={{ width: "14.28%", height: 9, alignItems: "center", justifyContent: "center" }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: kol === "transparent" ? (okno(d) ? "rgba(90,169,255,0.25)" : "rgba(255,255,255,0.06)") : kol }} /></View>;
                        })}
                      </View>
                    </Pressable>);
                })}
                <Text style={[st.maly, { fontSize: 10, marginTop: 4 }]}>🟢 u siebie · 🔵 wyjazd · ⚪ planowa kolejka · 🟡 inne wydarzenie · 🟣 Twój plan · jasnoniebieskie tło = okno transferowe</Text>
              </View>
            )}
            {!widokRoku && <>
            <View style={{ flexDirection: "row" }}>{["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((d) => <Text key={d} style={[st.maly, { flex: 1, textAlign: "center", fontWeight: "800" }]}>{d}</Text>)}</View>
            {Array.from({ length: komorki.length / 7 }, (_, r) => (
              <View key={r} style={{ flexDirection: "row" }}>
                {komorki.slice(r * 7, r * 7 + 7).map((d, i) => {
                  if (!d) return <View key={i} style={{ flex: 1, aspectRatio: 1, margin: 1.5 }} />;
                  const kl = klucz(d), z = zdarzenia.get(kl) ?? [], teraz = kl === klucz(dzis), wyb = kl === wybrany;
                  return (
                    <Pressable key={i} onPress={() => { setWybrany(kl); setKarta(d); }} style={{ flex: 1, aspectRatio: 1, margin: 1.5, borderRadius: 7, padding: 2, backgroundColor: okno(d) ? "rgba(90,169,255,0.10)" : K.karta, borderWidth: teraz || wyb ? 2 : 1, borderColor: teraz ? K.akcent : wyb ? K.niebieski : K.linia, ...web({ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.01) 55%, rgba(0,0,0,0.22) 100%)", boxShadow: teraz ? "0 0 12px rgba(255,206,71,0.55), 0 2px 0 rgba(0,0,0,0.5)" : wyb ? "0 0 10px rgba(90,169,255,0.5), 0 2px 0 rgba(0,0,0,0.5)" : "0 2px 0 rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)" }) }}>
                      <Text style={{ color: d < dzis && !teraz ? K.szary : K.tekst, fontSize: 11, fontWeight: "800", fontFamily: CZCIONKA }}>{d.getDate()}</Text>
                      <Text style={{ fontSize: 12, textAlign: "center" }}>{z.slice(0, 2).map((x) => x.ikona).join("")}{planNa(s, d) ? KATALOG[planNa(s, d)!.rodzaj].ikona : ""}</Text>
                      {z[0]?.kolor ? <View style={{ height: 3, borderRadius: 2, backgroundColor: z[0].kolor, marginTop: 1 }} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
            </>}
            <Text style={[st.maly, { marginTop: 6, fontSize: 10.5 }]}>🏟 u siebie · 🚌 wyjazd · 🤝 sparing · ⛺ obóz · 🏗 budowa · 📨 negocjacje · niebieskie tło = okno transferowe ({k.poziom <= 3 ? "szczebel centralny" : "szczebel amatorski"})</Text>
            <View style={[st.karta, { marginHorizontal: 0, marginTop: 10 }]}>
              <Text style={st.naglowek}>{wybrany ? wybrany.split("-").reverse().map((x, i) => (i === 1 ? String(Number(x) + 1).padStart(2, "0") : x.padStart(2, "0"))).join(".") : "Wybierz dzień"}</Text>
              {lista.length ? lista.map((w, i) => <Text key={i} style={[st.tekst, { fontSize: 13.5, marginVertical: 2, color: w.kolor ?? K.tekst }]}>{w.ikona} {w.tekst}</Text>) : <Text style={st.maly}>Brak wydarzeń.</Text>}
            </View>
            <Text style={[st.maly, { marginTop: 6, fontSize: 10.5 }]}>👆 Dotknij dnia, żeby zobaczyć szczegóły i zaplanować zajęcia drużyny (trening, odnowa, wideo, sparing, integracja…).</Text>
            <Pressable style={st.przycisk} onPress={onClose}><Text style={st.przyciskTekst}>Zamknij</Text></Pressable>
            <KartaDnia s={s} data={karta} dzis={dzis} wydarzenia={karta ? zdarzenia.get(klucz(karta)) ?? [] : []}
              zablokowany={karta ? ((zdarzenia.get(klucz(karta)) ?? []).some((w) => w.ikona === "🏟" || w.ikona === "🚌") ? "Dzień meczu ligowego — zajęcia ustala sztab (rozruch i mecz)." : blokadaOkresu(s, karta)) : null}
              onClose={() => setKarta(null)} odswiez={() => setW((x) => x + 1)} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** W okresie przygotowawczym: urlop i obóz są zablokowane, resztę dni można planować (sparing = termin w okresie). */
function blokadaOkresu(s: StanGry, d: Date): string | null {
  const o = s.okres; if (!o) return null;
  const idx = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(new Date(o.start).setHours(0, 0, 0, 0)).getTime()) / 864e5);
  if (idx < 0 || idx >= o.dniUrlopu + o.dniPrzygotowan) return null;
  if (idx < o.dniUrlopu) return "Zawodnicy są na urlopie — zajęcia od powrotu (możesz skrócić urlop w panelu okresu na pulpicie).";
  if (o.oboz && idx >= o.oboz.od && idx < o.oboz.od + o.oboz.dni) return "Drużyna na obozie — program zajęć ustala obóz.";
  if (o.sparingi.some((x) => x.dzien === idx)) return "Tego dnia gracie zaplanowany sparing.";
  return null;
}
