import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { silaKlubu, tabelaLigi } from "../engine/swiat";
import type { StanGry, Zawodnik } from "../engine/types";
import { BoiskoXI } from "./BoiskoXI";
import { Herb } from "./Herb";
import { LogoLigi } from "./LogoLigi";
import { WidokKlubu } from "./WidokKlubu";
import { K, st } from "./styl";

type Widok = "tabela" | "strzelcy" | "asysty" | "konta" | "xi";
const WIDOKI: [Widok, string][] = [["tabela", "Tabela"], ["strzelcy", "Strzelcy"], ["asysty", "Asysty"], ["konta", "Czyste konta"], ["xi", "⭐ XI kolejki"]];

export function Tabela({ s }: { s: StanGry }) {
  const [poziom, setPoziom] = useState(s.kluby[s.mojKlub].poziom);
  const [widok, setWidok] = useState<Widok>("tabela");
  const [podglad, setPodglad] = useState<string | null>(null);
  const [xiIdx, setXiIdx] = useState<number | null>(null);
  const liga = s.ligi[poziom - 1];
  const tabela = tabelaLigi(s, liga);
  const awans = poziom > 1 ? s.wymiana[poziom - 2] : 0;
  const spadek = poziom < s.ligi.length ? s.wymiana[poziom - 1] : 0;

  const zawodnicyLigi = (): Zawodnik[] =>
    liga.kluby.flatMap((kid) => s.kluby[kid].zawodnicy.map((id) => s.zawodnicy[id]));
  const ranking = (klucz: "gole" | "asysty" | "czysteKonta") =>
    zawodnicyLigi().filter((z) => z[klucz] > 0).sort((a, b) => b[klucz] - a[klucz] || b.mecze - a.mecze).slice(0, 20);

  return (
    <View style={st.ekran}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingTop: 10, paddingLeft: 12 }}>
        {s.ligi.map((l) => (
          <Pressable key={l.poziom} onPress={() => setPoziom(l.poziom)} style={[st.chip, l.poziom === poziom && st.chipAktywny]}>
            <Text style={{ color: l.poziom === poziom ? "#17310f" : K.tekst, fontWeight: "700" }}>{l.nazwa}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={[st.wiersz, { paddingHorizontal: 12, paddingTop: 2, flexWrap: "wrap" }]}>
        {WIDOKI.map(([id, n]) => (
          <Pressable key={id} onPress={() => setWidok(id)} style={[st.chip, { marginBottom: 6 }, widok === id && st.chipAktywny]}>
            <Text style={{ color: widok === id ? "#17310f" : K.tekst, fontWeight: "700", fontSize: 13 }}>{n}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={[st.wiersz, { gap: 10, paddingHorizontal: 14, paddingTop: 8 }]}>
          <LogoLigi nazwa={liga.nazwa} poziom={liga.poziom} rozmiar={34} />
          <Text style={[st.tytul, { fontSize: 17, flex: 1 }]}>{liga.nazwa}</Text>
        </View>
        {widok === "xi" ? (
          (() => {
            const hist = s.xiHistoria ?? (s.xiKolejki ? [s.xiKolejki] : []);
            if (!hist.length) return <View style={st.karta}><Text style={st.naglowek}>⭐ Najlepsza jedenastka kolejki</Text><Text style={st.maly}>Rozegraj kolejkę — po niej wybierzemy XI kolejki Twojej ligi.</Text></View>;
            const idx = xiIdx == null ? hist.length - 1 : Math.max(0, Math.min(hist.length - 1, xiIdx));
            const xi = hist[idx];
            return (
              <View style={st.karta}>
                <View style={[st.wiersz, { justifyContent: "space-between", marginBottom: 8 }]}>
                  <Pressable disabled={idx <= 0} onPress={() => setXiIdx(idx - 1)} style={[st.przyciskMaly, { opacity: idx <= 0 ? 0.3 : 1 }]}><Text style={st.przyciskMalyTekst}>◀</Text></Pressable>
                  <View style={{ alignItems: "center" }}>
                    <Text style={st.naglowek}>⭐ XI kolejki {xi.kolejka}</Text>
                    <Text style={st.maly}>{xi.liga} · 4-4-2 · {idx + 1}/{hist.length}</Text>
                  </View>
                  <Pressable disabled={idx >= hist.length - 1} onPress={() => setXiIdx(idx + 1)} style={[st.przyciskMaly, { opacity: idx >= hist.length - 1 ? 0.3 : 1 }]}><Text style={st.przyciskMalyTekst}>▶</Text></Pressable>
                </View>
                <BoiskoXI gracze={xi.gracze} mojaNazwa={s.kluby[s.mojKlub].nazwa} />
                <Text style={[st.maly, { marginTop: 10 }]}>Ocena 1–10 za mecz; najlepsi na pozycji tworzą jedenastkę kolejki. Twoi zawodnicy mają białą obwódkę. ◀▶ przegląda kolejki.</Text>
              </View>
            );
          })()
        ) : widok === "tabela" ? (
          <>
            <View style={[st.karta, { paddingHorizontal: 8 }]}>
              <View style={[st.wiersz, { paddingBottom: 6 }]}>
                <Text style={[st.maly, { width: 26 }]}>#</Text>
                <Text style={[st.maly, { flex: 1 }]}>Drużyna</Text>
                <Text style={[st.maly, { width: 32, textAlign: "center" }]}>OVR</Text>
                {["M", "W", "R", "P", "Br", "Pkt"].map((h) => (
                  <Text key={h} style={[st.maly, { width: h === "Br" ? 46 : 26, textAlign: "center" }]}>{h}</Text>
                ))}
              </View>
              {tabela.map((w, i) => {
                const k = s.kluby[w.klubId];
                const moj = w.klubId === s.mojKlub;
                const kolor = i < awans ? K.zielony : i >= tabela.length - spadek ? K.czerwony : "transparent";
                return (
                  <Pressable key={w.klubId} onPress={() => setPodglad(w.klubId)} style={[st.wiersz, { paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia, backgroundColor: moj ? K.karta2 : undefined }]}>
                    <View style={{ width: 3, alignSelf: "stretch", backgroundColor: kolor, marginRight: 4 }} />
                    <Text style={[st.tekst, { width: 22 }]}>{i + 1}</Text>
                    <Herb klub={k} rozmiar={20} />
                    <Text numberOfLines={1} style={[st.tekst, { flex: 1, marginLeft: 6, fontWeight: moj ? "800" : "400", fontSize: 14 }]}>{k.nazwa}{k.karaPunktowa ? ` (−${k.karaPunktowa} pkt)` : ""}</Text>
                    <Text style={{ width: 32, textAlign: "center", color: K.akcent, fontWeight: "800", fontSize: 12.5 }}>{silaKlubu(s, w.klubId).toFixed(0)}</Text>
                    {[w.m, w.w, w.r, w.p].map((x, j) => (
                      <Text key={j} style={[st.maly, { width: 26, textAlign: "center" }]}>{x}</Text>
                    ))}
                    <Text style={[st.maly, { width: 46, textAlign: "center" }]}>{w.bz}:{w.bs}</Text>
                    <Text style={[st.tekst, { width: 26, textAlign: "center", fontWeight: "800" }]}>{w.pkt}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[st.maly, { marginHorizontal: 12, marginTop: 8 }]}>Zielone: awans ({awans}) · czerwone: spadek ({spadek})</Text>
            <View style={st.karta}>
              <Text style={st.naglowek}>Najlepsza obrona</Text>
              {[...tabela].sort((a, b) => a.bs - b.bs).slice(0, 3).map((w, i) => (
                <Text key={w.klubId} style={st.maly}>{i + 1}. {s.kluby[w.klubId].nazwa} — {w.bs} straconych</Text>
              ))}
            </View>
          </>
        ) : (
          <View style={st.karta}>
            <Text style={st.naglowek}>
              {widok === "strzelcy" ? "Król strzelców" : widok === "asysty" ? "Król asyst" : "Czyste konta (bramkarze)"} — {liga.nazwa}
            </Text>
            {(() => {
              const klucz = widok === "strzelcy" ? "gole" : widok === "asysty" ? "asysty" : "czysteKonta";
              const lista = ranking(klucz as "gole" | "asysty" | "czysteKonta");
              if (!lista.length) return <Text style={st.maly}>Brak danych — rozegraj kilka kolejek.</Text>;
              return lista.map((z, i) => (
                <View key={z.id} style={[st.wiersz, { paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }]}>
                  <Text style={[st.maly, { width: 24 }]}>{i + 1}.</Text>
                  {z.klubId && <Herb klub={s.kluby[z.klubId]} rozmiar={18} />}
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text numberOfLines={1} style={[st.tekst, { fontSize: 14, fontWeight: z.klubId === s.mojKlub ? "800" : "400" }]}>{z.imie} {z.nazwisko}</Text>
                    <Text style={st.maly} numberOfLines={1}>{z.klubId ? s.kluby[z.klubId].nazwa : ""}</Text>
                  </View>
                  <Text style={{ color: K.akcent, fontSize: 18, fontWeight: "900", width: 36, textAlign: "right" }}>
                    {widok === "strzelcy" ? z.gole : widok === "asysty" ? z.asysty : z.czysteKonta}
                  </Text>
                </View>
              ));
            })()}
          </View>
        )}
      </ScrollView>
      <WidokKlubu s={s} klubId={podglad} onClose={() => setPodglad(null)} odswiez={() => {}} />
    </View>
  );
}
