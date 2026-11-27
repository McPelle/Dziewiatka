import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { kosztSztabuNaKolejke, poziomSztabu, przedluzSztab, ROLE_SZTABU, rynekSztabu, zatrudnijSztab, zwolnijSztab } from "../engine/sztab";
import { kosztMisji, REGIONY_SKAUT, sciagnijTalent, wiekMinimalny, wyslijSkauta } from "../engine/skauting";
import { NAZWA_KONTRAKTU, urodzony } from "../engine/swiat";
import { narodowoscKraju } from "../data/narodowosci";
import { jezykKraju, JEZYKI_DO_NAUKI, pensjaTlumacza, potrzebneJezyki, rynekTlumaczy, tlumaczDla, tlumaczeKlubu, zatrudnijTlumacza, zwolnijTlumacza, jezykiTrenera, kosztKursu, kosztKursuTrenera, NAZWA_JEZYKA, jezykZawodnika, poziomJezykaTrenera, polski, type Jezyk } from "../engine/jezyki";
import type { Pracownik, RolaSztabu, StanGry } from "../engine/types";
import { ProfilZawodnika } from "./ProfilZawodnika";
import { Twarz } from "./Twarz";
import { K, st } from "./styl";

const info = (t: string) => { if (typeof window !== "undefined" && window.alert) window.alert(t); };

function gwiazdki(poziom: number) {
  return "★".repeat(poziom) + "☆".repeat(5 - poziom);
}

export function Sztab({ s, widoczny, onClose, odswiez }: { s: StanGry; widoczny: boolean; onClose: () => void; odswiez: () => void }) {
  const [rynek, setRynek] = useState<{ rola: RolaSztabu; lista: Pracownik[] } | null>(null);
  const [profil, setProfil] = useState<string | null>(null);
  const [rynekTl, setRynekTl] = useState(false);
  const klub = s.kluby[s.mojKlub];
  const sztab = klub?.sztab ?? {};
  const koszt = kosztSztabuNaKolejke(s);

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "90%", paddingBottom: 20 }}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={st.tytul}>🧰 Sztab szkoleniowy</Text>
            <Text style={[st.maly, { marginTop: 2, marginBottom: 10 }]}>
              Specjaliści realnie wpływają na zespół. Łączny koszt: <Text style={{ color: K.akcent, fontWeight: "700" }}>{zl(koszt)}/kolejkę</Text>.
            </Text>

            {/* języki: tłumacz klubowy i kurs polskiego dla obcokrajowców */}
            {(() => {
              const k = s.kluby[s.mojKlub];
              const obcy = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kraj && z.kraj !== "Polska");
              const slabo = obcy.filter((z) => polski(z!) < 55);
              return (
                <View style={[st.karta, { marginHorizontal: 0, marginBottom: 10 }]}>
                  <Text style={st.naglowek}>🗣 Języki w szatni</Text>
                  <Text style={st.maly}>Obcokrajowców: {obcy.length} · słabo mówiących po polsku: {slabo.length}{slabo.length ? ` (${slabo.slice(0, 4).map((z) => `${z!.nazwisko} — ${NAZWA_JEZYKA[jezykZawodnika(z!)]}, ${Math.round(polski(z!))}%`).join("; ")})` : ""}</Text>
                  <Text style={[st.naglowek, { marginTop: 8 }]}>👥 Tłumacze klubu</Text>
                  {potrzebneJezyki(s).length ? <Text style={st.maly}>Szatnia potrzebuje: {potrzebneJezyki(s).map((j) => `${NAZWA_JEZYKA[j]}${tlumaczDla(s, j) ? " ✓" : " ✗"}`).join(", ")}</Text> : <Text style={st.maly}>Wszyscy dogadują się po polsku — tłumacz niepotrzebny.</Text>}
                  {tlumaczeKlubu(s).map((t) => (
                    <View key={t.id} style={[st.wiersz, { marginTop: 6, gap: 8 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[st.tekst, { fontSize: 13.5 }]}>{t.imie} {t.nazwisko} · {"★".repeat(t.jakosc)}{"☆".repeat(5 - t.jakosc)}</Text>
                        <Text style={[st.maly, { fontSize: 11 }]}>🎂 {urodzony(t.id, t.wiek, s.sezon)} · języki: {t.jezyki.map((j) => NAZWA_JEZYKA[j as Jezyk]).join(", ")} · {zl(t.pensja)}/tydz.</Text>
                      </View>
                      <Pressable onPress={() => { zwolnijTlumacza(s, t.id); odswiez(); }} style={[st.przyciskMaly, { borderColor: K.czerwony }]}><Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Zwolnij</Text></Pressable>
                    </View>))}
                  <Pressable onPress={() => { setRynekTl(!rynekTl); if (!rynekTl) rynekTlumaczy(s); }} style={[st.przyciskMaly, { marginTop: 8, alignItems: "flex-start" }]}><Text style={st.przyciskMalyTekst}>{rynekTl ? "▲ Ukryj kandydatów" : "＋ Zatrudnij tłumacza (kandydaci)"}</Text></Pressable>
                  {rynekTl && (<>
                    {rynekTlumaczy(s).map((t) => (
                      <View key={t.id} style={[st.wiersz, { marginTop: 6, gap: 8 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[st.tekst, { fontSize: 13 }]}>{t.imie} {t.nazwisko} · {"★".repeat(t.jakosc)}{"☆".repeat(5 - t.jakosc)}</Text>
                          <Text style={[st.maly, { fontSize: 11 }]}>🎂 {urodzony(t.id, t.wiek, s.sezon)} · {t.jezyki.map((j) => `${NAZWA_JEZYKA[j as Jezyk]}${potrzebneJezyki(s).includes(j as Jezyk) ? " ★" : ""}`).join(", ")} · {zl(pensjaTlumacza(t.jakosc, t.jezyki.length, k.poziom))}/tydz.</Text>
                        </View>
                        <Pressable onPress={() => { const b = zatrudnijTlumacza(s, t); if (b) info(b); odswiez(); }} style={[st.przyciskMaly, { borderColor: K.zielony }]}><Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>Zatrudnij</Text></Pressable>
                      </View>))}
                    <Pressable onPress={() => { rynekTlumaczy(s, true); odswiez(); }} style={{ marginTop: 6 }}><Text style={[st.maly, { color: K.niebieski }]}>⟳ Inni kandydaci</Text></Pressable>
                  </>)}
                  <Text style={[st.maly, { fontSize: 10.5, marginTop: 4 }]}>Tłumacz pomaga tylko w swoich językach: w szatni, na odprawach, w rozmowach i na konferencjach. Członek sztabu-cudzoziemiec z tłumaczem pracuje prawie na pełnych obrotach. ★ — język potrzebny Twojej szatni.</Text>
                  <Pressable onPress={() => { s.kursPolskiego = !s.kursPolskiego; odswiez(); }} style={[st.przyciskMaly, { marginTop: 6, alignItems: "flex-start", borderColor: s.kursPolskiego ? K.zielony : K.linia }]}>
                    <Text style={st.przyciskMalyTekst}>{s.kursPolskiego ? "✅" : "⬜"} Kurs języka polskiego — {zl(kosztKursu(k.poziom))}/tydz.</Text>
                    <Text style={[st.maly, { fontSize: 11 }]}>Lektorka 2× w tygodniu po treningu. Nauka ok. 2,5× szybsza (Słowianie i młodzi najszybciej).</Text>
                  </Pressable>
                  <Text style={[st.naglowek, { marginTop: 10 }]}>🎓 Twoje języki (trener)</Text>
                  {Object.entries(jezykiTrenera(s)).filter(([, v]) => (v ?? 0) > 0).map(([j, v]) => (
                    <View key={j} style={{ marginTop: 4 }}>
                      <Text style={st.maly}><Text style={{ color: K.tekst, fontWeight: "700" }}>{NAZWA_JEZYKA[j as Jezyk]}</Text> · {Math.round(v ?? 0)}% — {poziomJezykaTrenera(v ?? 0)}{s.naukaJezykaTrenera === j ? " · 📚 trwa kurs" : ""}</Text>
                      <View style={{ height: 4, backgroundColor: "#173126", borderRadius: 2, marginTop: 2 }}><View style={{ width: `${Math.round(v ?? 0)}%`, height: 4, backgroundColor: K.akcent, borderRadius: 2 }} /></View>
                    </View>))}
                  <Text style={[st.maly, { marginTop: 6 }]}>Ucz się języka (kurs {zl(kosztKursuTrenera(k.poziom))}/tydz., szybciej, gdy masz w kadrze zawodników mówiących tym językiem). Im lepiej znasz język zawodnika, tym lepiej rozumie Twoje odprawy i rozmowy.</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                    {JEZYKI_DO_NAUKI.map((j) => <Pressable key={j} onPress={() => { s.naukaJezykaTrenera = s.naukaJezykaTrenera === j ? undefined : j; jezykiTrenera(s); odswiez(); }} style={[st.chip, { marginBottom: 0, paddingVertical: 4 }, s.naukaJezykaTrenera === j && st.chipAktywny]}><Text style={{ color: s.naukaJezykaTrenera === j ? "#17310f" : K.tekst, fontSize: 11.5 }}>{NAZWA_JEZYKA[j]}{obcy.some((z) => jezykZawodnika(z!) === j) ? " ★" : ""}</Text></Pressable>)}
                  </View>
                  <Text style={[st.maly, { fontSize: 10.5, marginTop: 4 }]}>★ — język, którym mówi ktoś z Twojej kadry. Jeden kurs naraz; dotknij ponownie, by przerwać.</Text>
                </View>
              );
            })()}
            {ROLE_SZTABU.map((r) => {
              const czlonek = sztab[r.rola];
              const otwarty = rynek?.rola === r.rola;
              return (
                <View key={r.rola} style={[st.karta, { marginBottom: 8 }]}>
                  <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "flex-start" }]}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[st.tekst, { fontWeight: "800" }]}>{r.ikona} {r.nazwa}</Text>
                      <Text style={st.maly}>{r.opis}</Text>
                      {czlonek ? (
                        <View style={[st.wiersz, { gap: 8, marginTop: 6, alignItems: "flex-start" }]}>
                          <Twarz seed={`${czlonek.imie} ${czlonek.nazwisko}`} rozmiar={34} jersey="#2a2f3a" />
                          <View style={{ flex: 1 }}>
                            <Text style={[st.tekst, { fontSize: 14 }]}>{narodowoscKraju(czlonek.kraj)?.flaga ?? "🇵🇱"} {czlonek.imie} {czlonek.nazwisko}</Text>
                            <Text style={[st.maly, { fontSize: 11 }]}>🎂 {urodzony(czlonek.id ?? czlonek.imie + czlonek.nazwisko, czlonek.wiek, s.sezon)}{czlonek.kraj && czlonek.kraj !== "Polska" ? ` · ${czlonek.kraj} · ${NAZWA_JEZYKA[jezykKraju(czlonek.kraj)]}, polski ${Math.round(czlonek.polski ?? 0)}%${(czlonek.polski ?? 0) < 55 ? " — bez tłumacza pracuje słabiej" : ""}` : ""}</Text>
                            <Text style={st.maly}><Text style={{ color: K.akcent }}>{gwiazdki(czlonek.poziom)}</Text> · {zl(czlonek.pensja)}/kol.</Text>
                            <Text style={st.maly}>
                              {NAZWA_KONTRAKTU[czlonek.kontraktTyp ?? "amator"]}{czlonek.kontraktDo != null ? ` · umowa do ${czlonek.kontraktDo}` : ""}
                              {czlonek.kontraktDo != null && czlonek.kontraktDo <= s.sezon ? <Text style={{ color: K.czerwony }}> ⚠ wygasa</Text> : null}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={[st.maly, { marginTop: 4, color: K.szary }]}>Wakat — brak specjalisty</Text>
                      )}
                    </View>
                    <View style={{ gap: 6 }}>
                      <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => setRynek(otwarty ? null : { rola: r.rola, lista: rynekSztabu(s, r.rola) })}>
                        <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>{otwarty ? "Zwiń" : czlonek ? "Zmień" : "Zatrudnij"}</Text>
                      </Pressable>
                      {czlonek && (
                        <Pressable style={[st.przyciskMaly, { borderColor: K.zielony }]} onPress={() => { const b = przedluzSztab(s, r.rola, 2); if (b) info(b); else odswiez(); }}>
                          <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>Przedłuż +2</Text>
                        </Pressable>
                      )}
                      {czlonek && (
                        <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => { zwolnijSztab(s, r.rola); odswiez(); }}>
                          <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Zwolnij</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                  {otwarty && (
                    <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: K.linia, paddingTop: 6 }}>
                      <Text style={[st.maly, { marginBottom: 4 }]}>Rynek wolnych specjalistów — wybierz długość kontraktu:</Text>
                      {rynek!.lista.map((kand, i) => (
                        <View key={kand.id ?? i} style={{ paddingVertical: 5, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }}>
                          <View style={[st.wiersz, { gap: 8 }]}>
                            <Twarz seed={`${kand.imie} ${kand.nazwisko}`} rozmiar={30} jersey="#2a2f3a" />
                            <View style={{ flex: 1 }}>
                              <Text style={[st.tekst, { fontSize: 14 }]}>{narodowoscKraju(kand.kraj)?.flaga ?? "🇵🇱"} {kand.imie} {kand.nazwisko}</Text>
                              <Text style={[st.maly, { fontSize: 11 }]}>🎂 {urodzony(kand.id ?? kand.imie + kand.nazwisko, kand.wiek, s.sezon)}{kand.kraj && kand.kraj !== "Polska" ? ` · ${NAZWA_JEZYKA[jezykKraju(kand.kraj)]}, polski ${Math.round(kand.polski ?? 0)}%` : ""}</Text>
                              <Text style={st.maly}><Text style={{ color: K.akcent }}>{gwiazdki(kand.poziom)}</Text> · {zl(kand.pensja)}/kol. · podpis {zl(kand.pensja * 4)}</Text>
                            </View>
                          </View>
                          <View style={[st.wiersz, { gap: 6, marginTop: 4, flexWrap: "wrap" }]}>
                            {[1, 2, 3].map((lata) => (
                              <Pressable key={lata} style={[st.przyciskMaly, { borderColor: K.zielony }]} onPress={() => {
                                const b = zatrudnijSztab(s, r.rola, kand, lata);
                                if (b) info(b); else { setRynek(null); odswiez(); }
                              }}>
                                <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>Podpisz {lata} {lata === 1 ? "rok" : "lata"}</Text>
                              </Pressable>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {/* ——— Skauting talentów ——— */}
            <Text style={[st.naglowek, { marginTop: 14 }]}>🔎 Skauting talentów</Text>
            {poziomSztabu(s, "skaut") ? (
              s.skauting ? (
                <Text style={[st.maly, { marginBottom: 6 }]}>Skaut w regionie „{s.skauting.region}" — wróci za {Math.max(0, s.skauting.kolejkiDo - s.kolejka)} kol.</Text>
              ) : (
                <View style={{ marginBottom: 6 }}>
                  <Text style={[st.maly, { marginBottom: 4 }]}>Wyślij skauta po ukryte talenty (nawet nastolatków bez klubu z całego świata):</Text>
                  <View style={[st.wiersz, { flexWrap: "wrap", gap: 6 }]}>
                    {REGIONY_SKAUT.map((r) => (
                      <Pressable key={r} style={[st.przyciskMaly, { borderColor: K.niebieski }]} onPress={() => { const b = wyslijSkauta(s, r); if (b) info(b); else odswiez(); }}>
                        <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>{r} ({zl(kosztMisji(s, r))})</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )
            ) : (
              <Text style={[st.maly, { marginBottom: 6 }]}>Zatrudnij skauta (wyżej), aby wysyłać go po talenty z całego świata.</Text>
            )}
            {(s.odkryci ?? []).length > 0 && (
              <View style={[st.karta, { marginBottom: 8 }]}>
                <Text style={[st.maly, { marginBottom: 4 }]}>Odkryte talenty (obserwowani):</Text>
                {(s.odkryci ?? []).map((id) => {
                  const z = s.zawodnicy[id];
                  if (!z) return null;
                  const minW = wiekMinimalny(z);
                  const moze = z.wiek >= minW;
                  const fl = narodowoscKraju(z.kraj)?.flaga ?? "🇵🇱";
                  return (
                    <View key={id} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 1, borderTopColor: K.linia }]}>
                      <Pressable style={{ flex: 1 }} onPress={() => setProfil(id)}>
                        <Text style={[st.tekst, { fontSize: 14 }]} numberOfLines={1}>{fl} {z.imie} {z.nazwisko}</Text>
                        <Text style={st.maly}>{z.wiek} l. · {z.poz} · OVR {Math.floor(z.umiej)} · <Text style={{ color: K.akcent }}>pot. {Math.floor(z.potencjal)}</Text></Text>
                      </Pressable>
                      <Pressable disabled={!moze} style={[st.przyciskMaly, { borderColor: moze ? K.zielony : K.szary, opacity: moze ? 1 : 0.5 }]} onPress={() => { const b = sciagnijTalent(s, id); if (b) info(b); else odswiez(); }}>
                        <Text style={[st.przyciskMalyTekst, { color: moze ? K.zielony : K.szary }]}>{moze ? "Ściągnij ›" : `od ${minW} l.`}</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}

            <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 8 }]} onPress={onClose}>
              <Text style={st.przyciskTekst}>Zamknij</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
      <ProfilZawodnika s={s} zawodnikId={profil} onClose={() => setProfil(null)} odswiez={odswiez} />
    </Modal>
  );
}
