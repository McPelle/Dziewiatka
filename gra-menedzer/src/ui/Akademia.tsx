import { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { kosztAkademii, naborAkademii, poziomAkademii, rozbudujAkademie, wychowankowie } from "../engine/sezon";
import { promujJuniora, skladJun, wypozyczJuniora, zwolnijJuniora } from "../engine/juniorzy";
import { oknoOtwarte } from "../engine/sezon";
import { mojPucharJun, mojaLigaJun, mojeWynikiJun, tabelaJun, wPucharzeJun } from "../engine/ligaJuniorow";
import type { KatJun, StanGry } from "../engine/types";
import { SKROT_POZ } from "../data/pozycje";
import { ProfilZawodnika } from "./ProfilZawodnika";
import { K, KOLOR_POZ, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
type Widok = "akademia" | "U19" | "U17";

export function Akademia({ s, widoczny, onClose, odswiez }: { s: StanGry; widoczny: boolean; onClose: () => void; odswiez: () => void }) {
  const [widok, setWidok] = useState<Widok>("akademia");
  const [profil, setProfil] = useState<string | null>(null);
  const klub = s.kluby[s.mojKlub];
  const poziom = poziomAkademii(klub);
  const nabor = naborAkademii(s);

  const rozbuduj = () => { const b = rozbudujAkademie(s); odswiez(); if (b) komunikat(b); };
  const WIDOKI: [Widok, string][] = [["akademia", "🎓 Akademia"], ["U19", "U-19"], ["U17", "U-17"]];

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "92%", paddingBottom: 20 }}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={st.tytul}>Akademia i juniorzy</Text>
            <Text style={[st.maly, { marginTop: 2 }]}>{klub.nazwa} · budżet {zl(klub.kasa)}</Text>

            <View style={[st.wiersz, { flexWrap: "wrap", gap: 6, marginTop: 10 }]}>
              {WIDOKI.map(([w, etk]) => (
                <Pressable key={w} onPress={() => setWidok(w)} style={[st.chip, w === widok && st.chipAktywny]}>
                  <Text style={{ color: w === widok ? "#17310f" : K.tekst, fontWeight: "700", fontSize: 13 }}>{etk}</Text>
                </Pressable>
              ))}
            </View>

            {widok === "akademia" ? (
              <AkademiaWidok s={s} poziom={poziom} nabor={nabor} kosztAk={kosztAkademii(s)} rozbuduj={rozbuduj} otworz={setProfil} />
            ) : (
              <KategoriaWidok s={s} kat={widok} odswiez={odswiez} otworz={setProfil} />
            )}

            <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 16 }]} onPress={onClose}>
              <Text style={st.przyciskTekst}>Zamknij</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
      <ProfilZawodnika s={s} zawodnikId={profil} onClose={() => setProfil(null)} odswiez={odswiez} />
    </Modal>
  );
}

function AkademiaWidok({ s, poziom, nabor, kosztAk, rozbuduj, otworz }: any) {
  const mlodzi = wychowankowie(s);
  const klub = s.kluby[s.mojKlub];
  const ileJun = (klub.juniorzy ?? []).length;
  return (
    <>
      <View style={{ marginTop: 14 }}>
        <Text style={st.naglowek}>Poziom akademii</Text>
        <View style={[st.wiersz, { justifyContent: "space-between" }]}>
          <Text style={{ fontSize: 24, letterSpacing: 2 }}>{"★".repeat(poziom)}<Text style={{ color: K.linia }}>{"★".repeat(5 - poziom)}</Text></Text>
          <Text style={[st.tekst, { fontWeight: "800" }]}>{poziom}/5</Text>
        </View>
        {poziom < 5 ? (
          <Pressable style={[st.przyciskMaly, { marginTop: 8, alignItems: "center", borderColor: K.akcent }]} onPress={rozbuduj}>
            <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Rozbuduj akademię — {zl(kosztAk)}</Text>
          </Pressable>
        ) : (
          <Text style={[st.maly, { marginTop: 8, color: K.zielony }]}>Najwyższy poziom — najlepsze warunki do szkolenia.</Text>
        )}
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={st.naglowek}>Akademia (U-19 / U-17) — {ileJun} zawodników</Text>
        <Text style={st.maly}>Adepci „z ulicy" dołączają w trakcie sezonu (lepsza akademia = częściej i zdolniejsi). Nabór rocznikowy zasila U-19/U-17 na starcie sezonu.</Text>
        <Text style={[st.maly, { marginTop: 4 }]}>Nabór rocznikowy: {nabor.minIlu}–{nabor.maxIlu} · potencjał do <Text style={{ fontWeight: "800" }}>{nabor.potencjalDo}</Text> · talent {nabor.szansaTalentu}%</Text>
      </View>

      <Text style={[st.naglowek, { marginTop: 16 }]}>Wychowankowie w pierwszym zespole (U-21) — {mlodzi.length}</Text>
      {mlodzi.length === 0 ? (
        <Text style={st.maly}>Brak U-21 w kadrze pierwszego zespołu. Powołuj juniorów do seniorów w zakładkach U-19/U-17.</Text>
      ) : mlodzi.map((z: any) => {
        const roznica = z.potencjal - z.umiej; const znak = roznica >= 20 ? "🌟" : roznica >= 12 ? "⬆" : "";
        return (
          <Pressable key={z.id} onPress={() => otworz(z.id)} style={[st.wiersz, { paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }]}>
            <Text style={{ color: KOLOR_POZ[z.poz], width: 36, fontWeight: "700", fontSize: 12 }}>{z.pozS ? SKROT_POZ[z.pozS as keyof typeof SKROT_POZ] : z.poz}</Text>
            <View style={{ flex: 1 }}><Text style={[st.tekst, { fontSize: 14 }]} numberOfLines={1}>{z.imie} {z.nazwisko} {znak}</Text><Text style={st.maly}>{z.wiek} lat</Text></View>
            <Text style={{ color: K.tekst, fontWeight: "800" }}>{Math.floor(z.umiej)} <Text style={st.maly}>/ {Math.floor(z.potencjal)}</Text></Text>
          </Pressable>
        );
      })}
    </>
  );
}

function KategoriaWidok({ s, kat, odswiez, otworz }: { s: StanGry; kat: KatJun; odswiez: () => void; otworz: (id: string) => void }) {
  const sklad = skladJun(s, s.mojKlub, kat);
  const liga = mojaLigaJun(s, kat);
  const puchar = mojPucharJun(s, kat);
  const tab = liga ? tabelaJun(liga, s.kluby) : [];
  const wyniki = mojeWynikiJun(s, kat);
  const pelno = s.kluby[s.mojKlub].zawodnicy.length >= 26;

  return (
    <>
      <Text style={[st.naglowek, { marginTop: 14 }]}>Skład {kat === "U19" ? "U-19 (juniorzy starsi)" : "U-17 (juniorzy młodsi)"} — {sklad.length}</Text>
      {sklad.length === 0 ? (
        <Text style={st.maly}>Brak zawodników w tej kategorii wiekowej. Adepci dołączą z akademii.</Text>
      ) : sklad.map((z) => (
        <View key={z.id} style={[st.wiersz, { paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }]}>
          <Pressable onPress={() => otworz(z.id)} style={[st.wiersz, { flex: 1 }]}>
            <Text style={{ color: KOLOR_POZ[z.poz], width: 34, fontWeight: "700", fontSize: 12 }}>{z.pozS ? SKROT_POZ[z.pozS as keyof typeof SKROT_POZ] : z.poz}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[st.tekst, { fontSize: 14 }]} numberOfLines={1}>{z.imie} {z.nazwisko}{z.potencjal - z.umiej >= 18 ? " 🌟" : ""}</Text>
              <Text style={st.maly}>{z.wiek} l. · OVR {Math.floor(z.umiej)} / pot. {Math.floor(z.potencjal)}</Text>
            </View>
          </Pressable>
          <View style={{ gap: 4 }}>
            <Pressable disabled={pelno} style={[st.przyciskMaly, { borderColor: pelno ? K.szary : K.zielony, opacity: pelno ? 0.5 : 1 }]}
              onPress={() => { const b = promujJuniora(s, z.id); odswiez(); if (b) komunikat(b); }}>
              <Text style={[st.przyciskMalyTekst, { color: pelno ? K.szary : K.zielony }]}>Powołaj ›</Text>
            </Pressable>
            {z.wiek >= 16 && oknoOtwarte(s) && (
              <Pressable style={[st.przyciskMaly, { borderColor: K.niebieski }]}
                onPress={() => { const b = wypozyczJuniora(s, z.id); odswiez(); if (b) komunikat(b); }}>
                <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>Wypożycz</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      {liga && (
        <>
          <Text style={[st.naglowek, { marginTop: 16 }]}>{liga.nazwa}</Text>
          <Text style={[st.maly, { marginBottom: 4 }]}>Ostatnie: {wyniki.length ? wyniki.map((w) => `${w.moje}:${w.ich}`).join("  ") : "—"}</Text>
          {tab.map((w, i) => {
            const moj = w.klubId === s.mojKlub;
            return (
              <View key={w.klubId} style={[st.wiersz, { paddingVertical: 3, backgroundColor: moj ? "rgba(54,217,137,0.12)" : undefined, borderRadius: 6, paddingHorizontal: 4 }]}>
                <Text style={[st.maly, { width: 22, textAlign: "right" }]}>{i + 1}.</Text>
                <Text style={[st.tekst, { flex: 1, fontSize: 13, fontWeight: moj ? "800" : "400" }]} numberOfLines={1}> {s.kluby[w.klubId]?.nazwa ?? "?"}</Text>
                <Text style={[st.maly, { width: 42, textAlign: "center" }]}>{w.bz}:{w.bs}</Text>
                <Text style={[st.tekst, { width: 30, textAlign: "right", fontWeight: "800" }]}>{w.pkt}</Text>
              </View>
            );
          })}
        </>
      )}

      {puchar && (
        <>
          <Text style={[st.naglowek, { marginTop: 16 }]}>{puchar.nazwa}</Text>
          <Text style={st.tekst}>
            {puchar.zwyciezca
              ? (puchar.zwyciezca === s.mojKlub ? "🥇 Zdobyliście puchar!" : `Zdobywca: ${s.kluby[puchar.zwyciezca]?.nazwa ?? "?"}`)
              : wPucharzeJun(s, kat) ? `W grze — runda ${puchar.runda + 1} (${puchar.pary.length} par).` : "Odpadliście z pucharu."}
          </Text>
        </>
      )}
    </>
  );
}
