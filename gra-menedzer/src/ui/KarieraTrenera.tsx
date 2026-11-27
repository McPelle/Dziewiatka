import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { latTrenera, przedluzKontraktTrenera } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { Twarz } from "./Twarz";
import { K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));

function Info({ etyk, wart, kolor }: { etyk: string; wart: string; kolor?: string }) {
  return (
    <View style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]}>
      <Text style={st.maly}>{etyk}</Text>
      <Text style={[st.tekst, { fontSize: 14, fontWeight: "700", color: kolor ?? K.tekst }]}>{wart}</Text>
    </View>
  );
}

export function KarieraTrenera({ s, widoczny, onClose, odswiez }: { s: StanGry; widoczny: boolean; onClose: () => void; odswiez: () => void }) {
  const kariera = s.trenerKariera ?? [];
  const sum = kariera.reduce((a, w) => ({ mecze: a.mecze + w.mecze, w: a.w + w.w, r: a.r + w.r, p: a.p + w.p, bz: a.bz + w.bz, bp: a.bp + w.bp, awanse: a.awanse + w.awanse, spadki: a.spadki + w.spadki, tytuly: a.tytuly + w.tytuly }), { mecze: 0, w: 0, r: 0, p: 0, bz: 0, bp: 0, awanse: 0, spadki: 0, tytuly: 0 });
  const pktProc = sum.mecze ? Math.round(((sum.w * 3 + sum.r) / (sum.mecze * 3)) * 100) : 0;
  const finalny = !s.zwolniony && latTrenera(s) <= 1;
  const historia = [...(s.historia ?? [])].reverse();
  const puchary = (s.historia ?? []).filter((h) => h.puchar).length;
  const sezonow = s.historia?.length ?? 0;
  const WYNIK: Record<string, { t: string; k: string }> = {
    mistrz: { t: "Mistrz", k: K.akcent }, awans: { t: "Awans", k: K.zielony }, spadek: { t: "Spadek", k: K.czerwony }, utrzymanie: { t: "Utrzymanie", k: K.szary },
  };

  const przedluz = () => { const b = przedluzKontraktTrenera(s); odswiez(); komunikat(b ?? "Kontrakt przedłużony."); };

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", paddingBottom: 20 }}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <View style={[st.wiersz, { gap: 14 }]}>
              <Twarz seed={s.trener} rozmiar={54} zdjecie={s.trenerZdjecie} jersey="#2b2f45" />
              <View style={{ flex: 1 }}>
                <Text style={st.tytul}>{s.trener}</Text>
                <Text style={st.maly}>Trener · {kariera.length} {kariera.length === 1 ? "klub" : "kluby/klubów"} w karierze</Text>
                {s.trenerAgent ? <Text style={st.maly}>Agent: {s.trenerAgent}</Text> : null}
              </View>
            </View>

            {s.rekordy && (s.rekordy.najlepszeMiejsce || s.rekordy.najwiecejPkt || s.rekordy.topStrzelec || s.rekordy.najwieksza) && (
              <View style={{ marginTop: 16 }}>
                <Text style={st.naglowek}>📜 Rekordy klubu</Text>
                {s.rekordy.najlepszeMiejsce && <Text style={st.maly}>Najlepsze miejsce: <Text style={{ color: K.tekst, fontWeight: "700" }}>{s.rekordy.najlepszeMiejsce.miejsce}. w {s.rekordy.najlepszeMiejsce.liga}</Text> (sezon {s.rekordy.najlepszeMiejsce.sezon}/{(s.rekordy.najlepszeMiejsce.sezon + 1) % 100})</Text>}
                {s.rekordy.najwiecejPkt && <Text style={st.maly}>Najwięcej punktów w sezonie: <Text style={{ color: K.tekst, fontWeight: "700" }}>{s.rekordy.najwiecejPkt.pkt}</Text> ({s.rekordy.najwiecejPkt.liga})</Text>}
                {s.rekordy.topStrzelec && <Text style={st.maly}>Rekord strzelecki sezonu: <Text style={{ color: K.tekst, fontWeight: "700" }}>{s.rekordy.topStrzelec.imie} {s.rekordy.topStrzelec.nazwisko} — {s.rekordy.topStrzelec.gole} goli</Text></Text>}
                {s.rekordy.najwieksza && <Text style={st.maly}>Najwyższa wygrana: <Text style={{ color: K.tekst, fontWeight: "700" }}>{s.rekordy.najwieksza.wynik}</Text> z {s.rekordy.najwieksza.rywal} ({s.rekordy.najwieksza.uSiebie ? "u siebie" : "na wyjeździe"})</Text>}
              </View>
            )}

            <View style={{ marginTop: 16 }}>
              <Text style={st.naglowek}>🏆 Gablota trofeów</Text>
              <View style={[st.wiersz, { justifyContent: "space-between" }]}>
                {([["🏆", sum.tytuly, "mistrzostwa"], ["🥇", puchary, "puchary"], ["⬆", sum.awanse, "awanse"], ["📅", sezonow, "sezony"]] as const).map(([ik, n, et]) => (
                  <View key={et} style={{ alignItems: "center", flex: 1 }}>
                    <Text style={{ fontSize: 20 }}>{ik}</Text>
                    <Text style={{ color: K.tekst, fontSize: 22, fontWeight: "900" }}>{n}</Text>
                    <Text style={[st.maly, { fontSize: 11 }]}>{et}</Text>
                  </View>
                ))}
              </View>
            </View>

            {!s.zwolniony && (
              <View style={{ marginTop: 16 }}>
                <Text style={st.naglowek}>Kontrakt</Text>
                <Info etyk="Klub" wart={s.kluby[s.mojKlub]?.nazwa ?? "—"} />
                <Info etyk="Obowiązuje do" wart={`${s.trenerKontraktDo ?? "—"}${latTrenera(s) === 0 ? " (ostatni sezon)" : ` (jeszcze ${latTrenera(s)} sez.)`}`} kolor={latTrenera(s) === 0 ? K.akcent : K.tekst} />
                <Info etyk="Wartość" wart={`${zl(s.trenerPensja ?? 0)}/sezon`} />
                {finalny && (
                  <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center", borderColor: K.akcent }]} onPress={przedluz}>
                    <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Przedłuż kontrakt</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Text style={[st.naglowek, { marginTop: 18 }]}>Prowadzone kluby</Text>
            {kariera.length === 0 ? (
              <Text style={st.maly}>Brak historii.</Text>
            ) : (
              [...kariera].reverse().map((w, i) => {
                const obecny = w.do === null;
                const lata = obecny ? `${w.od}–teraz` : w.od === w.do ? `${w.od}` : `${w.od}–${w.do}`;
                const medale = [w.tytuly ? `🏆×${w.tytuly}` : "", w.awanse ? `⬆×${w.awanse}` : "", w.spadki ? `⬇×${w.spadki}` : ""].filter(Boolean).join(" ");
                return (
                  <View key={i} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: K.linia }}>
                    <View style={[st.wiersz, { justifyContent: "space-between" }]}>
                      <Text style={[st.tekst, { fontWeight: obecny ? "800" : "600", color: obecny ? K.tekst : K.szary, flex: 1 }]} numberOfLines={1}>{obecny ? "▸ " : ""}{w.klub}</Text>
                      <Text style={st.maly}>{lata}</Text>
                    </View>
                    <View style={[st.wiersz, { justifyContent: "space-between", marginTop: 2 }]}>
                      <Text style={st.maly}>{w.mecze} mecz. · {w.w}-{w.r}-{w.p} · bramki {w.bz}:{w.bp}</Text>
                      {medale ? <Text style={[st.maly, { color: K.akcent }]}>{medale}</Text> : null}
                    </View>
                  </View>
                );
              })
            )}

            {kariera.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={st.naglowek}>Łącznie w karierze</Text>
                <Info etyk="Mecze" wart={`${sum.mecze} (${sum.w} wyg. · ${sum.r} rem. · ${sum.p} por.)`} />
                <Info etyk="Punkty na mecz" wart={sum.mecze ? ((sum.w * 3 + sum.r) / sum.mecze).toFixed(2) : "—"} />
                <Info etyk="Skuteczność" wart={`${pktProc}%`} kolor={pktProc >= 55 ? K.zielony : pktProc >= 40 ? K.akcent : K.czerwony} />
                <Info etyk="Bramki" wart={`${sum.bz} : ${sum.bp}`} />
                <Info etyk="Osiągnięcia" wart={`🏆 ${sum.tytuly} · ⬆ ${sum.awanse} · ⬇ ${sum.spadki}`} />
              </View>
            )}

            {historia.length > 0 && (
              <View style={{ marginTop: 18 }}>
                <Text style={st.naglowek}>Historia sezonów</Text>
                {historia.map((h, i) => {
                  const w = WYNIK[h.wynik] ?? { t: h.wynik, k: K.tekst };
                  return (
                    <View key={i} style={{ paddingVertical: 7, borderTopWidth: 1, borderTopColor: K.linia }}>
                      <View style={[st.wiersz, { justifyContent: "space-between" }]}>
                        <Text style={[st.tekst, { fontSize: 14, flex: 1 }]} numberOfLines={1}>
                          <Text style={{ fontWeight: "800" }}>{h.sezon}</Text> · {h.liga} · {h.miejsce}. miejsce
                        </Text>
                        <Text style={{ color: w.k, fontWeight: "800", fontSize: 13 }}>{w.t}</Text>
                      </View>
                      {h.puchar ? <Text style={[st.maly, { color: K.akcent }]}>🥇 Puchar {h.puchar === "glowny" ? "główny" : "regionalny"} zdobyty!</Text> : null}
                      {(h.wyroznienia ?? []).map((x, j) => <Text key={j} style={st.maly}>{x}</Text>)}
                    </View>
                  );
                })}
              </View>
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
