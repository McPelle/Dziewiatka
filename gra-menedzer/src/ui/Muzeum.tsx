// Muzeum klubu: gablota trofeów, zastrzeżone numery, legendy (mecze / gole w barwach klubu), historia sezonów,
// rekordy i galeria zdjęć drużyny. Dane: src/engine/muzeum.ts (+ dziennik, zdjęcia drużyny).
import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { aktualizujKronike } from "../engine/dziennik";
import { legendyKlubu, mozeZastrzec, muzeumOdczyt, sezonyKlubu, trofeaKlubu, zastrzezNumer, type LegendaKlubu } from "../engine/muzeum";
import { zdjeciaDruzyny } from "../engine/zdjeciaDruzyny";
import type { Klub, StanGry } from "../engine/types";
import { barwyKlubu } from "./barwy";
import { Herb } from "./Herb";
import { K, KOLOR_POZ, st } from "./styl";
import { Twarz } from "./Twarz";
import { GaleriaZdjec, ZdjecieDruzyny } from "./ZdjecieDruzyny";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
const sezTxt = (r: number) => `${r}/${String((r + 1) % 100).padStart(2, "0")}`;
const WYNIK: Record<string, { t: string; k: string }> = {
  mistrz: { t: "Mistrz", k: K.akcent }, awans: { t: "Awans", k: K.zielony }, spadek: { t: "Spadek", k: K.czerwony }, utrzymanie: { t: "Utrzymanie", k: K.szary },
};

/** Oprawiona koszulka z zastrzeżonym numerem. */
function Koszulka({ numer, nazwisko, sezon, kol1, kol2 }: { numer: number; nazwisko?: string; sezon: number; kol1: string; kol2: string }) {
  return (
    <View style={{ width: 92, alignItems: "center", marginRight: 10, marginBottom: 10, padding: 6, borderRadius: 8, backgroundColor: "#1d1a14", borderWidth: 2, borderColor: "#8a6d2f" }}>
      <View style={{ width: 64, height: 58, alignItems: "center" }}>
        <View style={{ position: "absolute", top: 4, left: 0, width: 18, height: 22, backgroundColor: kol1, borderTopLeftRadius: 6, transform: [{ rotate: "-18deg" }] }} />
        <View style={{ position: "absolute", top: 4, right: 0, width: 18, height: 22, backgroundColor: kol1, borderTopRightRadius: 6, transform: [{ rotate: "18deg" }] }} />
        <View style={{ position: "absolute", top: 2, left: 12, right: 12, bottom: 0, backgroundColor: kol1, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: kol2, fontSize: 9, fontWeight: "800" }} numberOfLines={1}>{(nazwisko ?? "").toUpperCase()}</Text>
          <Text style={{ color: kol2, fontSize: 22, fontWeight: "900", lineHeight: 24 }}>{numer}</Text>
        </View>
      </View>
      <Text style={[st.maly, { fontSize: 10.5, color: "#e8d9a8", marginTop: 3 }]}>od {sezTxt(sezon)}</Text>
    </View>
  );
}

function WierszLegendy({ s, klubId, l, miejsce, miara, odswiez }: { s: StanGry; klubId: string; l: LegendaKlubu; miejsce: number; miara: "mecze" | "gole"; odswiez: () => void }) {
  const blad = mozeZastrzec(s, klubId, l.id);
  const zastrzezony = (s.kluby[klubId]?.numeryZastrzezone ?? []).includes(l.numer) && muzeumOdczyt(s, klubId)?.zastrzezone.some((n) => n.id === l.id || (n.numer === l.numer && n.nazwisko === l.nazwisko));
  const jersey = barwyKlubu(s.kluby[klubId]?.nazwa ?? "")[0];
  return (
    <View style={[st.wiersz, { gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }]}>
      <Text style={{ width: 20, color: miejsce <= 3 ? K.akcent : K.szary, fontWeight: "900", textAlign: "right" }}>{miejsce}.</Text>
      <Twarz seed={l.imie + l.nazwisko} cechy={l.twarz} kraj={l.kraj} rozmiar={34} jersey={jersey} zdjecie={s.zawodnicy[l.id]?.zdjecie} />
      <View style={{ flex: 1 }}>
        <Text style={[st.tekst, { fontSize: 14, fontWeight: "700" }]} numberOfLines={1}>
          {l.imie} {l.nazwisko} {l.wychowanek ? "🎓" : ""}{l.kapitan ? " ©" : ""}{zastrzezony ? " 🏛" : ""}
        </Text>
        <Text style={[st.maly, { fontSize: 11.5 }]}>
          <Text style={{ color: KOLOR_POZ[l.poz] }}>{l.poz}</Text> · nr {l.numer || "—"} · {l.od}–{l.do ?? "teraz"}{l.do === null ? " (w kadrze)" : ""}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: K.tekst, fontWeight: "900", fontSize: 16 }}>{miara === "mecze" ? l.mecze : l.gole}</Text>
        <Text style={[st.maly, { fontSize: 10.5 }]}>{miara === "mecze" ? `mecz. · ${l.gole} goli` : `goli · ${l.mecze} mecz.`}</Text>
        {!blad && (
          <Pressable onPress={() => { const b = zastrzezNumer(s, klubId, l.id); odswiez(); komunikat(b ?? `Numer ${l.numer} zastrzeżony na cześć ${l.imie} ${l.nazwisko}.`); }}>
            <Text style={[st.maly, { fontSize: 11, color: K.akcent }]}>🏛 Zastrzeż nr {l.numer}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function Muzeum({ s, widoczny, onClose, odswiez }: { s: StanGry; widoczny: boolean; onClose: () => void; odswiez?: () => void }) {
  const [klubId, setKlubId] = useState<string>(s.mojKlub);
  const [miara, setMiara] = useState<"mecze" | "gole">("mecze");
  const [galeria, setGaleria] = useState(false);
  const [, setTik] = useState(0);
  const tik = () => { setTik((t) => t + 1); odswiez?.(); };
  useEffect(() => { if (widoczny) { aktualizujKronike(s); setKlubId(s.zwolniony ? klubId : s.mojKlub); tik(); } }, [widoczny]); // eslint-disable-line react-hooks/exhaustive-deps

  // kluby prowadzone w karierze (po nazwie z trenerKariera → id)
  const poNazwie = new Map(Object.values(s.kluby).map((k) => [k.nazwa, k.id]));
  const prowadzone = [...new Set((s.trenerKariera ?? []).map((w) => poNazwie.get(w.klub)).filter((x): x is string => !!x))];
  if (!prowadzone.includes(s.mojKlub) && s.kluby[s.mojKlub]) prowadzone.push(s.mojKlub);
  const klub: Klub | undefined = s.kluby[klubId] ?? s.kluby[s.mojKlub];
  if (!klub) return null;
  const [kol1, kol2] = barwyKlubu(klub.nazwa);
  const mu = muzeumOdczyt(s, klub.id);
  const trofea = trofeaKlubu(s, klub.nazwa);
  const sezony = [...sezonyKlubu(s, klub.nazwa)].reverse();
  const leg = legendyKlubu(s, klub.id, 10);
  const lista = miara === "mecze" ? leg.mecze : leg.gole;
  const numery = (klub.numeryZastrzezone ?? []).map((n) => ({ numer: n, wpis: mu?.zastrzezone.find((x) => x.numer === n) }));
  const zdj = zdjeciaDruzyny(s).filter((z) => z.klubId === klub.id);
  const ostatnieZdj = zdj[zdj.length - 1];
  const poziomMuzeum = klub.obiekty?.muzeum ?? 0;
  const tytuly = trofea.filter((t) => t.ikona === "🏆").length, puchary = trofea.filter((t) => t.ikona === "🥇" || t.ikona === "🌍").length, awanse = trofea.filter((t) => t.ikona === "⬆️").length;
  const rekordy = klub.id === s.mojKlub ? s.rekordy : undefined;

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "94%", paddingBottom: 20 }}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            {/* nagłówek w barwach klubu */}
            <View style={{ borderRadius: 14, padding: 14, backgroundColor: kol1, borderWidth: 2, borderColor: kol2, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Herb klub={klub} rozmiar={58} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: kol2 === kol1 ? "#fff" : kol2, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 }}>🏛 MUZEUM KLUBU</Text>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: 3 }} numberOfLines={2}>{klub.nazwa}</Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: 2 }}>
                  {klub.zalozony ? `Założony ${klub.zalozony} · ` : ""}{klub.miasto} · {klub.stadion}
                </Text>
                {klub.trybunaImienia ? <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>Trybuna im. {klub.trybunaImienia}</Text> : null}
              </View>
            </View>
            <Text style={[st.maly, { marginTop: 6, fontSize: 11.5 }]}>
              {poziomMuzeum > 0 ? `Budynek muzeum: poziom ${poziomMuzeum} — eksponaty oglądają kibice w dni meczowe.` : "Klub nie ma jeszcze budynku muzeum (Stadion → obiekty) — zbiory czekają w magazynie."}
            </Text>

            {prowadzone.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {prowadzone.map((id) => (
                  <Pressable key={id} onPress={() => setKlubId(id)} style={[st.chip, id === klub.id && st.chipAktywny]}>
                    <Text style={{ color: id === klub.id ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{s.kluby[id]?.nazwa}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* gablota */}
            <View style={{ marginTop: 14 }}>
              <Text style={st.naglowek}>🏆 Gablota trofeów (Twoja kadencja)</Text>
              <View style={[st.wiersz, { justifyContent: "space-between", marginBottom: 6 }]}>
                {([["🏆", tytuly, "mistrzostwa"], ["🥇", puchary, "puchary"], ["⬆", awanse, "awanse"], ["📅", sezony.length, "sezony"]] as const).map(([ik, n, et]) => (
                  <View key={et} style={{ alignItems: "center", flex: 1 }}>
                    <Text style={{ fontSize: 20 }}>{ik}</Text>
                    <Text style={{ color: K.tekst, fontSize: 22, fontWeight: "900" }}>{n}</Text>
                    <Text style={[st.maly, { fontSize: 11 }]}>{et}</Text>
                  </View>
                ))}
              </View>
              {trofea.length === 0 ? <Text style={st.maly}>Gablota czeka na pierwsze trofeum.</Text> : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {trofea.map((t, i) => (
                    <View key={i} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#1d1a14", borderWidth: 1, borderColor: "#8a6d2f" }}>
                      <Text style={{ color: "#f1dca0", fontSize: 12.5, fontWeight: "700" }}>{t.ikona} {t.nazwa}</Text>
                      <Text style={[st.maly, { fontSize: 10.5, color: "#c8b27a" }]}>{sezTxt(t.sezon)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* zastrzeżone numery */}
            <View style={{ marginTop: 16 }}>
              <Text style={st.naglowek}>🏛 Zastrzeżone numery</Text>
              {numery.length === 0 ? <Text style={st.maly}>Żaden numer nie jest zastrzeżony. Legendy klubu (150+ meczów, wychowankowie 100+) po odejściu mogą otrzymać ten zaszczyt.</Text> : (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {numery.map(({ numer, wpis }) => <Koszulka key={numer} numer={numer} nazwisko={wpis?.nazwisko} sezon={wpis?.sezon ?? s.sezon} kol1={kol1} kol2={kol2} />)}
                </View>
              )}
              {numery.some((n) => n.wpis?.imie) && numery.filter((n) => n.wpis?.imie).map((n) => <Text key={n.numer} style={st.maly}>#{n.numer} — {n.wpis!.imie} {n.wpis!.nazwisko}</Text>)}
            </View>

            {/* legendy */}
            <View style={{ marginTop: 16 }}>
              <Text style={st.naglowek}>⭐ Legendy klubu</Text>
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                {(["mecze", "gole"] as const).map((m) => (
                  <Pressable key={m} onPress={() => setMiara(m)} style={[st.chip, miara === m && st.chipAktywny]}>
                    <Text style={{ color: miara === m ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{m === "mecze" ? "Najwięcej meczów" : "Najwięcej goli"}</Text>
                  </Pressable>
                ))}
              </View>
              {lista.length === 0 ? <Text style={st.maly}>Brak danych — legendy zapisują się po rozegranych meczach.</Text>
                : lista.map((l, i) => <WierszLegendy key={l.id} s={s} klubId={klub.id} l={l} miejsce={i + 1} miara={miara} odswiez={tik} />)}
              <Text style={[st.maly, { fontSize: 11, marginTop: 4 }]}>Dorobek w barwach klubu (cała kariera zawodnika w klubie). 🎓 wychowanek · © kapitan · 🏛 numer zastrzeżony</Text>
            </View>

            {/* historia sezonów */}
            <View style={{ marginTop: 16 }}>
              <Text style={st.naglowek}>📜 Historia sezonów</Text>
              {sezony.length === 0 ? <Text style={st.maly}>Pierwszy sezon jeszcze trwa.</Text> : sezony.map((h) => {
                const w = h.miejsce === 1 ? { t: "Mistrz", k: K.akcent } : WYNIK[h.wynik] ?? { t: h.wynik, k: K.tekst };
                return (
                  <View key={h.sezon} style={{ paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }}>
                    <View style={[st.wiersz, { justifyContent: "space-between" }]}>
                      <Text style={[st.tekst, { fontSize: 14, flex: 1 }]} numberOfLines={1}><Text style={{ fontWeight: "800" }}>{sezTxt(h.sezon)}</Text> · {h.liga} · {h.miejsce}.</Text>
                      <Text style={{ color: w.k, fontWeight: "800", fontSize: 13 }}>{w.t}</Text>
                    </View>
                    {h.puchar ? <Text style={[st.maly, { color: K.akcent }]}>🥇 Puchar {h.puchar === "glowny" ? "Polski" : "Polski (region)"}</Text> : null}
                    {(h.wyroznienia ?? []).map((x, j) => <Text key={j} style={[st.maly, { fontSize: 11.5 }]}>{x}</Text>)}
                  </View>
                );
              })}
            </View>

            {rekordy && (rekordy.najlepszeMiejsce || rekordy.topStrzelec || rekordy.najwieksza || rekordy.rekordFrekwencji) && (
              <View style={{ marginTop: 16 }}>
                <Text style={st.naglowek}>📈 Rekordy</Text>
                {rekordy.najlepszeMiejsce && <Text style={st.maly}>Najlepsze miejsce: {rekordy.najlepszeMiejsce.miejsce}. w {rekordy.najlepszeMiejsce.liga} ({sezTxt(rekordy.najlepszeMiejsce.sezon)})</Text>}
                {rekordy.najwiecejPkt && <Text style={st.maly}>Najwięcej punktów: {rekordy.najwiecejPkt.pkt} ({rekordy.najwiecejPkt.liga}, {sezTxt(rekordy.najwiecejPkt.sezon)})</Text>}
                {rekordy.topStrzelec && <Text style={st.maly}>Rekord strzelecki sezonu: {rekordy.topStrzelec.imie} {rekordy.topStrzelec.nazwisko} — {rekordy.topStrzelec.gole} goli</Text>}
                {rekordy.najwieksza && <Text style={st.maly}>Najwyższa wygrana: {rekordy.najwieksza.wynik} z {rekordy.najwieksza.rywal}</Text>}
                {rekordy.rekordFrekwencji && <Text style={st.maly}>Rekord frekwencji: {rekordy.rekordFrekwencji.widzowie.toLocaleString("pl")} widzów ({rekordy.rekordFrekwencji.rywal})</Text>}
              </View>
            )}

            {/* zdjęcia drużyny */}
            <View style={{ marginTop: 16 }}>
              <Text style={st.naglowek}>📸 Zdjęcia drużyny</Text>
              {ostatnieZdj ? (
                <Pressable onPress={() => setGaleria(true)}>
                  <View style={{ alignItems: "center" }}><ZdjecieDruzyny s={s} zdjecie={ostatnieZdj} szerokosc={300} /></View>
                  <Text style={[st.maly, { color: K.niebieski, marginTop: 6, textAlign: "center" }]}>Galeria: {zdj.length} {zdj.length === 1 ? "zdjęcie" : "zdjęć"} →</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => setGaleria(true)}><Text style={[st.maly, { color: K.niebieski }]}>Otwórz galerię →</Text></Pressable>
              )}
            </View>

            <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 16 }]} onPress={onClose}>
              <Text style={st.przyciskTekst}>Zamknij</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
      <GaleriaZdjec s={s} widoczny={galeria} onClose={() => setGaleria(false)} odswiez={tik} klubId={klub.id} />
    </Modal>
  );
}
