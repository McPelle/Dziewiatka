import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { dalejDzien, doMeczu, dzisiaj, fmtData, planTygodnia } from "../engine/dzien";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";
import { PanelOkresu } from "./PanelOkresu";
import { MeczNaZywo, zapisanyMecz } from "./MeczNaZywo";
import { KalendarzMiesiac } from "./KalendarzMiesiac";
import { KartaDnia } from "./KartaDnia";
import { paraMojegoMeczu } from "../engine/meczNaZywo";
import { meczPucharuGracza } from "../engine/puchar";
import { TreningNaZywo } from "./TreningNaZywo";

/** Panel kalendarza na pulpicie: dzisiejszy dzień, plan tygodnia, raport ostatniego dnia, przyciski Dalej / Do meczu. */
export function PanelDnia({ s, odswiez, pokazMecz }: { s: StanGry; odswiez: () => void; pokazMecz: () => void }) {
  const [rozwin, setRozwin] = useState(true);
  const [naZywo, setNaZywo] = useState<[string, string] | null>(null);
  const [pucharLive, setPucharLive] = useState<ReturnType<typeof meczPucharuGracza>>(null);
  const [miesiac, setMiesiac] = useState(false);
  const [treningLive, setTreningLive] = useState(false);
  const [karta, setKarta] = useState<number | null>(null);
  if (s.okres) return <PanelOkresu s={s} odswiez={odswiez} />;
  const plan = planTygodnia(s);
  const d = dzisiaj(s);
  const raport = s.raportyDni?.[0];
  const dalej = () => { const mecz = dalejDzien(s); odswiez(); if (mecz) pokazMecz(); };
  return (
    <View style={[st.karta, { borderColor: K.akcent, borderWidth: 1 }]}>
      <View style={[st.wiersz, { justifyContent: "space-between" }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 12, letterSpacing: 0.6, fontFamily: CZCIONKA }}>{d.nazwa.toUpperCase()} · {fmtData(d.data)}</Text>
          <Text style={[st.tekst, { fontSize: 17, fontWeight: "900", marginTop: 2 }]}>{d.ikona} {d.tytul}</Text>
        </View>
        <Pressable onPress={() => setMiesiac(true)} style={[st.przyciskMaly, { paddingVertical: 6 }]}><Text style={st.przyciskMalyTekst}>📅 Miesiąc</Text></Pressable>
      </View>
      {/* pasek tygodnia — dotknij dnia, by go zaplanować */}
      <View style={[st.wiersz, { marginTop: 10, gap: 4 }]}>
        {plan.map((p) => {
          const teraz = p.idx === d.idx, minal = p.idx < d.idx;
          return (
            <Pressable key={p.idx} onPress={() => setKarta(p.idx)} style={{ flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 8, backgroundColor: teraz ? "rgba(255,206,71,0.18)" : K.karta2, borderWidth: teraz ? 1 : p.akt ? 1 : 0, borderColor: p.akt ? K.niebieski : K.akcent, opacity: minal ? 0.45 : 1 }}>
              <Text style={{ fontSize: 10, color: K.szary, fontWeight: "800", fontFamily: CZCIONKA }}>{p.nazwa.slice(0, 3)}</Text>
              <Text style={{ fontSize: 15 }}>{p.ikona}</Text>
              <Text style={{ fontSize: 9.5, color: K.szary, fontFamily: CZCIONKA }}>{p.data.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>
      {raport && (
        <Pressable onPress={() => setRozwin(!rozwin)} style={{ marginTop: 10, backgroundColor: K.karta2, borderRadius: 10, padding: 10 }}>
          <Text style={[st.maly, { fontWeight: "800", color: K.tekst }]}>{raport.ikona} Raport: {raport.data} — {raport.tytul} {rozwin ? "▲" : "▼"}</Text>
          {rozwin && raport.wpisy.map((w, i) => <Text key={i} style={[st.maly, { marginTop: 3 }]}>{w}</Text>)}
        </Pressable>
      )}
      <View style={[st.wiersz, { gap: 8, marginTop: 12 }]}>
        <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0, marginTop: 0 }]} onPress={dalej}>
          <Text style={st.przyciskTekst}>{d.typ === "mecz" ? "⚽ Rozegraj mecz ›" : `Dalej › ${plan[d.idx + 1]?.nazwa ?? ""}`}</Text>
        </Pressable>
        {d.typ === "mecz" && paraMojegoMeczu(s) && (
          <Pressable style={[st.przyciskMaly, { justifyContent: "center", borderColor: K.akcent }]} onPress={() => setNaZywo(paraMojegoMeczu(s))}>
            <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>{zapisanyMecz(s, paraMojegoMeczu(s)!) ? `▶ Wznów (${zapisanyMecz(s, paraMojegoMeczu(s)!)!.m.min}')` : "📺 Na żywo"}</Text>
          </Pressable>
        )}
        {(d.typ === "trening" && (!d.akt || d.akt.rodzaj === "trening")) && (
          <Pressable style={[st.przyciskMaly, { justifyContent: "center", borderColor: K.akcent }]} onPress={() => setTreningLive(true)}>
            <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>📺 Trening na żywo</Text>
          </Pressable>
        )}
        {d.typ === "puchar" && !s.meczLivePuchar && meczPucharuGracza(s) && (
          <Pressable style={[st.przyciskMaly, { justifyContent: "center", borderColor: K.akcent }]} onPress={() => setPucharLive(meczPucharuGracza(s))}>
            <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>{zapisanyMecz(s, meczPucharuGracza(s)!.para) ? "▶ Wznów puchar" : "🏆 Puchar na żywo"}</Text>
          </Pressable>
        )}
        {d.typ !== "mecz" && (
          <Pressable style={[st.przyciskMaly, { justifyContent: "center", borderColor: K.niebieski }]} onPress={() => { doMeczu(s); odswiez(); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>⏩ Do meczu</Text>
          </Pressable>
        )}
      </View>
      <KalendarzMiesiac s={s} widoczny={miesiac} onClose={() => setMiesiac(false)} />
      {karta !== null && <KartaDnia s={s} data={plan[karta]?.data ?? null} dzis={d.data} odswiez={odswiez}
        wydarzenia={plan[karta] ? [{ ikona: plan[karta].ikona, tekst: plan[karta].tytul }] : []}
        zablokowany={plan[karta]?.typ === "mecz" ? "Dzień meczu — rozruch i mecz." : plan[karta]?.typ === "puchar" ? "Mecz pucharowy." : karta < d.idx ? "Ten dzień już minął." : null}
        onClose={() => setKarta(null)} />}
      {treningLive && <TreningNaZywo s={s} dzien={d} onAnuluj={() => setTreningLive(false)} onKoniec={(ses) => { s.treningLive = ses; s.osiagnieciaFlagi = { ...(s.osiagnieciaFlagi ?? {}), trening: true }; setTreningLive(false); dalejDzien(s); odswiez(); }} />}
      {pucharLive && <MeczNaZywo s={s} para={pucharLive.para} puchar={pucharLive} onAnuluj={() => setPucharLive(null)} onKoniec={(m) => { s.meczLivePuchar = m; setPucharLive(null); dalejDzien(s); odswiez(); }} />}
      {naZywo && <MeczNaZywo s={s} para={naZywo} onAnuluj={() => setNaZywo(null)} onKoniec={(m) => { s.meczLive = m; setNaZywo(null); const mecz = dalejDzien(s); odswiez(); if (mecz) pokazMecz(); }} />}
    </View>
  );
}
