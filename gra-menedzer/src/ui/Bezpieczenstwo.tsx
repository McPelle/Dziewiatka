// Bezpieczeństwo meczów u siebie: firma ochroniarska (płaci klub), obsada względem minimum ustawowego,
// wsparcie opraw kibiców, policja z urzędu, raport z ostatniego meczu.
import { Pressable, Text, View } from "react-native";
import { FIRMY_OCHRONY, planZabezpieczenia, ustawieniaOchrony, type FirmaOchrony } from "../engine/bezpieczenstwo";
import { zl } from "../engine/losuj";
import { MIN_SEKTOR_GOSCI } from "../engine/kibice";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

export function Bezpieczenstwo({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const k = s.kluby[s.mojKlub]; const u = ustawieniaOchrony(s);
  const typowo = Math.round(k.pojemnosc * 0.6);
  const zwykly = planZabezpieczenia(s, k, typowo, false), ryzyko = planZabezpieczenia(s, k, Math.round(k.pojemnosc * 0.9), true);
  const ost = s.ostatnieZabezpieczenie;
  return (
    <View style={[st.karta, { marginHorizontal: 0 }]}>
      <Text style={st.naglowek}>🛡 Bezpieczeństwo meczów u siebie</Text>
      <Text style={st.maly}>{k.pojemnosc >= 1000 ? `Stadion ma ${k.pojemnosc.toLocaleString("pl")} miejsc — mecze to IMPREZA MASOWA: ustawa wymaga min. 10 osób służby porządkowej na 300 widzów (podwyższone ryzyko: 15), kierownika ds. bezpieczeństwa i zabezpieczenia medycznego. Płaci klub; policja działa z urzędu, bez opłat.` : `Stadion poniżej 1000 miejsc — to nie impreza masowa. Wystarczą porządkowi klubowi (mogą być wolontariusze).`}</Text>
      <Text style={[st.naglowek, { marginTop: 8 }]}>Firma ochroniarska</Text>
      {(Object.keys(FIRMY_OCHRONY) as FirmaOchrony[]).map((f) => {
        const F = FIRMY_OCHRONY[f], zablok = f === "wolontariusze" && k.pojemnosc >= 1000;
        return (
          <Pressable key={f} disabled={zablok} onPress={() => { u.firma = f; odswiez(); }} style={[st.przyciskMaly, { marginTop: 5, alignItems: "flex-start", borderColor: u.firma === f ? K.akcent : K.linia, opacity: zablok ? 0.4 : 1 }]}>
            <Text style={[st.przyciskMalyTekst, { color: u.firma === f ? K.akcent : K.tekst }]}>{u.firma === f ? "◉" : "○"} {F.nazwa} · {zl(F.stawka)}/os. · jakość {"★".repeat(Math.round(F.jakosc * 5))}</Text>
            <Text style={[st.maly, { fontSize: 11 }]}>{zablok ? "Niedozwolone przy imprezie masowej — wymagana licencjonowana służba." : F.opis}</Text>
          </Pressable>);
      })}
      <Text style={[st.naglowek, { marginTop: 8 }]}>Obsada (względem minimum z ustawy)</Text>
      <View style={[st.wiersz, { gap: 6, flexWrap: "wrap" }]}>
        {[0.9, 1, 1.1, 1.25, 1.5].map((o) => <Pressable key={o} onPress={() => { u.obsada = o; odswiez(); }} style={[st.chip, { marginBottom: 0 }, u.obsada === o && st.chipAktywny]}><Text style={{ color: u.obsada === o ? "#17310f" : o < 1 ? K.czerwony : K.tekst, fontSize: 12, fontWeight: "700" }}>{Math.round(o * 100)}%{o < 1 ? " ⚠" : ""}</Text></Pressable>)}
      </View>
      {u.obsada < 1 && k.pojemnosc >= 1000 && <Text style={[st.maly, { color: K.czerwony }]}>Poniżej minimum ustawowego — ryzyko kontroli wojewody i zakazu (mecz bez publiczności).</Text>}
      <Text style={[st.naglowek, { marginTop: 8 }]}>🧱 Sektor gości („klatka”)</Text>
      <Text style={[st.maly, { fontSize: 11 }]}>PZPN: gospodarz musi przyjąć zorganizowaną grupę gości — min. 5% udostępnionych miejsc, wydzielony sektor z trwałym ogrodzeniem min. 2,2 m. Na derby zwykle więcej.</Text>
      <View style={[st.wiersz, { gap: 6, flexWrap: "wrap", marginTop: 4 }]}>
        {[0, MIN_SEKTOR_GOSCI, 0.06, 0.08, 0.1, 0.15].map((p) => { const akt = (s.sektorGosciProcent ?? 0.06) === p; return (
          <Pressable key={p} onPress={() => { s.sektorGosciProcent = p; odswiez(); }} style={[st.chip, { marginBottom: 0 }, akt && st.chipAktywny]}>
            <Text style={{ color: akt ? "#17310f" : p === 0 ? K.czerwony : K.tekst, fontSize: 12, fontWeight: "700" }}>{p === 0 ? "Zamknięty ⚠" : `${Math.round(p * 100)}% · ${Math.round(k.pojemnosc * p).toLocaleString("pl")} miejsc`}</Text>
          </Pressable>); })}
      </View>
      {(s.sektorGosciProcent ?? 0.06) === 0 && k.poziom <= 4 && <Text style={[st.maly, { color: K.czerwony }]}>Zamknięcie sektora gości bez decyzji służb narusza wymogi PZPN — wysoka kara Komisji Licencyjnej po każdym meczu u siebie.</Text>}
      <Pressable onPress={() => { u.wsparcieOpraw = !u.wsparcieOpraw; odswiez(); }} style={[st.przyciskMaly, { marginTop: 8, alignItems: "flex-start", borderColor: u.wsparcieOpraw ? K.zielony : K.linia }]}>
        <Text style={st.przyciskMalyTekst}>{u.wsparcieOpraw ? "✅" : "⬜"} Wspieraj legalne oprawy (materiały, magazyn na flagi)</Text>
        <Text style={[st.maly, { fontSize: 11 }]}>Więcej sektorówek i dopingu, lepsze relacje z kibicami. Koszt zależny od frekwencji.</Text>
      </Pressable>
      <Text style={[st.maly, { marginTop: 8 }]}>Szacunek kosztu: zwykły mecz (~{typowo.toLocaleString("pl")} widzów) — {zwykly.ochroniarze} os., {zl(zwykly.koszt)}; mecz podwyższonego ryzyka (komplet) — {ryzyko.ochroniarze} os., {zl(ryzyko.koszt)}, policja ok. {ryzyko.policja} funkcjonariuszy, armatka wodna w gotowości.</Text>
      <Text style={[st.maly, { marginTop: 4 }]}>👮 Opinia policji o organizacji meczów: {Math.round(s.opiniaPolicji ?? 60)}/100</Text>
      {ost && (
        <View style={{ marginTop: 8 }}>
          <Text style={st.naglowek}>Ostatni mecz u siebie (z {ost.rywal})</Text>
          <Text style={st.maly}>{ost.widzowie.toLocaleString("pl")} widzów · {ost.ochroniarze} stewardów · policja {ost.policja} · koszt {zl(ost.koszt)}</Text>
          {ost.incydenty.length ? ost.incydenty.map((i, n) => <Text key={n} style={[st.maly, { color: i.typ === "oprawa" ? K.zielony : K.czerwony }]}>{i.typ === "oprawa" ? "🎆" : "🚨"} {i.min}' {i.opis}</Text>) : <Text style={[st.maly, { color: K.zielony }]}>✅ Bez incydentów.</Text>}
        </View>
      )}
    </View>
  );
}
