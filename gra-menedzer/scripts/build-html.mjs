// Pakuje webowy build Expo w JEDEN samowystarczalny plik HTML (cała gra + herby + ikona).
// Użycie:
//   cd gra-menedzer
//   npx expo export --platform web
//   (opcjonalnie kompresja herbów: find dist/assets -name '*.png' -print0 | xargs -0 -P4 -I{} convert "{}" -resize '96x96>' -colors 64 -strip "{}")
//   node scripts/build-html.mjs dist index.html
// Wynik: index.html — otwiera się w Safari/Chrome bez żadnych dodatkowych plików,
// gotowy do wrzucenia na Netlify (Upload a new version) albo do odświeżenia linku Claude (Artifact).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = process.argv[2] || "dist";
const OUT = process.argv[3] || "index.html";
const REPO = dirname(dirname(fileURLToPath(import.meta.url))); // .../gra-menedzer
const IKONY = join(REPO, "assets", "ikona");

// 1) Bundel JS.
const jsDir = join(DIST, "_expo/static/js/web");
const jsName = readdirSync(jsDir).find((f) => f.endsWith(".js"));
let js = readFileSync(join(jsDir, jsName), "utf8");

// 2) Mapa: zserwowana ścieżka assetu -> data URI (wszystkie herby PNG).
const mapa = new Map();
function chodz(dir, bazaUrl) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) chodz(p, bazaUrl + "/" + e);
    else if (e.endsWith(".png")) mapa.set(bazaUrl + "/" + e, "data:image/png;base64," + readFileSync(p).toString("base64"));
  }
}
chodz(join(DIST, "assets"), "/assets");

// 3) Podmień URL-e herbów na data URI.
let trafione = 0, pominiete = 0;
js = js.replace(/\/assets\/assets\/herby\/[A-Za-z0-9._/-]+\.png/g, (m) => {
  const d = mapa.get(m);
  if (d) { trafione++; return d; }
  pominiete++; return m;
});
console.error(`Herby wstrzyknięte: ${trafione}, nietrafione: ${pominiete}, w mapie: ${mapa.size}`);

// 4) Zabezpiecz przed przedwczesnym zamknięciem <script>.
js = js.replace(/<\/script/gi, "<\\/script");

// 5) Ikona aplikacji (apple-touch-icon + favicon) jako data URI — „Dodaj do ekranu początkowego".
let ikonaTagi = "";
const p180 = join(IKONY, "ikona9-180.png"), p512 = join(IKONY, "ikona9-512.png");
if (existsSync(p180)) {
  const b180 = readFileSync(p180).toString("base64");
  const b512 = existsSync(p512) ? readFileSync(p512).toString("base64") : b180;
  ikonaTagi =
    `<link rel="apple-touch-icon" href="data:image/png;base64,${b180}">` +
    `<link rel="icon" type="image/png" sizes="512x512" href="data:image/png;base64,${b512}">` +
    `<link rel="icon" type="image/png" sizes="180x180" href="data:image/png;base64,${b180}">`;
  console.error("Ikona wstrzyknięta (apple-touch-icon).");
} else {
  console.error("UWAGA: brak assets/ikona/ikona9-180.png — plik bez ikony.");
}

// 6) Złóż finalny, pojedynczy HTML.
const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="apple-mobile-web-app-title" content="Dziewiątka" />
<meta name="theme-color" content="#0c5230" />
<title>Dziewiątka — Menedżer Piłkarski</title>
${ikonaTagi}
<style id="expo-reset">
  html, body { height: 100%; background: #06130d; }
  body { overflow: hidden; margin: 0; }
  #root { display: flex; height: calc(100% - env(safe-area-inset-bottom, 0px)); flex: 1; } /* pasek „home" iPhone'a nie zasłania menu */
</style>
</head>
<body>
<noscript>Włącz JavaScript, aby uruchomić grę.</noscript>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;

writeFileSync(OUT, html);
console.error("Zapisano: " + OUT + " (" + (Buffer.byteLength(html) / 1048576).toFixed(1) + " MB)");
