import { useState } from "react";
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { POZYCJE } from "../engine/mecz";
import { bilansKolejki, cenaKupna, cenaWywolawcza, ffpStan, kup, latDoKonca, negocjujTransfer, oknoInfo, oknoOtwarte, oplataWypozyczenia, pensjaPoTransferze, przedluzKontrakt, przyjmijOferte, rynek, rynekWypozyczen, statusOkna, sugerowanaCenaSprzedazy, wypozyczDoSiebie, wystawNaSprzedaz, zadaniePlacowe, zakonczWypozyczenieTeraz, zdejmijZeSprzedazy } from "../engine/sezon";
import { ileTestowanych, limitTestow, mozeTesty, odeslijZTestow, podpiszZTestow, raportTestu, rynekTestow, wezNaTesty } from "../engine/testy";
import { dataKontraktu, NAZWA_KONTRAKTU, wartosc } from "../engine/swiat";
import { KAT_POZ, SKROT_POZ, ETYKIETA_POZ } from "../data/pozycje";
import type { OfertaTransferu, WynikNegocjacji } from "../engine/sezon";
import type { Pozycja, PozycjaSzczegolowa, StanGry, Zawodnik } from "../engine/types";
import { K, KOLOR_POZ, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("Transfer", t));

type Zrodlo = "wolni" | "kluby" | "wypozyczenia" | "sprzedaz";
const ZRODLA: [Zrodlo, string][] = [["wolni", "Bez klubu"], ["kluby", "Z klubów"], ["wypozyczenia", "🔁 Wypożycz"], ["sprzedaz", "🏷 Sprzedaj"]];
const WIEK_OPCJE: [string, string, [number, number]][] = [
  ["dowolny", "Każdy wiek", [0, 99]], ["u19", "≤19", [0, 19]], ["u21", "≤21", [0, 21]],
  ["u23", "≤23", [0, 23]], ["u27", "≤27", [0, 27]], ["u30", "≤30", [0, 30]], ["30+", "31+", [31, 99]],
];
const CENA_OPCJE: [string, string, number | null][] = [
  ["dowolna", "Każda cena", null], ["darmo", "Za darmo", 0], ["100", "do 100 tys.", 100000],
  ["250", "do 250 tys.", 250000], ["500", "do 500 tys.", 500000], ["1000", "do 1 mln", 1000000], ["budzet", "W budżecie", -1],
];
const SORT_OPCJE: [string, string][] = [["ovr", "OVR"], ["pot", "Potencjał"], ["mlodzi", "Najmłodsi"], ["tanio", "Najtańsi"], ["talent", "Talent"]];

function FChip({ akt, label, onPress }: { akt: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[st.chip, { paddingVertical: 5, paddingHorizontal: 10, marginRight: 6, marginBottom: 6 }, akt && st.chipAktywny]}>
      <Text style={{ color: akt ? "#15300c" : K.tekst, fontWeight: "700", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

export function Transfery({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [zrodlo, setZrodlo] = useState<Zrodlo>("wolni");
  const [kat, setKat] = useState<Pozycja | "wszyscy">("wszyscy");
  const [pozS, setPozS] = useState<PozycjaSzczegolowa | null>(null);
  const [wiekKey, setWiekKey] = useState("dowolny");
  const [cenaKey, setCenaKey] = useState("dowolna");
  const [tylkoWygasa, setTylkoWygasa] = useState(false);
  const [sort, setSort] = useState("ovr");
  const [neg, setNeg] = useState<Zawodnik | null>(null);

  const klub = s.kluby[s.mojKlub];
  const r = rynek(s);
  const wyp = zrodlo === "wypozyczenia";
  const sprzedaz = zrodlo === "sprzedaz";
  const [, , wiekZakres] = WIEK_OPCJE.find((o) => o[0] === wiekKey)!;
  const cenaMax = CENA_OPCJE.find((o) => o[0] === cenaKey)![2];

  const cenaZa = (z: Zawodnik): number => {
    if (wyp) { const p = z.klubId ? s.kluby[z.klubId] : undefined; return p && p.poziom < klub.poziom ? 0 : oplataWypozyczenia(s, z); }
    return cenaKupna(s, z.id);
  };

  // Źródło listy.
  let baza: Zawodnik[];
  if (sprzedaz) baza = klub.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && !z.macierzysty);
  else if (wyp) baza = rynekWypozyczen(s);
  else baza = zrodlo === "wolni" ? r.wolni : r.zKlubow;

  // Filtry.
  let lista = baza.filter((z) => {
    if (kat !== "wszyscy" && z.poz !== kat) return false;
    if (pozS && z.pozS !== pozS) return false;
    if (z.wiek < wiekZakres[0] || z.wiek > wiekZakres[1]) return false;
    if (!sprzedaz && cenaMax !== null) {
      const c = cenaZa(z);
      if (cenaMax === 0 && c !== 0) return false;
      if (cenaMax === -1 && c > klub.kasa) return false;
      if (cenaMax > 0 && c > cenaMax) return false;
    }
    if (tylkoWygasa && !sprzedaz && zrodlo === "kluby" && !(z.klubId && latDoKonca(s, z) <= 1)) return false;
    return true;
  });
  // Sortowanie.
  const klucz: Record<string, (z: Zawodnik) => number> = {
    ovr: (z) => -z.umiej, pot: (z) => -z.potencjal, mlodzi: (z) => z.wiek,
    tanio: (z) => cenaZa(z), talent: (z) => -(z.potencjal - z.umiej),
  };
  lista = [...lista].sort((a, b) => klucz[sort](a) - klucz[sort](b)).slice(0, 120);

  const koncza = klub.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => latDoKonca(s, z) <= 1).sort((a, b) => a.kontraktDo - b.kontraktDo);
  const wypozyczeni = Object.values(s.zawodnicy).filter((z) => z.macierzysty === s.mojKlub && z.klubId !== s.mojKlub);

  const kupuj = (z: Zawodnik) => { const blad = wyp ? wypozyczDoSiebie(s, z.id) : kup(s, z.id); odswiez(); if (blad) komunikat(blad); };

  // Pozycje szczegółowe w wybranej kategorii.
  const pozSWKat = kat === "wszyscy" ? [] : (Object.keys(SKROT_POZ) as PozycjaSzczegolowa[]).filter((p) => KAT_POZ[p] === kat);

  const pusteKom =
    zrodlo === "sprzedaz" ? "Brak zawodników do wystawienia w tym filtrze."
    : zrodlo === "wolni" ? "Brak wolnych zawodników w tym filtrze. Poluzuj filtry albo zaczekaj — pojawią się po wygaśnięciu kontraktów."
    : zrodlo === "wypozyczenia" ? "Brak zawodników do wypożyczenia w tym filtrze."
    : "Brak zawodników z innych klubów w tym filtrze. Zmień pozycję, wiek lub cenę.";

  const Naglowek = (
    <View>
      {s.oferty.length > 0 && (
        <View style={st.karta}>
          <Text style={st.naglowek}>📨 Oferty za Twoich zawodników</Text>
          {s.oferty.map((o, i) => {
            const z = s.zawodnicy[o.zawodnikId];
            return (
              <View key={i} style={[st.wiersz, { paddingVertical: 6 }]}>
                <Text style={[st.maly, { flex: 1, color: K.tekst }]}>
                  {s.kluby[o.klubId].nazwa}: {z.imie} {z.nazwisko} ({Math.floor(z.umiej)}) za {zl(o.kwota)}{(z.wystawiony ?? 0) > 0 ? " · wystawiony" : ""}
                </Text>
                <Pressable style={st.przyciskMaly} onPress={() => { const b = przyjmijOferte(s, i); odswiez(); if (b) komunikat(b); }}>
                  <Text style={st.przyciskMalyTekst}>Sprzedaj</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
      {koncza.length > 0 && (
        <View style={st.karta}>
          <Text style={[st.naglowek, { color: K.akcent }]}>Kontrakty do przedłużenia</Text>
          {koncza.map((z) => (
            <View key={z.id} style={[st.wiersz, { paddingVertical: 5 }]}>
              <Text style={[st.maly, { flex: 1, color: K.tekst }]}>
                {z.imie} {z.nazwisko} ({Math.floor(z.umiej)}) — do {dataKontraktu(z.kontraktDo)}{latDoKonca(s, z) <= 0 ? " (wygasła!)" : ""}
              </Text>
              <Pressable style={st.przyciskMaly} onPress={() => { const b = przedluzKontrakt(s, z.id); odswiez(); if (b) komunikat(b); }}>
                <Text style={st.przyciskMalyTekst}>Przedłuż</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {wypozyczeni.length > 0 && (
        <View style={st.karta}>
          <Text style={[st.naglowek, { color: K.niebieski }]}>Twoi wypożyczeni (poza klubem)</Text>
          {wypozyczeni.map((z) => (
            <View key={z.id} style={[st.wiersz, { paddingVertical: 5 }]}>
              <Text style={[st.maly, { flex: 1, color: K.tekst }]}>
                {z.imie} {z.nazwisko} ({Math.floor(z.umiej)}) → {z.klubId ? s.kluby[z.klubId].nazwa : "?"}{z.doplataMacierzystego ? ` · dopłacasz ${zl(z.doplataMacierzystego)}/kol.` : ""}
              </Text>
              <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => { const b = zakonczWypozyczenieTeraz(s, z.id); odswiez(); if (b) komunikat(b); }}>
                <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>↩ Odwołaj</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {mozeTesty(s) && (() => {
        const testowani = (klub.testowani ?? []).map((id) => s.zawodnicy[id]).filter(Boolean);
        const kandydaci = rynekTestow(s);
        const pelno = ileTestowanych(s) >= limitTestow(s);
        return (
          <View style={st.karta}>
            <Text style={[st.naglowek, { color: K.akcent }]}>🧪 Testy zawodników ({ileTestowanych(s)}/{limitTestow(s)})</Text>
            <Text style={st.maly}>Wolni zawodnicy na okresie próbnym — ocena wyostrza się z tygodniami, potem decyzja.</Text>
            {testowani.map((z) => (
              <View key={z.id} style={{ paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }}>
                <Text style={[st.tekst, { fontSize: 14 }]} numberOfLines={1}>{z.poz} {z.imie} {z.nazwisko} · {z.wiek} l.</Text>
                <Text style={st.maly}>{raportTestu(z)}</Text>
                <View style={[st.wiersz, { gap: 6, marginTop: 4 }]}>
                  <Pressable style={[st.przyciskMaly, { borderColor: K.zielony }]} onPress={() => { const b = podpiszZTestow(s, z.id); odswiez(); if (b) komunikat(b); }}>
                    <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>✍️ Podpisz</Text>
                  </Pressable>
                  <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => { odeslijZTestow(s, z.id); odswiez(); }}>
                    <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Odeślij</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            {!pelno && (
              <>
                <Text style={[st.maly, { marginTop: 8, color: K.szary }]}>Dostępni na testy (szac. OVR):</Text>
                {kandydaci.slice(0, 8).map((z) => (
                  <View key={z.id} style={[st.wiersz, { paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
                    <Text style={[st.maly, { flex: 1, color: K.tekst }]} numberOfLines={1}>{z.poz} {z.imie} {z.nazwisko} · {z.wiek} l. · ~{z.test?.min ?? "?"}–{z.test?.max ?? "?"}</Text>
                    <Pressable style={[st.przyciskMaly, { borderColor: K.niebieski }]} onPress={() => { const b = wezNaTesty(s, z.id); odswiez(); if (b) komunikat(b); }}>
                      <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>Na testy ›</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}
          </View>
        );
      })()}

      {/* Okno + budżet + FFP */}
      <View style={[st.karta, { paddingBottom: 6 }]}>
        <Text style={[st.maly, { color: oknoOtwarte(s) ? K.zielony : K.czerwony, fontWeight: "700", marginBottom: 2 }]}>{statusOkna(s)}</Text>
        <Text style={[st.maly, { color: K.szary, marginBottom: 4 }]}>
          {oknoInfo(s).zawodowe
            ? "PZPN — liga zawodowa: letnie 1 VII–8 IX, zimowe do poł. marca."
            : "PZPN — liga amatorska: letnie 1 VII–30 IX, zimowe do pocz. kwietnia."}
        </Text>
        {!oknoOtwarte(s) && (
          <Text style={[st.maly, { color: K.zielony, marginBottom: 4 }]}>
            ✅ Wolnych zawodników („Bez klubu") podpiszesz też poza oknem — kupno z klubu i wypożyczenia dopiero w oknie.
          </Text>
        )}
        <Text style={st.maly}>Budżet: <Text style={{ color: K.tekst, fontWeight: "700" }}>{zl(klub.kasa)}</Text> · kadra {klub.zawodnicy.length}/26 · bilans/kol. {zl(bilansKolejki(s).bilans)}</Text>
        {(() => { const f = ffpStan(s); return (
          <Text style={[st.maly, { color: f.przekroczony ? K.czerwony : f.ratio > 1 ? K.akcent : K.zielony }]}>
            ⚖️ FFP: płace {Math.round(f.ratio * 100)}% przychodów{f.przekroczony ? " — przekroczone! blokada zakupów" : f.ratio > 1 ? " — uważaj" : " — OK"}
          </Text>
        ); })()}
      </View>

      {/* FILTRY */}
      <View style={[st.karta, { paddingVertical: 10 }]}>
        <Text style={[st.maly, { color: K.szary, marginBottom: 4, fontWeight: "700" }]}>RYNEK</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {ZRODLA.map(([id, n]) => <FChip key={id} akt={zrodlo === id} label={n} onPress={() => setZrodlo(id)} />)}
        </View>

        <Text style={[st.maly, { color: K.szary, marginTop: 4, marginBottom: 4, fontWeight: "700" }]}>POZYCJA</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          <FChip akt={kat === "wszyscy"} label="Wszyscy" onPress={() => { setKat("wszyscy"); setPozS(null); }} />
          {(POZYCJE as Pozycja[]).map((p) => <FChip key={p} akt={kat === p} label={p} onPress={() => { setKat(p); setPozS(null); }} />)}
        </View>
        {pozSWKat.length > 0 && (
          <View style={[st.wiersz, { flexWrap: "wrap" }]}>
            <FChip akt={pozS === null} label={`Wszystkie ${kat}`} onPress={() => setPozS(null)} />
            {pozSWKat.map((p) => <FChip key={p} akt={pozS === p} label={ETYKIETA_POZ[p]} onPress={() => setPozS(p)} />)}
          </View>
        )}

        <Text style={[st.maly, { color: K.szary, marginTop: 4, marginBottom: 4, fontWeight: "700" }]}>WIEK</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {WIEK_OPCJE.map(([id, n]) => <FChip key={id} akt={wiekKey === id} label={n} onPress={() => setWiekKey(id)} />)}
        </View>

        {!sprzedaz && (
          <>
            <Text style={[st.maly, { color: K.szary, marginTop: 4, marginBottom: 4, fontWeight: "700" }]}>CENA</Text>
            <View style={[st.wiersz, { flexWrap: "wrap" }]}>
              {CENA_OPCJE.map(([id, n]) => <FChip key={id} akt={cenaKey === id} label={n} onPress={() => setCenaKey(id)} />)}
            </View>
          </>
        )}

        <Text style={[st.maly, { color: K.szary, marginTop: 4, marginBottom: 4, fontWeight: "700" }]}>SORTUJ</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {SORT_OPCJE.map(([id, n]) => <FChip key={id} akt={sort === id} label={n} onPress={() => setSort(id)} />)}
        </View>

        {zrodlo === "kluby" && (
          <Pressable onPress={() => setTylkoWygasa((v) => !v)} style={[st.wiersz, { alignItems: "center", marginTop: 4 }]}>
            <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: tylkoWygasa ? K.akcent : K.linia, backgroundColor: tylkoWygasa ? K.akcent : "transparent", marginRight: 8, alignItems: "center", justifyContent: "center" }}>
              {tylkoWygasa && <Text style={{ color: "#15300c", fontWeight: "900", fontSize: 12 }}>✓</Text>}
            </View>
            <Text style={st.maly}>Tylko z wygasającym kontraktem (tani/okazje)</Text>
          </Pressable>
        )}
        <Text style={[st.maly, { color: K.szary, marginTop: 6 }]}>
          {sprzedaz ? `Twoja kadra: ${lista.length} — ustaw kwotę i „Wystaw”.` : `Znaleziono: ${lista.length}`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={st.ekran}>
      <FlatList
        style={{ flex: 1 }}
        data={lista}
        keyExtractor={(z) => z.id}
        ListHeaderComponent={Naglowek}
        ListEmptyComponent={<View style={[st.karta, { marginTop: 6 }]}><Text style={st.maly}>{pusteKom}</Text></View>}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 2 }}
        renderItem={({ item: z }) =>
          sprzedaz
            ? <WierszSprzedazy s={s} z={z} odswiez={odswiez} />
            : <WierszRynku s={s} z={z} wyp={wyp} cena={cenaZa(z)} onKup={() => kupuj(z)} onNeg={() => setNeg(z)} />
        }
      />
      <NegocjacjeModal s={s} z={neg} onClose={() => setNeg(null)} odswiez={odswiez} />
    </View>
  );
}

function WierszRynku({ s, z, wyp, cena, onKup, onNeg }: { s: StanGry; z: Zawodnik; wyp: boolean; cena: number; onKup: () => void; onNeg: () => void }) {
  const klub = s.kluby[s.mojKlub];
  const parent = z.klubId ? s.kluby[z.klubId] : undefined;
  const pensja = pensjaPoTransferze(s, z.id);
  const poBilans = bilansKolejki(s, wyp ? z.pensja : pensja).bilans;
  const doplaci = wyp && parent && parent.poziom < klub.poziom;
  return (
    <View style={[st.karta, st.wiersz, { marginTop: 6, paddingVertical: 10 }]}>
      <View style={{ width: 44 }}>
        <Text style={{ color: KOLOR_POZ[z.poz], fontWeight: "800" }}>{z.poz}</Text>
        {z.pozS && <Text style={{ color: K.szary, fontSize: 10, fontWeight: "700" }}>{SKROT_POZ[z.pozS]}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.tekst}>{z.imie} {z.nazwisko} <Text style={st.maly}>({z.wiek} l.)</Text></Text>
        <Text style={st.maly}>
          {parent ? parent.nazwa : "wolny zawodnik"} · {wyp ? `wypożyczenie ${cena ? zl(cena) : "za darmo"}` : (cena ? zl(cena) : "za darmo")} · pensja {zl(z.pensja)}
        </Text>
        <Text style={[st.maly, { fontSize: 11 }]}>
          {wyp
            ? `na sezon, wraca po rozgrywkach${doplaci ? ` · ${parent!.nazwa} dopłaci do pensji` : ""}`
            : (z.klubId ? `${NAZWA_KONTRAKTU[z.kontraktTyp]} · do ${dataKontraktu(z.kontraktDo)}${latDoKonca(s, z) === 1 ? " — ostatni sezon (tanio!)" : ""}` : "wolny zawodnik (Bosman, bez kwoty)")}
        </Text>
        {poBilans < 0 && <Text style={[st.maly, { color: K.czerwony }]}>Po {wyp ? "wypożyczeniu" : "transferze"} bilans kolejki: {zl(poBilans)}</Text>}
      </View>
      <View style={{ alignItems: "center", marginHorizontal: 8 }}>
        <Text style={{ color: K.tekst, fontSize: 18, fontWeight: "800" }}>{Math.floor(z.umiej)}</Text>
        <Text style={[st.maly, { fontSize: 11 }]}>pot. {Math.floor(z.potencjal)}</Text>
      </View>
      <View style={{ gap: 6 }}>
        <Pressable style={st.przyciskMaly} onPress={onKup}>
          <Text style={st.przyciskMalyTekst}>{wyp ? "Wypożycz" : cena ? "Kup" : "Podpisz"}</Text>
        </Pressable>
        {!wyp && (
          <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={onNeg}>
            <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Negocjuj</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function WierszSprzedazy({ s, z, odswiez }: { s: StanGry; z: Zawodnik; odswiez: () => void }) {
  const sugest = sugerowanaCenaSprzedazy(s, z.id);
  const [kwota, setKwota] = useState(z.wystawiony ?? sugest);
  const krok = sugest >= 100000 ? Math.max(10000, Math.round(sugest * 0.1 / 10000) * 10000) : Math.max(100, Math.round(sugest * 0.1 / 100) * 100);
  const amator = z.kontraktTyp === "amator";
  const wystaw = () => { const b = wystawNaSprzedaz(s, z.id, kwota); odswiez(); if (b) komunikat(b); };
  const zdejmij = () => { zdejmijZeSprzedazy(s, z.id); odswiez(); };
  return (
    <View style={[st.karta, { marginTop: 6, paddingVertical: 10 }]}>
      <View style={st.wiersz}>
        <View style={{ width: 44 }}>
          <Text style={{ color: KOLOR_POZ[z.poz], fontWeight: "800" }}>{z.poz}</Text>
          {z.pozS && <Text style={{ color: K.szary, fontSize: 10, fontWeight: "700" }}>{SKROT_POZ[z.pozS]}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.tekst}>{z.imie} {z.nazwisko} <Text style={st.maly}>({z.wiek} l.)</Text></Text>
          <Text style={st.maly}>{NAZWA_KONTRAKTU[z.kontraktTyp]} · do {dataKontraktu(z.kontraktDo)} · wartość ~{zl(wartosc(z))}</Text>
          {(z.wystawiony ?? 0) > 0 && <Text style={[st.maly, { color: K.akcent, fontWeight: "700" }]}>🏷 Na sprzedaż: {zl(z.wystawiony!)}</Text>}
        </View>
        <View style={{ alignItems: "center", marginLeft: 8 }}>
          <Text style={{ color: K.tekst, fontSize: 18, fontWeight: "800" }}>{Math.floor(z.umiej)}</Text>
          <Text style={[st.maly, { fontSize: 11 }]}>pot. {Math.floor(z.potencjal)}</Text>
        </View>
      </View>
      {amator ? (
        <Text style={[st.maly, { marginTop: 8, color: K.szary }]}>Umowa amatorska — nie sprzedasz go za kwotę. Po awansie klubu na szczebel półprofesjonalny (IV liga) kontrakt zmieni się na półprofesjonalny i wtedy będzie można go sprzedać.</Text>
      ) : (
        <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "center", marginTop: 8 }]}>
          <View style={[st.wiersz, { gap: 8, alignItems: "center" }]}>
            <Pressable style={st.przyciskMaly} onPress={() => setKwota((k) => Math.max(amator ? 100 : 1000, k - krok))}><Text style={st.przyciskMalyTekst}>−</Text></Pressable>
            <Text style={[st.tekst, { fontWeight: "800", minWidth: 96, textAlign: "center" }]}>{zl(kwota)}</Text>
            <Pressable style={st.przyciskMaly} onPress={() => setKwota((k) => k + krok)}><Text style={st.przyciskMalyTekst}>+</Text></Pressable>
          </View>
          <View style={[st.wiersz, { gap: 6 }]}>
            <Pressable style={[st.przyciskMaly, { borderColor: K.zielony }]} onPress={wystaw}>
              <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>{(z.wystawiony ?? 0) > 0 ? "Zmień" : "🏷 Wystaw"}</Text>
            </Pressable>
            {(z.wystawiony ?? 0) > 0 && (
              <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={zdejmij}>
                <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Zdejmij</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

export function NegocjacjeModal({ s, z, onClose, odswiez }: { s: StanGry; z: Zawodnik | null; onClose: () => void; odswiez: () => void }) {
  return (
    <Modal visible={!!z} transparent animationType="slide" onRequestClose={onClose}>
      {z ? <NegocjacjeTresc key={z.id} s={s} z={z} onClose={onClose} odswiez={odswiez} /> : null}
    </Modal>
  );
}

function Chip({ akt, label, onPress }: { akt: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[st.chip, akt && st.chipAktywny]}>
      <Text style={{ color: akt ? "#1a1a1a" : K.tekst, fontWeight: "600", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function NegocjacjeTresc({ s, z, onClose, odswiez }: { s: StanGry; z: Zawodnik; onClose: () => void; odswiez: () => void }) {
  const klub = s.kluby[s.mojKlub];
  const wolny = !z.klubId;
  const asking = cenaWywolawcza(s, z.id);
  const zada = zadaniePlacowe(s, z, klub.poziom);
  const w = wartosc(z);
  const stepK = Math.max(10000, Math.round((asking || w) * 0.1));
  const klauzOpcje = [0, Math.round((w * 2) / 10000) * 10000, Math.round((w * 4) / 10000) * 10000];

  const [kwota, setKwota] = useState(asking);
  const [raty, setRaty] = useState(1);
  const [odsprzedaz, setOdsprzedaz] = useState(0);
  const [pensja, setPensja] = useState(zada);
  const [lata, setLata] = useState(z.wiek >= 31 ? 2 : 3);
  const [klauzula, setKlauzula] = useState(0);
  const [wynik, setWynik] = useState<WynikNegocjacji | null>(null);

  const zloz = () => {
    const o: OfertaTransferu = { kwota: wolny ? 0 : kwota, ratySezony: raty, odsprzedazProc: odsprzedaz || undefined, pensja, lata, klauzula: klauzula || undefined };
    const r = negocjujTransfer(s, z.id, o);
    setWynik(r);
    if (r.ok) { odswiez(); komunikat(`✍️ Transfer dobity: ${z.imie} ${z.nazwisko}.`); onClose(); }
  };

  const Stepper = ({ etyk, wart, set, step, min = 0 }: { etyk: string; wart: number; set: (n: number) => void; step: number; min?: number }) => (
    <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }]}>
      <Text style={st.maly}>{etyk}</Text>
      <View style={[st.wiersz, { gap: 8, alignItems: "center" }]}>
        <Pressable style={st.przyciskMaly} onPress={() => set(Math.max(min, wart - step))}><Text style={st.przyciskMalyTekst}>−</Text></Pressable>
        <Text style={[st.tekst, { fontWeight: "700", minWidth: 90, textAlign: "center" }]}>{zl(wart)}</Text>
        <Pressable style={st.przyciskMaly} onPress={() => set(wart + step)}><Text style={st.przyciskMalyTekst}>+</Text></Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
      <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", paddingBottom: 20 }}>
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <Text style={st.tytul}>Negocjacje — {z.imie} {z.nazwisko}</Text>
          <Text style={[st.maly, { marginBottom: 8 }]}>
            {z.poz} · {z.wiek} l. · OVR {Math.floor(z.umiej)} · {wolny ? "wolny zawodnik" : `${s.kluby[z.klubId!].nazwa} (do ${dataKontraktu(z.kontraktDo)})`}
          </Text>
          <Text style={[st.maly, { color: K.tekst }]}>Budżet: <Text style={{ fontWeight: "700" }}>{zl(klub.kasa)}</Text>{!wolny ? ` · cena wywoławcza klubu: ${zl(asking)}` : ""}</Text>

          {!wolny && (
            <View style={{ marginTop: 10 }}>
              <Text style={[st.naglowek, { fontSize: 14 }]}>Kwota i struktura</Text>
              <Stepper etyk="Oferta za zawodnika" wart={kwota} set={setKwota} step={stepK} />
              <Text style={[st.maly, { marginTop: 4 }]}>Rozłożenie na raty:</Text>
              <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 2 }]}>
                {[1, 2, 3, 4].map((n) => <Chip key={n} akt={raty === n} label={n === 1 ? "całość" : `${n} sezony`} onPress={() => setRaty(n)} />)}
              </View>
              <Text style={[st.maly, { marginTop: 6 }]}>Klauzula odsprzedaży dla klubu (% z przyszłego transferu):</Text>
              <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 2 }]}>
                {[0, 10, 20, 30].map((n) => <Chip key={n} akt={odsprzedaz === n} label={n === 0 ? "brak" : `${n}%`} onPress={() => setOdsprzedaz(n)} />)}
              </View>
            </View>
          )}

          <View style={{ marginTop: 12 }}>
            <Text style={[st.naglowek, { fontSize: 14 }]}>Warunki dla zawodnika</Text>
            <Stepper etyk={`Pensja (żąda ~${zl(zada)}/kol.)`} wart={pensja} set={setPensja} step={Math.max(100, Math.round(zada * 0.05))} />
            <Text style={[st.maly, { marginTop: 4 }]}>Długość kontraktu:</Text>
            <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 2 }]}>
              {[1, 2, 3, 4].map((n) => <Chip key={n} akt={lata === n} label={`${n} ${n === 1 ? "sezon" : "sezony"}`} onPress={() => setLata(n)} />)}
            </View>
            <Text style={[st.maly, { marginTop: 6 }]}>Klauzula wykupu w nowej umowie:</Text>
            <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 2 }]}>
              {klauzOpcje.map((n, i) => <Chip key={i} akt={klauzula === n} label={n === 0 ? "brak" : `${zl(n)}`} onPress={() => setKlauzula(n)} />)}
            </View>
          </View>

          {wynik && !wynik.ok && (
            <View style={[st.karta, { marginTop: 12, borderColor: K.czerwony }]}>
              <Text style={[st.maly, { color: K.czerwony }]}>{wynik.powod}</Text>
              {wynik.kontraKlub ? (
                <Pressable style={[st.przyciskMaly, { borderColor: K.akcent, marginTop: 6 }]} onPress={() => { setKwota(wynik.kontraKlub!); setWynik(null); }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Przyjmij kontrofertę {zl(wynik.kontraKlub)}</Text>
                </Pressable>
              ) : null}
              {wynik.oczekiwaniaPensja ? (
                <Pressable style={[st.przyciskMaly, { borderColor: K.akcent, marginTop: 6 }]} onPress={() => { setPensja(wynik.oczekiwaniaPensja!); setWynik(null); }}>
                  <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Podbij pensję do {zl(wynik.oczekiwaniaPensja)}</Text>
                </Pressable>
              ) : null}
            </View>
          )}

          <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 14 }]} onPress={zloz}>
            <Text style={st.przyciskTekst}>Złóż ofertę</Text>
          </Pressable>
          <Pressable style={[st.przyciskMaly, { alignItems: "center", marginTop: 8 }]} onPress={onClose}>
            <Text style={st.przyciskMalyTekst}>Anuluj</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}
