// Karta kolekcjonerska zawodnika (styl „Ultimate Team"): ranga wg overall (brąz/srebro/złoto) lub karta specjalna,
// twarz, numer, pozycja, overall, 6 skrótów atrybutów, herb klubu i flaga narodowości.
// Użycie: <KartaKolekcjonerska zawodnik={z} s={s} />  albo z kartą specjalną: <KartaKolekcjonerska zawodnik={z} s={s} specjalna={k} />
import { Pressable, Text, View } from "react-native";
import { INFO_SPECJALNEJ, koloryKarty, NAZWA_RANGI, rangaKarty, rzadkaKarta, szescAtrybutow, type KartaSpecjalna } from "../engine/karty";
import type { StanGry, Zawodnik } from "../engine/types";
import { narodowoscKraju } from "../data/narodowosci";
import { SKROT_POZ } from "../data/pozycje";
import { barwyKlubu } from "./barwy";
import { Herb } from "./Herb";
import { Twarz } from "./Twarz";
import { CZCIONKA } from "./styl";

const SKROT_KAT: Record<string, string> = { BR: "BR", OBR: "OBR", POM: "POM", NAP: "NAP" };

export function KartaKolekcjonerska({ zawodnik: z, s, specjalna, szerokosc = 150, onPress }: {
  zawodnik: Zawodnik;
  s: StanGry;
  specjalna?: KartaSpecjalna;
  szerokosc?: number;
  onPress?: () => void;
}) {
  const W = szerokosc;
  const H = Math.round(W * 1.42);
  const f = W / 150; // skala czcionek/odstępów
  const umiej = Math.round(specjalna?.umiej ?? z.umiej);
  const typ = specjalna?.typ;
  const kol = koloryKarty(umiej, typ);
  const klubId = specjalna?.klubId ?? z.klubId ?? s.mojKlub;
  const klub = s.kluby[klubId];
  const flaga = narodowoscKraju(z.kraj)?.flaga ?? "🇵🇱";
  const poz = z.pozS ? SKROT_POZ[z.pozS] : SKROT_KAT[z.poz];
  const atr = szescAtrybutow({ poz: z.poz, umiej, atrybuty: specjalna?.atrybuty ?? z.atrybuty });
  const jersey = klub ? barwyKlubu(klub.nazwa)[0] : "#1f7a43";
  const etykieta = typ ? INFO_SPECJALNEJ[typ].nazwa : `${NAZWA_RANGI[rangaKarty(umiej)]}${rzadkaKarta(umiej) ? " rzadka" : ""}`;
  const blysk = typ === "legenda" || typ === "miesiaca" || (!typ && rzadkaKarta(umiej));
  const tekst = { color: kol.tekst, fontFamily: CZCIONKA } as const;

  const tresc = (
    <View style={{ width: W, height: H, borderRadius: 14 * f, borderTopLeftRadius: 28 * f, borderTopRightRadius: 28 * f, borderWidth: 2.5 * f, borderColor: kol.ramka, backgroundColor: kol.dol, overflow: "hidden",
      shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
      {/* tło: górna jaśniejsza część + ukośny refleks */}
      <View style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.58, backgroundColor: kol.gora }} />
      <View style={{ position: "absolute", left: -W * 0.3, top: H * 0.05, width: W * 0.5, height: H * 1.2, backgroundColor: "rgba(255,255,255,0.13)", transform: [{ rotate: "25deg" }] }} />
      {blysk && <View style={{ position: "absolute", right: -W * 0.15, top: -H * 0.1, width: W * 0.22, height: H * 1.3, backgroundColor: "rgba(255,255,255,0.22)", transform: [{ rotate: "25deg" }] }} />}

      {/* lewa kolumna: overall, pozycja, flaga, herb */}
      <View style={{ position: "absolute", left: 10 * f, top: 14 * f, alignItems: "center", width: 34 * f }}>
        <Text style={[tekst, { fontSize: 30 * f, fontWeight: "900", lineHeight: 32 * f }]}>{umiej}</Text>
        <Text style={[tekst, { fontSize: 12 * f, fontWeight: "800", letterSpacing: 0.5 }]}>{poz}</Text>
        <View style={{ height: 1, width: 22 * f, backgroundColor: kol.akcent, opacity: 0.5, marginVertical: 4 * f }} />
        <Text style={{ fontSize: 15 * f }}>{flaga}</Text>
        <View style={{ height: 4 * f }} />
        {klub && <Herb klub={klub} rozmiar={20 * f} />}
      </View>

      {/* numer na koszulce (prawy górny róg) */}
      <View style={{ position: "absolute", right: 10 * f, top: 14 * f, alignItems: "center" }}>
        <Text style={[tekst, { fontSize: 9 * f, fontWeight: "700", opacity: 0.75 }]}>NR</Text>
        <Text style={[tekst, { fontSize: 16 * f, fontWeight: "900" }]}>{z.numer}</Text>
        {typ && <Text style={{ fontSize: 14 * f, marginTop: 2 * f }}>{INFO_SPECJALNEJ[typ].ikona}</Text>}
      </View>

      {/* twarz */}
      <View style={{ position: "absolute", left: (W - 72 * f) / 2 + 6 * f, top: 16 * f }}>
        <Twarz seed={z.id} rozmiar={72 * f} zdjecie={z.zdjecie} cechy={z.twarz} jersey={jersey} kraj={z.kraj} />
      </View>

      {/* nazwisko */}
      <View style={{ position: "absolute", left: 6 * f, right: 6 * f, top: H * 0.585, alignItems: "center" }}>
        <Text numberOfLines={1} style={[tekst, { fontSize: 13.5 * f, fontWeight: "900", letterSpacing: 0.3, textTransform: "uppercase" }]}>{z.nazwisko}</Text>
        <View style={{ height: 1, alignSelf: "stretch", marginHorizontal: 12 * f, backgroundColor: kol.akcent, opacity: 0.45, marginTop: 2 * f }} />
      </View>

      {/* 6 atrybutów: 2 kolumny × 3 */}
      <View style={{ position: "absolute", left: 14 * f, right: 14 * f, top: H * 0.7, flexDirection: "row" }}>
        {[0, 1].map((kolumna) => (
          <View key={kolumna} style={{ flex: 1, alignItems: "center", borderLeftWidth: kolumna ? 1 : 0, borderLeftColor: `${kol.akcent}55` }}>
            {atr.slice(kolumna * 3, kolumna * 3 + 3).map((a) => (
              <View key={a.skrot} style={{ flexDirection: "row", width: 52 * f, justifyContent: "space-between" }}>
                <Text style={[tekst, { fontSize: 12 * f, fontWeight: "900" }]}>{a.wartosc}</Text>
                <Text style={[tekst, { fontSize: 11 * f, fontWeight: "600", opacity: 0.85 }]}>{a.skrot}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* stopka: typ karty */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 5 * f, alignItems: "center" }}>
        <Text numberOfLines={1} style={[tekst, { fontSize: 8.5 * f, fontWeight: "800", letterSpacing: 1, opacity: 0.8, textTransform: "uppercase" }]}>
          {etykieta}{specjalna ? ` · ${specjalna.sezon}` : ""}
        </Text>
      </View>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{tresc}</Pressable> : tresc;
}
