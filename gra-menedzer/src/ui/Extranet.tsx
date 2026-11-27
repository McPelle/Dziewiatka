// Extranet PZPN: karty zawodników (potwierdzenie, badania lekarskie, ITC), zgłoszenie drużyny do rozgrywek
// (opłata wpisowa, wycofanie) i informacja o obsadzie sędziowskiej szczebla.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { aktualizujExtranet, dataZNr, extranetStan, kartyKadry, OPIS_POWODU, ustawAutoBadania, zaplanujBadania } from "../engine/extranet";
import { zl } from "../engine/losuj";
import { NAZWA_SZCZEBLA, opisObsady } from "../engine/obsadaSedziowska";
import { wycofajMojaDruzyne, zaplacWpisowe, zgloszenie } from "../engine/zgloszenie";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

export function Extranet({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [komunikat, setKomunikat] = useState<string | null>(null);
  const [potwierdzWycofanie, setPotwierdzWycofanie] = useState(false);
  if (!extranetStan(s)) aktualizujExtranet(s); // pierwsze otwarcie przed rozegraniem dnia
  const e = extranetStan(s);
  const k = s.kluby[s.mojKlub];
  const z = zgloszenie(s);
  const wiersze = kartyKadry(s);
  const nieupr = wiersze.filter((w) => w.powod);
  const wycofany = !!z?.wycofania.some((w) => w.klubId === s.mojKlub);
  const akcja = (t: string) => { setKomunikat(t); odswiez(); };
  if (!k || !e) return null;
  return (
    <View style={[st.karta, { marginHorizontal: 0 }]}>
      <Text style={st.naglowek}>📋 Extranet PZPN — {k.nazwa}</Text>
      <Text style={st.maly}>Dziś: {dataZNr(e.dzis)} · zawodników w Extranecie: {wiersze.length} · nieuprawnionych do gry: {nieupr.length}</Text>
      {komunikat && <Text style={[st.maly, { color: K.akcent, marginTop: 4 }]}>{komunikat}</Text>}

      {/* ——— zgłoszenie do rozgrywek ——— */}
      {z && (
        <View style={{ marginTop: 10 }}>
          <Text style={st.naglowek}>📝 Zgłoszenie drużyny — sezon {s.sezon}/{(s.sezon + 1) % 100}</Text>
          <Text style={st.maly}>{NAZWA_SZCZEBLA[z.szczebel]} · organ prowadzący: {z.organ} · opłata za udział: {zl(z.oplata)}{z.kara ? ` + kara ${zl(z.kara)}` : ""}</Text>
          <Text style={[st.maly, { color: wycofany ? K.czerwony : z.zaplacono ? K.zielony : K.akcent }]}>
            {wycofany ? "🚫 Drużyna wycofana z rozgrywek w tym sezonie." : z.zaplacono ? "✅ Opłacone — drużyna zgłoszona." : `⏳ Do zapłaty przed ${z.termin + 1}. kolejką${z.wezwanie ? " (WEZWANIE — ostatni termin, potem skreślenie)" : ""}.`}
          </Text>
          {!z.zaplacono && !wycofany && (
            <Pressable onPress={() => akcja(zaplacWpisowe(s))} style={[st.przyciskMaly, { marginTop: 5 }]}><Text style={st.przyciskMalyTekst}>💳 Zapłać teraz ({zl(z.oplata + z.kara)})</Text></Pressable>
          )}
          <Pressable onPress={() => { z.autoPlatnosc = !z.autoPlatnosc; odswiez(); }} style={[st.przyciskMaly, { marginTop: 5, alignItems: "flex-start" }]}>
            <Text style={st.przyciskMalyTekst}>{z.autoPlatnosc ? "✅" : "⬜"} Sekretarz klubu płaci w terminie automatycznie (jeśli jest kasa)</Text>
          </Pressable>
          {!wycofany && (potwierdzWycofanie ? (
            <View style={{ marginTop: 6 }}>
              <Text style={[st.maly, { color: K.czerwony }]}>Na pewno? Przy mniej niż 50% rozegranych meczów wyniki zostaną anulowane, przy ≥ 50% — walkowery w pozostałych meczach. Drużyna zajmie ostatnie miejsce i spadnie, kara {zl(z.oplata * 2)}, zarząd i kibice stracą zaufanie.</Text>
              <View style={[st.wiersz, { gap: 6, marginTop: 4 }]}>
                <Pressable onPress={() => { setPotwierdzWycofanie(false); akcja(wycofajMojaDruzyne(s)); }} style={[st.przyciskMaly, { borderColor: K.czerwony }]}><Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Tak, wycofaj drużynę</Text></Pressable>
                <Pressable onPress={() => setPotwierdzWycofanie(false)} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>Anuluj</Text></Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setPotwierdzWycofanie(true)} style={[st.przyciskMaly, { marginTop: 5, borderColor: K.linia }]}><Text style={[st.przyciskMalyTekst, { color: K.szary }]}>🚫 Wycofaj drużynę z rozgrywek…</Text></Pressable>
          ))}
          {z.wycofania.filter((w) => w.klubId !== s.mojKlub).map((w, i) => (
            <Text key={i} style={[st.maly, { marginTop: 3 }]}>• {s.kluby[w.klubId]?.nazwa} wycofany z {s.ligi[w.poziom - 1]?.nazwa} po {w.kolejka}. kolejce ({w.anulowane ? "wyniki anulowane" : "walkowery w pozostałych meczach"}).</Text>
          ))}
        </View>
      )}

      {/* ——— karty zawodników ——— */}
      <Text style={[st.naglowek, { marginTop: 10 }]}>🩺 Karty zawodników i badania lekarskie</Text>
      <Text style={[st.maly, { fontSize: 11 }]}>Orzeczenie lekarskie ważne 12 mies. (do 16 lat — 6 mies.). Bez ważnych badań, potwierdzenia w Extranecie lub certyfikatu ITC (zawodnik z zagranicy) nie wpiszesz zawodnika do protokołu meczowego. Badania U-23 — NFZ (bez kosztu w grze).</Text>
      <View style={[st.wiersz, { gap: 6, flexWrap: "wrap", marginTop: 5 }]}>
        <Pressable onPress={() => akcja(zaplanujBadania(s))} style={st.przyciskMaly}><Text style={st.przyciskMalyTekst}>🩺 Umów badania (wygasłe i wygasające ≤ 30 dni)</Text></Pressable>
        {k.poziom > 3 && (
          <Pressable onPress={() => { ustawAutoBadania(s, !e.autoBadania); odswiez(); }} style={st.przyciskMaly}>
            <Text style={st.przyciskMalyTekst}>{e.autoBadania ? "✅" : "⬜"} Kierownik drużyny pilnuje terminów</Text>
          </Pressable>
        )}
      </View>
      {k.poziom <= 3 && <Text style={[st.maly, { color: K.zielony }]}>Dział medyczny klubu odnawia badania automatycznie (10 dni przed wygaśnięciem).</Text>}
      {wiersze.map(({ z: zaw, k: karta, powod, dniBadan, koszt }) => (
        <View key={zaw.id} style={[st.wiersz, { paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: K.linia }]}>
          <Text style={[st.tekst, { flex: 1, fontSize: 13 }]}>{zaw.numer ? `${zaw.numer}. ` : ""}{zaw.imie[0]}. {zaw.nazwisko}{zaw.kraj && zaw.kraj !== "Polska" ? ` (${zaw.kraj})` : ""} · {zaw.wiek} l.</Text>
          <View style={{ flex: 1.4 }}>
            <Text style={[st.maly, { fontSize: 11, color: powod ? K.czerwony : dniBadan <= 14 ? K.akcent : K.szary }]}>
              {powod ? OPIS_POWODU[powod].replace("📋 Extranet: ", "⛔ ") : "✅ uprawniony"}
              {karta.badaniaTermin !== undefined ? " · 🩺 badania w toku" : karta.badaniaDo ? ` · badania do ${dataZNr(karta.badaniaDo)}` : " · brak badań"}
            </Text>
            {karta.itc && <Text style={[st.maly, { fontSize: 11 }]}>🌍 ITC ({karta.itc.kraj}): {karta.itc.status === "oczekuje" ? `oczekuje — decyzja ok. ${dataZNr(karta.itc.decyzja)}${karta.itc.maloletni ? " (małoletni — zgoda FIFA)" : ""}` : karta.itc.status === "tymczasowa" ? "rejestracja tymczasowa" : "wydany"}</Text>}
          </View>
          {karta.badaniaTermin === undefined && dniBadan <= 30 && (
            <Pressable onPress={() => akcja(zaplanujBadania(s, [zaw.id]))} style={[st.przyciskMaly, { paddingVertical: 3 }]}><Text style={[st.przyciskMalyTekst, { fontSize: 11 }]}>Badania {koszt ? zl(koszt) : "(NFZ)"}</Text></Pressable>
          )}
        </View>
      ))}
      {!wiersze.length && <Text style={st.maly}>Brak zawodników w kadrze.</Text>}
      <Text style={[st.maly, { fontSize: 11, marginTop: 4 }]}>Zaplanuj w kalendarzu dzień „Badania medyczne" — przebada całą kadrę (orzeczenia ważne krócej niż 4 miesiące).</Text>

      {/* ——— obsada sędziowska ——— */}
      <Text style={[st.naglowek, { marginTop: 10 }]}>🧑‍⚖️ Obsada sędziowska Twojej ligi</Text>
      <Text style={st.maly}>{opisObsady(s, k.poziom)}</Text>
    </View>
  );
}
