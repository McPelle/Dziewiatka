import { CoDzisWazne } from "./ZywySwiat";
import { Feta3D } from "./three/Trofea3D";
import { grafika3D } from "./three/Stadion3DWidok";
import { bilansZRywalem } from "../engine/zywySwiat";
import { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { jestDerby, jestPrzyjazn } from "../engine/derby";
import { bilansKolejki, ileKolejek, kosztObozu, latTrenera, mojaLiga, nowySezon, OBOZY, obozDostepny, premiaZaCel, przejmijKlub, przyjmijOferteTrenera, stylRywala, wolneKlubyDlaZwolnionego, wyslijNaOboz, zagrajKolejke } from "../engine/sezon";
import { tabelaLigi } from "../engine/swiat";
import { pogodaMeczu } from "../engine/pogoda";
import { dataKolejki } from "../engine/kalendarz";
import type { StanGry } from "../engine/types";
import { KarieraTrenera } from "./KarieraTrenera";
import { KontraktTrenera } from "./KontraktTrenera";
import { PanelDnia } from "./PanelDnia";
import { KonferencjaEkran } from "./Konferencja";
import { Finanse } from "./Finanse";
import { Scouting } from "./Scouting";
import { Sztab } from "./Sztab";
import { WidokKlubu } from "./WidokKlubu";
import { Herb } from "./Herb";
import { Twarz } from "./Twarz";
import { wybierzZdjecie } from "./zdjecie";
import { K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));

export function Pulpit({ s, odswiez, pokazMecz }: { s: StanGry; odswiez: () => void; pokazMecz: () => void }) {
  const [feta, setFeta] = useState<string | null>(null);
  const [widokKlub, setWidokKlub] = useState<string | null>(null);
  const [kariera, setKariera] = useState(false);
  const [scout, setScout] = useState<string | null>(null);
  const [sztabOtw, setSztabOtw] = useState(false);
  const [finanse, setFinanse] = useState(false);
  const [podglad, setPodglad] = useState(false);
  const [podgladP, setPodgladP] = useState(false);
  const klub = s.kluby[s.mojKlub];
  const liga = mojaLiga(s);
  const tabela = tabelaLigi(s, liga);
  const miejsce = tabela.findIndex((w) => w.klubId === s.mojKlub) + 1;
  const wiersz = tabela[miejsce - 1];
  const para = liga.terminarz[s.kolejka]?.find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
  const rywalId = para ? (para[0] === s.mojKlub ? para[1] : para[0]) : null;
  const bilans = bilansKolejki(s);
  const niedostepni = Object.entries(s.niedostepni);

  if (s.zwolniony) {
    const oferty = wolneKlubyDlaZwolnionego(s);
    const wygasl = s.powodWolny === "wygasl";
    return (
      <ScrollView style={st.ekran} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={st.karta}>
          <Text style={st.tytul}>{wygasl ? "Kontrakt wygasł — jesteś bez klubu" : "Zostałeś zwolniony"}</Text>
          <Text style={[st.maly, { marginTop: 6 }]}>
            {wygasl
              ? "Twoja umowa dobiegła końca i nie została przedłużona. Znajdź klub, który szuka trenera, i podpisz nowy kontrakt."
              : "Zarząd się z Tobą rozstał. Poniższe kluby szukają trenera — wybierz nowy klub i zacznij od nowa."}
          </Text>
          {s.trenerAgent ? <Text style={[st.maly, { marginTop: 6, color: K.niebieski }]}>📞 Twój agent {s.trenerAgent} załatwił rozmowy z klubami bez trenera.</Text> : null}
        </View>
        <Pressable style={[st.przyciskMaly, { marginHorizontal: 12, marginTop: 10, alignItems: "center", borderColor: K.niebieski }]} onPress={() => setKariera(true)}>
          <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>📋 Twoja kariera trenera</Text>
        </Pressable>
        {(s.ofertyTrenera ?? []).length > 0 && (
          <View>
            <Text style={[st.naglowek, { marginHorizontal: 14, marginTop: 14 }]}>📨 Oferty pracy (agent)</Text>
            {(s.ofertyTrenera ?? []).map((o, i) => { const kl = s.kluby[o.klubId]; if (!kl) return null; return (
              <Pressable key={o.klubId} style={[st.karta, st.wiersz, { marginTop: 8, borderColor: o.obecny ? K.akcent : K.linia, borderWidth: o.obecny ? 1 : 0 }]} onPress={() => { const b = przyjmijOferteTrenera(s, i); setKariera(false); odswiez(); if (b) komunikat(b); }}>
                <Herb klub={kl} rozmiar={40} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={st.tekst}>{kl.nazwa}{o.obecny ? "  · obecny klub" : ""}</Text>
                  <Text style={st.maly}>{s.ligi[kl.poziom - 1]?.nazwa} · {zl(o.pensja)}/sezon{o.lata ? ` · ${o.lata} sez.` : ""}</Text>
                </View>
                <Text style={{ color: K.akcent, fontWeight: "700" }}>{o.obecny ? "Zostań ›" : "Podpisz ›"}</Text>
              </Pressable>
            ); })}
          </View>
        )}
        <Text style={[st.naglowek, { marginHorizontal: 14, marginTop: 14 }]}>Kluby bez trenera</Text>
        {oferty.map((id) => (
          <Pressable key={id} style={[st.karta, st.wiersz, { marginTop: 8 }]} onPress={() => { przejmijKlub(s, id); setKariera(false); odswiez(); }}>
            <Herb klub={s.kluby[id]} rozmiar={40} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={st.tekst}>{s.kluby[id].nazwa}</Text>
              <Text style={st.maly}>{s.ligi[s.kluby[id].poziom - 1]?.nazwa}</Text>
            </View>
            <Text style={{ color: K.akcent, fontWeight: "700" }}>Podpisz ›</Text>
          </Pressable>
        ))}
        <KarieraTrenera s={s} widoczny={kariera} onClose={() => setKariera(false)} odswiez={odswiez} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={st.ekran} contentContainerStyle={{ paddingBottom: 24 }}>
      <Pressable style={[st.karta, st.wiersz]} onPress={() => setWidokKlub(klub.id)}>
        <Herb klub={klub} rozmiar={52} />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={st.tytul}>{klub.nazwa}</Text>
          <Text style={st.maly}>{liga.nazwa} · sezon {s.sezon}/{(s.sezon + 1) % 100} · trener {s.trener}</Text>
          {(klub.seria ?? 0) !== 0 && (() => { const se = klub.seria ?? 0; const dobra = se > 0; const n = Math.abs(se); return (
            <View style={{ marginTop: 5, alignSelf: "flex-start", backgroundColor: dobra ? "rgba(54,217,137,0.16)" : "rgba(255,100,112,0.16)", borderWidth: 1, borderColor: dobra ? K.zielony : K.czerwony, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: dobra ? K.zielony : K.czerwony, fontWeight: "800", fontSize: 12 }}>{dobra ? "🔥" : "🥶"} {dobra ? `${n} ${n === 1 ? "zwycięstwo" : n < 5 ? "zwycięstwa" : "zwycięstw"} z rzędu` : `${n} ${n < 5 ? "porażki" : "porażek"} z rzędu`}</Text>
            </View>
          ); })()}
        </View>
        <Text style={[st.maly, { color: K.niebieski }]}>✎</Text>
      </Pressable>

      <View style={[st.karta, st.wiersz, { marginTop: 8 }]}>
        <Pressable style={[st.wiersz, { flex: 1 }]} onPress={() => setKariera(true)}>
          <Twarz seed={s.trener} rozmiar={44} zdjecie={s.trenerZdjecie} jersey="#2b2f45" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={st.maly}>Trener · zobacz karierę ›</Text>
            <Text style={[st.tekst, { fontWeight: "700" }]}>{s.trener}{s.trenerLicencja ? <Text style={{ color: K.akcent }}>  🎓 UEFA {s.trenerLicencja}</Text> : null}</Text>
            <Text style={st.maly}>kontrakt do {s.trenerKontraktDo ?? "—"}{latTrenera(s) === 0 ? " (ostatni sezon)" : ""} · {zl(s.trenerPensja ?? 0)}/sezon</Text>
          </View>
        </Pressable>
        <Pressable style={[st.przyciskMaly, { borderColor: K.niebieski }]} onPress={async () => {
          const r = await wybierzZdjecie();
          if (r === "BRAK_PICKERA") { komunikat("Wgrywanie zdjęcia z telefonu wymaga pakietu expo-image-picker. Na komputerze (web) działa od razu."); return; }
          if (r) { s.trenerZdjecie = r; odswiez(); }
        }}>
          <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>📷 {s.trenerZdjecie ? "Zmień" : "Wgraj"}</Text>
        </Pressable>
        {s.trenerZdjecie ? (
          <Pressable style={[st.przyciskMaly, { marginLeft: 6, borderColor: K.czerwony }]} onPress={() => { s.trenerZdjecie = undefined; odswiez(); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Usuń</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable style={[st.karta, st.wiersz, { marginTop: 8, justifyContent: "space-between" }]} onPress={() => setSztabOtw(true)}>
        <Text style={[st.tekst, { fontWeight: "700" }]}>🧰 Sztab szkoleniowy</Text>
        <Text style={{ color: K.akcent, fontWeight: "700" }}>Zarządzaj ›</Text>
      </Pressable>

      <Pressable style={[st.karta, st.wiersz, { marginTop: 8, justifyContent: "space-between" }]} onPress={() => setFinanse(true)}>
        <Text style={[st.tekst, { fontWeight: "700" }]}>💰 Finanse{s.kluby[s.mojKlub]?.karaPunktowa ? "  ⚖️" : ""}</Text>
        <Text style={{ color: K.akcent, fontWeight: "700" }}>Podgląd ›</Text>
      </Pressable>

      <KontraktTrenera s={s} odswiez={odswiez} />

      {s.ofertyTrenera && s.ofertyTrenera.length > 0 && (
        <View style={[st.karta, { borderColor: K.akcent, borderWidth: 1 }]}>
          <Text style={st.naglowek}>📨 Oferty pracy dla Ciebie</Text>
          <Text style={[st.maly, { marginBottom: 6 }]}>Twoje wyniki zwróciły uwagę innych klubów. Przyjęcie oznacza odejście z {klub.nazwa}.</Text>
          {s.ofertyTrenera.map((o, i) => {
            const kl = s.kluby[o.klubId];
            if (!kl) return null;
            return (
              <View key={o.klubId} style={[st.wiersz, { paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }]}>
                <Herb klub={kl} rozmiar={28} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[st.tekst, { fontWeight: "700" }]} numberOfLines={1}>{kl.nazwa}</Text>
                  <Text style={st.maly}>{s.ligi[kl.poziom - 1]?.nazwa} · {zl(o.pensja)}/sezon</Text>
                </View>
                <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => {
                  const przejdz = () => { const b = przyjmijOferteTrenera(s, i); komunikat(b ?? `Przeniosłeś się do ${kl.nazwa}.`); odswiez(); };
                  if (Platform.OS === "web") { if (window.confirm(`Przyjąć ofertę ${kl.nazwa} i odejść z ${klub.nazwa}?`)) przejdz(); }
                  else Alert.alert("Zmiana klubu", `Przyjąć ofertę ${kl.nazwa} i odejść z ${klub.nazwa}?`, [{ text: "Anuluj", style: "cancel" }, { text: "Przyjmij", onPress: przejdz }]);
                }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Przyjmij ›</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <View style={st.karta}>
        <Text style={st.naglowek}>{s.koniecSezonu ? "Koniec sezonu" : `Kolejka ${s.kolejka + 1} z ${ileKolejek(s)}`}</Text>
        {!s.koniecSezonu && (() => {
          const kal = dataKolejki(s.sezon, ileKolejek(s), s.kolejka);
          return (
            <Text style={[st.maly, { marginTop: -2, marginBottom: 4 }]}>
              {kal.pierwszaWiosenna ? "❄️ Po przerwie zimowej · " : ""}{kal.tekst} · runda {kal.runda}
            </Text>
          );
        })()}
        {s.koniecSezonu ? (
          <Text style={st.tekst}>Zajęliście {miejsce}. miejsce ({wiersz.pkt} pkt).</Text>
        ) : rywalId ? (
          <View style={st.wiersz}>
            <Herb klub={s.kluby[rywalId]} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={st.tekst}>{para![0] === s.mojKlub ? "u siebie" : "na wyjeździe"}: {s.kluby[rywalId].nazwa}</Text>
              <Text style={st.maly}>rywal na {tabela.findIndex((w) => w.klubId === rywalId) + 1}. miejscu</Text>
              {(() => { const b = bilansZRywalem(s, s.kluby[rywalId]?.nazwa ?? ""); return b.mecze ? <Text style={st.maly}>📜 Bilans: {b.w}W {b.r}R {b.p}P{b.ostatni ? ` · ostatnio ${b.ostatni.my}:${b.ostatni.oni}` : ""}</Text> : <Text style={st.maly}>📜 Pierwszy mecz z tym rywalem w Twojej karierze</Text>; })()}
              {jestDerby(s, s.mojKlub, rywalId) ? (
                <View style={{ marginTop: 5, alignSelf: "flex-start", backgroundColor: "rgba(255,100,112,0.16)", borderWidth: 1, borderColor: K.czerwony, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: K.czerwony, fontWeight: "800", fontSize: 12 }}>⚔ {jestDerby(s, s.mojKlub, rywalId)} · mecz podwyższonego ryzyka</Text>
                </View>
              ) : jestPrzyjazn(s, s.mojKlub, rywalId) ? (
                <View style={{ marginTop: 5, alignSelf: "flex-start", backgroundColor: "rgba(54,217,137,0.16)", borderWidth: 1, borderColor: K.zielony, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: K.zielony, fontWeight: "800", fontSize: 12 }}>🤝 {jestPrzyjazn(s, s.mojKlub, rywalId)}</Text>
                </View>
              ) : null}
              <View style={[st.wiersz, { gap: 8, marginTop: 8, flexWrap: "wrap" }]}>
                <Pressable style={[st.przyciskMaly, { alignSelf: "flex-start", borderColor: K.niebieski }]} onPress={() => setScout(rywalId)}>
                  <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>🔍 Scouting rywala</Text>
                </Pressable>
                <Pressable style={[st.przyciskMaly, { alignSelf: "flex-start", borderColor: K.akcent }]} onPress={() => setPodglad((v) => !v)}>
                  <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>📋 Podgląd meczu {podglad ? "⌃" : "⌄"}</Text>
                </Pressable>
              </View>
              {podglad && (() => {
                const tab = tabelaLigi(s, liga);
                const wierszR = tab.find((w) => w.klubId === rywalId);
                const wierszMoj = tab.find((w) => w.klubId === s.mojKlub);
                const forma = (w?: typeof wierszR) => (w?.forma ?? []).slice(-5).join("") || "—";
                const seriaR = s.kluby[rywalId].seria ?? 0;
                const gospodarz = para![0];
                const pog = pogodaMeczu(s.kluby[gospodarz].miasto, s.kolejka, liga.terminarz.length);
                // H2H w tym sezonie
                const h2h: string[] = [];
                for (const kol of liga.wyniki) for (const w of kol ?? []) {
                  if ((w.dom === s.mojKlub && w.gosc === rywalId) || (w.dom === rywalId && w.gosc === s.mojKlub)) {
                    const uMnie = w.dom === s.mojKlub;
                    h2h.push(`${uMnie ? w.gd : w.gg}:${uMnie ? w.gg : w.gd}`);
                  }
                }
                const kluczowi = [...s.kluby[rywalId].zawodnicy].map((id) => s.zawodnicy[id]).filter(Boolean)
                  .sort((a, b) => b.umiej - a.umiej).slice(0, 4);
                return (
                  <View style={[st.karta, { marginTop: 8, backgroundColor: "rgba(255,255,255,0.03)" }]}>
                    <Text style={[st.tekst, { fontWeight: "800", marginBottom: 4 }]}>📋 {s.kluby[rywalId].nazwa}</Text>
                    <Text style={st.maly}>Pozycja: {tab.findIndex((w) => w.klubId === rywalId) + 1}. ({wierszR?.pkt ?? 0} pkt) · Ty: {tab.findIndex((w) => w.klubId === s.mojKlub) + 1}. ({wierszMoj?.pkt ?? 0} pkt)</Text>
                    <Text style={st.maly}>Forma rywala: <Text style={{ color: K.tekst, fontWeight: "700" }}>{forma(wierszR)}</Text> · Twoja: {forma(wierszMoj)}</Text>
                    <Text style={st.maly}>Styl gry rywala: <Text style={{ color: K.tekst, fontWeight: "700" }}>{stylRywala(s, rywalId)}</Text></Text>
                    {seriaR !== 0 && <Text style={[st.maly, { color: seriaR > 0 ? K.zielony : K.czerwony }]}>Passa rywala: {seriaR > 0 ? `🔥 ${seriaR} zwycięstw z rzędu` : `🥶 ${-seriaR} porażek z rzędu`}</Text>}
                    <Text style={st.maly}>Pogoda u gospodarza ({s.kluby[gospodarz].miasto}): {pog.ikona} {pog.nazwa}{pog.gole < 1 ? " — trudne warunki" : ""}</Text>
                    <Text style={st.maly}>Mecze w tym sezonie: {h2h.length ? h2h.join(", ") : "jeszcze nie graliście"}</Text>
                    <Text style={[st.maly, { marginTop: 4 }]}>Kluczowi zawodnicy rywala:</Text>
                    {kluczowi.map((z) => (
                      <Text key={z.id} style={st.maly}>  • {z.poz} {z.imie} {z.nazwisko} — OVR {Math.floor(z.umiej)}</Text>
                    ))}
                  </View>
                );
              })()}
            </View>
          </View>
        ) : (
          <Text style={st.tekst}>W tej kolejce pauzujecie.</Text>
        )}
        {niedostepni.length > 0 && !s.koniecSezonu && (
          <Text style={[st.maly, { marginTop: 8, color: K.akcent }]}>
            Nie przyjdą: {niedostepni.map(([id, p]) => `${s.zawodnicy[id].nazwisko} (${p})`).join(", ")}
          </Text>
        )}
      </View>

      {s.puchar && s.puchar.przeciwnik && (s.puchar.faza === "regionalny" || s.puchar.faza === "glowny") && (() => {
        const rid = s.puchar.przeciwnik!;
        const ryw = s.kluby[rid];
        if (!ryw) return null;
        const ligaR = s.ligi.find((l) => l.kluby.includes(rid));
        const tabR = ligaR ? tabelaLigi(s, ligaR) : [];
        const wR = tabR.find((w) => w.klubId === rid);
        const forma = (wR?.forma ?? []).slice(-5).join("") || "—";
        const seriaR = ryw.seria ?? 0;
        const teraz = s.puchar.harmonogram?.includes(s.kolejka);
        const pog = pogodaMeczu(ryw.miasto, s.kolejka, liga.terminarz.length);
        const kluczowi = [...ryw.zawodnicy].map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.umiej - a.umiej).slice(0, 4);
        return (
          <View style={st.karta}>
            <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "center" }]}>
              <Text style={st.naglowek}>🏆 Puchar — {s.puchar.nazwaRundy}</Text>
              <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => setPodgladP((v) => !v)}>
                <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Podgląd {podgladP ? "⌃" : "⌄"}</Text>
              </Pressable>
            </View>
            <View style={st.wiersz}>
              <Herb klub={ryw} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={st.tekst}>{ryw.nazwa}{teraz ? " — gracie w tej kolejce" : ""}</Text>
                <Text style={st.maly}>{ligaR?.nazwa ?? "?"}{wR ? ` · ${tabR.findIndex((w) => w.klubId === rid) + 1}. miejsce` : ""}</Text>
              </View>
            </View>
            {podgladP && (
              <View style={[st.karta, { marginTop: 8, backgroundColor: "rgba(255,255,255,0.03)" }]}>
                <Text style={st.maly}>Forma rywala: <Text style={{ color: K.tekst, fontWeight: "700" }}>{forma}</Text></Text>
                {seriaR !== 0 && <Text style={[st.maly, { color: seriaR > 0 ? K.zielony : K.czerwony }]}>Passa rywala: {seriaR > 0 ? `🔥 ${seriaR} zwycięstw z rzędu` : `🥶 ${-seriaR} porażek z rzędu`}</Text>}
                <Text style={st.maly}>Siła rywala (śr. OVR XI): {Math.round(kluczowi.reduce((a, z) => a + z.umiej, 0) / Math.max(1, kluczowi.length))}</Text>
                <Text style={st.maly}>Pogoda ({ryw.miasto}): {pog.ikona} {pog.nazwa}</Text>
                {s.puchar.sciezka && s.puchar.sciezka.length > 0 && (
                  <Text style={st.maly}>Wasza droga w pucharze: {s.puchar.sciezka.length} rund za sobą</Text>
                )}
                <Text style={[st.maly, { marginTop: 4 }]}>Kluczowi zawodnicy rywala:</Text>
                {kluczowi.map((z) => (
                  <Text key={z.id} style={st.maly}>  • {z.poz} {z.imie} {z.nazwisko} — OVR {Math.floor(z.umiej)}</Text>
                ))}
              </View>
            )}
          </View>
        );
      })()}

      {s.koniecSezonu ? (
        <Pressable style={st.przycisk} onPress={() => { nowySezon(s); const h = s.historia?.[s.historia.length - 1]; if (h && (h.wynik === "awans" || h.wynik === "mistrz" || h.puchar) && s.fetaSezon !== h.sezon) { s.fetaSezon = h.sezon; setFeta(h.wynik === "mistrz" ? "MISTRZOSTWO" : h.wynik === "awans" ? "AWANS" : h.puchar === "glowny" ? "PUCHAR POLSKI" : "PUCHAR ZPN"); } odswiez(); }}>
          <Text style={st.przyciskTekst}>Zakończ sezon — awanse i spadki ›</Text>
        </Pressable>
      ) : (
        <>
          {feta && Platform.OS === "web" && grafika3D() && (
            <Modal visible transparent animationType="fade" onRequestClose={() => setFeta(null)}>
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 14 }}>
                <Text style={{ color: K.akcent, fontSize: 30, fontWeight: "900", textAlign: "center", marginBottom: 8 }}>🏆 {feta}!</Text>
                <Feta3D s={s} klub={s.kluby[s.mojKlub]} tytul={feta === "AWANS" ? "Awans" : feta === "MISTRZOSTWO" ? "Mistrzostwo" : feta === "PUCHAR POLSKI" ? "Puchar Polski" : "Puchar"} />
                <Pressable style={st.przycisk} onPress={() => setFeta(null)}><Text style={st.przyciskTekst}>Świętujemy — dalej ›</Text></Pressable>
              </View>
            </Modal>
          )}
          <PanelDnia s={s} odswiez={odswiez} pokazMecz={() => { if (rywalId) pokazMecz(); }} />
          <CoDzisWazne s={s} />
        </>
      )}

      <View style={[st.karta, st.wiersz, { justifyContent: "space-between" }]}>
        <Stat nazwa="Miejsce" wartosc={`${miejsce}.`} />
        <Stat nazwa="Punkty" wartosc={`${wiersz.pkt}`} />
        <Stat nazwa="Bramki" wartosc={`${wiersz.bz}:${wiersz.bs}`} />
        <Stat nazwa="Forma" wartosc={wiersz.forma.slice(-5).join("") || "—"} />
      </View>

      <View style={st.karta}>
        <Text style={st.naglowek}>Zarząd · cel: {s.cel}</Text>
        {s.celDlugo && <Text style={[st.maly, { marginBottom: 4 }]}>🎯 Długofalowo: {s.celDlugo.opis} (do sezonu {s.celDlugo.doSezonu})</Text>}
        <View style={{ height: 10, backgroundColor: K.karta2, borderRadius: 5, overflow: "hidden" }}>
          <View style={{ width: `${s.zarzad}%`, height: 10, backgroundColor: s.zarzad > 50 ? K.zielony : s.zarzad > 25 ? K.akcent : K.czerwony }} />
        </View>
        <Text style={[st.maly, { marginTop: 6 }]}>Zaufanie zarządu: {Math.round(s.zarzad)}%</Text>
        {s.zaufanieKibicow != null && (
          <>
            <View style={{ height: 8, backgroundColor: K.karta2, borderRadius: 4, overflow: "hidden", marginTop: 6 }}>
              <View style={{ width: `${s.zaufanieKibicow}%`, height: 8, backgroundColor: s.zaufanieKibicow > 55 ? K.zielony : s.zaufanieKibicow > 30 ? K.akcent : K.czerwony }} />
            </View>
            <Text style={[st.maly, { marginTop: 4 }]}>❤ Zaufanie kibiców: {Math.round(s.zaufanieKibicow)}% <Text style={{ color: K.szary }}>(wpływa na frekwencję)</Text></Text>
          </>
        )}
        <Text style={[st.maly, { marginTop: 2 }]}>🎯 Za zrealizowanie celu: premia <Text style={{ color: K.akcent, fontWeight: "700" }}>{zl(premiaZaCel(s))}</Text> i wzrost zaufania.</Text>
      </View>

      {obozDostepny(s) && (
        <View style={st.karta}>
          <Text style={st.naglowek}>🏕 Przerwa — obóz piłkarski</Text>
          <Text style={[st.maly, { marginBottom: 6 }]}>Wyślij kadrę na zgrupowanie: rozwój (młodzi najwięcej), pełna forma i lepsze morale. Raz na sezon.</Text>
          {OBOZY.map((o, i) => (
            <View key={o.id} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[st.tekst, { fontSize: 14, fontWeight: "600" }]}>{o.nazwa}</Text>
                <Text style={st.maly}>{o.opis}</Text>
              </View>
              <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => { const b = wyslijNaOboz(s, i); odswiez(); if (b) komunikat(b); }}>
                <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>{kosztObozu(s, i) === 0 ? "Za darmo" : zl(kosztObozu(s, i))}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={st.karta}>
        <Text style={st.naglowek}>Finanse</Text>
        <Text style={[st.tytul, { color: klub.kasa < 0 ? K.czerwony : K.tekst }]}>{zl(klub.kasa)}</Text>
        <Text style={st.maly}>
          Na kolejkę: sponsor {zl(bilans.sponsor)} + bilety ~{zl(bilans.bilety)} − pensje {zl(bilans.pensje)} ={" "}
          <Text style={{ color: bilans.bilans < 0 ? K.czerwony : K.zielony }}>{zl(bilans.bilans)}</Text>
        </Text>
      </View>

      <View style={st.karta}>
        <Text style={st.naglowek}>Wiadomości</Text>
        {s.wiadomosci.slice(0, 12).map((w, i) => (
          <Text key={i} style={[st.maly, { color: i === 0 ? K.tekst : K.szary, marginBottom: 6 }]}>• {w.tekst}</Text>
        ))}
      </View>

      {s.historia.length > 0 && (
        <View style={st.karta}>
          <Text style={st.naglowek}>Historia kariery</Text>
          {s.historia.map((h) => (
            <Text key={h.sezon} style={st.maly}>
              {h.sezon}/{(h.sezon + 1) % 100}: {h.liga}, {h.miejsce}. miejsce {h.wynik === "awans" ? "⬆ awans" : h.wynik === "spadek" ? "⬇ spadek" : h.wynik === "mistrz" ? "🏆 mistrz Polski" : ""}
            </Text>
          ))}
        </View>
      )}
      <WidokKlubu s={s} klubId={widokKlub} onClose={() => setWidokKlub(null)} odswiez={odswiez} />
      <KarieraTrenera s={s} widoczny={kariera} onClose={() => setKariera(false)} odswiez={odswiez} />
      <Scouting s={s} rywalId={scout} onClose={() => setScout(null)} />
      <Sztab s={s} widoczny={sztabOtw} onClose={() => setSztabOtw(false)} odswiez={odswiez} />
      <Finanse s={s} widoczny={finanse} onClose={() => setFinanse(false)} />
      <KonferencjaEkran s={s} odswiez={odswiez} />
    </ScrollView>
  );
}

function Stat({ nazwa, wartosc }: { nazwa: string; wartosc: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={[st.tytul, { fontSize: 18 }]}>{wartosc}</Text>
      <Text style={st.maly}>{nazwa}</Text>
    </View>
  );
}
