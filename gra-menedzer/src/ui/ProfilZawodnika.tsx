import { NegocjacjeModal } from "./Transfery";
import { przelaczObserwowanego, wykupZWypozyczenia } from "../engine/transfery";
import { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { latDoKonca, oknoOtwarte, przedluzKontrakt, wykupKlauzula, wypozyczNaZewnatrz, zakonczWypozyczenieTeraz, zwolnijZawodnika } from "../engine/sezon";
import { dataKontraktu, dataUrodzenia, NAZWA_KONTRAKTU } from "../engine/swiat";
import type { Cecha, StanGry, Zawodnik } from "../engine/types";
import { ETYKIETA_ATRYB, kluczoweAtryby, SKILL } from "../engine/atrybuty";
import {
  ileIndywidualnych, ileNauki, limitIndywidualnych, limitNauki, pozycjeDoNauki, przerwijNauke,
  tempoNauki, ustawNaukePozycji, ustawTreningIndywidualny, usunTreningIndywidualny,
} from "../engine/trening";
import { etykietaPoz, ETYKIETA_POZ, SKROT_POZ } from "../data/pozycje";
import { roleDla, rolaZawodnika } from "../data/role";
import type { AtrybutKlucz } from "../engine/types";
import { narodowoscKraju } from "../data/narodowosci";
import { barwyKlubu } from "./barwy";
import { EdytorZawodnika } from "./EdytorZawodnika";
import { Rozmowa } from "./Rozmowa";
import { StrojZawodnika } from "./Stroje";
import { Twarz } from "./Twarz";
import { K, KOLOR_POZ, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
const NOGA_NAZWA: Record<string, string> = { prawa: "prawa", lewa: "lewa", obie: "obie (oburęczny)" };
const CECHA_NAZWA: Record<Cecha, string> = {
  snajper: "⚽ Snajper", egzekutor: "🎯 Egzekutor karnych", lider: "🫅 Lider szatni",
  talent: "🌟 Młody talent", mur: "🧱 Mur obrony", szybki: "⚡ Błyskawiczny", weteran: "🧠 Weteran",
  nerwowy: "🤬 Nerwowy", kontuzjogenny: "🩹 Podatny na kontuzje", bigmecz: "🔥 Gracz na wielkie mecze",
  profesjonalista: "💎 Profesjonalista", lojalny: "🤝 Lojalny klubowi", niespokojny: "✈️ Niespokojny duch",
};

/** Paski atrybutów zawodnika (kluczowe podświetlone) + przywództwo. */
function Atrybuty({ z }: { z: Zawodnik }) {
  if (!z.atrybuty) return null;
  const klucz = new Set(kluczoweAtryby(z.poz));
  const kolor = (v: number) => (v >= 75 ? K.zielony : v >= 55 ? K.akcent : v >= 38 ? K.tekst : K.szary);
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={st.naglowek}>Atrybuty</Text>
      {SKILL.map((k) => {
        const v = Math.round(z.atrybuty![k]);
        const key = klucz.has(k);
        return (
          <View key={k} style={[st.wiersz, { alignItems: "center", gap: 8, paddingVertical: 2 }]}>
            <Text style={[st.maly, { width: 108, color: key ? K.tekst : K.szary, fontWeight: key ? "700" : "400" }]} numberOfLines={1}>
              {key ? "★ " : ""}{ETYKIETA_ATRYB[k]}
            </Text>
            <View style={{ flex: 1, height: 7, backgroundColor: K.linia, borderRadius: 4, overflow: "hidden" }}>
              <View style={{ width: `${Math.min(100, v)}%`, height: 7, backgroundColor: kolor(v) }} />
            </View>
            <Text style={[st.tekst, { width: 26, textAlign: "right", fontWeight: "700", fontSize: 13 }]}>{v}</Text>
          </View>
        );
      })}
      <View style={[st.wiersz, { alignItems: "center", gap: 8, paddingVertical: 3, borderTopWidth: 1, borderTopColor: K.linia, marginTop: 3 }]}>
        <Text style={[st.maly, { width: 108, fontWeight: "700" }]}>👑 Przywództwo</Text>
        <View style={{ flex: 1, height: 7, backgroundColor: K.linia, borderRadius: 4, overflow: "hidden" }}>
          <View style={{ width: `${Math.min(100, Math.round(z.atrybuty.prz))}%`, height: 7, backgroundColor: kolor(z.atrybuty.prz) }} />
        </View>
        <Text style={[st.tekst, { width: 26, textAlign: "right", fontWeight: "700", fontSize: 13 }]}>{Math.round(z.atrybuty.prz)}</Text>
      </View>
    </View>
  );
}

function Wiersz({ etyk, wart, kolor }: { etyk: string; wart: string; kolor?: string }) {
  return (
    <View style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]}>
      <Text style={st.maly}>{etyk}</Text>
      <Text style={[st.tekst, { fontSize: 14, fontWeight: "600", color: kolor ?? K.tekst }]}>{wart}</Text>
    </View>
  );
}

/** Wykres rozwoju umiejętności (słupki co sezon + bieżąca) z linią potencjału. */
function WykresRozwoju({ z }: { z: Zawodnik }) {
  const H = 72;
  const dane = [...(z.rozwoj ?? []), Math.round(z.umiej * 10) / 10];
  const min = Math.floor(Math.min(...dane, z.potencjal) - 1);
  const max = Math.ceil(Math.max(...dane, z.potencjal) + 0.5);
  const zakres = Math.max(1, max - min);
  const wys = (v: number) => Math.max(3, ((v - min) / zakres) * H);
  const start = dane[0], teraz = dane[dane.length - 1];
  const przyrost = Math.round((teraz - start) * 10) / 10;
  const linPot = H - (wys(z.potencjal));
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={st.naglowek}>Rozwój umiejętności</Text>
      <View style={{ height: H, flexDirection: "row", alignItems: "flex-end", gap: 3, position: "relative", marginTop: 4 }}>
        {/* linia potencjału */}
        <View style={{ position: "absolute", left: 0, right: 0, top: Math.max(0, linPot), height: 1, backgroundColor: K.akcent, opacity: 0.55 }} />
        {dane.map((v, i) => {
          const ostatni = i === dane.length - 1;
          const kolor = ostatni ? K.akcent : v >= start ? K.zielony : K.szary;
          return <View key={i} style={{ flex: 1, height: wys(v), backgroundColor: kolor, borderTopLeftRadius: 3, borderTopRightRadius: 3, opacity: ostatni ? 1 : 0.8 }} />;
        })}
      </View>
      <View style={[st.wiersz, { justifyContent: "space-between", marginTop: 4 }]}>
        <Text style={st.maly}>Start {Math.floor(start)} → teraz {Math.floor(teraz)} {przyrost !== 0 && <Text style={{ color: przyrost > 0 ? K.zielony : K.czerwony, fontWeight: "700" }}>({przyrost > 0 ? "+" : ""}{przyrost})</Text>}</Text>
        <Text style={st.maly}>Potencjał <Text style={{ color: K.akcent, fontWeight: "700" }}>{Math.floor(z.potencjal)}</Text></Text>
      </View>
      {dane.length < 2 && <Text style={[st.maly, { marginTop: 2 }]}>Słupki przybędą po każdym sezonie — tu zobaczysz krzywą rozwoju.</Text>}
    </View>
  );
}

export function ProfilZawodnika({ s, zawodnikId, onClose, odswiez }: { s: StanGry; zawodnikId: string | null; onClose: () => void; odswiez: () => void }) {
  const z: Zawodnik | undefined = zawodnikId ? s.zawodnicy[zawodnikId] : undefined;
  const [edycja, setEdycja] = useState(false);
  const [rozmowa, setRozmowa] = useState(false);
  const widoczny = !!z;
  const mojKlubowicz = z?.klubId === s.mojKlub;
  const [oferta, setOferta] = useState(false);
  const moraleKolor = !z ? K.tekst : z.morale > 65 ? K.zielony : z.morale > 35 ? K.akcent : K.czerwony;

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "88%", paddingBottom: 20 }}>
          {z && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "flex-start", gap: 10 }]}>
                <Twarz seed={z.imie + z.nazwisko} rozmiar={54} zdjecie={z.zdjecie} cechy={z.twarz} kraj={z.kraj} jersey={z.klubId && s.kluby[z.klubId] ? barwyKlubu(s.kluby[z.klubId].nazwa)[0] : "#1f7a43"} />
                <View style={{ flex: 1 }}>
                  <Text style={st.tytul}>#{z.numer || "—"} {z.imie} {z.nazwisko}</Text>
                  <Text style={[st.maly, { marginTop: 2 }]}>
                    <Text style={{ color: KOLOR_POZ[z.poz], fontWeight: "700" }}>{etykietaPoz(z.poz, z.pozS)}</Text>{z.pozycjeDodatkowe?.length ? <Text style={{ color: K.niebieski }}> (też: {z.pozycjeDodatkowe.map((p) => SKROT_POZ[p]).join(", ")})</Text> : null} · {narodowoscKraju(z.kraj)?.flaga ?? "🇵🇱"} {z.kraj ?? "Polska"}{z.kraj && !narodowoscKraju(z.kraj)?.ue ? " (spoza UE)" : ""} · noga {NOGA_NAZWA[z.noga]}
                  </Text>
                  <Text style={[st.maly, { marginTop: 2 }]}>
                    🎂 ur. <Text style={{ fontWeight: "700", color: K.tekst }}>{dataUrodzenia(z, s.sezon)}</Text> ({z.wiek} {z.wiek % 10 >= 2 && z.wiek % 10 <= 4 && (z.wiek % 100 < 12 || z.wiek % 100 > 14) ? "lata" : "lat"}){z.wzrost ? ` · ${z.wzrost} cm` : ""}{z.realny && z.wartoscReal ? ` · realna wycena (start gry): ${z.wartoscReal >= 1e6 ? (z.wartoscReal / 1e6).toLocaleString("pl-PL") + " mln €" : Math.round(z.wartoscReal / 1e3) + " tys. €"}` : ""}
                  </Text>
                  <View style={[st.wiersz, { marginTop: 8, gap: 4, alignItems: "flex-end" }]}>
                    <Text style={{ color: K.akcent, fontSize: 26, fontWeight: "900" }}>{Math.floor(z.umiej)}</Text>
                    <Text style={[st.maly, { fontSize: 10, marginBottom: 3 }]}>OVERALL</Text>
                    <Text style={[st.maly, { fontSize: 11, marginBottom: 3 }]}>/ pot. {Math.floor(z.potencjal)}</Text>
                  </View>
                  {z.cechy && z.cechy.length > 0 && (
                    <View style={[st.wiersz, { flexWrap: "wrap", gap: 4, marginTop: 6 }]}>
                      {z.cechy.map((c) => (
                        <Text key={c} style={{ fontSize: 10, fontWeight: "700", color: K.akcent, borderWidth: 1, borderColor: K.akcent, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }}>
                          {CECHA_NAZWA[c]}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                {z.klubId && s.kluby[z.klubId] && (
                  <StrojZawodnika s={s} klub={s.kluby[z.klubId]} numer={z.numer} nazwisko={z.nazwisko} bramkarz={z.poz === "BR"} />
                )}
              </View>
              <View style={[st.wiersz, { gap: 10, marginTop: 12 }]}>
                {mojKlubowicz && (
                  <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.zielony }]} onPress={() => setRozmowa(true)}>
                    <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>💬 Porozmawiaj</Text>
                  </Pressable>
                )}
                <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.niebieski }]} onPress={() => setEdycja(true)}>
                  <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>✎ Edytuj zawodnika</Text>
                </Pressable>
              </View>

              {!mojKlubowicz && !s.zwolniony && (z.klubId ? !s.kluby[z.klubId]?.pozaLiga : true) && (
                <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center", borderColor: K.zielony }]} onPress={() => setOferta(true)}>
                  <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>💼 Złóż ofertę {z.klubId ? `(${s.kluby[z.klubId]?.nazwa})` : "(wolny zawodnik)"}</Text>
                </Pressable>
              )}
              <NegocjacjeModal s={s} z={oferta ? z : null} onClose={() => setOferta(false)} odswiez={odswiez} />

              {mojKlubowicz && z.wykup && (
                <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center", borderColor: K.akcent }]}
                  onPress={() => { const b = wykupZWypozyczenia(s, z.id); odswiez(); komunikat(b ?? `Wykupiony: ${z.imie} ${z.nazwisko} zostaje na stałe.`); }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>🔁 {z.wykup.obowiazek ? "Wykup teraz (obowiązek po sezonie)" : "Skorzystaj z opcji wykupu"} — {zl(z.wykup.kwota)}</Text>
                </Pressable>
              )}
              {!mojKlubowicz && (
                <Pressable style={{ marginTop: 8, alignItems: "center" }} onPress={() => { przelaczObserwowanego(s, z.id); odswiez(); }}>
                  <Text style={[st.maly, { color: K.akcent }]}>{(s.obserwowani ?? []).includes(z.id) ? "⭐ Obserwowany — dotknij, by usunąć" : "☆ Dodaj do obserwowanych"}</Text>
                </Pressable>
              )}
              {!mojKlubowicz && z.klauzula && z.klubId && oknoOtwarte(s) && (
                <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center", borderColor: K.akcent }]}
                  onPress={() => { const b = wykupKlauzula(s, z.id); odswiez(); if (b) komunikat(b); else { komunikat(`Klauzula aktywowana — ${z.imie} ${z.nazwisko} dołącza do klubu.`); onClose(); } }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>💸 Zapłać klauzulę wykupu ({zl(z.klauzula)})</Text>
                </Pressable>
              )}

              <View style={{ marginTop: 14 }}>
                {z.wychowanek && <Wiersz etyk="Wychowanek" wart={`🎓 ${z.wychowanek}${z.pochodzenie ? ` · ${z.pochodzenie}` : ""}`} kolor={K.zielony} />}
                {!z.wychowanek && z.pochodzenie && <Wiersz etyk="Pochodzenie" wart={z.pochodzenie} />}
                {z.reprezentant && <Wiersz etyk="Reprezentacja" wart={`🏟 ${z.reprezentant}`} kolor={K.akcent} />}
                {z.jun && z.jun.m > 0 && <Wiersz etyk={`Liga juniorów ${z.jun.kat} (sezon)`} wart={`${z.jun.m} m. · ${z.jun.g} g. · ${z.jun.a} as. · śr. ${(z.jun.oc / z.jun.m).toFixed(1)}${z.jun.wyr ? ` · ⭐×${z.jun.wyr}` : ""}`} kolor={K.zielony} />}
                {(z.junKariera ?? []).map((j, i) => <Wiersz key={i} etyk={`Juniorzy ${j.kat} ${j.sezon}/${(j.sezon + 1) % 100}`} wart={`${j.m} m. · ${j.g} g. · ${j.a} as. · śr. ${j.sr}`} />)}
                <Wiersz etyk="Morale" wart={`${Math.round(z.morale)}%${z.prosiOTransfer ? " — chce odejść" : ""}`} kolor={moraleKolor} />
                <Wiersz etyk="Kondycja" wart={`${Math.round(z.kondycja)}%`} />
                {z.klubId === s.mojKlub && <Wiersz etyk="Zgranie z drużyną" wart={`${Math.round(z.zgranie ?? 80)}%${(z.zgranie ?? 80) < 55 ? "  — wciąż się wgrywa" : (z.zgranie ?? 80) >= 90 ? "  — w pełni zgrany" : ""}`} kolor={(z.zgranie ?? 80) >= 75 ? K.zielony : (z.zgranie ?? 80) >= 50 ? K.akcent : K.czerwony} />}
                <Wiersz etyk="Forma" wart={`${z.forma > 0 ? "+" : ""}${z.forma.toFixed(1)}${z.forma >= 3 ? "  🔥 gorąca passa" : z.forma <= -3 ? "  🥶 słaba passa" : ""}`} kolor={z.forma >= 3 ? K.zielony : z.forma <= -3 ? K.czerwony : K.tekst} />
                {z.ocenaMeczu != null && <Wiersz etyk="Ocena ostatniego meczu" wart={`${z.ocenaMeczu.toFixed(1)} / 10`} kolor={z.ocenaMeczu >= 7 ? K.zielony : z.ocenaMeczu >= 5.5 ? K.akcent : K.czerwony} />}
                <Wiersz etyk="Kontrakt" wart={`${NAZWA_KONTRAKTU[z.kontraktTyp]} · do ${dataKontraktu(z.kontraktDo)}${latDoKonca(s, z) <= 1 && z.klubId ? " (ostatni sezon)" : ""}`} />
                <Wiersz etyk="Pensja" wart={`${zl(z.pensja)}/kolejkę`} />
                <Wiersz etyk="Agent" wart={z.agent ?? "brak (zawodnik bez agenta)"} kolor={z.agent ? K.tekst : K.szary} />
                {z.podatnosc != null && (
                  <Wiersz
                    etyk="Podatność na urazy"
                    wart={`${z.podatnosc >= 1.25 ? "wysoka (szklany)" : z.podatnosc >= 1.05 ? "podwyższona" : z.podatnosc <= 0.95 ? "niska (odporny)" : "przeciętna"}${z.urazy ? ` · urazów w karierze: ${z.urazy}` : ""}`}
                    kolor={z.podatnosc >= 1.25 ? K.czerwony : z.podatnosc <= 0.95 ? K.zielony : K.tekst}
                  />
                )}
                {z.klauzula ? <Wiersz etyk="Klauzula wykupu" wart={zl(z.klauzula)} kolor={K.akcent} /> : null}
                {z.macierzysty && (
                  <Wiersz
                    etyk="Wypożyczenie"
                    kolor={K.niebieski}
                    wart={z.macierzysty === s.mojKlub
                      ? `oddany do ${z.klubId ? s.kluby[z.klubId].nazwa : "?"} (wraca ${(z.wypozyczenieDo ?? s.sezon) + 1})`
                      : `u Was z ${s.kluby[z.macierzysty]?.nazwa ?? "?"} (wraca ${(z.wypozyczenieDo ?? s.sezon) + 1})`}
                  />
                )}
                {z.doplataMacierzystego ? <Wiersz etyk="Dopłata macierzystego" wart={`${zl(z.doplataMacierzystego)}/kolejkę`} /> : null}
                <Wiersz etyk="W sezonie" wart={`${z.mecze} mecz. · ${z.gole} gol. · 🟨${z.kartki}${z.zawieszenie ? ` · ⛔${z.zawieszenie}` : ""}`} />
                {z.kontuzja > 0 && <Wiersz etyk="Kontuzja" wart={`${z.kontuzja} kolejki`} kolor={K.czerwony} />}
              </View>

              <Atrybuty z={z} />

              {mojKlubowicz && (() => {
                const ATRYBUTY: AtrybutKlucz[] = [...SKILL, "prz"];
                return (
                  <View style={{ marginTop: 14 }}>
                    <Text style={st.naglowek}>🏋 Trening indywidualny</Text>
                    <Text style={st.maly}>Dodatkowy, szybszy rozwój wybranej cechy ({ileIndywidualnych(s)}/{limitIndywidualnych(s)} podopiecznych).</Text>
                    <View style={[st.wiersz, { flexWrap: "wrap", gap: 6, marginTop: 6 }]}>
                      {ATRYBUTY.map((k) => {
                        const akt = z.treningIndywidualny === k;
                        return (
                          <Pressable key={k} style={[st.chip, akt && st.chipAktywny]} onPress={() => {
                            if (akt) usunTreningIndywidualny(s, z.id);
                            else { const b = ustawTreningIndywidualny(s, z.id, k); if (b) komunikat(b); }
                            odswiez();
                          }}>
                            <Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600", fontSize: 12 }}>{ETYKIETA_ATRYB[k]}</Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text style={[st.naglowek, { marginTop: 12 }]}>🎓 Nauka nowej pozycji</Text>
                    {z.naukaPozycji ? (
                      <View>
                        <Text style={st.maly}>Uczy się: <Text style={{ color: K.niebieski, fontWeight: "700" }}>{ETYKIETA_POZ[z.naukaPozycji.poz]} ({SKROT_POZ[z.naukaPozycji.poz]})</Text> · {Math.floor(z.naukaPozycji.postep)}% · ~{Math.max(1, Math.ceil((100 - z.naukaPozycji.postep) / Math.max(0.1, tempoNauki(s, z))))} tyg.</Text>
                        <View style={{ height: 6, backgroundColor: K.linia, borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                          <View style={{ width: `${Math.min(100, Math.floor(z.naukaPozycji.postep))}%`, height: 6, backgroundColor: K.niebieski }} />
                        </View>
                        <Pressable style={[st.przyciskMaly, { marginTop: 6, borderColor: K.czerwony, alignSelf: "flex-start" }]} onPress={() => { przerwijNauke(s, z.id); odswiez(); }}>
                          <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Przerwij naukę</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <>
                        <Text style={st.maly}>Po kilkunastu tygodniach zyska pozycję, nie tracąc dotychczasowych ({ileNauki(s)}/{limitNauki(s)}).</Text>
                        <View style={[st.wiersz, { flexWrap: "wrap", gap: 6, marginTop: 6 }]}>
                          {pozycjeDoNauki(z).map((p) => (
                            <Pressable key={p} style={st.chip} onPress={() => { const b = ustawNaukePozycji(s, z.id, p); if (b) komunikat(b); odswiez(); }}>
                              <Text style={{ color: K.tekst, fontWeight: "600", fontSize: 12 }}>{SKROT_POZ[p]} · {ETYKIETA_POZ[p]}</Text>
                            </Pressable>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                );
              })()}

              <WykresRozwoju z={z} />

              <Text style={[st.naglowek, { marginTop: 16 }]}>Historia kariery</Text>
              {(() => {
                let sumM = 0, sumG = 0;
                return (
                  <>
                    {z.kariera.map((w, i) => {
                      const obecny = w.do === null;
                      const m = w.mecze + (obecny ? z.mecze : 0);
                      const g = w.gole + (obecny ? z.gole : 0);
                      sumM += m; sumG += g;
                      const lata = obecny ? `${w.od}–teraz` : w.od === w.do ? `${w.od}` : `${w.od}–${w.do}`;
                      return (
                        <View key={i} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={[st.tekst, { fontSize: 14, fontWeight: obecny ? "700" : "400", color: obecny ? K.tekst : K.szary }]} numberOfLines={1}>
                              {obecny ? "▸ " : "• "}{w.klub}
                            </Text>
                            <Text style={st.maly}>{lata}</Text>
                          </View>
                          <Text style={[st.tekst, { fontSize: 13, color: obecny ? K.tekst : K.szary }]}>
                            {m} {m === 1 ? "mecz" : "mecz."}{z.poz !== "BR" ? ` · ${g} gol${g === 1 ? "" : g % 10 >= 2 && g % 10 <= 4 && (g < 10 || g > 20) ? "e" : "i"}` : ""}
                          </Text>
                        </View>
                      );
                    })}
                    {z.kariera.length > 1 && (
                      <View style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 2, borderTopColor: K.linia, marginTop: 2 }]}>
                        <Text style={[st.tekst, { fontWeight: "800" }]}>Łącznie w karierze</Text>
                        <Text style={[st.tekst, { fontWeight: "800" }]}>{sumM} mecz.{z.poz !== "BR" ? ` · ${sumG} gol.` : ""}</Text>
                      </View>
                    )}
                    {z.kariera.length === 0 && <Text style={st.maly}>Wychowanek klubu — zaczyna karierę.</Text>}
                  </>
                );
              })()}

              {mojKlubowicz && (
                <Pressable style={[st.przyciskMaly, { marginTop: 16, alignItems: "center", borderColor: s.kapitan === z.id ? K.akcent : K.linia }]}
                  onPress={() => { s.kapitan = z.id; odswiez(); }}>
                  <Text style={[st.przyciskMalyTekst, { color: s.kapitan === z.id ? K.akcent : K.tekst }]}>
                    {s.kapitan === z.id ? "⭐ Kapitan drużyny" : "Mianuj kapitanem"}
                  </Text>
                </Pressable>
              )}
              {mojKlubowicz && (() => {
                const role = roleDla(z); if (!role.length) return null;
                const akt = rolaZawodnika(s, z);
                return (
                  <View style={{ marginTop: 14 }}>
                    <Text style={st.naglowek}>Rola taktyczna</Text>
                    <View style={[st.wiersz, { flexWrap: "wrap" }]}>
                      {role.map((r) => {
                        const wybrana = akt?.kod === r.kod;
                        return (
                          <Pressable key={r.kod} onPress={() => { s.taktyka.role = { ...(s.taktyka.role ?? {}), [z.id]: r.kod }; odswiez(); }} style={[st.chip, wybrana && st.chipAktywny]}>
                            <Text style={{ color: wybrana ? "#17310f" : K.tekst, fontWeight: "600", fontSize: 12 }}>{r.nazwa}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {akt && <Text style={[st.maly, { marginTop: 2 }]}>{akt.opis}</Text>}
                  </View>
                );
              })()}
              {mojKlubowicz && !z.macierzysty && (
                <View style={[st.wiersz, { marginTop: 10, gap: 10 }]}>
                  <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.akcent }]}
                    onPress={() => { const b = przedluzKontrakt(s, z.id); odswiez(); komunikat(b ?? "Kontrakt przedłużony."); }}>
                    <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Przedłuż kontrakt</Text>
                  </Pressable>
                  <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.czerwony }]}
                    onPress={() => { const b = zwolnijZawodnika(s, z.id); odswiez(); if (b) komunikat(b); else onClose(); }}>
                    <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Rozwiąż umowę</Text>
                  </Pressable>
                </View>
              )}
              {/* Wypożyczenie swojego zawodnika do mniejszego klubu */}
              {mojKlubowicz && !z.macierzysty && (
                <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center", borderColor: K.niebieski }]}
                  onPress={() => { const b = wypozyczNaZewnatrz(s, z.id); odswiez(); if (b) komunikat(b); else onClose(); }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>🔁 Wypożycz do innego klubu</Text>
                </Pressable>
              )}
              {/* Zakończ wypożyczenie natychmiast (gracz u Ciebie z innego klubu, albo Twój oddany) */}
              {z.macierzysty && (z.klubId === s.mojKlub || z.macierzysty === s.mojKlub) && (
                <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center", borderColor: K.akcent }]}
                  onPress={() => { const b = zakonczWypozyczenieTeraz(s, z.id); odswiez(); if (b) komunikat(b); else onClose(); }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>
                    {z.macierzysty === s.mojKlub ? "↩ Odwołaj z wypożyczenia" : "↩ Zakończ wypożyczenie (oddaj wcześniej)"}
                  </Text>
                </Pressable>
              )}

              <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 14 }]} onPress={onClose}>
                <Text style={st.przyciskTekst}>Zamknij</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
      <EdytorZawodnika s={s} zawodnikId={edycja ? zawodnikId : null} onClose={() => setEdycja(false)} odswiez={odswiez} />
      <Rozmowa s={s} z={z} widoczny={rozmowa} onClose={() => setRozmowa(false)} odswiez={odswiez} />
    </Modal>
  );
}
