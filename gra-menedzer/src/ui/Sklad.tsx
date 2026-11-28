import { EdytorZawodnika } from "./EdytorZawodnika";
import { ZespolyKlubu } from "./ZespolyKlubu";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { autoSklad, FORMACJE, POZYCJE, przydzielSloty, silaSkladu } from "../engine/mecz";
import { SKROT_POZ, ETYKIETA_POZ, opisDopasowania } from "../data/pozycje";
import { dataKontraktu, jestMlodziezowcem, liczySieJakoMlodziezowiec, NAZWA_KONTRAKTU, wymogMlodziezowca } from "../engine/swiat";
import { domyslnyWykonawca, poziomAkademii, treningiMoje, ustawWykonawca, wicekapitanowie, wykonawca, zwolnijZawodnika } from "../engine/sezon";
import type { Nastawienie, StanGry, Zawodnik } from "../engine/types";
import { Akademia } from "./Akademia";
import { BoiskoEdytor } from "./BoiskoEdytor";
import { Trening } from "./Trening";
import { fokus, intensywnosc } from "../engine/trening";
import { barwyKlubu } from "./barwy";
import { ProfilZawodnika } from "./ProfilZawodnika";
import { Twarz } from "./Twarz";
import { K, KOLOR_POZ, st } from "./styl";

const NASTAWIENIA: [Nastawienie, string][] = [["autobus", "Autobus"], ["obronne", "Obronne"], ["zrownowazone", "Zrównoważone"], ["ofensywne", "Ofensywne"]];

export function Sklad({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [tworz, setTworz] = useState(false);
  const [profil, setProfil] = useState<string | null>(null);
  const [akademia, setAkademia] = useState(false);
  const [trening, setTrening] = useState(false);
  const [sfg, setSfg] = useState<"karne" | "wolne" | "rozne" | null>(null);
  const [boisko, setBoisko] = useState(false);
  const t = s.taktyka;
  const kadra = [...s.kluby[s.mojKlub].zawodnicy, ...(s.powolaniKlubowi ?? [])]
    .map((id) => s.zawodnicy[id]).filter(Boolean)
    .sort((a, b) => POZYCJE.indexOf(a.poz) - POZYCJE.indexOf(b.poz) || b.umiej - a.umiej);
  const sila = silaSkladu(s, t.sklad, t.formacja, !!t.reczneSloty);
  const pozM = s.kluby[s.mojKlub].poziom; const wymM = wymogMlodziezowca(pozM, s.sciezka, s.ligi[pozM - 1]?.nazwa); const ileM = t.sklad.filter((id) => s.zawodnicy[id] && liczySieJakoMlodziezowiec(s.zawodnicy[id], pozM, s.sciezka)).length; const maMlodziezowca = ileM >= wymM;
  const f = FORMACJE[t.formacja];
  const wSkladzie = (poz: string) => t.sklad.filter((id) => s.zawodnicy[id]?.poz === poz).length;

  const przelacz = (z: Zawodnik) => {
    if (z.kontuzja > 0 || s.niedostepni[z.id]) return;
    t.auto = false;
    t.reczneSloty = false;
    if (t.sklad.includes(z.id)) t.sklad = t.sklad.filter((x) => x !== z.id);
    else if (t.sklad.length < 11) t.sklad = [...t.sklad, z.id];
    odswiez();
  };

  return (
    <ScrollView style={st.ekran} contentContainerStyle={{ paddingBottom: 30 }}>
      {tworz && <EdytorZawodnika s={s} zawodnikId={null} nowy onClose={() => setTworz(false)} odswiez={odswiez} />}
      <Pressable onPress={() => setTworz(true)} style={[st.przyciskMaly, { marginHorizontal: 12, marginTop: 12, alignItems: "center" }]}>
        <Text style={st.przyciskMalyTekst}>➕ Stwórz zawodnika (kreator twarzy albo własne zdjęcie)</Text>
      </Pressable>
      <Pressable onPress={() => setBoisko(true)} style={({ pressed }) => [st.karta, st.wiersz, { backgroundColor: K.murawa, borderColor: K.akcent, opacity: pressed ? 0.9 : 1, justifyContent: "space-between" }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900", fontFamily: undefined }}>⚽ Ustaw skład na boisku</Text>
          <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 2 }}>Przeciągaj zawodników palcem na pozycje — jak w FIFie.</Text>
        </View>
        <Text style={{ color: K.akcent, fontSize: 22, fontWeight: "900" }}>›</Text>
      </Pressable>
      <BoiskoEdytor s={s} widoczny={boisko} onClose={() => setBoisko(false)} odswiez={odswiez} />
      <View style={st.karta}>
        <Text style={st.naglowek}>Formacja</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {Object.keys(FORMACJE).map((nazwa) => (
            <Pressable
              key={nazwa}
              onPress={() => { t.formacja = nazwa; t.reczneSloty = false; if (t.auto) { t.sklad = autoSklad(s, s.mojKlub, nazwa); t.reczneSloty = true; } odswiez(); }}
              style={[st.chip, nazwa === t.formacja && st.chipAktywny]}
            >
              <Text style={{ color: nazwa === t.formacja ? "#1a1a1a" : K.tekst, fontWeight: "700" }}>{nazwa}</Text>
            </Pressable>
          ))}
        </View>
        {t.sklad.length === 11 && (() => {
          const role = przydzielSloty(s, t.sklad, t.formacja, !!t.reczneSloty);
          return (
            <View style={{ marginTop: 6 }}>
              <Text style={st.naglowek}>Ustawienie — role ({t.formacja})</Text>
              <View style={[st.wiersz, { flexWrap: "wrap", gap: 4 }]}>
                {role.map((r, i) => {
                  const z = r.id ? s.zawodnicy[r.id] : null;
                  const poza = r.dopas < 0.999;
                  const o = opisDopasowania(r.dopas);
                  return (
                    <View key={i} style={{ borderWidth: 1, borderColor: poza ? o.kolor : K.linia, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginBottom: 2 }}>
                      <Text style={{ fontSize: 10, color: poza ? o.kolor : K.szary, fontWeight: "700" }}>{SKROT_POZ[r.slot]}{z ? ` · ${Math.floor(z.umiej * r.dopas)}` : ""}{poza && z ? ` (${Math.round((r.dopas - 1) * 100)}%)` : ""}</Text>
                      <Text style={{ fontSize: 11, color: K.tekst }} numberOfLines={1}>{z ? z.nazwisko : "—"}{poza ? " ⚠" : ""}</Text>
                    </View>
                  );
                })}
              </View>
              {role.some((r) => r.dopas < 0.999) && <Text style={[st.maly, { color: K.akcent, marginTop: 2 }]}>⚠ = gra poza swoją pozycją — liczba po pozycji to jego OVR na tej pozycji (np. ŚP na LP ok. −18%, ŚP na LO ok. −34%). Naucz go pozycji w Centrum treningu, by grał pełną siłą.</Text>}
            </View>
          );
        })()}
        <Text style={st.naglowek}>Nastawienie</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {NASTAWIENIA.map(([n, opis]) => (
            <Pressable key={n} onPress={() => { t.nastawienie = n; odswiez(); }} style={[st.chip, n === t.nastawienie && st.chipAktywny]}>
              <Text style={{ color: n === t.nastawienie ? "#17310f" : K.tekst, fontWeight: "600" }}>{opis}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={st.naglowek}>Tempo gry</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {([["wolne", "Wolne"], ["normalne", "Normalne"], ["szybkie", "Szybkie"]] as const).map(([n, opis]) => {
            const akt = (t.tempo ?? "normalne") === n;
            return <Pressable key={n} onPress={() => { t.tempo = n; odswiez(); }} style={[st.chip, akt && st.chipAktywny]}><Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600" }}>{opis}</Text></Pressable>;
          })}
        </View>
        <Text style={st.naglowek}>Pressing</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {([["niski", "Niski"], ["sredni", "Średni"], ["wysoki", "Wysoki"]] as const).map(([n, opis]) => {
            const akt = (t.pressing ?? "sredni") === n;
            return <Pressable key={n} onPress={() => { t.pressing = n; odswiez(); }} style={[st.chip, akt && st.chipAktywny]}><Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600" }}>{opis}</Text></Pressable>;
          })}
        </View>
        <Text style={[st.maly, { marginTop: 2 }]}>Szybkie tempo = więcej bramek, większe zmęczenie. Wysoki pressing = więcej odbiorów, ale ryzyko z tyłu i zmęczenie.</Text>
        <Text style={st.naglowek}>Styl ataku</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {([["normalny", "Zbalansowany"], ["posiadanie", "Posiadanie"], ["skrzydla", "Skrzydłami"], ["dlugie", "Długie piłki"], ["kontra", "Z kontry"]] as const).map(([n, opis]) => {
            const akt = (t.stylAtaku ?? "normalny") === n;
            return <Pressable key={n} onPress={() => { t.stylAtaku = n; odswiez(); }} style={[st.chip, akt && st.chipAktywny]}><Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600" }}>{opis}</Text></Pressable>;
          })}
        </View>
        <Text style={st.naglowek}>Linia obrony</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {([["niska", "Niska (blok)"], ["normalna", "Normalna"], ["wysoka", "Wysoka (pułapka ofsajdowa)"]] as const).map(([n, opis]) => {
            const akt = (t.liniaObrony ?? "normalna") === n;
            return <Pressable key={n} onPress={() => { t.liniaObrony = n; odswiez(); }} style={[st.chip, akt && st.chipAktywny]}><Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600" }}>{opis}</Text></Pressable>;
          })}
        </View>
        <Text style={st.naglowek}>Szerokość</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {([["waska", "Wąska"], ["normalna", "Normalna"], ["szeroka", "Szeroka"]] as const).map(([n, opis]) => {
            const akt = (t.szerokosc ?? "normalna") === n;
            return <Pressable key={n} onPress={() => { t.szerokosc = n; odswiez(); }} style={[st.chip, akt && st.chipAktywny]}><Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600" }}>{opis}</Text></Pressable>;
          })}
        </View>
        <Text style={st.naglowek}>Krycie</Text>
        <View style={[st.wiersz, { flexWrap: "wrap" }]}>
          {([["strefowe", "Strefowe"], ["za_czlowiekiem", "Za człowiekiem"]] as const).map(([n, opis]) => {
            const akt = (t.krycie ?? "strefowe") === n;
            return <Pressable key={n} onPress={() => { t.krycie = n; odswiez(); }} style={[st.chip, akt && st.chipAktywny]}><Text style={{ color: akt ? "#17310f" : K.tekst, fontWeight: "600" }}>{opis}</Text></Pressable>;
          })}
        </View>
        <Text style={[st.maly, { marginTop: 2 }]}>Posiadanie/kontra kontrolują mecz; wysoka linia podnosi atak, ale odkrywa tyły; szeroko = więcej miejsca z przodu i z tyłu.</Text>
        <Text style={st.naglowek}>Trening</Text>
        <Pressable style={[st.karta, { marginTop: 0 }]} onPress={() => setTrening(true)}>
          <View style={[st.wiersz, { justifyContent: "space-between", alignItems: "center" }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[st.tekst, { fontWeight: "700" }]}>
                {s.treningAuto ? "🧠 Prowadzi sztab" : fokus(s).ikona + " " + fokus(s).etykieta} · {intensywnosc(s).ikona} {intensywnosc(s).etykieta}
              </Text>
              <Text style={st.maly}>{treningiMoje(s)}× w tygodniu · fokus, intensywność, trening indywidualny i nauka pozycji</Text>
            </View>
            <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>Centrum ›</Text>
          </View>
        </Pressable>
        <Pressable style={[st.przyciskMaly, { marginTop: 8, alignItems: "center", borderColor: K.niebieski }]} onPress={() => setAkademia(true)}>
          <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>🎓 Akademia młodzieży (poziom {poziomAkademii(s.kluby[s.mojKlub])}/5)</Text>
        </Pressable>
        {s.kapitan && s.zawodnicy[s.kapitan] && (
          <Text style={[st.maly, { marginTop: 4 }]}>Kapitan: <Text style={{ color: K.akcent, fontWeight: "700" }}>{s.zawodnicy[s.kapitan].imie} {s.zawodnicy[s.kapitan].nazwisko}</Text> (zmienisz w profilu zawodnika)</Text>
        )}
        {(() => { const wice = wicekapitanowie(s); return wice.length ? (
          <Text style={[st.maly, { marginTop: 2 }]}>Rada drużyny (wicekapitanowie): {wice.map((z) => `${z.imie} ${z.nazwisko}`).join(", ")}</Text>
        ) : null; })()}
        <View style={{ marginTop: 6 }}>
          <Text style={st.maly}>⚽ Stałe fragmenty gry (wykonawcy):</Text>
          {([["karne", "Rzuty karne"], ["wolne", "Rzuty wolne"], ["rozne", "Rzuty rożne"]] as const).map(([r, etyk]) => {
            const id = wykonawca(s, r); const z = id ? s.zawodnicy[id] : undefined;
            const domysl = domyslnyWykonawca(s, s.mojKlub, r);
            return (
              <Pressable key={r} onPress={() => setSfg(r)} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 3 }]}>
                <Text style={st.maly}>{etyk}</Text>
                <Text style={[st.maly, { color: K.akcent, fontWeight: "700" }]}>{z ? `${z.imie} ${z.nazwisko}` : "—"}{id && id === domysl ? " (auto)" : ""} ✎</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[st.wiersz, { justifyContent: "space-between", marginTop: 4 }]}>
          <Text style={st.maly}>
            Skład {t.sklad.length}/11 · atak {sila.atak.toFixed(0)} · obrona {sila.obrona.toFixed(0)}
          </Text>
          <Pressable
            style={[st.przyciskMaly, t.auto && { borderColor: K.akcent }]}
            onPress={() => { t.auto = !t.auto; t.reczneSloty = false; if (t.auto) { t.sklad = autoSklad(s, s.mojKlub, t.formacja); t.reczneSloty = true; } odswiez(); }}
          >
            <Text style={[st.przyciskMalyTekst, t.auto && { color: K.akcent }]}>{t.auto ? "✓ Auto skład" : "Auto skład"}</Text>
          </Pressable>
        </View>
        <Text style={[st.maly, { marginTop: 8 }]}>
          Potrzeba: {POZYCJE.map((p) => `${p} ${wSkladzie(p)}/${f[p]}`).join(" · ")}. Dotknij zawodnika, żeby go wstawić lub zdjąć
          (wyłącza auto skład).
        </Text>
        {wymM > 0 && (
          <Text style={[st.maly, { marginTop: 6, color: maMlodziezowca ? K.zielony : K.czerwony, fontWeight: "700" }]}>
            {maMlodziezowca ? `🟢 Młodzieżowcy (rocznik 2006 i młodsi) w składzie: ${ileM}/${wymM} — OK` : `⚠ Młodzieżowcy w składzie: ${ileM}/${wymM}! Muszą grać cały mecz — inaczej walkower 0:3 (przepis PZPN).`}
            {s.mlodziezoweWystepy != null ? `  ·  wystąpień młodzieżowców w sezonie: ${s.mlodziezoweWystepy}` : ""}
          </Text>
        )}
        {s.kluby[s.mojKlub].rezerwaId && (
          <Text style={[st.maly, { marginTop: 4 }]}>Rezerwy: {s.kluby[s.kluby[s.mojKlub].rezerwaId!].nazwa} — zawodnicy poza składem grają tam (kondycja, rozwój).</Text>
        )}
        <ZespolyKlubu s={s} odswiez={odswiez} />
      </View>

      {POZYCJE.map((poz) => (
        <View key={poz} style={st.karta}>
          <Text style={[st.naglowek, { color: KOLOR_POZ[poz] }]}>
            {{ BR: "Bramkarze", OBR: "Obrońcy", POM: "Pomocnicy", NAP: "Napastnicy" }[poz]}
          </Text>
          {kadra.filter((z) => z.poz === poz).map((z) => {
            const gra = t.sklad.includes(z.id);
            const brak = z.kontuzja > 0 ? `🚑 kontuzja ${z.kontuzja} kol.` : z.zawieszenie > 0 ? `⛔ pauza ${z.zawieszenie} kol.` : s.niedostepni[z.id];
            return (
              <View key={z.id} style={[st.wiersz, { paddingVertical: 8, borderTopWidth: 1, borderTopColor: K.linia, opacity: brak ? 0.5 : 1 }]}>
                <Pressable onPress={() => przelacz(z)} hitSlop={6}
                  style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: gra ? K.akcent : K.karta2, marginRight: 10, alignItems: "center", justifyContent: "center" }}>
                  {gra && <Text style={{ color: "#1a1a1a", fontWeight: "900" }}>✓</Text>}
                </Pressable>
                <Pressable onPress={() => setProfil(z.id)} style={{ marginRight: 9 }}>
                  <Twarz seed={z.imie + z.nazwisko} rozmiar={34} zdjecie={z.zdjecie} cechy={z.twarz} kraj={z.kraj} jersey={barwyKlubu(s.kluby[s.mojKlub].nazwa)[0]} />
                </Pressable>
                <Pressable style={{ flex: 1 }} onPress={() => setProfil(z.id)}>
                  <Text style={st.tekst}>#{z.numer || "—"} {z.imie} {z.nazwisko}{jestMlodziezowcem(z) ? " 🟢" : ""}{z.kartki > 0 ? ` · 🟨${z.kartki}` : ""}{z.prosiOTransfer ? " · ✈" : ""}</Text>
                  <Text style={st.maly}>
                    <Text style={{ color: KOLOR_POZ[z.poz], fontWeight: "800" }}>{z.pozS ? ETYKIETA_POZ[z.pozS] : { BR: "Bramkarz", OBR: "Obrońca", POM: "Pomocnik", NAP: "Napastnik" }[z.poz]}</Text>
                    {z.pozycjeDodatkowe?.length ? ` (też ${z.pozycjeDodatkowe.map((p) => SKROT_POZ[p]).join(", ")})` : ""} · {z.wiek} l. · {zl(z.pensja)}/kol. · {NAZWA_KONTRAKTU[z.kontraktTyp]} do {dataKontraktu(z.kontraktDo)}
                    {brak ? ` · ${brak}` : ""}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setProfil(z.id)} style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: K.tekst, fontSize: 18, fontWeight: "800" }}>{Math.floor(z.umiej)}</Text>
                  <Text style={[st.maly, { fontSize: 11 }]}>pot. {Math.floor(z.potencjal)}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
      <Text style={[st.maly, { marginHorizontal: 12, marginTop: 10 }]}>Dotknij kółka, by wstawić/zdjąć ze składu. Dotknij nazwiska, by otworzyć profil (kontrakt, morale, kariera).</Text>
      <ProfilZawodnika s={s} zawodnikId={profil} onClose={() => setProfil(null)} odswiez={odswiez} />
      <Akademia s={s} widoczny={akademia} onClose={() => setAkademia(false)} odswiez={odswiez} />
      <Trening s={s} widoczny={trening} onClose={() => setTrening(false)} odswiez={odswiez} otworzProfil={(id) => { setTrening(false); setProfil(id); }} />
      <Modal visible={!!sfg} transparent animationType="slide" onRequestClose={() => setSfg(null)}>
        <View style={st.zaslona}>
          <View style={[st.arkusz, { maxHeight: "80%", paddingBottom: 20 }]}>
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <Text style={st.tytul}>Wykonawca: {sfg === "karne" ? "rzuty karne" : sfg === "wolne" ? "rzuty wolne" : "rzuty rożne"}</Text>
              <Pressable style={[st.przyciskMaly, { alignItems: "center", marginVertical: 8, borderColor: K.akcent }]} onPress={() => { if (sfg) ustawWykonawca(s, sfg, null); setSfg(null); odswiez(); }}>
                <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>Auto (najlepszy dostępny)</Text>
              </Pressable>
              {sfg && [...s.kluby[s.mojKlub].zawodnicy].map((id) => s.zawodnicy[id]).filter((z) => z && z.poz !== "BR")
                .sort((a, b) => {
                  const oc = (z: Zawodnik) => { const at = z.atrybuty; if (!at) return z.umiej; if (sfg === "karne") return at.str + (z.cechy?.includes("egzekutor") ? 8 : 0); if (sfg === "wolne") return at.str * 0.6 + at.dry * 0.5 + at.pod * 0.2; return at.pod * 0.6 + at.dry * 0.5; };
                  return oc(b) - oc(a);
                })
                .map((z) => {
                  const wybrany = s.wykonawcy?.[sfg] === z.id;
                  return (
                    <Pressable key={z.id} onPress={() => { ustawWykonawca(s, sfg, z.id); setSfg(null); odswiez(); }} style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }]}>
                      <Text style={[st.tekst, { fontSize: 14 }]}>{z.poz} {z.imie} {z.nazwisko}{wybrany ? " ✓" : ""}</Text>
                      <Text style={st.maly}>str {z.atrybuty?.str ?? "—"} · tech {z.atrybuty?.dry ?? "—"} · pod {z.atrybuty?.pod ?? "—"}</Text>
                    </Pressable>
                  );
                })}
              <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 12 }]} onPress={() => setSfg(null)}>
                <Text style={st.przyciskTekst}>Zamknij</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
