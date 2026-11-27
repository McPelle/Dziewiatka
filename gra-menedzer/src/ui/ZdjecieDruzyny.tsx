// Zdjęcie drużyny na początku sezonu: cała kadra w trzech rzędach (dwa stoją, pierwszy siedzi), trener
// i sztab po bokach, w tle trybuna w barwach klubu z herbem. Renderowanie jest w pełni deterministyczne
// z minimalnych danych zdjęcia (sezon + osoby z numerami) — patrz src/engine/zdjeciaDruzyny.ts.
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { Klub, StanGry, TwarzCechy } from "../engine/types";
import { kadrZdjecia, zdjeciaDruzyny, zdjecieSezonu, zrobZdjecieDruzyny, type OsobaNaZdjeciu, type ZdjecieDruzyny as Zdjecie } from "../engine/zdjeciaDruzyny";
import { aktualizujKronike } from "../engine/dziennik";
import { barwyKlubu, hashNazwy, odcien } from "./barwy";
import { Herb } from "./Herb";
import { kity, type Kit } from "./strojeDane";
import { CZCIONKA, K, st } from "./styl";
import { domyslneCechy, SKORY, Twarz } from "./Twarz";

const sezTxt = (r: number) => `${r}/${String((r + 1) % 100).padStart(2, "0")}`;

// ——— Postać na zdjęciu ———
function Postac({ seed, cechy, kraj, zdjecie, kit, numer, w, siedzi, dres, pilka }: {
  seed: string; cechy?: TwarzCechy; kraj?: string; zdjecie?: string; kit: Kit; numer?: number; w: number; siedzi: boolean; dres?: boolean; pilka?: boolean;
}) {
  const glowa = w * 0.66;
  const tulowW = w * 0.86, tulowH = w * 0.78;
  const skora = SKORY[(cechy ?? domyslneCechy(seed, kraj)).skora % SKORY.length];
  const spodenki = dres ? odcien(kit.baza, -0.12) : kit.dodatek;
  const getry = dres ? "#15171d" : kit.baza;
  const top = glowa * 0.86; // tułów zaczyna się pod brodą
  const H = siedzi ? top + tulowH + w * 0.95 : top + tulowH + w * 1.25;
  return (
    <View style={{ width: w, height: H, alignItems: "center" }}>
      {/* tułów (koszulka) */}
      <View style={{ position: "absolute", top, left: (w - tulowW) / 2, width: tulowW, height: tulowH, backgroundColor: kit.baza, borderTopLeftRadius: w * 0.26, borderTopRightRadius: w * 0.26, borderBottomLeftRadius: w * 0.06, borderBottomRightRadius: w * 0.06, overflow: "hidden" }}>
        {!dres && kit.wzor === "pasy" && [0.18, 0.5, 0.82].map((x) => <View key={x} style={{ position: "absolute", top: 0, bottom: 0, left: tulowW * x - tulowW * 0.07, width: tulowW * 0.14, backgroundColor: kit.dodatek }} />)}
        {!dres && kit.wzor === "rekaw" && <>
          <View style={{ position: "absolute", top: 0, left: 0, width: tulowW * 0.2, height: tulowH * 0.55, backgroundColor: kit.dodatek }} />
          <View style={{ position: "absolute", top: 0, right: 0, width: tulowW * 0.2, height: tulowH * 0.55, backgroundColor: kit.dodatek }} />
        </>}
        {dres && <View style={{ position: "absolute", top: 0, bottom: 0, left: tulowW * 0.48, width: tulowW * 0.04, backgroundColor: kit.dodatek }} />}
        {/* kołnierzyk */}
        <View style={{ position: "absolute", top: 0, left: tulowW * 0.36, width: tulowW * 0.28, height: tulowH * 0.1, borderBottomLeftRadius: tulowW * 0.14, borderBottomRightRadius: tulowW * 0.14, backgroundColor: odcien(kit.baza, -0.2) }} />
        {numer != null && numer > 0 && (
          <Text style={{ position: "absolute", top: tulowH * 0.14, left: 0, right: 0, textAlign: "center", color: kit.wzor === "pasy" ? "#ffffff" : kit.dodatek, fontWeight: "900", fontSize: Math.max(7, w * 0.3), fontFamily: CZCIONKA, textShadowColor: "rgba(0,0,0,0.45)", textShadowRadius: 1.5 }}>{numer}</Text>
        )}
        {/* skrzyżowane ręce (stojący) / dłonie na kolanach (siedzący) */}
        {siedzi
          ? <>
            <View style={{ position: "absolute", bottom: tulowH * 0.02, left: tulowW * 0.06, width: tulowW * 0.22, height: tulowH * 0.16, borderRadius: w * 0.05, backgroundColor: skora }} />
            <View style={{ position: "absolute", bottom: tulowH * 0.02, right: tulowW * 0.06, width: tulowW * 0.22, height: tulowH * 0.16, borderRadius: w * 0.05, backgroundColor: skora }} />
          </>
          : <View style={{ position: "absolute", top: tulowH * 0.56, left: tulowW * 0.12, right: tulowW * 0.12, height: tulowH * 0.17, borderRadius: w * 0.08, backgroundColor: skora, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" }} />}
      </View>
      {/* spodenki */}
      <View style={{ position: "absolute", top: top + tulowH - 1, left: (w - tulowW * 0.86) / 2, width: tulowW * 0.86, height: w * (siedzi ? 0.26 : 0.36), backgroundColor: spodenki, borderBottomLeftRadius: w * 0.04, borderBottomRightRadius: w * 0.04 }} />
      {/* nogi */}
      {[0.28, 0.58].map((x) => (
        <View key={x} style={{ position: "absolute", top: top + tulowH + w * (siedzi ? 0.24 : 0.34), left: w * x, width: w * 0.15, height: w * (siedzi ? 0.62 : 0.82) }}>
          <View style={{ height: "28%", backgroundColor: dres ? spodenki : skora }} />
          <View style={{ flex: 1, backgroundColor: getry }} />
          <View style={{ height: w * 0.08, marginHorizontal: -w * 0.02, borderRadius: w * 0.03, backgroundColor: "#111" }} />
        </View>
      ))}
      {pilka && <View style={{ position: "absolute", top: top + tulowH + w * 0.3, left: w * 0.2, width: w * 0.6, height: w * 0.6, borderRadius: w * 0.3, backgroundColor: "#f4f4f4", borderWidth: Math.max(1, w * 0.04), borderColor: "#1b1b1b" }}>
        <View style={{ position: "absolute", left: w * 0.2, top: w * 0.2, width: w * 0.16, height: w * 0.16, backgroundColor: "#1b1b1b", borderRadius: w * 0.03 }} />
      </View>}
      {/* głowa (generowany awatar) */}
      <View style={{ position: "absolute", top: 0 }}>
        <Twarz seed={seed} rozmiar={glowa} cechy={cechy} kraj={kraj} zdjecie={zdjecie} jersey={kit.baza} />
      </View>
    </View>
  );
}

const ORDER = { BR: 0, OBR: 1, POM: 2, NAP: 3 } as const;
const BAZA_WZROSTU = { BR: 189, OBR: 184, POM: 178, NAP: 181 } as const;
/** Rozstawia rząd od środka na zewnątrz (najwyżsi / kapitan w środku) — jak u fotografa. */
function odSrodka<T>(lista: T[]): T[] {
  const wynik: T[] = [];
  lista.forEach((x, i) => { if (i % 2 === 0) wynik.push(x); else wynik.unshift(x); });
  return wynik;
}

/** Podział kadry na rzędy (deterministycznie): tył = najwyżsi + bramkarze, przód (siedzą) = najniżsi + kapitan. */
export function rzedyZdjecia(z: Zdjecie): { tyl: OsobaNaZdjeciu[]; srodek: OsobaNaZdjeciu[]; przod: OsobaNaZdjeciu[] } {
  const wz = (o: OsobaNaZdjeciu) => (o.wzrost ?? BAZA_WZROSTU[o.poz] + (hashNazwy(o.id) % 9) - 4) + (o.poz === "BR" ? 6 : 0);
  const gracze = [...z.zawodnicy].sort((a, b) => wz(b) - wz(a) || ORDER[a.poz] - ORDER[b.poz] || a.numer - b.numer);
  const n = gracze.length;
  const nPrzod = Math.ceil(n / 3), nSrodek = Math.ceil((n - nPrzod) / 2);
  let tyl = gracze.slice(0, n - nPrzod - nSrodek);
  let srodek = gracze.slice(n - nPrzod - nSrodek, n - nPrzod);
  let przod = gracze.slice(n - nPrzod);
  const kap = gracze.find((o) => o.kapitan);
  if (kap && !przod.includes(kap)) { // kapitan zawsze siedzi w środku pierwszego rzędu
    const zam = przod[0];
    przod = [kap, ...przod.slice(1)];
    tyl = tyl.map((o) => (o === kap ? zam : o));
    srodek = srodek.map((o) => (o === kap ? zam : o));
  } else if (kap) przod = [kap, ...przod.filter((o) => o !== kap)];
  return { tyl: odSrodka(tyl), srodek: odSrodka(srodek), przod: odSrodka(przod) };
}

// ——— Samo zdjęcie ———
export function ZdjecieDruzyny({ s, zdjecie, szerokosc }: { s: StanGry; zdjecie: Zdjecie; szerokosc: number }) {
  const W = Math.max(280, szerokosc);
  const klub: Klub = s.kluby[zdjecie.klubId] ?? ({ nazwa: zdjecie.klubNazwa } as Klub);
  const komplety = kity(klub);
  const pole = komplety.pole[0], br = komplety.bramkarz[0];
  const [kol1, kol2] = barwyKlubu(klub.nazwa);
  const dres: Kit = { baza: "#1c2230", dodatek: kol1, wzor: "jednolity", nazwa: "Dres" };
  const { tyl, srodek, przod } = useMemo(() => rzedyZdjecia(zdjecie), [zdjecie]);
  const osobySztabu = [{ imie: "", nazwisko: zdjecie.trener, rola: "trener" }, ...zdjecie.sztab];
  // trener i pierwszy asystent siedzą na skrajach pierwszego rzędu, reszta sztabu stoi po bokach środkowego
  const przodSztab = osobySztabu.slice(0, 2), srodekSztab = osobySztabu.slice(2);
  const lewi = przodSztab.filter((_, i) => i % 2 === 0), prawi = przodSztab.filter((_, i) => i % 2 === 1);
  const lewiS = srodekSztab.filter((_, i) => i % 2 === 0), prawiS = srodekSztab.filter((_, i) => i % 2 === 1);
  const maxRzad = Math.max(tyl.length, srodek.length + srodekSztab.length, przod.length + przodSztab.length);
  const w = Math.min(W * 0.95 / Math.max(1, maxRzad), W / 6.5);
  const skala = [0.9, 0.95, 1]; // perspektywa: dalsze rzędy nieco mniejsze
  const krok = w * 0.95;
  const yTyl = W * 0.075 + Math.max(30, w * 1.15);
  const ySrodek = yTyl + krok, yPrzod = ySrodek + krok;
  const H = yPrzod + w * 2.4;
  const yTrybunaKoniec = yTyl + w * 0.95;
  const fotoGracza = (id: string) => s.zawodnicy[id]?.zdjecie;
  const fotoTrenera = zdjecie.trener === s.trener ? s.trenerZdjecie : undefined;

  const rzad = (osoby: OsobaNaZdjeciu[], y: number, sk: number, siedzi: boolean, sztabL: typeof osobySztabu = [], sztabP: typeof osobySztabu = []) => {
    const ww = w * sk;
    const elementy = [
      ...sztabL.map((p) => ({ k: `l${p.nazwisko}${p.rola}`, el: <Postac seed={p.rola === "trener" ? p.nazwisko : `${p.imie} ${p.nazwisko}`} zdjecie={p.rola === "trener" ? fotoTrenera : undefined} kit={dres} w={ww} siedzi={siedzi} dres /> })),
      ...osoby.map((o) => ({ k: o.id, el: <Postac seed={o.imie + o.nazwisko} cechy={o.twarz} kraj={o.kraj} zdjecie={fotoGracza(o.id)} kit={o.poz === "BR" ? br : pole} numer={o.numer} w={ww} siedzi={siedzi} pilka={siedzi && o.kapitan} /> })),
      ...sztabP.map((p) => ({ k: `p${p.nazwisko}${p.rola}`, el: <Postac seed={`${p.imie} ${p.nazwisko}`} kit={dres} w={ww} siedzi={siedzi} dres /> })),
    ];
    return (
      <View style={{ position: "absolute", top: y, left: 0, right: 0, flexDirection: "row", justifyContent: "center" }} pointerEvents="none">
        {elementy.map((e, i) => <View key={e.k} style={{ marginTop: ((hashNazwy(e.k) % 5) - 2) * w * 0.012, marginHorizontal: -ww * 0.02, zIndex: i }}>{e.el}</View>)}
      </View>
    );
  };

  const rzedySiedzen = Math.floor(yTrybunaKoniec / 7);
  return (
    <View style={{ width: W, height: H, borderRadius: 6, overflow: "hidden", backgroundColor: "#0b1a10", borderWidth: 3, borderColor: "#f4efe3" }}>
      <Svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id="niebo" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#9cc7e8" /><Stop offset="1" stopColor="#dfeaf2" /></LinearGradient>
          <LinearGradient id="murawa" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#2f8f46" /><Stop offset="1" stopColor="#1d6a33" /></LinearGradient>
          <LinearGradient id="swiatlo" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#ffffff" stopOpacity="0.12" /><Stop offset="1" stopColor="#000000" stopOpacity="0.18" /></LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={W * 0.05} fill="url(#niebo)" />
        {/* dach trybuny */}
        <Rect x={0} y={W * 0.035} width={W} height={W * 0.03} fill="#2b2f36" />
        {/* rzędy krzesełek w barwach klubu */}
        {Array.from({ length: rzedySiedzen }, (_, r) => {
          const y = W * 0.065 + r * 7;
          if (y > yTrybunaKoniec) return null;
          return <Rect key={r} x={0} y={y} width={W} height={5} fill={r % 2 === 0 ? kol1 : odcien(kol1, -0.12)} opacity={0.92} />;
        })}
        {Array.from({ length: rzedySiedzen }, (_, r) => <Rect key={`b${r}`} x={0} y={W * 0.065 + r * 7 + 5} width={W} height={2} fill={odcien(kol2, -0.35)} opacity={0.5} />)}
        {/* przejścia między sektorami */}
        {[0.12, 0.32, 0.68, 0.88].map((x) => <Rect key={x} x={W * x - 3} y={W * 0.065} width={6} height={yTrybunaKoniec - W * 0.065} fill="#5b6068" opacity={0.85} />)}
        {/* bandy reklamowe */}
        <Rect x={0} y={yTrybunaKoniec} width={W} height={W * 0.035} fill="#14161b" />
        <Rect x={0} y={yTrybunaKoniec + W * 0.03} width={W} height={2} fill={kol2} />
        {/* murawa z pasami koszenia */}
        <Rect x={0} y={yTrybunaKoniec + W * 0.035} width={W} height={H} fill="url(#murawa)" />
        {Array.from({ length: 8 }, (_, i) => <Rect key={`m${i}`} x={(W / 8) * i} y={yTrybunaKoniec + W * 0.035} width={W / 16} height={H} fill="#ffffff" opacity={0.035} />)}
        {/* ławka dla siedzących */}
        <Rect x={W * 0.03} y={yPrzod + w * 1.3} width={W * 0.94} height={w * 0.18} rx={3} fill="#c9c2b2" />
        <Rect x={0} y={0} width={W} height={H} fill="url(#swiatlo)" />
      </Svg>

      {/* baner z herbem na trybunie */}
      <View style={{ position: "absolute", top: W * 0.07, left: W * 0.2, right: W * 0.2, height: Math.max(28, yTyl - W * 0.085), borderRadius: 4, backgroundColor: odcien(kol1, -0.18), borderWidth: 2, borderColor: kol2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: W * 0.02, paddingHorizontal: 6 }}>
        <Herb klub={klub} rozmiar={Math.max(22, Math.min(W * 0.1, yTyl - W * 0.1))} />
        <View style={{ flexShrink: 1 }}>
          <Text numberOfLines={1} style={{ color: kol2 === kol1 ? "#fff" : kol2, fontWeight: "900", fontSize: Math.max(9, W * 0.032), fontFamily: CZCIONKA, letterSpacing: 0.5 }}>{zdjecie.klubNazwa.toUpperCase()}</Text>
          <Text numberOfLines={1} style={{ color: "#f4efe3", fontWeight: "700", fontSize: Math.max(7, W * 0.02), fontFamily: CZCIONKA }}>SEZON {sezTxt(zdjecie.sezon)}{zdjecie.liga ? ` · ${zdjecie.liga}` : ""}</Text>
        </View>
      </View>

      {rzad(tyl, yTyl, skala[0], false)}
      {rzad(srodek, ySrodek, skala[1], false, lewiS, prawiS)}
      {rzad(przod, yPrzod, skala[2], true, lewi, prawi)}

      {/* podpis w rogu jak na odbitce */}
      <Text style={{ position: "absolute", right: 6, bottom: 4, color: "rgba(255,255,255,0.7)", fontSize: Math.max(7, W * 0.018), fontFamily: CZCIONKA, fontStyle: "italic" }}>Fot. klubowa · {sezTxt(zdjecie.sezon)}</Text>
    </View>
  );
}

/** Podpis pod zdjęciem — kto gdzie stoi (od lewej). */
export function PodpisZdjecia({ zdjecie }: { zdjecie: Zdjecie }) {
  const { tyl, srodek, przod } = rzedyZdjecia(zdjecie);
  const os = (l: OsobaNaZdjeciu[]) => l.map((o) => `${o.imie.charAt(0)}. ${o.nazwisko} (${o.numer || "—"})${o.kapitan ? " ©" : ""}`).join(", ");
  const sztab = [`${zdjecie.trener} (trener)`, ...zdjecie.sztab.map((p) => `${p.imie} ${p.nazwisko} (${p.rola})`)].join(", ");
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={st.maly}><Text style={{ color: K.tekst, fontWeight: "700" }}>Górny rząd od lewej: </Text>{os(tyl)}</Text>
      <Text style={st.maly}><Text style={{ color: K.tekst, fontWeight: "700" }}>Środkowy rząd: </Text>{os(srodek)}</Text>
      <Text style={st.maly}><Text style={{ color: K.tekst, fontWeight: "700" }}>Siedzą: </Text>{os(przod)}</Text>
      <Text style={st.maly}><Text style={{ color: K.tekst, fontWeight: "700" }}>Sztab: </Text>{sztab}</Text>
    </View>
  );
}

// ——— Galeria zdjęć (jedno na sezon) ———
export function GaleriaZdjec({ s, widoczny, onClose, odswiez, klubId }: { s: StanGry; widoczny: boolean; onClose: () => void; odswiez?: () => void; klubId?: string }) {
  const { width } = useWindowDimensions();
  const [wybrane, setWybrane] = useState<number | null>(null);
  const [, setTik] = useState(0);
  useEffect(() => { if (widoczny) aktualizujKronike(s); }, [widoczny, s]);
  const lista = zdjeciaDruzyny(s).filter((z) => !klubId || z.klubId === klubId);
  const podglad = !s.zwolniony && !zdjecieSezonu(s) && (!klubId || klubId === s.mojKlub) ? kadrZdjecia(s) : null;
  const idx = wybrane != null && wybrane < lista.length ? wybrane : lista.length - 1;
  const aktualne = idx >= 0 ? lista[idx] : null;
  const pokaz = aktualne ?? podglad;
  const szer = Math.min(width - 36, 760);
  const odswiezWszystko = () => { setTik((t) => t + 1); odswiez?.(); };

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "94%", paddingBottom: 20 }]}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={st.tytul}>📸 Zdjęcia drużyny</Text>
            <Text style={[st.maly, { marginBottom: 10 }]}>Pamiątkowe zdjęcie całej kadry na początek każdego sezonu.</Text>
            {lista.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {lista.map((z, i) => (
                  <Pressable key={`${z.sezon}-${z.klubId}`} onPress={() => setWybrane(i)} style={[st.chip, i === idx && st.chipAktywny]}>
                    <Text style={{ color: i === idx ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{sezTxt(z.sezon)} · {s.kluby[z.klubId]?.skrot ?? z.klubNazwa}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {pokaz ? (
              <>
                {!aktualne && <Text style={[st.maly, { color: K.akcent, marginBottom: 6 }]}>Podgląd — zdjęcie na ten sezon nie zostało jeszcze zrobione.</Text>}
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
                  <ZdjecieDruzyny s={s} zdjecie={pokaz} szerokosc={szer} />
                </ScrollView>
                <PodpisZdjecia zdjecie={pokaz} />
              </>
            ) : <Text style={st.maly}>Brak zdjęć — pierwsze powstanie po starcie sezonu.</Text>}
            {!s.zwolniony && (!klubId || klubId === s.mojKlub) && (
              <Pressable style={[st.przyciskMaly, { marginTop: 12, alignItems: "center", borderColor: K.akcent }]} onPress={() => { const zr = zrobZdjecieDruzyny(s, !!zdjecieSezonu(s)); if (zr) setWybrane(zdjeciaDruzyny(s).filter((z) => !klubId || z.klubId === klubId).length - 1); odswiezWszystko(); }}>
                <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>{zdjecieSezonu(s) ? `🔁 Powtórz zdjęcie na sezon ${sezTxt(s.sezon)}` : `📸 Zrób zdjęcie na sezon ${sezTxt(s.sezon)}`}</Text>
              </Pressable>
            )}
            <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 16 }]} onPress={onClose}>
              <Text style={st.przyciskTekst}>Zamknij</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
