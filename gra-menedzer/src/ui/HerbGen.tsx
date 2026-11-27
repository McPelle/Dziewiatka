import { Text, View } from "react-native";
import { cien } from "./styl";

// ——— Pomocnicze (kolory, hasz, monogram) ———
function jasnosc(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function hx(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
function zmieszaj(hex: string, cel: number, t: number): string {
  const [r, g, b] = rgb(hex);
  return hx(r + (cel - r) * t, g + (cel - g) * t, b + (cel - b) * t);
}
const przyciemnij = (h: string, t = 0.28) => zmieszaj(h, 0, t);
const rozjasnij = (h: string, t = 0.32) => zmieszaj(h, 255, t);
function kontrast(tlo: string): string {
  return jasnosc(tlo) > 0.6 ? "#16181d" : "#ffffff";
}
/** Akcent czytelny na tle — gdy za podobny, pochodna tła. */
function akcentCzytelny(tlo: string, akcent: string): string {
  if (Math.abs(jasnosc(tlo) - jasnosc(akcent)) >= 0.22) return akcent;
  return jasnosc(tlo) > 0.5 ? przyciemnij(tlo, 0.45) : rozjasnij(tlo, 0.5);
}
function hasz(s: string): number {
  let h = 2166136261;
  for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const POMIN = new Set(["FC", "AC", "AS", "RB", "SC", "SK", "US", "KS", "GKS", "MKS", "LKS", "AP", "UKS", "KP", "MKP", "WKS", "GLKS", "GTS", "LZS", "TS"]);
function monogram(nazwa: string): string {
  const slowa = nazwa.split(/[\s/.-]+/).filter((w) => w && !POMIN.has(w.toUpperCase()) && !/^(I|II|III|IV|V|VI|VII|VIII)$/i.test(w) && !/^\d+$/.test(w));
  if (slowa.length >= 2) return (slowa[0][0] + slowa[1][0]).toUpperCase();
  const w = slowa[0] ?? nazwa.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, "");
  return w.slice(0, 3).toUpperCase();
}
/** Numer rezerw (II/III/IV) jako dopisek do monogramu, jeśli jest. */
function sufiksRezerw(nazwa: string): string {
  const m = nazwa.match(/\b(II|III|IV)\b/);
  return m ? m[1] : "";
}

const WZORY = ["pas", "slupy", "skos", "szewron", "polowa", "cwiartki", "solid", "gwiazda", "luk"] as const;

/**
 * Oryginalny, proceduralny herb klubu — WŁASNY emblemat w prawdziwych barwach klubu
 * (barwy to fakt; kształt/wzór generowany, NIE kopia chronionego logo).
 * Deterministyczny z nazwy: sylwetka (tarcza/koło), wzór heraldyczny, roundel z monogramem,
 * a przy większym rozmiarze wstęga z rokiem założenia.
 */
export function HerbGenerowany({
  nazwa, tlo, akcent, rok, rozmiar = 28,
}: { nazwa: string; tlo: string; akcent: string; rok?: number; rozmiar?: number }) {
  const R = rozmiar;
  const h = hasz(nazwa);
  const ak = akcentCzytelny(tlo, akcent);
  const akCiemny = przyciemnij(ak, 0.22);
  const kolo = (h >> 5) % 3 === 0;            // ~1/3 klubów: okrągła odznaka
  const wzor = WZORY[h % WZORY.length];
  const W = R;
  const Hh = kolo ? R : R * 1.16;
  const txt = kontrast(tlo);
  const maly = R < 30;

  // sylwetka
  const ksztalt = kolo
    ? { borderRadius: R / 2 }
    : { borderTopLeftRadius: R * 0.17, borderTopRightRadius: R * 0.17, borderBottomLeftRadius: R * 0.5, borderBottomRightRadius: R * 0.5 };

  // roundel (środek z monogramem) — gwarantuje czytelność na każdym wzorze
  const disc = W * (kolo ? 0.64 : 0.6);
  const mono = monogram(nazwa);
  const sufiks = sufiksRezerw(nazwa);
  const rokWstega = !kolo && !maly && R >= 44 && typeof rok === "number";

  const ring = Math.max(1.3, R / 20); // jasny obrys dla kontrastu na ciemnym tle
  return (
    <View style={{ width: W, height: Hh, alignItems: "center", justifyContent: "center" }}>
      {/* jasny pierścień + cień — tarcza jest wyraźna na każdym tle */}
      <View style={[{ width: W, height: Hh, backgroundColor: "rgba(255,255,255,0.78)", padding: ring, ...cien }, ksztalt]}>
      <View
        style={[
          {
            width: "100%", height: "100%", backgroundColor: tlo, overflow: "hidden",
            borderWidth: Math.max(1, R / 18), borderColor: akCiemny,
            alignItems: "center", justifyContent: "center",
          },
          ksztalt,
        ]}
      >
        {/* ——— wzór heraldyczny (akcent) ——— */}
        {wzor === "pas" && (
          <View style={{ position: "absolute", top: Hh * 0.37, left: 0, right: 0, height: Hh * 0.28, backgroundColor: ak }} />
        )}
        {wzor === "slupy" && (
          <>
            <View style={{ position: "absolute", top: 0, bottom: 0, left: W * 0.19, width: W * 0.16, backgroundColor: ak }} />
            <View style={{ position: "absolute", top: 0, bottom: 0, right: W * 0.19, width: W * 0.16, backgroundColor: ak }} />
          </>
        )}
        {wzor === "skos" && (
          <View style={{ position: "absolute", top: Hh / 2 - W * 0.12, left: -W * 0.25, width: W * 1.5, height: W * 0.24, backgroundColor: ak, transform: [{ rotate: "-42deg" }] }} />
        )}
        {wzor === "szewron" && (
          <>
            <View style={{ position: "absolute", top: Hh * 0.26, left: -W * 0.12, width: W * 0.82, height: W * 0.15, backgroundColor: ak, transform: [{ rotate: "34deg" }] }} />
            <View style={{ position: "absolute", top: Hh * 0.26, right: -W * 0.12, width: W * 0.82, height: W * 0.15, backgroundColor: ak, transform: [{ rotate: "-34deg" }] }} />
          </>
        )}
        {wzor === "polowa" && (
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: W / 2, backgroundColor: ak }} />
        )}
        {wzor === "cwiartki" && (
          <>
            <View style={{ position: "absolute", top: 0, left: 0, width: W / 2, height: Hh / 2, backgroundColor: ak }} />
            <View style={{ position: "absolute", bottom: 0, right: 0, width: W / 2, height: Hh / 2, backgroundColor: ak }} />
          </>
        )}
        {wzor === "luk" && (
          <View style={{ position: "absolute", top: -Hh * 0.52, left: -W * 0.1, width: W * 1.2, height: Hh * 0.9, borderRadius: W, backgroundColor: ak }} />
        )}
        {/* "solid" / "gwiazda": bez wzoru tła */}

        {/* delikatny połysk u góry (profesjonalny odcień) */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: Hh * 0.3, backgroundColor: "#ffffff", opacity: 0.07 }} />

        {/* gwiazdka nad roundelem (wariant "gwiazda", większe rozmiary) */}
        {wzor === "gwiazda" && R >= 32 && (
          <Text style={{ position: "absolute", top: Hh * 0.08, color: ak, fontSize: R * 0.26, fontWeight: "900" }}>★</Text>
        )}

        {/* roundel z monogramem */}
        <View
          style={{
            width: disc, height: disc, borderRadius: disc / 2, backgroundColor: tlo,
            borderWidth: Math.max(1, R / 22), borderColor: ak,
            alignItems: "center", justifyContent: "center",
            marginTop: wzor === "gwiazda" && R >= 32 ? R * 0.1 : 0,
          }}
        >
          <Text
            style={{
              color: txt, fontWeight: "900", fontSize: disc * (mono.length >= 3 ? 0.42 : 0.5),
              letterSpacing: -0.5, textShadowColor: "rgba(0,0,0,0.25)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
            }}
          >
            {mono}
          </Text>
          {sufiks && !maly && (
            <Text style={{ color: txt, opacity: 0.8, fontWeight: "800", fontSize: disc * 0.2, marginTop: -disc * 0.06 }}>{sufiks}</Text>
          )}
        </View>

        {/* wstęga z rokiem założenia (tylko większe tarcze, gdy rok znany) */}
        {rokWstega && (
          <View style={{ position: "absolute", bottom: Hh * 0.05, backgroundColor: akCiemny, paddingHorizontal: R * 0.1, borderRadius: R * 0.06 }}>
            <Text style={{ color: kontrast(akCiemny), fontWeight: "800", fontSize: R * 0.17 }}>{rok}</Text>
          </View>
        )}
      </View>
      </View>
    </View>
  );
}
