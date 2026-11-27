import { useEffect, useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import { dzisiaj } from "../engine/dzien";
import { FORMACJE } from "../engine/mecz";
import { dograjDoKonca, krokMinuty, mowaWPrzerwie, NAZWA_NAST, okrzyk, OKRZYKI, podpowiedzi, przerwa, rozpocznijMeczNaZywo, zmianaGracza, zmienTaktyke, type MeczLive, type Mowa, type Okrzyk } from "../engine/meczNaZywo";
import { maOswietlenie } from "../engine/sezon";
import type { Nastawienie, StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { CZCIONKA, K, st } from "./styl";
import { Mecz3D, type Kamera, type Ustawienia3D } from "./three/Mecz3D";
import { czyWyciszony, gwizdek, startDzwieku, stopDzwieku, wycisz } from "./three/dzwiek";

type Zakl = "relacja" | "staty" | "sklady" | "taktyka" | "zmiany";
const KAMERY: [Kamera, string][] = [["auto", "🎬 Reżyser"], ["tv", "📺 TV"], ["bramka", "🥅 Zza bramki"], ["gora", "🛰 Z góry"], ["blisko", "🔍 Zbliżenie"]];

/** Warunki meczu: pora (wieczór pod reflektorami), pogoda wg miesiąca, frekwencja wg renomy. */
function warunki(s: StanGry, domId: string): Ustawienia3D {
  const k = s.kluby[domId];
  const d = dzisiaj(s).data, mies = d.getMonth() + 1;
  const h = (s.sezon * 31 + s.kolejka * 7 + domId.length) % 100;
  const noc = maOswietlenie(k) && (mies >= 10 || mies <= 3 ? h < 55 : h < (k.poziom <= 3 ? 40 : 15));
  const zima = mies === 12 || mies <= 2, jesien = mies >= 10 && mies <= 11;
  const pogoda: Ustawienia3D["pogoda"] = zima && h % 3 === 0 ? "snieg" : (jesien || mies === 3 || mies === 4) && h % 4 === 1 ? "deszcz" : jesien && h % 9 === 2 ? "mgla" : h % 11 === 3 ? "deszcz" : "slonce";
  const widzowie = Math.round(k.pojemnosc * Math.min(0.95, 0.3 + k.renoma * 0.55));
  const lekka = typeof window !== "undefined" && (window as any).localStorage?.getItem("dz_lekka") === "1";
  return { noc, pogoda, widzowie, lekka };
}

export function MeczNaZywo({ s, para, onKoniec, onAnuluj }: { s: StanGry; para: [string, string]; onKoniec: (m: MeczLive) => void; onAnuluj: () => void }) {
  const [m] = useState<MeczLive>(() => rozpocznijMeczNaZywo(s, para[0], para[1]));
  const ust = useMemo(() => warunki(s, para[0]), []);
  const [wersja, setWersja] = useState(0);
  const [predkosc, setPredkosc] = useState(0);
  const [ostatniaPr, setOstatniaPr] = useState(1);
  const [kamera, setKamera] = useState<Kamera>("auto");
  const [zakl, setZakl] = useState<Zakl>("relacja");
  const [tylkoAkcje, setTylkoAkcje] = useState(false);
  const [autoPauza, setAutoPauza] = useState(true);
  const [powt, setPowt] = useState(false);
  const [bez3D, setBez3D] = useState(Platform.OS !== "web");
  const [schodzi, setSchodzi] = useState<string | null>(null);
  const [kom, setKom] = useState<string | null>(null);
  const [glosno, setGlosno] = useState(!czyWyciszony());
  const [startTxt, setStartTxt] = useState(true);
  const kd = s.kluby[m.dom.klubId], kg = s.kluby[m.gosc.klubId];
  const moj = m.moja === "dom" ? m.dom : m.gosc;
  const odswiez = () => setWersja((v) => v + 1);

  const krok = () => {
    if (m.koniec) return;
    krokMinuty(s, m);
    if (tylkoAkcje) { let n = 0; while (!m.koniec && !m.wazne && n++ < 12 && !m.sekwencja.some((p) => p.zdarzenie && p.zdarzenie !== "aut")) krokMinuty(s, m); }
    const w = m.wazne;
    if (w) {
      if (w.typ === "przerwa" || w.typ === "koniec") { gwizdek(true, w.typ === "koniec" ? 3 : 2); setPredkosc(0); }
      else if (autoPauza && (w.typ === "czerwona" || (w.typ === "uraz" && (w.strona === m.moja)))) { setPredkosc(0); if (w.typ === "uraz") { setZakl("zmiany"); setSchodzi(w.id ?? null); } }
    }
    odswiez();
  };
  // widok 2D: zegar meczu bez silnika 3D
  useEffect(() => {
    if (!bez3D || predkosc <= 0 || m.koniec) return;
    const t = setInterval(krok, 1400 / predkosc);
    return () => clearInterval(t);
  });
  const graj = (v: number) => { setPredkosc(v); if (v > 0) setOstatniaPr(v); if (startTxt) { setStartTxt(false); startDzwieku(ust.widzowie / Math.max(1, kd.pojemnosc)); } };
  const dograj = (doPrzerwy: boolean) => { dograjDoKonca(s, m, doPrzerwy); setPredkosc(0); odswiez(); };
  const minuta = m.koniec ? "KONIEC" : przerwa(m) ? "PRZERWA" : m.polowa === 1 && m.min > 45 ? `45+${m.min - 45}'` : m.min > 90 ? `90+${m.min - 90}'` : `${m.min}'`;
  const posD = m.staty.posN ? Math.round((m.staty.posD / m.staty.posN) * 100) : 50;
  const nz = (id: string) => { const z = s.zawodnicy[id]; return z ? `${z.nazwisko}` : "?"; };

  const Btn = ({ t, on, akt, kol }: { t: string; on: () => void; akt?: boolean; kol?: string }) => (
    <Pressable onPress={on} style={[st.chip, { marginBottom: 6, paddingVertical: 6, paddingHorizontal: 11 }, akt && st.chipAktywny, kol ? { borderColor: kol } : null]}>
      <Text style={{ color: akt ? "#17310f" : kol ?? K.tekst, fontSize: 12.5, fontWeight: "700", fontFamily: CZCIONKA }}>{t}</Text>
    </Pressable>
  );
  const Stat = ({ et, a, b, proc }: { et: string; a: number; b: number; proc?: boolean }) => {
    const sum = a + b || 1;
    return (
      <View style={{ marginVertical: 4 }}>
        <View style={[st.wiersz, { justifyContent: "space-between" }]}><Text style={[st.tekst, { fontWeight: "800" }]}>{proc ? `${a}%` : a}</Text><Text style={st.maly}>{et}</Text><Text style={[st.tekst, { fontWeight: "800" }]}>{proc ? `${b}%` : b}</Text></View>
        <View style={{ flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden", backgroundColor: K.karta2 }}><View style={{ flex: a / sum, backgroundColor: K.akcent }} /><View style={{ flex: b / sum, backgroundColor: K.niebieski }} /></View>
      </View>
    );
  };
  const Sklad = ({ z, nazwa }: { z: typeof m.dom; nazwa: string }) => (
    <View style={{ flex: 1 }}>
      <Text style={[st.naglowek, { fontSize: 10 }]}>{nazwa} · {z.formacja}</Text>
      {[...z.naBoisku, ...z.czerwoni].map((id) => { const p = s.zawodnicy[id]; if (!p) return null; const oc = m.oceny[id] ?? 6; const cz = z.czerwoni.includes(id);
        return (
          <View key={id} style={{ paddingVertical: 2.5, opacity: cz ? 0.5 : 1 }}>
            <Text style={{ color: K.tekst, fontSize: 12, fontFamily: CZCIONKA }} numberOfLines={1}>
              <Text style={{ color: K.szary }}>{p.numer} </Text>{p.nazwisko}{z.zolte.includes(id) ? " 🟨" : ""}{cz ? " 🟥" : ""}{m.gole.filter((g) => g.strzelec === id && g.typ !== "samoboj").map(() => " ⚽").join("")}{m.urazy.some((u) => u.id === id) ? " 🚑" : ""}
              <Text style={{ color: oc >= 7.5 ? K.zielony : oc < 5.5 ? K.czerwony : K.akcent, fontWeight: "800" }}>  {oc.toFixed(1)}</Text>
            </Text>
            <View style={{ height: 3, backgroundColor: K.karta2, borderRadius: 2, marginTop: 1 }}><View style={{ width: `${Math.round(p.kondycja)}%`, height: 3, borderRadius: 2, backgroundColor: p.kondycja < 55 ? K.czerwony : p.kondycja < 70 ? K.akcent : K.zielony }} /></View>
          </View>
        ); })}
    </View>
  );

  return (
    <Modal visible animationType="slide" onRequestClose={() => {}}>
      <View style={{ flex: 1, backgroundColor: K.tlo }}>
        {/* grafika wyniku jak w TV */}
        <View style={[st.wiersz, { padding: 10, paddingTop: 14, gap: 8, backgroundColor: "#0a1f14", borderBottomWidth: 1, borderBottomColor: K.linia }]}>
          <Herb klub={kd} rozmiar={30} />
          <Text style={{ flex: 1, color: K.tekst, fontWeight: "800", fontSize: 13, fontFamily: CZCIONKA }} numberOfLines={1}>{kd.nazwa}</Text>
          <View style={{ backgroundColor: "#000", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 22, fontFamily: CZCIONKA }}>{m.gd}:{m.gg}</Text></View>
          <Text style={{ flex: 1, color: K.tekst, fontWeight: "800", fontSize: 13, textAlign: "right", fontFamily: CZCIONKA }} numberOfLines={1}>{kg.nazwa}</Text>
          <Herb klub={kg} rozmiar={30} />
        </View>
        <View style={[st.wiersz, { justifyContent: "center", gap: 10, paddingVertical: 4, backgroundColor: "#071710" }]}>
          <Text style={{ color: K.akcent, fontWeight: "900", fontFamily: CZCIONKA }}>{minuta}</Text>
          <Text style={st.maly}>{ust.noc ? "🌙 pod reflektorami" : "☀️ dzień"} · {{ slonce: "pogodnie", deszcz: "🌧 deszcz", snieg: "❄️ śnieg (pomarańczowa piłka)", mgla: "🌫 mgła" }[ust.pogoda]} · {ust.widzowie.toLocaleString("pl")} widzów</Text>
        </View>
        {/* pasek przewagi */}
        <View style={{ flexDirection: "row", height: 4 }}><View style={{ flex: Math.max(0.05, 0.5 + m.momentum * 0.5), backgroundColor: K.akcent }} /><View style={{ flex: Math.max(0.05, 0.5 - m.momentum * 0.5), backgroundColor: K.niebieski }} /></View>

        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 40 }}>
          {/* obraz meczu */}
          <View>
            {!bez3D ? (
              <Mecz3D s={s} m={m} wersja={wersja} predkosc={predkosc} kamera={kamera} ust={ust} onKoniecSekwencji={krok} onPowtorka={setPowt} onBlad={() => setBez3D(true)} />
            ) : <Boisko2D s={s} m={m} />}
            {powt && <View style={{ position: "absolute", top: 8, left: 8, backgroundColor: "#c8102e", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>⟲ POWTÓRKA</Text></View>}
            {m.wazne?.typ === "gol" && predkosc > 0 && <View style={{ position: "absolute", top: "38%", alignSelf: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 18, paddingVertical: 6, borderRadius: 8 }}><Text style={{ color: K.akcent, fontWeight: "900", fontSize: 28, fontFamily: CZCIONKA }}>GOOOL!</Text></View>}
            {startTxt && <Pressable onPress={() => graj(1)} style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" } as any}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>▶ Rozpocznij mecz</Text><Text style={[st.maly, { color: "#ddd" }]}>{m.zasady.opis}</Text></Pressable>}
          </View>
          {/* sterowanie */}
          <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 8 }]}>
            <Btn t={predkosc > 0 ? "⏸ Pauza" : "▶ Graj"} on={() => (predkosc > 0 ? setPredkosc(0) : graj(ostatniaPr))} akt={predkosc === 0} />
            {[1, 2, 4, 8].map((v) => <Btn key={v} t={`${v}×`} on={() => graj(v)} akt={predkosc === v} />)}
            <Btn t={tylkoAkcje ? "⚡ Tylko akcje ✓" : "⚡ Tylko akcje"} on={() => setTylkoAkcje(!tylkoAkcje)} akt={tylkoAkcje} />
            <Btn t={autoPauza ? "⏯ Auto-pauza ✓" : "⏯ Auto-pauza"} on={() => setAutoPauza(!autoPauza)} />
            <Btn t={glosno ? "🔊" : "🔇"} on={() => { wycisz(glosno); setGlosno(!glosno); }} />
            {!bez3D && Platform.OS === "web" && <Btn t="🗺 2D" on={() => setBez3D(true)} />}
            {bez3D && Platform.OS === "web" && <Btn t="🏟 3D" on={() => setBez3D(false)} />}
          </View>
          {!bez3D && <View style={[st.wiersz, { flexWrap: "wrap" }]}>{KAMERY.map(([k, t]) => <Btn key={k} t={t} on={() => setKamera(k)} akt={kamera === k} />)}</View>}
          <View style={[st.wiersz, { flexWrap: "wrap" }]}>
            {m.polowa === 1 && !m.koniec && <Btn t="⏭ Do przerwy" on={() => dograj(true)} />}
            {!m.koniec && <Btn t="⏭⏭ Dograj do końca" on={() => dograj(false)} />}
          </View>

          {/* przerwa: mowa w szatni */}
          {przerwa(m) && !m.mowa && (
            <View style={[st.karta, { marginHorizontal: 0, borderColor: K.akcent, borderWidth: 1 }]}>
              <Text style={st.naglowek}>🗣 Szatnia — przerwa ({m.gd}:{m.gg})</Text>
              <Text style={st.maly}>Co powiesz drużynie? Efekt zależy od wyniku i charakteru zespołu.</Text>
              <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 6 }]}>
                {([["pochwala", "👏 Pochwała"], ["spokoj", "🧘 Spokojne wskazówki"], ["wiara", "💪 „Wierzę w was!”"], ["ochrzan", "😡 Ostra reprymenda"]] as [Mowa, string][]).map(([t, n]) => <Btn key={t} t={n} on={() => { setKom(mowaWPrzerwie(s, m, t)); odswiez(); }} />)}
              </View>
            </View>
          )}
          {kom && <Text style={[st.maly, { color: K.akcent, marginVertical: 4 }]}>{kom}</Text>}

          {/* zakładki */}
          <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 6 }]}>
            {([["relacja", "📝 Relacja"], ["staty", "📊 Statystyki"], ["sklady", "👥 Składy"], ["taktyka", "📋 Taktyka"], ["zmiany", `🔄 Zmiany ${moj.zmiany}/${m.zasady.limit >= 99 ? "∞" : m.zasady.limit}`]] as [Zakl, string][]).map(([z, t]) => <Btn key={z} t={t} on={() => setZakl(z)} akt={zakl === z} />)}
          </View>
          <View style={[st.karta, { marginHorizontal: 0 }]}>
            {zakl === "relacja" && m.komentarz.slice(0, 40).map((c, i) => (
              <Text key={i} style={{ color: c.typ === "gol" ? K.akcent : c.typ === "kartka" ? "#ffd84d" : c.typ === "var" ? K.niebieski : K.tekst, fontSize: 12.5, marginVertical: 2.5, fontWeight: c.typ === "gol" ? "800" : "400", fontFamily: CZCIONKA }}>
                <Text style={{ color: K.szary, fontWeight: "800" }}>{c.min} </Text>{c.tekst}
              </Text>))}
            {zakl === "staty" && (<>
              <Stat et="Posiadanie" a={posD} b={100 - posD} proc />
              <Stat et="Strzały" a={m.staty.strz[0]} b={m.staty.strz[1]} />
              <Stat et="Celne" a={m.staty.celne[0]} b={m.staty.celne[1]} />
              <Stat et="xG (oczekiwane gole)" a={Math.round(m.staty.xg[0] * 10) / 10} b={Math.round(m.staty.xg[1] * 10) / 10} />
              <Stat et="Rzuty rożne" a={m.staty.rozne[0]} b={m.staty.rozne[1]} />
              <Stat et="Faule" a={m.staty.faule[0]} b={m.staty.faule[1]} />
              <Stat et="Spalone" a={m.staty.spalone[0]} b={m.staty.spalone[1]} />
              <Stat et="Słupki / poprzeczki" a={m.staty.slupki[0]} b={m.staty.slupki[1]} />
              <Stat et="Obrony bramkarza" a={m.staty.obrony[0]} b={m.staty.obrony[1]} />
              <Text style={[st.naglowek, { marginTop: 8 }]}>Mapa strzałów</Text>
              <MapaStrzalow m={m} />
            </>)}
            {zakl === "sklady" && <View style={[st.wiersz, { alignItems: "flex-start", gap: 10 }]}><Sklad z={m.dom} nazwa={kd.nazwa} /><Sklad z={m.gosc} nazwa={kg.nazwa} /></View>}
            {zakl === "taktyka" && (<>
              <Text style={st.naglowek}>Asystent podpowiada</Text>
              {podpowiedzi(s, m).map((p, i) => <Text key={i} style={[st.maly, { marginVertical: 2 }]}>{p}</Text>)}
              <Text style={[st.naglowek, { marginTop: 10 }]}>Nastawienie</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{(Object.keys(NAZWA_NAST) as Nastawienie[]).map((n) => <Btn key={n} t={NAZWA_NAST[n]} akt={moj.nastawienie === n} on={() => { zmienTaktyke(s, m, { nastawienie: n }); odswiez(); }} />)}</View>
              <Text style={[st.naglowek, { marginTop: 6 }]}>Ustawienie</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{Object.keys(FORMACJE).map((f) => <Btn key={f} t={f} akt={moj.formacja === f} on={() => { zmienTaktyke(s, m, { formacja: f }); odswiez(); }} />)}</View>
              <Text style={[st.naglowek, { marginTop: 6 }]}>Tempo i pressing</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>
                {(["wolne", "normalne", "szybkie"] as const).map((t) => <Btn key={t} t={`tempo ${t}`} akt={(s.taktyka.tempo ?? "normalne") === t} on={() => { s.taktyka.tempo = t; odswiez(); }} />)}
                {(["niski", "sredni", "wysoki"] as const).map((t) => <Btn key={t} t={`pressing ${t === "sredni" ? "średni" : t}`} akt={(s.taktyka.pressing ?? "sredni") === t} on={() => { s.taktyka.pressing = t; odswiez(); }} />)}
              </View>
              <Text style={[st.naglowek, { marginTop: 6 }]}>Okrzyk z ławki (~10 min)</Text>
              {(Object.keys(OKRZYKI) as Okrzyk[]).map((o) => (
                <Pressable key={o} onPress={() => { const b = okrzyk(s, m, o); setKom(b ?? `${OKRZYKI[o].nazwa} — ${OKRZYKI[o].opis}`); odswiez(); }} style={{ paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }}>
                  <Text style={[st.tekst, { fontSize: 13, color: m.okrzyk?.typ === o ? K.akcent : K.tekst }]}>{OKRZYKI[o].nazwa} <Text style={st.maly}>— {OKRZYKI[o].opis}</Text></Text>
                </Pressable>))}
            </>)}
            {zakl === "zmiany" && (<>
              <Text style={st.maly}>{m.zasady.opis}. {m.zasady.okna !== null ? `Przerwy na zmiany: ${moj.oknaZmian.length}/${m.zasady.okna}.` : ""}</Text>
              <Text style={[st.naglowek, { marginTop: 8 }]}>1. Kto schodzi?</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{moj.naBoisku.map((id) => { const p = s.zawodnicy[id]; return <Btn key={id} t={`${p?.numer ?? ""} ${nz(id)} ${Math.round(p?.kondycja ?? 0)}%${m.urazy.some((u) => u.id === id) ? " 🚑" : ""}`} akt={schodzi === id} on={() => setSchodzi(id)} />; })}</View>
              <Text style={[st.naglowek, { marginTop: 8 }]}>2. Kto wchodzi?</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{moj.lawka.map((id) => { const p = s.zawodnicy[id]; return <Btn key={id} t={`${p?.poz} ${nz(id)} (${Math.floor(p?.umiej ?? 0)})`} on={() => { if (!schodzi) { setKom("Najpierw wybierz, kto schodzi."); return; } const b = zmianaGracza(s, m, schodzi, id); setKom(b ?? `🔄 ${nz(id)} za ${nz(schodzi)}`); setSchodzi(null); odswiez(); }} />; })}</View>
              {!moj.lawka.length && <Text style={st.maly}>Ławka pusta.</Text>}
            </>)}
          </View>

          {m.koniec ? (
            <Pressable style={st.przycisk} onPress={() => { stopDzwieku(); onKoniec(m); }}><Text style={st.przyciskTekst}>✅ Zakończ i zapisz wynik ({m.gd}:{m.gg})</Text></Pressable>
          ) : m.min === 0 ? (
            <Pressable onPress={() => { stopDzwieku(); onAnuluj(); }} style={{ alignItems: "center", marginTop: 8 }}><Text style={[st.maly, { color: K.czerwony }]}>Wróć bez oglądania (mecz zostanie zasymulowany)</Text></Pressable>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

/** Lekki widok 2D (słabsze telefony / bez WebGL): boisko z kropkami w miejscu akcji. */
function Boisko2D({ s, m }: { s: StanGry; m: MeczLive }) {
  const b = m.pilka;
  return (
    <Svg width="100%" viewBox="0 0 105 68" style={{ aspectRatio: 105 / 68, backgroundColor: "#2f9a4c", borderRadius: 8 }}>
      <Rect x={0.5} y={0.5} width={104} height={67} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      <Line x1={52.5} y1={0.5} x2={52.5} y2={67.5} stroke="#e9f5ea" strokeWidth={0.4} />
      <Circle cx={52.5} cy={34} r={9.15} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      <Rect x={0.5} y={13.8} width={16.5} height={40.3} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      <Rect x={88} y={13.8} width={16.5} height={40.3} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      {m.sekwencja.map((p, i) => i > 0 ? <Line key={i} x1={m.sekwencja[i - 1].x * 1.05} y1={m.sekwencja[i - 1].y * 0.68} x2={p.x * 1.05} y2={p.y * 0.68} stroke="#fff" strokeWidth={0.3} strokeDasharray="1,1" opacity={0.7} /> : null)}
      {[m.dom, m.gosc].map((z, j) => z.naBoisku.map((id, i) => {
        const x = j === 0 ? 8 + (i / 11) * 40 + (b.x - 50) * 0.3 : 97 - (i / 11) * 40 + (b.x - 50) * 0.3;
        const y = 8 + ((i * 37) % 52);
        return <Circle key={id} cx={Math.max(2, Math.min(103, x))} cy={y} r={1.6} fill={j === 0 ? "#ffce47" : "#5aa9ff"} stroke="#000" strokeWidth={0.2} />;
      }))}
      <Circle cx={b.x * 1.05} cy={b.y * 0.68} r={1} fill="#fff" stroke="#000" strokeWidth={0.2} />
    </Svg>
  );
}
function MapaStrzalow({ m }: { m: MeczLive }) {
  return (
    <Svg width="100%" viewBox="0 0 105 68" style={{ aspectRatio: 105 / 68, backgroundColor: "#245f37", borderRadius: 6 }}>
      <Rect x={0.5} y={0.5} width={104} height={67} fill="none" stroke="#cfe" strokeWidth={0.3} />
      <Line x1={52.5} y1={0.5} x2={52.5} y2={67.5} stroke="#cfe" strokeWidth={0.3} />
      {m.staty.strzaly.map((p, i) => <Circle key={i} cx={p.x * 1.05} cy={p.y * 0.68} r={0.8 + p.xg * 4} fill={p.gol ? "#ffce47" : "none"} stroke={p.strona === "dom" ? "#ffce47" : "#5aa9ff"} strokeWidth={0.4} />)}
    </Svg>
  );
}
