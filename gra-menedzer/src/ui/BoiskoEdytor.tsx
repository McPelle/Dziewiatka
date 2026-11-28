import { useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { FORMACJE, FORMACJE_SLOTY, przydzielSloty, silaSkladu } from "../engine/mecz";
import { jestMlodziezowcem, liczySieJakoMlodziezowiec, wymogMlodziezowca } from "../engine/swiat";
import { KAT_POZ, SKROT_POZ, dopasowanieDoSlotu, opisDopasowania } from "../data/pozycje";
import type { Pozycja, PozycjaSzczegolowa, StanGry, Zawodnik } from "../engine/types";
import { CZCIONKA, cien, K, st } from "./styl";

const KOLOR_POZ: Record<Pozycja, string> = { BR: "#ffce47", OBR: "#5aa9ff", POM: "#3fd47f", NAP: "#ff6470" };
const LINIA_Y: Record<Pozycja, number> = { NAP: 15, POM: 40, OBR: 65, BR: 86 };

// Współrzędne 11 slotów formacji (x,y w %), pogrupowane po liniach z zachowaniem kolejności lewa→prawa.
function wspolrzedneSlotow(formacja: string) {
  const slots = FORMACJE_SLOTY[formacja] ?? FORMACJE_SLOTY["4-4-2"];
  const linie: Record<Pozycja, number[]> = { NAP: [], POM: [], OBR: [], BR: [] };
  slots.forEach((slot, idx) => linie[KAT_POZ[slot]].push(idx));
  const coords: { slot: PozycjaSzczegolowa; x: number; y: number }[] = new Array(slots.length);
  (["NAP", "POM", "OBR", "BR"] as Pozycja[]).forEach((line) => {
    const arr = linie[line];
    arr.forEach((idx, i) => { coords[idx] = { slot: slots[idx], x: ((i + 1) / (arr.length + 1)) * 100, y: LINIA_Y[line] }; });
  });
  return coords;
}

export function BoiskoEdytor({ s, widoczny, onClose, odswiez }: { s: StanGry; widoczny: boolean; onClose: () => void; odswiez: () => void }) {
  const t = s.taktyka;
  const [formacja, setFormacja] = useState(t.formacja);
  // ustaw[i] = id zawodnika w slocie i (wg FORMACJE_SLOTY), null = pusty.
  const [ustaw, setUstaw] = useState<(string | null)[]>(() => przydzielSloty(s, t.sklad, t.formacja, !!t.reczneSloty).map((r) => r.id));
  // wybrany zawodnik (dotknij → postaw). from = numer slotu na boisku albo null (z ławki).
  const [wybrany, setWybrany] = useState<{ id: string; from: number | null } | null>(null);
  const coords = useMemo(() => wspolrzedneSlotow(formacja), [formacja]);

  const klub = s.kluby[s.mojKlub];
  const kadra = klub.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const wUstaw = new Set(ustaw.filter(Boolean) as string[]);
  const lawka = kadra.filter((z) => !wUstaw.has(z.id)).sort((a, b) => (["BR", "OBR", "POM", "NAP"].indexOf(a.poz) - ["BR", "OBR", "POM", "NAP"].indexOf(b.poz)) || b.umiej - a.umiej);

  const naBoisku = ustaw.filter(Boolean) as string[];
  const komplet = naBoisku.length === ustaw.length;
  const silaRaw = silaSkladu(s, komplet ? (ustaw as string[]) : naBoisku, formacja, komplet);
  const sila = Math.round((silaRaw.atak + silaRaw.obrona) / 2);
  const wymog = wymogMlodziezowca(klub.poziom, s.sciezka, s.ligi[klub.poziom - 1]?.nazwa);
  const mlodzi = naBoisku.filter((id) => s.zawodnicy[id] && liczySieJakoMlodziezowiec(s.zawodnicy[id], klub.poziom, s.sciezka)).length;

  const zapisz = (next: (string | null)[]) => {
    setUstaw(next);
    t.formacja = formacja;
    const pelny = next.every(Boolean);
    t.sklad = pelny ? (next as string[]) : (next.filter(Boolean) as string[]); // pełny skład: kolejność = sloty (ręczne ustawienie)
    t.reczneSloty = pelny;
    t.auto = false;
    odswiez();
  };
  const naLawke = (id: string) => { const next = ustaw.map((x) => (x === id ? null : x)); zapisz(next); };

  // Dotknięcie slotu na boisku.
  const klikSlot = (i: number) => {
    const zajId = ustaw[i];
    if (wybrany) {
      if (wybrany.from === i) { setWybrany(null); return; } // ten sam slot → odznacz
      const next = [...ustaw];
      // zamiana boisko↔boisko: ten z docelowego slotu wraca na miejsce wybranego
      if (wybrany.from !== null) next[wybrany.from] = zajId ?? null;
      // z ławki: jeśli slot był zajęty, zajId zostaje nadpisany → wraca na ławkę
      next[i] = wybrany.id;
      zapisz(next);
      setWybrany(null);
    } else if (zajId) {
      setWybrany({ id: zajId, from: i }); // wybierz zawodnika z boiska
    }
  };

  // Dotknięcie zawodnika na ławce.
  const klikLawka = (id: string) => {
    if (wybrany?.id === id) { setWybrany(null); return; } // odznacz
    if (wybrany && wybrany.from !== null) {
      // wybrany jest z boiska → ten z ławki wchodzi na jego miejsce, boiskowy schodzi na ławkę
      const next = [...ustaw];
      next[wybrany.from] = id;
      zapisz(next);
      setWybrany(null);
      return;
    }
    setWybrany({ id, from: null }); // wybierz z ławki
  };

  const zejdzNaLawke = () => { if (wybrany?.from != null) { naLawke(wybrany.id); setWybrany(null); } };

  const podpowiedz = wybrany
    ? `Wybrano: ${s.zawodnicy[wybrany.id]?.nazwisko ?? "?"} — dotknij pozycję na boisku, żeby go ustawić.`
    : "Dotknij zawodnika (na boisku lub ławce), potem dotknij pozycji.";

  return (
    <Modal visible={widoczny} animationType="slide" onRequestClose={onClose}>
      <View style={[st.ekran, { paddingTop: Platform.OS === "android" ? 30 : 8 }]}>
        {/* pasek */}
        <View style={[st.wiersz, { paddingHorizontal: 10, paddingBottom: 8, justifyContent: "space-between", alignItems: "center" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Pressable onPress={onClose} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 7, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", marginRight: 8, opacity: pressed ? 0.8 : 1 }]}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", marginRight: 3 }}>‹</Text>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800", fontFamily: CZCIONKA }}>Wstecz</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ color: K.tekst, fontSize: 17, fontWeight: "900", fontFamily: CZCIONKA }}>Ustaw skład</Text>
              <Text style={{ color: K.szary, fontSize: 11, fontFamily: CZCIONKA }}>OVR {sila} · {naBoisku.length}/11</Text>
            </View>
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => [{ backgroundColor: K.akcent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, opacity: pressed ? 0.9 : 1 }]}>
            <Text style={{ color: "#15300c", fontWeight: "900", fontSize: 14, fontFamily: CZCIONKA }}>Gotowe</Text>
          </Pressable>
        </View>

        {/* podpowiedź */}
        <View style={{ marginHorizontal: 12, marginBottom: 6, backgroundColor: wybrany ? "rgba(54,217,137,0.16)" : K.karta2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: wybrany ? K.akcent : K.linia }}>
          <Text style={{ color: wybrany ? K.akcent : K.szary, fontSize: 12, fontWeight: "700", fontFamily: CZCIONKA }}>{podpowiedz}</Text>
        </View>

        {/* formacje */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }} contentContainerStyle={{ paddingHorizontal: 10, alignItems: "center" }}>
          {Object.keys(FORMACJE).map((nazwa) => {
            const akt = nazwa === formacja;
            return (
              <Pressable key={nazwa} onPress={() => { setFormacja(nazwa); const re = przydzielSloty(s, t.sklad, nazwa).map((r) => r.id); setUstaw(re); setWybrany(null); t.formacja = nazwa; t.sklad = re.filter(Boolean) as string[]; t.reczneSloty = false; odswiez(); }}
                style={{ backgroundColor: akt ? K.akcent : K.karta2, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: akt ? K.akcent : K.linia }}>
                <Text style={{ color: akt ? "#15300c" : K.tekst, fontWeight: "800", fontSize: 13, fontFamily: CZCIONKA }}>{nazwa}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* BOISKO */}
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          <View style={{ width: "100%", aspectRatio: 0.72, backgroundColor: "#15823f", borderRadius: 14, overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 16.66}%`, height: "16.66%", backgroundColor: i % 2 ? "rgba(255,255,255,0.05)" : "transparent" }} />
            ))}
            <View style={{ position: "absolute", left: "50%", top: "50%", width: 90, height: 90, marginLeft: -45, marginTop: -45, borderRadius: 45, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" }} />
            <View style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, backgroundColor: "rgba(255,255,255,0.25)" }} />
            <View style={{ position: "absolute", left: "24%", right: "24%", bottom: 0, height: "13%", borderWidth: 2, borderBottomWidth: 0, borderColor: "rgba(255,255,255,0.28)" }} />
            <View style={{ position: "absolute", left: "24%", right: "24%", top: 0, height: "13%", borderWidth: 2, borderTopWidth: 0, borderColor: "rgba(255,255,255,0.28)" }} />
            {/* sloty */}
            {coords.map((c, i) => {
              const id = ustaw[i];
              const z = id ? s.zawodnicy[id] : null;
              const wybranyTu = z && wybrany?.id === z.id;
              const docelowy = !!wybrany && wybrany.from !== i; // slot, w który można wrzucić wybranego
              return (
                <Pressable key={i} onPress={() => klikSlot(i)} style={{ position: "absolute", left: `${c.x}%`, top: `${c.y}%`, width: 64, marginLeft: -32, marginTop: -30, alignItems: "center" }}>
                  {z ? (
                    <View style={{ alignItems: "center" }}>
                      <View style={wybranyTu ? { borderRadius: 16, borderWidth: 3, borderColor: "#fff", padding: 1 } : undefined}>
                        <Token z={z} mlody={jestMlodziezowcem(z)} />
                      </View>
                      {(() => {
                        const d = dopasowanieDoSlotu(z, c.slot);
                        if (d >= 0.999) return null;
                        const o = opisDopasowania(d);
                        return (
                          <View style={{ marginTop: 1, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 }}>
                            <Text style={{ color: o.kolor, fontSize: 9, fontWeight: "900", fontFamily: CZCIONKA }}>{SKROT_POZ[c.slot]} {Math.floor(z.umiej * d)} ({Math.round((d - 1) * 100)}%)</Text>
                          </View>
                        );
                      })()}
                    </View>
                  ) : (
                    <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderStyle: "dashed", borderColor: docelowy ? "#fff" : "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", backgroundColor: docelowy ? "rgba(54,217,137,0.35)" : "rgba(0,0,0,0.15)" }}>
                      <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800", fontFamily: CZCIONKA }}>{SKROT_POZ[c.slot] ?? c.slot}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "center", marginTop: 6 }]}>
            <Text style={{ color: mlodzi >= wymog ? K.szary : K.czerwony, fontSize: 11.5, fontFamily: CZCIONKA, flex: 1 }}>
              {mlodzi >= wymog ? "✓" : "⚠"} Młodzieżowcy (rocznik 2006+): {mlodzi}/{wymog} wymagane.
            </Text>
            {wybrany?.from != null && (
              <Pressable onPress={zejdzNaLawke} style={({ pressed }) => [{ backgroundColor: K.karta2, borderWidth: 1, borderColor: K.czerwony, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, opacity: pressed ? 0.8 : 1 }]}>
                <Text style={{ color: K.czerwony, fontSize: 12, fontWeight: "800", fontFamily: CZCIONKA }}>⬇ Na ławkę</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ŁAWKA / KADRA */}
        <Text style={[st.naglowek, { marginHorizontal: 14, marginTop: 10 }]}>Ławka i kadra — dotknij, by wybrać ({lawka.length})</Text>
        <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8, paddingBottom: 24 }}>
          {lawka.map((z) => {
            const sel = wybrany?.id === z.id;
            return (
              <Pressable key={z.id} onPress={() => klikLawka(z.id)} style={{ width: 70, alignItems: "center", margin: 4, borderRadius: 12, borderWidth: 2, borderColor: sel ? K.akcent : "transparent", backgroundColor: sel ? "rgba(54,217,137,0.14)" : "transparent", paddingVertical: 2 }}>
                <Token z={z} mlody={jestMlodziezowcem(z)} maly />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Token({ z, mlody, maly }: { z: Zawodnik; mlody?: boolean; maly?: boolean }) {
  const rozmiar = maly ? 36 : 44;
  return (
    <View style={{ alignItems: "center", width: maly ? 70 : 64 }}>
      <View style={{ width: rozmiar, height: rozmiar, borderRadius: rozmiar * 0.28, backgroundColor: KOLOR_POZ[z.poz], borderWidth: 2, borderColor: mlody ? "#36d989" : "#fff", alignItems: "center", justifyContent: "center", ...cien }}>
        <Text style={{ color: "#10231a", fontWeight: "900", fontSize: maly ? 13 : 15, fontFamily: CZCIONKA }}>{z.numer || "?"}</Text>
        <View style={{ position: "absolute", top: -6, right: -8, backgroundColor: "#10231a", borderRadius: 7, paddingHorizontal: 4, minWidth: 18, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900", fontFamily: CZCIONKA }}>{Math.round(z.umiej)}</Text>
        </View>
      </View>
      <View style={{ marginTop: 2, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 5, paddingHorizontal: 4, paddingVertical: 1, maxWidth: maly ? 70 : 64 }}>
        <Text numberOfLines={1} style={{ color: "#fff", fontSize: 9.5, fontWeight: "800", textAlign: "center", fontFamily: CZCIONKA }}>{z.nazwisko}</Text>
      </View>
      {maly && <Text style={{ color: K.szary, fontSize: 9, marginTop: 1, fontFamily: CZCIONKA }}>{z.pozS ? SKROT_POZ[z.pozS] : z.poz} · OVR {Math.round(z.umiej)}</Text>}
    </View>
  );
}
