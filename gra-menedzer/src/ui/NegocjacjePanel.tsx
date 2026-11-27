import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { czekaNaCiebie, decyzjaMedyczna, dzienGry, podbijOferte, ROLA_NAZWA, zaproponujKontrakt, zerwijNegocjacje, type Negocjacja, type Rola, type WarunkiKontraktu } from "../engine/transfery";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
const ETAP: Record<Negocjacja["etap"], string> = { klub: "🏢 Rozmowy z klubem", zawodnik: "🤝 Kontrakt z zawodnikiem", medyczne: "🩺 Badania medyczne", rejestracja: "📝 Rejestracja w Extranecie", zakonczona: "✅ Zakończone", zerwana: "❌ Zerwane" };

/** Negocjacje transferowe w toku — etapy, dziennik i Twoje decyzje. */
export function NegocjacjePanel({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const lista = (s.negocjacje ?? []).filter((n) => s.zawodnicy[n.zawodnikId]);
  if (!lista.length) return null;
  return (
    <View style={[st.karta, { borderColor: K.akcent, borderWidth: 1 }]}>
      <Text style={st.naglowek}>📨 Negocjacje w toku ({lista.filter((n) => n.etap !== "zakonczona" && n.etap !== "zerwana").length})</Text>
      {lista.map((n) => <Pozycja key={n.id} s={s} n={n} odswiez={odswiez} />)}
    </View>
  );
}

function Pozycja({ s, n, odswiez }: { s: StanGry; n: Negocjacja; odswiez: () => void }) {
  const z = s.zawodnicy[n.zawodnikId];
  const w0 = n.zadania;
  const [w, setW] = useState<WarunkiKontraktu | null>(w0 ? { ...w0 } : null);
  const [kwota, setKwota] = useState(n.oferta.kwota);
  const czeka = czekaNaCiebie(n, s);
  const aktywna = n.etap !== "zakonczona" && n.etap !== "zerwana";
  const krokP = Math.max(10, Math.round((w0?.pensja ?? 100) * 0.05 / 10) * 10);
  const Step = ({ et, v, set, krok }: { et: string; v: number; set: (x: number) => void; krok: number }) => (
    <View style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 2 }]}>
      <Text style={st.maly}>{et}</Text>
      <View style={[st.wiersz, { gap: 6 }]}>
        <Pressable style={st.przyciskMaly} onPress={() => set(Math.max(0, v - krok))}><Text style={st.przyciskMalyTekst}>−</Text></Pressable>
        <Text style={[st.tekst, { minWidth: 84, textAlign: "center", fontWeight: "700", fontSize: 13 }]}>{zl(v)}</Text>
        <Pressable style={st.przyciskMaly} onPress={() => set(v + krok)}><Text style={st.przyciskMalyTekst}>+</Text></Pressable>
      </View>
    </View>
  );
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: K.linia, paddingVertical: 8 }}>
      <Text style={[st.tekst, { fontWeight: "800" }]}>{z.imie} {z.nazwisko} <Text style={st.maly}>· {z.poz} · {z.wiek} l. · {n.wstepna ? "umowa wstępna" : n.klubSprzedajacy ? s.kluby[n.klubSprzedajacy]?.nazwa : "wolny"}</Text></Text>
      <Text style={[st.maly, { color: aktywna ? K.akcent : K.szary }]}>{ETAP[n.etap]}{aktywna && !czeka ? ` · odpowiedź za ${Math.max(1, n.odpowiedz - dzienGry(s))} dn.` : aktywna ? " · czeka na Twoją decyzję" : ""}</Text>
      {n.dziennik.slice(-3).map((d, i) => <Text key={i} style={[st.maly, { fontSize: 11.5 }]}>• {d}</Text>)}
      {aktywna && n.etap === "klub" && czeka && (
        <View style={{ marginTop: 6 }}>
          <Step et="Nowa oferta dla klubu" v={kwota} set={setKwota} krok={Math.max(1000, Math.round(n.oferta.kwota * 0.05 / 1000) * 1000)} />
          <Pressable style={[st.przyciskMaly, { marginTop: 4, borderColor: K.zielony }]} onPress={() => { const b = podbijOferte(s, n.id, kwota); odswiez(); if (b) komunikat(b); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>Wyślij nową ofertę</Text>
          </Pressable>
        </View>
      )}
      {aktywna && n.etap === "zawodnik" && w && (czeka || !n.propozycja) && (
        <View style={{ marginTop: 6, backgroundColor: K.karta2, borderRadius: 8, padding: 8 }}>
          <Text style={[st.maly, { fontWeight: "800" }]}>Oczekiwania: {zl(w0!.pensja)}/kol. · {w0!.lata} sez. · rola: {ROLA_NAZWA[w0!.rola]}</Text>
          <Step et="Pensja (zł/kolejkę)" v={w.pensja} set={(x) => setW({ ...w, pensja: x })} krok={krokP} />
          <Step et="Premia za podpis" v={w.premia} set={(x) => setW({ ...w, premia: x })} krok={Math.max(100, krokP * 4)} />
          <Step et="Premia za gola" v={w.bonusGol} set={(x) => setW({ ...w, bonusGol: x })} krok={Math.max(50, krokP)} />
          <Step et="Premia za występ" v={w.bonusMecz} set={(x) => setW({ ...w, bonusMecz: x })} krok={Math.max(10, Math.round(krokP / 2))} />
          <Step et="Klauzula odstępnego (0 = brak)" v={w.klauzula} set={(x) => setW({ ...w, klauzula: x })} krok={Math.max(10000, Math.round((w0!.klauzula || 100000) * 0.1 / 10000) * 10000)} />
          <View style={[st.wiersz, { flexWrap: "wrap", gap: 4, marginTop: 4 }]}>
            {[1, 2, 3, 4, 5].map((l) => <Pressable key={l} onPress={() => setW({ ...w, lata: l })} style={[st.chip, w.lata === l && st.chipAktywny]}><Text style={{ color: w.lata === l ? "#17310f" : K.tekst, fontSize: 12 }}>{l} sez.</Text></Pressable>)}
          </View>
          <View style={[st.wiersz, { flexWrap: "wrap", gap: 4, marginTop: 4 }]}>
            {(Object.keys(ROLA_NAZWA) as Rola[]).map((r) => <Pressable key={r} onPress={() => setW({ ...w, rola: r })} style={[st.chip, w.rola === r && st.chipAktywny]}><Text style={{ color: w.rola === r ? "#17310f" : K.tekst, fontSize: 12 }}>{ROLA_NAZWA[r]}</Text></Pressable>)}
          </View>
          <Pressable style={[st.przyciskMaly, { marginTop: 6, borderColor: K.zielony }]} onPress={() => { const b = zaproponujKontrakt(s, n.id, w); odswiez(); if (b) komunikat(b); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>📞 Wyślij propozycję {z.agent ? "agentowi" : "zawodnikowi"}</Text>
          </Pressable>
          <Text style={[st.maly, { fontSize: 10.5, marginTop: 4 }]}>Obiecana rola „kluczowy/rotacja" = obietnica minut (rozliczana po kilku kolejkach).</Text>
        </View>
      )}
      {aktywna && n.etap === "medyczne" && n.uraz && (
        <View style={[st.wiersz, { gap: 6, marginTop: 6, flexWrap: "wrap" }]}>
          {([["kontynuuj", "Kontynuuj (zawodnik z urazem)"], ["renegocjuj", "Renegocjuj kwotę (−15%)"], ["zerwij", "Zerwij transfer"]] as const).map(([d, t]) => (
            <Pressable key={d} style={st.przyciskMaly} onPress={() => { decyzjaMedyczna(s, n.id, d); odswiez(); }}><Text style={st.przyciskMalyTekst}>{t}</Text></Pressable>
          ))}
        </View>
      )}
      {aktywna && (
        <Pressable style={{ marginTop: 4 }} onPress={() => { zerwijNegocjacje(s, n.id); odswiez(); }}><Text style={[st.maly, { color: K.czerwony }]}>Zerwij rozmowy</Text></Pressable>
      )}
    </View>
  );
}
