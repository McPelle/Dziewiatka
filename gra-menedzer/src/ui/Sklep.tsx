// Sklep klubowy: projekt szalika i koszulki, ceny, prognoza i statystyki sprzedaży.
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  bestseller, cenaReferencyjna, historiaSklepu, kosztProjektu, kosztSztuki, ocenaProjektu, popytTygodnia, rankingKoszulek, sezonSklepu, stanSklepu,
  ustawSprzedaz, WZORY_KOSZULKI, WZORY_SZALIKA, zapiszProjekt, type ProjektKoszulki, type ProjektSzalika, type WzorKoszulki, type WzorSzalika,
} from "../engine/sklep";
import type { StanGry } from "../engine/types";
import { barwyKlubu, odcien } from "./barwy";
import { K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
const zl = (n: number) => `${Math.round(n).toLocaleString("pl")} zł`;
const PALETA = ["#ffffff", "#111111", "#d4001a", "#0a3d91", "#1b8a3a", "#f6c700", "#ff7a00", "#6a1b9a", "#7a0019", "#5aa9ff", "#8a8a8a", "#00a0a0"];
const jasny = (hex: string) => {
  const n = hex.replace("#", "");
  if (n.length < 6) return true;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
};
const poprawnyHex = (t: string) => /^#[0-9a-fA-F]{6}$/.test(t);

/** Rysunek szalika (View). */
export function SzalikPodglad({ p, szer = 300 }: { p: ProjektSzalika; szer?: number }) {
  const H = Math.round(szer * 0.16);
  const k1 = p.kolor1, k2 = p.kolor2, k3 = p.kolor3 ?? (jasny(k1) ? "#111111" : "#ffffff");
  const tlo = () => {
    switch (p.wzor) {
      case "pasy": return Array.from({ length: 14 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: i % 2 ? k2 : k1 }} />);
      case "polszalik": return [<View key="a" style={{ flex: 1, backgroundColor: k1 }} />, <View key="b" style={{ flex: 1, backgroundColor: k2 }} />];
      case "bloki": return [<View key="a" style={{ width: szer * 0.16, backgroundColor: k2 }} />, <View key="b" style={{ flex: 1, backgroundColor: k1 }} />, <View key="c" style={{ width: szer * 0.16, backgroundColor: k2 }} />];
      case "szachownica": return Array.from({ length: 16 }, (_, i) => (
        <View key={i} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: i % 2 ? k2 : k1 }} />
          <View style={{ flex: 1, backgroundColor: i % 2 ? k1 : k2 }} />
        </View>
      ));
      case "jodelka": return [<View key="t" style={{ flex: 1, backgroundColor: k1 }}>
        {Array.from({ length: 18 }, (_, i) => <View key={i} style={{ position: "absolute", left: i * (szer / 16) - 10, top: -H * 0.3, width: szer / 34, height: H * 1.6, backgroundColor: k2, transform: [{ rotate: i % 2 ? "35deg" : "-35deg" }] }} />)}
      </View>];
      default: return [<View key="g" style={{ flex: 1, backgroundColor: k1 }} />];
    }
  };
  const fredzle = (kolor: string) => (
    <View style={{ width: 10, height: H, justifyContent: "space-between", paddingVertical: 2 }}>
      {Array.from({ length: 7 }, (_, i) => <View key={i} style={{ height: 2, backgroundColor: kolor, borderRadius: 1 }} />)}
    </View>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
      {fredzle(k2)}
      <View style={{ width: szer, height: H, borderRadius: 4, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.35)" }}>
        <View style={{ flex: 1, flexDirection: "row" }}>{tlo()}</View>
        {p.wzor === "gladki" && <>
          <View style={{ position: "absolute", left: 0, right: 0, top: 3, height: 3, backgroundColor: k2 }} />
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 3, height: 3, backgroundColor: k2 }} />
        </>}
        {!!p.napis && (
          <View style={{ position: "absolute", left: szer * 0.18, right: szer * 0.18, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            <View style={{ backgroundColor: p.wzor === "pasy" || p.wzor === "szachownica" || p.wzor === "jodelka" ? odcien(k1, -0.1) : "transparent", paddingHorizontal: 6, borderRadius: 2 }}>
              <Text numberOfLines={1} style={{ color: k3, fontWeight: "900", fontSize: H * 0.42, letterSpacing: 1.5 }}>{p.napis.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </View>
      {fredzle(k2)}
    </View>
  );
}

/** Rysunek koszulki (widok z tyłu: nazwisko + numer). */
export function KoszulkaPodglad({ p, nazwisko, numer, szer = 120 }: { p: ProjektKoszulki; nazwisko?: string; numer?: number; szer?: number }) {
  const W = szer, H = W * 0.95;
  const napis = jasny(p.baza) ? "#111111" : "#ffffff";
  const korpus = () => {
    switch (p.wzor) {
      case "pasy": return <View style={{ flex: 1, flexDirection: "row" }}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: i % 2 ? p.dodatek : p.baza }} />)}</View>;
      case "polowki": return <View style={{ flex: 1, flexDirection: "row" }}><View style={{ flex: 1, backgroundColor: p.baza }} /><View style={{ flex: 1, backgroundColor: p.dodatek }} /></View>;
      case "szachownica": return <View style={{ flex: 1 }}>{Array.from({ length: 6 }, (_, r) => <View key={r} style={{ flex: 1, flexDirection: "row" }}>{Array.from({ length: 5 }, (_, c) => <View key={c} style={{ flex: 1, backgroundColor: (r + c) % 2 ? p.dodatek : p.baza }} />)}</View>)}</View>;
      case "szarfa": return <View style={{ flex: 1, backgroundColor: p.baza }}><View style={{ position: "absolute", left: -W * 0.2, top: H * 0.35, width: W * 1.4, height: H * 0.16, backgroundColor: p.dodatek, transform: [{ rotate: "-35deg" }] }} /></View>;
      default: return <View style={{ flex: 1, backgroundColor: p.baza }} />;
    }
  };
  const rekaw = p.wzor === "rekaw" ? p.dodatek : p.wzor === "polowki" ? undefined : p.baza;
  return (
    <View style={{ width: W + 16, height: H, alignItems: "center" }}>
      <View style={{ position: "absolute", left: 0, top: H * 0.06, width: W * 0.3, height: H * 0.34, borderTopLeftRadius: 12, backgroundColor: rekaw ?? p.baza, transform: [{ rotate: "-18deg" }], borderWidth: 1, borderColor: "rgba(0,0,0,0.25)" }} />
      <View style={{ position: "absolute", right: 0, top: H * 0.06, width: W * 0.3, height: H * 0.34, borderTopRightRadius: 12, backgroundColor: rekaw ?? p.dodatek, transform: [{ rotate: "18deg" }], borderWidth: 1, borderColor: "rgba(0,0,0,0.25)" }} />
      <View style={{ position: "absolute", left: 8 + W * 0.17, top: 0, width: W * 0.66, height: H, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.3)" }}>
        {korpus()}
        <View style={{ position: "absolute", top: 0, left: W * 0.22, width: W * 0.22, height: 6, backgroundColor: p.dodatek, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }} />
        <View style={{ position: "absolute", left: 0, right: 0, top: H * 0.16, alignItems: "center" }}>
          {!!nazwisko && <Text numberOfLines={1} style={{ color: napis, fontWeight: "900", fontSize: W * 0.085, letterSpacing: 0.5, textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 2 }}>{nazwisko.toUpperCase()}</Text>}
          {numer != null && <Text style={{ color: napis, fontWeight: "900", fontSize: W * 0.3, textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 2 }}>{numer}</Text>}
        </View>
      </View>
    </View>
  );
}

function Kolory({ wartosc, onZmien, klubowe }: { wartosc: string; onZmien: (c: string) => void; klubowe: string[] }) {
  const [hex, setHex] = useState(wartosc);
  const probka = (c: string, i: number) => (
    <Pressable key={`${c}-${i}`} onPress={() => { onZmien(c); setHex(c); }} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c, marginRight: 6, marginBottom: 6, borderWidth: wartosc.toLowerCase() === c.toLowerCase() ? 3 : 1, borderColor: wartosc.toLowerCase() === c.toLowerCase() ? K.akcent : "rgba(255,255,255,0.3)" }} />
  );
  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
        <Text style={[st.maly, { fontSize: 11, marginRight: 6 }]}>Klubowe:</Text>
        {klubowe.map(probka)}
        <Text style={[st.maly, { fontSize: 11, marginHorizontal: 6 }]}>Inne:</Text>
        {PALETA.map(probka)}
        <TextInput value={hex} onChangeText={(t) => { setHex(t); if (poprawnyHex(t)) onZmien(t); }} placeholder="#rrggbb" placeholderTextColor={K.szary}
          style={[st.input, { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, width: 86, marginBottom: 6 }]} autoCapitalize="none" maxLength={7} />
      </View>
    </View>
  );
}

function Cena({ wartosc, refC, onZmien }: { wartosc: number; refC: number; onZmien: (n: number) => void }) {
  const krok = refC >= 100 ? 10 : 5;
  const btn = (t: string, d: number) => (
    <Pressable onPress={() => onZmien(Math.max(Math.round(refC * 0.3), Math.min(Math.round(refC * 3), wartosc + d)))} style={[st.przyciskMaly, { paddingVertical: 5, paddingHorizontal: 11 }]}>
      <Text style={st.przyciskMalyTekst}>{t}</Text>
    </Pressable>
  );
  const proc = Math.round((wartosc / refC - 1) * 100);
  return (
    <View style={[st.wiersz, { gap: 8, marginTop: 6 }]}>
      {btn("−", -krok)}
      <Text style={[st.tekst, { fontWeight: "900", minWidth: 70, textAlign: "center" }]}>{zl(wartosc)}</Text>
      {btn("+", krok)}
      <Text style={[st.maly, { fontSize: 12 }]}>rynek: {zl(refC)} ({proc >= 0 ? "+" : ""}{proc}%)</Text>
    </View>
  );
}

export function Sklep({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const stan = stanSklepu(s);
  const klub = s.kluby[s.mojKlub];
  const klubowe = [...new Set([...(klub.barwyWlasne ?? barwyKlubu(klub.nazwa)), "#ffffff"])];
  const [sz, setSz] = useState<ProjektSzalika>({ ...stan.szalik });
  const [ko, setKo] = useState<ProjektKoszulki>({ ...stan.koszulka });
  const [, setT] = useState(0);
  const ref = cenaReferencyjna(s);
  const koszt = kosztSztuki(s);
  const prog = popytTygodnia(s, { szalik: sz, koszulka: ko });
  const oc = ocenaProjektu(s, sz, ko);
  const zysk = prog.szaliki * (sz.cena - koszt.szalik) + prog.koszulki * (ko.cena - koszt.koszulka);
  const zmieniony = JSON.stringify(sz) !== JSON.stringify(stan.szalik) || JSON.stringify(ko) !== JSON.stringify(stan.koszulka);
  const ss = sezonSklepu(s);
  const best = bestseller(s);
  const ranking = rankingKoszulek(s, s.sezon, 5);
  const kadra = klub.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const gwiazda = best ? s.zawodnicy[best.id] : [...kadra].sort((a, b) => b.gole - a.gole || b.umiej - a.umiej)[0];

  const zapisz = () => {
    const blad = zapiszProjekt(s, sz, ko);
    if (blad) return komunikat(blad);
    setSz({ ...stanSklepu(s).szalik }); setKo({ ...stanSklepu(s).koszulka });
    odswiez(); setT((x) => x + 1);
  };
  const przelacz = () => {
    if (zmieniony) { const b = zapiszProjekt(s, sz, ko); if (b) return komunikat(b); }
    const b = ustawSprzedaz(s, !stan.otwarty);
    if (b) return komunikat(b);
    odswiez(); setT((x) => x + 1);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={st.karta}>
        <Text style={st.naglowek}>🛍 Sklep klubowy — {klub.nazwa}</Text>
        <Text style={st.maly}>Status: {stan.otwarty ? "✅ sprzedaż trwa" : "⏸ sprzedaż wstrzymana"} · obiekt „sklep" przy stadionie: poziom {klub.obiekty.sklep ?? 0}{(klub.obiekty.sklep ?? 0) === 0 ? " (tylko stoisko i internet)" : ""}</Text>
        <Text style={st.maly}>Baza kibiców-klientów: ok. {prog.fani.toLocaleString("pl")} · koszt sztuki: szalik {zl(koszt.szalik)}, koszulka {zl(koszt.koszulka)}</Text>
        <Pressable onPress={przelacz} style={[st.przycisk, { marginHorizontal: 0, backgroundColor: stan.otwarty ? K.karta2 : K.akcent }]}>
          <Text style={[st.przyciskTekst, stan.otwarty && { color: K.tekst }]}>{stan.otwarty ? "Wstrzymaj sprzedaż" : `Uruchom sprzedaż (pierwsza seria ${zl(kosztProjektu(s))})`}</Text>
        </Pressable>
      </View>

      {/* ——— SZALIK ——— */}
      <View style={st.karta}>
        <Text style={st.naglowek}>🧣 Szalik</Text>
        <SzalikPodglad p={sz} />
        <Text style={[st.maly, { marginTop: 10 }]}>Wzór</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {WZORY_SZALIKA.map((w) => (
            <Pressable key={w.id} onPress={() => setSz({ ...sz, wzor: w.id as WzorSzalika })} style={[st.chip, sz.wzor === w.id && st.chipAktywny, { paddingVertical: 5 }]}>
              <Text style={{ color: sz.wzor === w.id ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{w.nazwa}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={st.maly}>Kolor główny</Text>
        <Kolory wartosc={sz.kolor1} klubowe={klubowe} onZmien={(c) => setSz({ ...sz, kolor1: c })} />
        <Text style={st.maly}>Kolor drugi</Text>
        <Kolory wartosc={sz.kolor2} klubowe={klubowe} onZmien={(c) => setSz({ ...sz, kolor2: c })} />
        <Text style={st.maly}>Kolor napisu</Text>
        <Kolory wartosc={sz.kolor3 ?? (jasny(sz.kolor1) ? "#111111" : "#ffffff")} klubowe={klubowe} onZmien={(c) => setSz({ ...sz, kolor3: c })} />
        <Text style={st.maly}>Napis (maks. 24 znaki)</Text>
        <TextInput value={sz.napis} onChangeText={(t) => setSz({ ...sz, napis: t.slice(0, 24) })} style={[st.input, { marginTop: 4 }]} placeholder={klub.nazwa.toUpperCase()} placeholderTextColor={K.szary} />
        <Text style={[st.maly, { marginTop: 8 }]}>Cena szalika</Text>
        <Cena wartosc={sz.cena} refC={ref.szalik} onZmien={(n) => setSz({ ...sz, cena: n })} />
      </View>

      {/* ——— KOSZULKA ——— */}
      <View style={st.karta}>
        <Text style={st.naglowek}>👕 Koszulka (replika z nazwiskiem)</Text>
        <View style={{ alignItems: "center" }}>
          <KoszulkaPodglad p={ko} nazwisko={gwiazda?.nazwisko} numer={gwiazda?.numer} szer={130} />
        </View>
        <Text style={[st.maly, { marginTop: 10 }]}>Wzór</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {WZORY_KOSZULKI.map((w) => (
            <Pressable key={w.id} onPress={() => setKo({ ...ko, wzor: w.id as WzorKoszulki })} style={[st.chip, ko.wzor === w.id && st.chipAktywny, { paddingVertical: 5 }]}>
              <Text style={{ color: ko.wzor === w.id ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{w.nazwa}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={st.maly}>Kolor bazowy</Text>
        <Kolory wartosc={ko.baza} klubowe={klubowe} onZmien={(c) => setKo({ ...ko, baza: c })} />
        <Text style={st.maly}>Kolor dodatkowy</Text>
        <Kolory wartosc={ko.dodatek} klubowe={klubowe} onZmien={(c) => setKo({ ...ko, dodatek: c })} />
        <Text style={[st.maly, { marginTop: 8 }]}>Cena koszulki</Text>
        <Cena wartosc={ko.cena} refC={ref.koszulka} onZmien={(n) => setKo({ ...ko, cena: n })} />
      </View>

      {/* ——— PROGNOZA ——— */}
      <View style={st.karta}>
        <Text style={st.naglowek}>📊 Prognoza na tydzień</Text>
        <Text style={st.tekst}>~{prog.szaliki.toFixed(1)} szalików · ~{prog.koszulki.toFixed(1)} koszulek · zysk ~{zl(zysk)}</Text>
        <Text style={st.maly}>Odbiór projektu: szalik ×{oc.szalik.toFixed(2)}, koszulka ×{oc.koszulka.toFixed(2)}</Text>
        {oc.uwagi.map((u) => <Text key={u} style={[st.maly, { fontSize: 12 }]}>• {u}</Text>)}
        {prog.powody.length > 0 && <Text style={[st.maly, { marginTop: 4 }]}>Czynniki: {prog.powody.join(", ")}</Text>}
        {klub.poziom >= 8 && <Text style={[st.maly, { marginTop: 4, color: K.akcent }]}>Na tym szczeblu kibiców jest garstka — sklep to raczej pamiątka niż biznes. Awans podniesie sprzedaż.</Text>}
        {zmieniony && (
          <Pressable onPress={zapisz} style={[st.przycisk, { marginHorizontal: 0 }]}>
            <Text style={st.przyciskTekst}>Zapisz projekt i ceny{stan.otwarty ? ` (nowy projekt: ${zl(kosztProjektu(s))})` : ""}</Text>
          </Pressable>
        )}
        {zmieniony && stan.otwarty && <Text style={[st.maly, { fontSize: 11, marginTop: 4 }]}>Zmiana samych cen jest darmowa; opłata dotyczy zmiany wzoru, kolorów lub napisu. Nowa kolekcja (raz w sezonie) sprzedaje się lepiej przez 4 kolejki.</Text>}
      </View>

      {/* ——— STATYSTYKI ——— */}
      <View style={st.karta}>
        <Text style={st.naglowek}>📈 Sezon {s.sezon}</Text>
        <Text style={st.tekst}>Szaliki: {ss.szaliki} · Koszulki: {ss.koszulki}</Text>
        <Text style={st.maly}>Sprzedaż {zl(ss.przychod)} · koszty produkcji {zl(ss.koszty)} · zysk <Text style={{ color: ss.przychod - ss.koszty >= 0 ? K.zielony : K.czerwony, fontWeight: "800" }}>{zl(ss.przychod - ss.koszty)}</Text></Text>
        {stan.ostatniTydzien && <Text style={st.maly}>Ostatni tydzień: {stan.ostatniTydzien.szaliki} szal. + {stan.ostatniTydzien.koszulki} kosz. = {zl(stan.ostatniTydzien.przychod - stan.ostatniTydzien.koszty)} na czysto</Text>}
        {ranking.length > 0 && <>
          <Text style={[st.naglowek, { marginTop: 10 }]}>🏆 Najchętniej kupowane nazwiska</Text>
          {ranking.map((r, i) => (
            <View key={r.id} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 3 }]}>
              <Text style={st.tekst}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {r.n}</Text>
              <Text style={[st.tekst, { fontWeight: "800" }]}>{r.szt} szt.</Text>
            </View>
          ))}
        </>}
        {historiaSklepu(s).filter((h) => h.sezon !== s.sezon).length > 0 && <>
          <Text style={[st.naglowek, { marginTop: 10 }]}>📚 Poprzednie sezony</Text>
          {historiaSklepu(s).filter((h) => h.sezon !== s.sezon).map((h) => {
            const b = bestseller(s, h.sezon);
            return <Text key={h.sezon} style={st.maly}>{h.sezon}: {h.dane.szaliki} szal., {h.dane.koszulki} kosz., zysk {zl(h.dane.przychod - h.dane.koszty)}{b ? ` · bestseller: ${b.n} (${b.szt})` : ""}</Text>;
          })}
        </>}
      </View>
    </ScrollView>
  );
}
