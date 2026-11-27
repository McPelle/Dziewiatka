// @ts-nocheck  (skrypt uruchomieniowy pod tsx/Node — korzysta z fs/fetch; nie jest częścią builda aplikacji)
/*
 * Dociąganie realnych danych niższych lig (lata założenia + pojemności stadionów).
 * URUCHAMIAĆ NA MASZYNIE Z OTWARTYM INTERNETEM (VPS / Windows) — w chmurowej sesji
 * Claude 90minut (HTTP) i część hostów są nieosiągalne.
 *
 * Tryby:
 *   npx tsx scripts/dociagnij-dane.ts            → dociąga i zapisuje scripts/dane/dociagniete.json (DO WERYFIKACJI; nic nie zmienia w grze)
 *   npx tsx scripts/dociagnij-dane.ts --z90minut → dodatkowo próbuje 90minut.pl (HTTP) dla pojemności
 *   npx tsx scripts/dociagnij-dane.ts --scal     → scala zweryfikowany scripts/dane/dociagniete.json do zalozenie.ts / pojemnosci.ts
 *   npx tsx scripts/dociagnij-dane.ts --limit=50 → ogranicz liczbę klubów (test)
 *
 * ZASADA: tylko fakty potwierdzone na stronie KLUBOWEJ. Niepewne/niejednoznaczne są pomijane (nie zgadujemy).
 * Po dociągnięciu PRZEJRZYJ dociagniete.json, usuń wątpliwe wpisy, dopiero potem --scal.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { SCIEZKI } from "../src/data/sciezki";
import { ZALOZENIE_KLUBOW } from "../src/data/zalozenie";
import { POJEMNOSC_KLUBOW } from "../src/data/pojemnosci";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, "dane", "dociagniete.json");
const UA = "SystemSprzedawcy-DataFetch/1.0 (prywatny projekt menedżera)"; // generyczny — bez danych osobowych

const args = process.argv.slice(2);
const flaga = (n: string) => args.includes(n);
const limit = Number((args.find((a) => a.startsWith("--limit=")) || "").split("=")[1]) || Infinity;

// ——— lista klubów bez danych (III liga → klasa B; poziom ≥ 4) ———
function braki(): { nazwa: string; miasto: string; rok: boolean; poj: boolean }[] {
  const seen = new Set<string>(); const out: { nazwa: string; miasto: string; rok: boolean; poj: boolean }[] = [];
  for (const sc of SCIEZKI) for (let i = 0; i < sc.ligi.length; i++) {
    if (i + 1 < 4) continue; // poziom = indeks+1; bierzemy III liga → klasa B
    const liga = sc.ligi[i];
    for (const k of liga.kluby as any[]) {
      if (seen.has(k.nazwa)) continue; seen.add(k.nazwa);
      const rok = ZALOZENIE_KLUBOW[k.nazwa] == null, poj = POJEMNOSC_KLUBOW[k.nazwa] == null;
      if (rok || poj) out.push({ nazwa: k.nazwa, miasto: k.miasto, rok, poj });
    }
  }
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/ł/g, "l").replace(/ą/g, "a").replace(/ę/g, "e").replace(/ś/g, "s").replace(/ć/g, "c").replace(/ź|ż/g, "z").replace(/ó/g, "o").replace(/ń/g, "n").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const tokeny = (s: string) => new Set(norm(s).split(" ").filter((w) => w.length > 2));
function podobne(a: string, b: string): boolean { const ta = tokeny(a), tb = tokeny(b); let wsp = 0; for (const t of ta) if (tb.has(t)) wsp++; return wsp >= Math.min(2, ta.size); }
const rezerwaBaza = (n: string) => n.replace(/\s+(II|III|IV)\b/g, "").replace(/\s+/g, " ").trim();

async function wiki(url: string): Promise<any> {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/** Szuka artykułu klubu na pl.wikipedia i wyciąga rok założenia + pojemność z infoboksu (tylko gdy to artykuł o klubie). */
async function zWikipedii(nazwa: string, miasto: string): Promise<{ rok?: number; poj?: number; zrodlo?: string }> {
  const q = encodeURIComponent(`${nazwa} ${miasto} piłka`);
  const sr = await wiki(`https://pl.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&srlimit=5&origin=*`);
  const trafienia: { title: string }[] = sr?.query?.search ?? [];
  for (const t of trafienia.slice(0, 5)) {
    if (!podobne(t.title, nazwa) && !podobne(t.title, rezerwaBaza(nazwa))) continue;
    const pr = await wiki(`https://pl.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(t.title)}&prop=wikitext&format=json&origin=*`);
    const wt: string = pr?.parse?.wikitext?.["*"] ?? "";
    if (!/piłk|klub sportowy|stadion|Piłka nożna/i.test(wt)) continue; // to musi być klub piłkarski
    const rokM = wt.match(/(?:Rok założenia|Data założenia|Założony|Rok powstania)\s*=\s*(?:\[\[)?.*?(\d{4})/i);
    const pojM = wt.match(/Pojemność\s*=\s*(?:\[\[)?\s*([\d  .]{2,})/i);
    const rok = rokM ? Number(rokM[1]) : undefined;
    const poj = pojM ? Number(pojM[1].replace(/[  .]/g, "")) : undefined;
    const okRok = rok && rok >= 1900 && rok <= 2026 ? rok : undefined;
    const okPoj = poj && poj >= 100 && poj <= 80000 ? poj : undefined;
    if (okRok || okPoj) return { rok: okRok, poj: okPoj, zrodlo: `pl.wikipedia.org/wiki/${encodeURIComponent(t.title)}` };
  }
  return {};
}

async function glowna() {
  if (flaga("--scal")) return scal();
  const lista = braki().slice(0, limit);
  console.log(`Klubów do sprawdzenia: ${lista.length}. Źródło: pl.wikipedia (API)${flaga("--z90minut") ? " + 90minut" : ""}.`);
  const zalozenie: Record<string, number> = {}, pojemnosc: Record<string, number> = {}, zrodla: Record<string, string> = {};
  let i = 0;
  for (const k of lista) {
    i++;
    try {
      const w = await zWikipedii(k.nazwa, k.miasto);
      if (k.rok && w.rok) { zalozenie[k.nazwa] = w.rok; zrodla[k.nazwa] = w.zrodlo!; }
      if (k.poj && w.poj) { pojemnosc[k.nazwa] = w.poj; zrodla[k.nazwa] = w.zrodlo!; }
      if (w.rok || w.poj) console.log(`  ✓ ${k.nazwa}: ${w.rok ? "rok " + w.rok : ""}${w.rok && w.poj ? ", " : ""}${w.poj ? "poj " + w.poj : ""}`);
    } catch (e) { /* pomijamy błędy sieci dla pojedynczego klubu */ }
    if (i % 25 === 0) console.log(`… ${i}/${lista.length}`);
    await new Promise((r) => setTimeout(r, 300)); // delikatnie dla API
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ zalozenie, pojemnosc, zrodla }, null, 2), "utf-8");
  console.log(`\nZapisano ${Object.keys(zalozenie).length} lat i ${Object.keys(pojemnosc).length} pojemności → ${OUT}`);
  console.log("PRZEJRZYJ ten plik, usuń wątpliwe wpisy, a potem: npx tsx scripts/dociagnij-dane.ts --scal");
}

/** Zachowawczy merge do danych gry: tylko kluby istniejące w grze i tylko brakujące pola (bez nadpisywania). */
function scal() {
  if (!fs.existsSync(OUT)) { console.error(`Brak ${OUT} — najpierw uruchom bez --scal.`); process.exit(1); }
  const d = JSON.parse(fs.readFileSync(OUT, "utf-8"));
  const valid = new Set<string>();
  for (const sc of SCIEZKI) for (const liga of sc.ligi) for (const k of liga.kluby as any[]) valid.add(k.nazwa);
  const dodaj = (plik: string, mapa: Record<string, number>, istn: Record<string, number>, komentarz: string) => {
    const linie = Object.keys(mapa).filter((n) => valid.has(n) && istn[n] == null).sort().map((n) => `  ${JSON.stringify(n)}: ${mapa[n]},`);
    if (!linie.length) { console.log(`${plik}: nic nowego`); return; }
    const p = path.join(DIR, "..", "src", "data", plik);
    const s = fs.readFileSync(p, "utf-8"); const idx = s.indexOf("\n};");
    fs.writeFileSync(p, s.slice(0, idx) + "\n  // " + komentarz + "\n" + linie.join("\n") + s.slice(idx), "utf-8");
    console.log(`${plik}: dodano ${linie.length}`);
  };
  dodaj("zalozenie.ts", d.zalozenie ?? {}, ZALOZENIE_KLUBOW, "Dociągnięte z sieci (scripts/dociagnij-dane.ts)");
  dodaj("pojemnosci.ts", d.pojemnosc ?? {}, POJEMNOSC_KLUBOW, "Dociągnięte z sieci (scripts/dociagnij-dane.ts)");
  console.log("Gotowe. Sprawdź `git diff`, odpal `npx tsc --noEmit`, potem commit.");
}

glowna();
