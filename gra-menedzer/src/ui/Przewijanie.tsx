// Przewijanie kalendarza o wiele dni naraz (obok „Dalej" dzień po dniu): szybkie skoki, wybór dnia,
// automatyczne mecze albo stop w dniu meczu, inteligentne zatrzymanie na ważnych wydarzeniach i podsumowanie przewiniętych dni.
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { dataBiezaca, dniDoMeczu, DOMYSLNE_PRZEWIJANIE, fmtData, przewin, type OpcjePrzewijania, type WynikPrzewijania } from "../engine/dzien";
import { dniRazem } from "../engine/okres";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";

const SKOKI: [number, string][] = [[1, "1 dzień"], [2, "2 dni"], [3, "3 dni"], [5, "5 dni"], [7, "Tydzień"], [14, "2 tygodnie"], [30, "Miesiąc"]];
const NAZWY_DNI = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];

export function PrzyciskPrzewijania({ s, odswiez, onMecz }: { s: StanGry; odswiez: () => void; onMecz?: () => void }) {
  const [otw, setOtw] = useState(false);
  return (
    <>
      <Pressable style={[st.przyciskMaly, { justifyContent: "center", borderColor: K.akcent }]} onPress={() => setOtw(true)}>
        <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>⏩ Przewiń…</Text>
      </Pressable>
      {otw && <Przewijanie s={s} onClose={() => { setOtw(false); odswiez(); }} onMecz={onMecz} odswiez={odswiez} />}
    </>
  );
}

function Przewijanie({ s, onClose, odswiez, onMecz }: { s: StanGry; onClose: () => void; odswiez: () => void; onMecz?: () => void }) {
  const zap = (s as unknown as { ustPrzewijania?: OpcjePrzewijania }).ustPrzewijania;
  const [o, setO] = useState<OpcjePrzewijania>({ ...DOMYSLNE_PRZEWIJANIE, ...(zap ?? {}) });
  const [wynik, setWynik] = useState<WynikPrzewijania | null>(null);
  const ust = (z: Partial<OpcjePrzewijania>) => setO((x) => ({ ...x, ...z }));
  const dzis = dataBiezaca(s);
  const cel = new Date(dzis.getTime() + o.dni * 86400000);
  const doMeczu = dniDoMeczu(s);
  const doKoncaOkresu = s.okres ? Math.max(1, dniRazem(s.okres) - s.okres.dzien) : null;

  const start = () => {
    (s as unknown as { ustPrzewijania?: OpcjePrzewijania }).ustPrzewijania = o;
    const w = przewin(s, o);
    setWynik(w); odswiez();
    if (w.mecze > 0 && onMecz && !o.mecze) onMecz();
  };

  const Przelacznik = ({ wl, tekst, onP }: { wl: boolean; tekst: string; onP: () => void }) => (
    <Pressable onPress={onP} style={[st.wiersz, { paddingVertical: 7, gap: 10 }]}>
      <View style={{ width: 42, height: 24, borderRadius: 12, backgroundColor: wl ? K.zielony : "rgba(255,255,255,0.15)", padding: 2, alignItems: wl ? "flex-end" : "flex-start" }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" }} />
      </View>
      <Text style={[st.tekst, { flex: 1, fontSize: 13.5 }]}>{tekst}</Text>
    </Pressable>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ maxHeight: "92%", backgroundColor: K.tlo, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: K.akcent }}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
            <View style={[st.wiersz, { justifyContent: "space-between" }]}>
              <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 18, fontFamily: CZCIONKA }}>⏩ Przewiń kalendarz</Text>
              <Pressable onPress={onClose} hitSlop={10}><Text style={{ color: K.szary, fontSize: 22, fontWeight: "900" }}>✕</Text></Pressable>
            </View>
            <Text style={[st.maly, { marginTop: 2 }]}>Dziś: {NAZWY_DNI[dzis.getDay()]} {fmtData(dzis)}. Każdy dzień wykonuje się normalnie (treningi z planu, regeneracja, negocjacje, budowy) — tylko szybciej.</Text>

            {wynik ? (
              <View style={{ marginTop: 12 }}>
                <View style={[st.karta, { marginHorizontal: 0, borderColor: wynik.powod ? K.akcent : K.zielony }]}>
                  <Text style={[st.tekst, { fontWeight: "900", fontSize: 15 }]}>Przewinięto {wynik.dni} {wynik.dni === 1 ? "dzień" : "dni"}{wynik.mecze ? ` · rozegrane mecze: ${wynik.mecze}` : ""}</Text>
                  <Text style={st.maly}>Teraz: {NAZWY_DNI[dataBiezaca(s).getDay()]} {fmtData(dataBiezaca(s))}</Text>
                  {wynik.powod ? <Text style={[st.tekst, { color: K.akcent, marginTop: 6, fontWeight: "800" }]}>⏸ Zatrzymano: {wynik.powod}</Text> : null}
                </View>
                {wynik.dzienne.length > 0 && <Text style={[st.naglowek, { marginTop: 10 }]}>📆 Przebieg</Text>}
                {wynik.dzienne.map((d, i) => <Text key={i} style={[st.maly, { marginTop: 3 }]}>{d.ikona} {d.data} — {d.tytul}</Text>)}
                {wynik.wiadomosci.length > 0 && <Text style={[st.naglowek, { marginTop: 10 }]}>📰 Najważniejsze wiadomości</Text>}
                {wynik.wiadomosci.map((t, i) => <Text key={i} style={[st.maly, { marginTop: 3 }]}>• {t}</Text>)}
                <View style={[st.wiersz, { gap: 8, marginTop: 14 }]}>
                  <Pressable style={[st.przyciskMaly, { flex: 1, justifyContent: "center" }]} onPress={() => setWynik(null)}><Text style={st.przyciskMalyTekst}>⏩ Przewiń dalej</Text></Pressable>
                  <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0, marginTop: 0 }]} onPress={onClose}><Text style={st.przyciskTekst}>Gotowe</Text></Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text style={[st.naglowek, { marginTop: 12 }]}>Ile dni?</Text>
                <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>
                  {SKOKI.map(([n, t]) => (
                    <Pressable key={n} onPress={() => ust({ dni: n })} style={[st.chip, o.dni === n && st.chipAktywny]}><Text style={{ color: o.dni === n ? "#17310f" : K.tekst, fontWeight: "700", fontSize: 12.5 }}>{t}</Text></Pressable>
                  ))}
                  {doMeczu != null && doMeczu > 0 && (
                    <Pressable onPress={() => ust({ dni: doMeczu, mecze: false })} style={[st.chip, { borderColor: K.niebieski }]}><Text style={{ color: K.niebieski, fontWeight: "800", fontSize: 12.5 }}>⚽ Do meczu ({doMeczu} {doMeczu === 1 ? "dzień" : "dni"})</Text></Pressable>
                  )}
                  {doKoncaOkresu != null && (
                    <Pressable onPress={() => ust({ dni: doKoncaOkresu })} style={[st.chip, { borderColor: K.niebieski }]}><Text style={{ color: K.niebieski, fontWeight: "800", fontSize: 12.5 }}>🏟 Do końca przygotowań ({doKoncaOkresu} dni)</Text></Pressable>
                  )}
                </View>
                {/* wybór dokładnego dnia: − / + */}
                <View style={[st.wiersz, { marginTop: 8, gap: 10, justifyContent: "center" }]}>
                  <Pressable onPress={() => ust({ dni: Math.max(1, o.dni - 1) })} style={[st.przyciskMaly, { width: 46, justifyContent: "center" }]}><Text style={[st.przyciskMalyTekst, { fontSize: 18 }]}>−</Text></Pressable>
                  <View style={{ alignItems: "center", minWidth: 150 }}>
                    <Text style={[st.tekst, { fontSize: 22, fontWeight: "900", color: K.akcent }]}>{o.dni} {o.dni === 1 ? "dzień" : "dni"}</Text>
                    <Text style={st.maly}>do: {NAZWY_DNI[cel.getDay()]} {fmtData(cel)}</Text>
                  </View>
                  <Pressable onPress={() => ust({ dni: Math.min(120, o.dni + 1) })} style={[st.przyciskMaly, { width: 46, justifyContent: "center" }]}><Text style={[st.przyciskMalyTekst, { fontSize: 18 }]}>+</Text></Pressable>
                </View>

                <Text style={[st.naglowek, { marginTop: 12 }]}>Mecze po drodze</Text>
                <Przelacznik wl={o.mecze} tekst={o.mecze ? "Rozgrywaj mecze automatycznie (asystent ustawia skład)" : "Zatrzymaj się w dniu meczu — zagram sam"} onP={() => ust({ mecze: !o.mecze })} />

                <Text style={[st.naglowek, { marginTop: 8 }]}>Zatrzymaj, gdy…</Text>
                <Przelacznik wl={o.stopKontuzja} tekst="🤕 ktoś z kadry dozna kontuzji" onP={() => ust({ stopKontuzja: !o.stopKontuzja })} />
                <Przelacznik wl={o.stopOferta} tekst="💰 przyjdzie oferta za zawodnika albo oferta pracy dla Ciebie" onP={() => ust({ stopOferta: !o.stopOferta })} />
                <Przelacznik wl={o.stopNegocjacje} tekst="✉️ negocjacje będą czekać na Twoją decyzję" onP={() => ust({ stopNegocjacje: !o.stopNegocjacje })} />
                <Przelacznik wl={o.stopOkres} tekst="🏟 zacznie się / skończy okres przygotowawczy" onP={() => ust({ stopOkres: !o.stopOkres })} />

                <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 14 }]} onPress={start}>
                  <Text style={st.przyciskTekst}>⏩ Przewiń o {o.dni} {o.dni === 1 ? "dzień" : "dni"}</Text>
                </Pressable>
                <Text style={[st.maly, { marginTop: 6, textAlign: "center" }]}>„Dalej" na pulpicie nadal przesuwa dzień po dniu.</Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
