import { ProfilZawodnika } from "./ProfilZawodnika";
import { grafika3D, Stadion3DWidok } from "./three/Stadion3DWidok";
import { BazaTreningowa3D, LegendaBazy } from "./three/BazaTreningowa3D";
import { Extranet } from "./Extranet";
import { budowyKlubu, oglosPrzetarg, opisUtrudnien, trwaBudowa } from "../engine/budowy";
import { PrzetargPanel, TrwajaceBudowy } from "./Budowy";
import { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import STADIONY_JSON from "../../assets/stadiony.json";
import { zl } from "../engine/losuj";
import { POZYCJE } from "../engine/mecz";
import {
  kosztObiektu, maOswietlenie, MAX_POZIOM_OBIEKTU, OBIEKTY_IKONY, OBIEKTY_NAZWY, OBIEKTY_OPIS, przychodObiektow, rozbudujObiekt, rozbudujStadion,
  wariantyRozbudowy, wymogObiektu,
} from "../engine/sezon";
import { WidokStadionu } from "./WidokStadionu";
import { tabelaLigi, urodzony } from "../engine/swiat";
import { narodowoscKraju } from "../data/narodowosci";
import { jezykKraju, NAZWA_JEZYKA } from "../engine/jezyki";
import type { Obiekty, RolaSztabu, StanGry } from "../engine/types";
import { NAZWA_ROLI } from "../engine/sztab";
import { EdytorKlubu } from "./EdytorKlubu";
import { Herb } from "./Herb";
import { przydomek } from "../data/przydomki";
import { stazTrenera, trenerKlubu } from "../data/trenerzy";
import { Twarz } from "./Twarz";
import { Sponsorzy } from "./Sponsorzy";
import { Bezpieczenstwo } from "./Bezpieczenstwo";
import { kulturaTrybun } from "../engine/flagi";
import { opisSankcji } from "../engine/bezpieczenstwo";
import { Stroje } from "./Stroje";
import { K, KOLOR_POZ, st } from "./styl";

const STADIONY = STADIONY_JSON as Record<string, { stadion?: string; pojemnosc?: number; adres?: string; pelna?: string; rok?: number }>;
const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));

function Info({ etyk, wart }: { etyk: string; wart: string }) {
  return (
    <View style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]}>
      <Text style={st.maly}>{etyk}</Text>
      <Text style={[st.tekst, { fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right", marginLeft: 10 }]}>{wart}</Text>
    </View>
  );
}

export function WidokKlubu({ s, klubId, onClose, odswiez, onZawodnik }: { s: StanGry; klubId: string | null; onClose: () => void; odswiez: () => void; onZawodnik?: (id: string) => void }) {
  const [edycja, setEdycja] = useState(false);
  const [profil, setProfil] = useState<string | null>(null); // podgląd zawodnika (pełne dane, kariera, oferta) — gdy wywołujący nie obsługuje sam
  const [, setT] = useState(0);
  const odsw = () => { odswiez(); setT((x) => x + 1); };
  const klub = klubId ? s.kluby[klubId] : undefined;
  const moj = klubId === s.mojKlub;
  const real = klub ? STADIONY[klub.nazwa] : undefined;
  const liga = klub ? s.ligi[klub.poziom - 1] : undefined;
  const miejsce = klub && liga ? tabelaLigi(s, liga).findIndex((w) => w.klubId === klub.id) + 1 : 0;

  const kadra = klub ? [...klub.zawodnicy].map((id) => s.zawodnicy[id]).sort((a, b) => POZYCJE.indexOf(a.poz) - POZYCJE.indexOf(b.poz) || b.umiej - a.umiej) : [];

  const [widok3D, setWidok3D] = useState(true);
  const [baza3D, setBaza3D] = useState(false);
  const akcja = (f: () => string | null) => { const b = f(); odswiez(); if (b) komunikat(b); };

  return (<>
    <Modal visible={!!klub} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "92%", paddingBottom: 20 }]}>
          {klub && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <View style={[st.wiersz, { gap: 14 }]}>
                <Herb klub={klub} rozmiar={54} />
                <View style={{ flex: 1 }}>
                  <Text style={st.tytul}>{klub.nazwa}</Text>
                  {przydomek(klub.nazwa) ? <Text style={[st.maly, { color: K.akcent, fontStyle: "italic" }]}>„{przydomek(klub.nazwa)}"</Text> : null}
                  <Text style={st.maly}>{klub.pozaLiga ? "Drużyna spoza lig — tylko Puchar Polski" : `${liga?.nazwa}${miejsce ? ` · ${miejsce}. miejsce` : ""}`}</Text>
                  {klub.opisPozaLiga ? <Text style={[st.maly, { color: K.akcent }]}>{klub.opisPozaLiga}</Text> : null}
                </View>
              </View>

              <View style={{ marginTop: 14 }}>
                {real?.pelna && <Info etyk="Pełna nazwa" wart={real.pelna} />}
                <Info etyk="Miasto" wart={klub.miasto} />
                <Info etyk="Stadion" wart={real?.stadion ?? klub.stadion} />
                <Info etyk="Pojemność" wart={`${(real?.pojemnosc ?? klub.pojemnosc).toLocaleString("pl")} miejsc`} />
                {klub.murawa ? <Info etyk="Murawa" wart={klub.murawa === "podgrzewana" ? "naturalna (podgrzewana)" : klub.murawa === "sztuczna" ? "sztuczna" : "naturalna"} /> : null}
                {(real?.adres || klub.adres) ? <Info etyk="Adres" wart={real?.adres ?? klub.adres} /> : null}
                {(real?.rok || klub.zalozony) ? <Info etyk="Rok założenia" wart={String(real?.rok ?? klub.zalozony)} /> : null}
                {real && <Text style={[st.maly, { marginTop: 6, color: K.zielony }]}>✓ Dane z Wikipedii</Text>}
              </View>

              <View style={{ marginTop: 14 }}>
                <Text style={st.naglowek}>👔 Trener</Text>
                <View style={[st.wiersz, { gap: 12, marginTop: 4 }]}>
                  <Twarz seed={moj ? (s.trener || "Trener") : trenerKlubu(klub)} rozmiar={48} zdjecie={moj ? s.trenerZdjecie : undefined} jersey="#2a2f3a" />
                  <View style={{ flex: 1 }}>
                    <Text style={[st.tekst, { fontSize: 15, fontWeight: "700" }]}>{moj ? `${s.trener} (Ty)` : trenerKlubu(klub)}</Text>
                    <Text style={st.maly}>
                      {moj ? (s.trenerLicencja ? `Licencja UEFA ${s.trenerLicencja}` : "Trener-menedżer") : [klub.trenerLicencja ? `Licencja UEFA ${klub.trenerLicencja}` : null, klub.trenerOd != null ? `w klubie od ${klub.trenerOd} (${stazTrenera(klub, s.sezon)} sez.)` : null].filter(Boolean).join(" · ")}
                    </Text>
                    {moj ? (
                      <Pressable onPress={() => { const v = typeof window !== "undefined" ? window.prompt("Data urodzenia trenera (DD.MM.RRRR):", s.trenerDataUr ?? "") : null; if (v && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(v.trim())) { s.trenerDataUr = v.trim(); odswiez(); } }}>
                        <Text style={st.maly}>🎂 {s.trenerDataUr ? `ur. ${s.trenerDataUr} (${s.sezon - Number(s.trenerDataUr.split(".")[2])} lat)` : "data urodzenia — dotknij, aby ustawić"} ✎</Text>
                      </Pressable>
                    ) : (
                      <Text style={st.maly}>🎂 {klub.trenerReal ? "data urodzenia: brak zweryfikowanych danych w grze" : urodzony(`${klub.trenerImie}${klub.trenerNazwisko}`, klub.trenerWiek, s.sezon)}{klub.trenerKraj ? ` · ${narodowoscKraju(klub.trenerKraj)?.flaga ?? "🌍"} ${klub.trenerKraj} · ${NAZWA_JEZYKA[jezykKraju(klub.trenerKraj)]}, polski ${Math.round(klub.trenerPolski ?? 0)}%` : " · 🇵🇱 Polska"}</Text>
                    )}
                    {!moj && klub.trenerReal ? <Text style={[st.maly, { color: K.zielony }]}>✓ realny szkoleniowiec</Text> : null}
                  </View>
                </View>
                {!moj && klub.trenerHistoria && klub.trenerHistoria.length ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={st.maly}>Kariera trenerska:</Text>
                    {klub.trenerHistoria.map((h, i) => (
                      <Text key={i} style={[st.maly, { paddingVertical: 1 }]}>• {h.klub} ({h.od}{h.do ? `–${h.do}` : "–teraz"})</Text>
                    ))}
                  </View>
                ) : null}
              </View>

              {!moj && klub.sztab && Object.keys(klub.sztab).length ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={st.naglowek}>🧰 Sztab szkoleniowy</Text>
                  {(Object.keys(klub.sztab) as RolaSztabu[]).map((rola) => {
                    const p = klub.sztab![rola];
                    if (!p) return null;
                    return (
                      <View key={rola} style={[st.wiersz, { gap: 10, paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
                        <Twarz seed={`${p.imie} ${p.nazwisko}`} rozmiar={30} jersey="#2a2f3a" />
                        <View style={{ flex: 1 }}>
                          <Text style={[st.tekst, { fontSize: 13 }]}>{p.imie} {p.nazwisko}</Text>
                          <Text style={st.maly}>{NAZWA_ROLI[rola]} · {"★".repeat(p.poziom)}{"☆".repeat(5 - p.poziom)}{p.kontraktDo != null ? ` · do ${p.kontraktDo}` : ""}</Text>
                          <Text style={[st.maly, { fontSize: 11 }]}>🎂 {urodzony(p.id ?? p.imie + p.nazwisko, p.wiek, s.sezon)} · {narodowoscKraju(p.kraj)?.flaga ?? "🇵🇱"} {p.kraj ?? "Polska"}{p.kraj && p.kraj !== "Polska" ? ` · polski ${Math.round(p.polski ?? 0)}%` : ""}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {(() => { const kt = kulturaTrybun(s, klub); const sank = opisSankcji(klub); return (
                <View style={[st.karta, { marginHorizontal: 0, marginTop: 14 }]}>
                  <Text style={st.naglowek}>📣 Kibice</Text>
                  <Text style={st.maly}>🥁 {kt.mlyn}{kt.gniazdowy ? " · gniazdowy z megafonem, bęben" : ""}</Text>
                  {kt.grupy.length ? <Text style={st.maly}>👥 Grupy: {kt.grupy.join(" · ")}</Text> : null}
                  {kt.zgody?.length ? <Text style={st.maly}>🤝 Zgody: {kt.zgody.join(", ")}</Text> : null}
                  <Text style={[st.maly, { marginTop: 4 }]}>🚩 Flagi na płocie ({kt.flagi.length}):</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 3 }}>
                    {kt.flagi.map((f, i) => <View key={i} style={{ backgroundColor: f.kolory[0], borderColor: f.kolory[1], borderWidth: 2, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ color: "#fff", fontSize: 10.5, fontWeight: "800", textShadowColor: "#000", textShadowRadius: 2 }}>{f.tekst}</Text></View>)}
                  </View>
                  <Text style={[st.maly, { marginTop: 4 }]}>🎆 Opraw pokazanych przez kibiców: {(s.oprawyUzyte?.[klub.nazwa] ?? []).length} (żadna się nie powtarza)</Text>
                  {sank.map((t, i) => <Text key={i} style={[st.maly, { color: K.czerwony }]}>{t}</Text>)}
                </View>); })()}
              <View style={{ marginTop: 16 }}>
                <Stroje s={s} klub={klub} />
              </View>
              {moj && <View style={{ marginTop: 10 }}><Sponsorzy s={s} odswiez={odswiez} /></View>}
              {moj && <View style={{ marginTop: 10 }}><Bezpieczenstwo s={s} odswiez={odswiez} /></View>}
              {moj && <View style={{ marginTop: 10 }}><Extranet s={s} odswiez={odswiez} /></View>}

              <View style={{ marginTop: 18 }}>
                <Text style={st.naglowek}>🏟 Stadion z lotu ptaka</Text>
                <Text style={[st.maly, { marginBottom: 6 }]}>{klub.pojemnosc.toLocaleString("pl")} miejsc · trybuny i obiekty rosną razem z rozbudową</Text>
                {widok3D && Platform.OS === "web" && grafika3D()
                  ? <Stadion3DWidok s={moj ? s : null} klub={klub} />
                  : <WidokStadionu klub={klub} oswietlenie={maOswietlenie(klub)} budowy={moj ? budowyKlubu(s) : undefined} />}
                {Platform.OS === "web" && grafika3D() && <Pressable onPress={() => setWidok3D(!widok3D)} style={{ marginTop: 6 }}><Text style={[st.maly, { color: K.akcent }]}>{widok3D ? "🗺 Pokaż plan 2D (z góry)" : "🏟 Pokaż stadion w 3D (obracaj palcem)"}</Text></Pressable>}
              </View>

              <View style={{ marginTop: 18 }}>
                <Text style={st.naglowek}>🏋 Baza treningowa</Text>
                <Text style={[st.maly, { marginBottom: 6 }]}>Boiska, szatnie, siłownia i boisko akademii — rosną z poziomem obiektu „Boiska treningowe” i akademii.</Text>
                {baza3D && Platform.OS === "web" && grafika3D() ? <BazaTreningowa3D s={s} klub={klub} /> : <LegendaBazy klub={klub} />}
                {Platform.OS === "web" && grafika3D() && <Pressable onPress={() => setBaza3D(!baza3D)} style={[st.przyciskMaly, { marginTop: 6, alignSelf: "flex-start" }]}><Text style={st.przyciskMalyTekst}>{baza3D ? "✕ Zamknij widok 3D" : "🏋 Baza treningowa 3D"}</Text></Pressable>}
              </View>

              {moj && (
                <View style={{ marginTop: 18 }}>
                  <TrwajaceBudowy s={s} />
                  <PrzetargPanel s={s} odswiez={odswiez} />
                  <Text style={st.naglowek}>🏗 Rozbudowa stadionu</Text>
                  <Text style={[st.maly, { marginBottom: 4 }]}>Każda budowa to przetarg: firmy podają cenę i czas, a w trakcie robót część miejsc jest wyłączona.</Text>
                  {wariantyRozbudowy(s).map((w, i) => (
                    <View key={w.nazwa} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={st.tekst}>{w.nazwa}</Text>
                        <Text style={st.maly}>+{w.miejsca.toLocaleString("pl")} miejsc → {(klub.pojemnosc + w.miejsca).toLocaleString("pl")} · ok. {zl(w.koszt)}</Text>
                        <Text style={[st.maly, { fontSize: 11 }]}>W trakcie: {opisUtrudnien({ rodzaj: "stadion", wariant: i })}</Text>
                      </View>
                      <Pressable style={[st.przyciskMaly, trwaBudowa(s, { rodzaj: "stadion", wariant: i }) ? { opacity: 0.4 } : null]} onPress={() => akcja(() => oglosPrzetarg(s, { rodzaj: "stadion", wariant: i }))}>
                        <Text style={st.przyciskMalyTekst}>{trwaBudowa(s, { rodzaj: "stadion", wariant: i }) ? "🚧 w budowie" : "📑 Przetarg"}</Text>
                      </Pressable>
                    </View>
                  ))}

                  <Text style={[st.naglowek, { marginTop: 14 }]}>🏘 Obiekty wokół stadionu</Text>
                  {(Object.keys(OBIEKTY_NAZWY) as (keyof Obiekty)[]).map((typ) => {
                    const poz = klub.obiekty[typ] ?? 0;
                    const wym = wymogObiektu(klub, typ);
                    return (
                      <View key={typ} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 7, borderTopWidth: 1, borderTopColor: K.linia, gap: 8 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={st.tekst}>{OBIEKTY_IKONY[typ]} {OBIEKTY_NAZWY[typ]} <Text style={{ color: K.akcent }}>{"●".repeat(poz)}<Text style={{ color: K.szary }}>{"○".repeat(MAX_POZIOM_OBIEKTU - poz)}</Text></Text></Text>
                          <Text style={st.maly}>{OBIEKTY_OPIS[typ]}</Text>
                          {wym && poz < MAX_POZIOM_OBIEKTU ? <Text style={[st.maly, { color: K.czerwony }]}>🔒 {wym}</Text> : null}
                        </View>
                        {poz >= MAX_POZIOM_OBIEKTU ? (
                          <Text style={st.maly}>max</Text>
                        ) : (
                          trwaBudowa(s, { rodzaj: "obiekt", typ }) ? <Text style={[st.maly, { color: "#e0a030" }]}>🚧 w budowie</Text> :
                          <Pressable style={[st.przyciskMaly, wym ? { opacity: 0.4 } : null]} onPress={() => akcja(() => oglosPrzetarg(s, { rodzaj: "obiekt", typ }))}>
                            <Text style={st.przyciskMalyTekst}>📑 {poz ? "Rozbuduj" : "Zbuduj"} · ok. {zl(kosztObiektu(s, typ))}</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                  <Text style={[st.maly, { marginTop: 6 }]}>Obiekty dają przychód w dniu meczu (teraz ~{zl(przychodObiektow(klub.obiekty, Math.min(klub.pojemnosc, 1000)))} przy 1000 widzów) i podnoszą frekwencję.</Text>
                </View>
              )}

              {moj && (
                <View style={{ marginTop: 18 }}>
                  <Text style={st.naglowek}>🎟 Bilety i karnety</Text>
                  <Text style={[st.maly, { marginBottom: 4 }]}>Cena biletu — drożej = większy wpływ z głowy, ale mniej kibiców na trybunach.</Text>
                  <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>
                    {([["Tani", 0.7], ["Normalny", 1], ["Drożej", 1.3], ["Premium", 1.6]] as [string, number][]).map(([et, v]) => {
                      const akt = Math.abs((s.cenaBiletu ?? 1) - v) < 0.01;
                      return (
                        <Pressable key={et} style={[st.przyciskMaly, { backgroundColor: akt ? K.akcent : K.karta }]} onPress={() => akcja(() => { s.cenaBiletu = v; return null; })}>
                          <Text style={[st.przyciskMalyTekst, { color: akt ? "#17310f" : K.tekst }]}>{et}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={[st.maly, { marginTop: 8, marginBottom: 4 }]}>Karnety (% pojemności) — wpłata z góry na start sezonu + pewna frekwencja.</Text>
                  <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>
                    {([["Brak", 0], ["15%", 0.15], ["30%", 0.30], ["45%", 0.45]] as [string, number][]).map(([et, v]) => {
                      const akt = Math.abs((s.karnety ?? 0) - v) < 0.01;
                      return (
                        <Pressable key={et} style={[st.przyciskMaly, { backgroundColor: akt ? K.akcent : K.karta }]} onPress={() => akcja(() => { s.karnety = v; return null; })}>
                          <Text style={[st.przyciskMalyTekst, { color: akt ? "#17310f" : K.tekst }]}>{et}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={[st.maly, { marginTop: 6 }]}>Wpływ z karnetów naliczany na początku każdego sezonu. Zmiana ceny działa od najbliższego meczu u siebie.</Text>
                </View>
              )}

              <Text style={[st.naglowek, { marginTop: 18 }]}>Kadra ({kadra.length})</Text>
              {kadra.map((z) => (
                <Pressable key={z.id} onPress={() => (onZawodnik ? onZawodnik(z.id) : setProfil(z.id))} style={[st.wiersz, { paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]}>
                  <Text style={{ color: KOLOR_POZ[z.poz], width: 30, fontWeight: "700", fontSize: 12 }}>{z.poz}</Text>
                  <Text style={{ width: 28, color: K.szary }}>{z.numer || ""}</Text>
                  <Text style={[st.tekst, { flex: 1, fontSize: 14 }]} numberOfLines={1}>{z.imie} {z.nazwisko}</Text>
                  <Text style={{ color: K.tekst, fontWeight: "800" }}>{Math.floor(z.umiej)}</Text>
                </Pressable>
              ))}

              <View style={[st.wiersz, { gap: 10, marginTop: 16 }]}>
                {moj && (
                  <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.niebieski }]} onPress={() => setEdycja(true)}>
                    <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>✎ Edytuj klub</Text>
                  </Pressable>
                )}
                <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0, marginTop: 0 }]} onPress={onClose}>
                  <Text style={st.przyciskTekst}>Zamknij</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
      <EdytorKlubu s={s} klubId={edycja ? klubId : null} onClose={() => setEdycja(false)} odswiez={odswiez} />
    </Modal>
    {!onZawodnik && <ProfilZawodnika s={s} zawodnikId={profil} onClose={() => setProfil(null)} odswiez={odsw} />}
  </>);
}
