import { ScrollView, Text, View } from "react-native";
import { drabinkaEuropy, NAZWA_ROZGRYWEK } from "../engine/europa";
import { etapPucharu, pelnaDrabinka, pucharRegion } from "../engine/puchar";
import { LogoLigi } from "./LogoLigi";
import type { EuroRywal, StanGry } from "../engine/types";
import { Relacja } from "./Terminarz";
import { Herb } from "./Herb";
import { EmblematRozgrywek, HerbEuro } from "./HerbEuro";
import { K, st } from "./styl";

/** Karta z prawdziwymi danymi europejskiego rywala (bez herbu — oryginalny emblemat). */
function KartaRywala({ r }: { r: EuroRywal }) {
  return (
    <View style={[st.wiersz, { alignItems: "center", gap: 10, marginTop: 8, padding: 8, borderWidth: 1, borderColor: K.linia, borderRadius: 8 }]}>
      <HerbEuro rywal={r} rozmiar={40} />
      <View style={{ flex: 1 }}>
        <Text style={[st.tekst, { fontWeight: "800" }]} numberOfLines={1}>{r.nazwa}</Text>
        <Text style={st.maly} numberOfLines={1}>{r.miasto}, {r.kraj} · zał. {r.zalozony}</Text>
        <Text style={st.maly} numberOfLines={1}>🏟 {r.stadion} ({r.pojemnosc.toLocaleString("pl-PL")})</Text>
      </View>
    </View>
  );
}

/** Kampania europejska — emblemat, bieżący rywal, faza ligowa 36 drużyn i drabinka fazy pucharowej. */
function Europa({ s }: { s: StanGry }) {
  const e = s.europa;
  if (!e) return null;
  const rundy = drabinkaEuropy(e);
  const naglowek = e.faza === "zdobyty" ? K.akcent : e.faza === "odpadl" ? K.czerwony : K.zielony;
  const status = e.faza === "zdobyty" ? "🏆 Triumf!" : e.faza === "odpadl" ? "Odpadliście" : `W grze · ${e.nazwaRundy}`;
  return (
    <View style={st.karta}>
      <View style={[st.wiersz, { alignItems: "center", gap: 10 }]}>
        <LogoLigi nazwa={NAZWA_ROZGRYWEK[e.rozgrywki]} rozmiar={42} />
        <Text style={st.naglowek}>{NAZWA_ROZGRYWEK[e.rozgrywki]}</Text>
      </View>
      <Text style={[st.tytul, { color: naglowek, fontSize: 18, marginTop: 4 }]}>{status}</Text>

      {/* bieżący rywal (eliminacje / faza pucharowa) z prawdziwymi danymi */}
      {e.faza === "w_toku" && e.przeciwnikDane && !e.nazwaRundy.includes("Faza ligowa") && (
        <>
          <Text style={[st.maly, { marginTop: 8 }]}>Najbliższy rywal · {e.nazwaRundy}</Text>
          <KartaRywala r={e.przeciwnikDane} />
        </>
      )}

      {/* faza ligowa: mini-tabela Twoich meczów */}
      {e.fazaLigowa && e.fazaLigowa.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={[st.tekst, { fontWeight: "800" }]}>Faza ligowa · {e.pktLigowe} pkt · {e.miejsceLigowe}. miejsce / 36</Text>
          {e.fazaLigowa.map((m, i) => (
            <View key={i} style={{ paddingVertical: 3 }}>
              <View style={[st.wiersz, { alignItems: "center", gap: 8 }]}>
                {m.dane ? <HerbEuro rywal={m.dane} rozmiar={18} /> : <View style={{ width: 18 }} />}
                <Text style={[st.maly, { width: 26, color: K.szary }]}>{m.uSiebie ? "dom" : "wyj"}</Text>
                <Text style={[st.tekst, { flex: 1, fontSize: 13 }]} numberOfLines={1}>{m.przeciwnik}</Text>
                <Text style={[st.tekst, { fontSize: 13, fontWeight: "700" }]}>{m.wynik}</Text>
              </View>
              {m.sedzia ? <Text style={[st.maly, { marginLeft: 26, color: K.szary }]}>🧑‍⚖️ {m.sedzia}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {/* drabinka etapów */}
      <View style={{ marginTop: 12 }}>
        {rundy.map((nazwa, i) => {
          const wpis = (e.sciezka ?? []).find((x) => x.nazwa === nazwa);
          const biezaca = e.faza === "w_toku" && nazwa === e.nazwaRundy && !wpis;
          const kolor = wpis ? (wpis.awans ? K.zielony : K.czerwony) : biezaca ? K.akcent : K.linia;
          return (
            <View key={i} style={[st.wiersz, { alignItems: "stretch" }]}>
              <View style={{ width: 20, alignItems: "center" }}>
                {i > 0 && <View style={{ width: 2, height: 8, backgroundColor: K.linia }} />}
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: kolor, borderWidth: 2, borderColor: K.tlo }} />
                {i < rundy.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: K.linia }} />}
              </View>
              <View style={{ flex: 1, paddingVertical: 3, paddingBottom: 7 }}>
                <Text style={[st.tekst, { fontSize: 13, fontWeight: biezaca ? "800" : "600", color: wpis || biezaca ? K.tekst : K.szary }]} numberOfLines={1}>
                  {i === rundy.length - 1 ? "🏆 " : ""}{nazwa}
                </Text>
                {wpis ? (
                  <View style={[st.wiersz, { gap: 6, alignItems: "center", marginTop: 1 }]}>
                    {wpis.dane ? <HerbEuro rywal={wpis.dane} rozmiar={14} /> : null}
                    <Text style={[st.maly, { color: wpis.awans ? K.zielony : K.czerwony, flex: 1 }]} numberOfLines={1}>{wpis.uSiebie ? "" : "@ "}{wpis.przeciwnik} · {wpis.wynik} {wpis.awans ? "✓" : "✗"}</Text>
                  </View>
                ) : biezaca ? <Text style={[st.maly, { color: K.akcent }]}>trwa…</Text> : <Text style={st.maly}>—</Text>}
                {wpis?.sedzia ? <Text style={[st.maly, { color: K.szary }]}>🧑‍⚖️ {wpis.sedzia}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Drabinka pucharu — pełna droga do finału: przebyte rundy z wynikiem, bieżąca i przyszłe. */
function Drabinka({ s }: { s: StanGry }) {
  const p = s.puchar;
  if (!p) return null;
  const rundy = pelnaDrabinka(s);
  const sciezka = p.sciezka ?? [];
  const biezaca = (p.faza === "regionalny" || p.faza === "glowny") ? p.nazwaRundy : null;
  return (
    <View style={st.karta}>
      <Text style={st.naglowek}>🏆 Drabinka pucharu</Text>
      {rundy.map((nazwa, i) => {
        const wpis = sciezka.find((x) => x.nazwa === nazwa);
        const jestBiezaca = nazwa === biezaca && !wpis;
        const krotka = nazwa.replace(" Pucharu Małopolski", " (Małopolska)").replace(" Pucharu Pomorskiego ZPN", " (Pomorze)").replace(" Pucharu Polski", " (Polska)");
        const kolorKropki = wpis ? (wpis.awans ? K.zielony : K.czerwony) : jestBiezaca ? K.akcent : K.linia;
        return (
          <View key={i} style={[st.wiersz, { alignItems: "stretch" }]}>
            {/* linia pionowa + kropka */}
            <View style={{ width: 22, alignItems: "center" }}>
              {i > 0 && <View style={{ width: 2, height: 10, backgroundColor: K.linia }} />}
              <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: kolorKropki, borderWidth: 2, borderColor: K.tlo }} />
              {i < rundy.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: K.linia }} />}
            </View>
            <View style={{ flex: 1, paddingVertical: 4, paddingBottom: 8 }}>
              <Text style={[st.tekst, { fontSize: 14, fontWeight: jestBiezaca ? "800" : "600", color: wpis || jestBiezaca ? K.tekst : K.szary }]} numberOfLines={1}>
                {i === rundy.length - 1 ? "🏆 " : ""}{krotka}
              </Text>
              {wpis ? (
                <View style={[st.wiersz, { gap: 6, marginTop: 1 }]}>
                  <Herb klub={s.kluby[wpis.przeciwnik]} rozmiar={16} />
                  <Text style={[st.maly, { color: wpis.awans ? K.zielony : K.czerwony }]} numberOfLines={1}>
                    {wpis.uSiebie ? "" : "@ "}{s.kluby[wpis.przeciwnik].nazwa} · {wpis.wynik} {wpis.awans ? "✓" : "✗"}
                  </Text>
                </View>
              ) : jestBiezaca ? (
                <Text style={[st.maly, { color: K.akcent }]}>trwa…</Text>
              ) : (
                <Text style={st.maly}>—</Text>
              )}
            </View>
          </View>
        );
      })}
      {p.pary && p.pary.length > 1 && (
        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: K.linia, paddingTop: 8 }}>
          <Text style={[st.naglowek, { fontSize: 14 }]}>Pełne losowanie par — ostatnia runda</Text>
          {p.pary.map((para, i) => {
            const moj = para.dom === s.mojKlub || para.gosc === s.mojKlub;
            return (
              <Text key={i} style={[st.maly, { paddingVertical: 1, color: moj ? K.akcent : K.tekst, fontWeight: moj ? "700" : "400" }]} numberOfLines={1}>
                {s.kluby[para.dom]?.nazwa ?? "?"} {para.wynik} {s.kluby[para.gosc]?.nazwa ?? "?"}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function PucharEkran({ s }: { s: StanGry }) {
  const p = s.puchar;
  if (!p) {
    return (
      <View style={[st.ekran, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={st.maly}>Puchar ruszy w nowym sezonie.</Text>
      </View>
    );
  }
  const wPucharze = p.faza === "regionalny" || p.faza === "glowny";
  const kolor = p.faza === "zdobyty" ? K.akcent : p.faza === "odpadl" ? K.czerwony : K.zielony;

  return (
    <ScrollView style={st.ekran} contentContainerStyle={{ paddingBottom: 30 }}>
      {s.superpuchar && (
        <View style={[st.karta, st.wiersz, { gap: 12, alignItems: "center" }]}>
          <LogoLigi nazwa="Superpuchar Polski" rozmiar={58} />
          <View style={{ flex: 1 }}>
            <Text style={st.naglowek}>Superpuchar Polski {s.superpuchar.sezon}</Text>
            <Text style={[st.tekst, { fontWeight: "800" }]}>🏆 {s.superpuchar.zwyciezca}</Text>
            <Text style={st.maly}>{s.superpuchar.zwyciezca} — {s.superpuchar.przegrany}: {s.superpuchar.wynik} · mistrz kontra zdobywca Pucharu Polski, przy remisie od razu rzuty karne</Text>
          </View>
        </View>)}
      <Europa s={s} />
      <View style={st.karta}>
        <View style={[st.wiersz, { gap: 12 }]}>
          <LogoLigi nazwa={p.faza === "glowny" || p.faza === "zdobyty" ? "Puchar Polski" : pucharRegion(s).nom} rozmiar={p.faza === "glowny" || p.faza === "zdobyty" ? 56 : 40} />
          <View style={{ flex: 1 }}>
            <Text style={st.naglowek}>{p.faza === "glowny" || p.faza === "zdobyty" ? "STS Puchar Polski" : pucharRegion(s).nom}</Text>
            <Text style={[st.tytul, { color: kolor }]}>{etapPucharu(s)}</Text>
          </View>
        </View>
        {p.faza === "regionalny" && (
          <Text style={[st.maly, { marginTop: 6 }]}>
            Grasz wojewódzki {pucharRegion(s).nom}. Zdobywca awansuje do głównego Pucharu Polski i zagra z zawodowcami
            (Ekstraklasa, I–III liga).
          </Text>
        )}
        {p.faza === "glowny" && (
          <Text style={[st.maly, { marginTop: 6 }]}>
            {p.zdobywcaRegion === s.mojKlub
              ? `Jako zdobywca ${pucharRegion(s).gen} gracie teraz w głównym Pucharze Polski!`
              : "Grasz główny Puchar Polski."}
          </Text>
        )}
        {p.faza === "odpadl" && <Text style={[st.maly, { marginTop: 6 }]}>Odpadliście w tym sezonie. Spróbujecie w następnym.</Text>}
        {p.faza === "zdobyty" && <Text style={[st.maly, { marginTop: 6 }]}>🏆 Puchar Polski zdobyty! Największy sukces w historii klubu.</Text>}
      </View>

      {wPucharze && p.przeciwnik && (
        <View style={[st.karta, st.wiersz]}>
          <Herb klub={s.kluby[p.przeciwnik]} rozmiar={36} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={st.maly}>{p.ostatniMecz ? "Ostatni rywal" : "Rywal"}</Text>
            <Text style={st.tekst}>{s.kluby[p.przeciwnik].nazwa}</Text>
            <Text style={st.maly}>{s.ligi[s.kluby[p.przeciwnik].poziom - 1]?.nazwa}</Text>
          </View>
        </View>
      )}

      {p.ostatniMecz && <Relacja s={s} w={p.ostatniMecz} />}

      <Drabinka s={s} />

      <View style={st.karta}>
        <Text style={st.naglowek}>Jak to działa</Text>
        <Text style={st.maly}>• Rundy pucharu rozgrywają się co kilka kolejek (razem z „Rozegraj kolejkę").</Text>
        <Text style={st.maly}>• Jeden mecz, remis → rzuty karne. Przegrana = koniec w tym sezonie.</Text>
        <Text style={st.maly}>• Za każdą rundę jest premia; główny Puchar Polski płaci znacznie więcej.</Text>
      </View>
    </ScrollView>
  );
}
