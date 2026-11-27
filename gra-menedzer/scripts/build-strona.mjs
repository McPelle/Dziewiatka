// Buduje grę jako FOLDER do publikacji (Netlify) — aplikacja webowa (PWA):
//  • index.html + app-<hash>.js + assets/ (herby, grafika) — pliki ładowane osobno, gra startuje szybciej,
//  • manifest.webmanifest + ikony — „Dodaj do ekranu początkowego": ikona, pełny ekran bez paska przeglądarki,
//  • sw.js (service worker) — gra działa bez internetu; z internetem pobiera nową wersję w tle,
//    a włącza ją przy następnym uruchomieniu (albo po kliknięciu „Uruchom ponownie" w komunikacie),
//  • _headers — Netlify: index.html i sw.js zawsze świeże, reszta cache'owana na długo.
// Użycie:  npx expo export --platform web && node scripts/build-strona.mjs dist ../strona
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const DIST = process.argv[2] || "dist";
const OUT = process.argv[3] || "../strona";
const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const IKONY = join(REPO, "assets", "ikona");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 1) Bundel JS pod nazwą z hashem (przeglądarka nie weźmie starej wersji z pamięci).
const jsDir = join(DIST, "_expo/static/js/web");
const jsName = readdirSync(jsDir).find((f) => f.endsWith(".js"));
const js = Buffer.from(readFileSync(join(jsDir, jsName), "utf8").replace(/"\/assets\//g, "\"./assets/"));
const hash = createHash("sha1").update(js).digest("hex").slice(0, 10);
const appJs = `app-${hash}.js`;
writeFileSync(join(OUT, appJs), js);

// 2) Assety (herby, grafika) — te same ścieżki, co w bundlu (/assets/...).
if (existsSync(join(DIST, "assets"))) cpSync(join(DIST, "assets"), join(OUT, "assets"), { recursive: true });
if (existsSync(join(REPO, "public3d"))) cpSync(join(REPO, "public3d"), join(OUT, "3d"), { recursive: true }); // modele/tekstury 3D

// 3) Ikony + manifest.
for (const [z, d] of [["ikona9-180.png", "ikona-180.png"], ["ikona9-512.png", "ikona-512.png"]]) if (existsSync(join(IKONY, z))) cpSync(join(IKONY, z), join(OUT, d));
writeFileSync(join(OUT, "manifest.webmanifest"), JSON.stringify({
  name: "Dziewiątka — Menedżer Piłkarski", short_name: "Dziewiątka", lang: "pl",
  start_url: "./", scope: "./", display: "standalone", orientation: "portrait",
  background_color: "#06130d", theme_color: "#0c5230",
  icons: [{ src: "./ikona-180.png", sizes: "180x180", type: "image/png" }, { src: "./ikona-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }],
}, null, 2));

// 4) index.html z rejestracją service workera i komunikatem o nowej wersji.
const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="apple-mobile-web-app-title" content="Dziewiątka" />
<meta name="theme-color" content="#0c5230" />
<title>Dziewiątka — Menedżer Piłkarski</title>
<link rel="manifest" href="./manifest.webmanifest" />
<link rel="apple-touch-icon" href="./ikona-180.png" />
<link rel="icon" type="image/png" sizes="512x512" href="./ikona-512.png" />
<style id="expo-reset">
  html, body { height: 100%; background: #06130d; }
  body { overflow: hidden; margin: 0; }
  #root { display: flex; height: calc(100% - env(safe-area-inset-bottom, 0px)); flex: 1; } /* pasek „home" iPhone'a nie zasłania menu */
  #nowa-wersja { position: fixed; left: 12px; right: 12px; bottom: calc(14px + env(safe-area-inset-bottom)); z-index: 99999; display: none;
    background: #ffce47; color: #15300c; border-radius: 14px; padding: 12px 14px; font: 700 14px -apple-system, system-ui, sans-serif; box-shadow: 0 6px 24px rgba(0,0,0,.45); }
  #nowa-wersja button { float: right; margin-left: 10px; background: #15300c; color: #ffce47; border: 0; border-radius: 10px; padding: 8px 12px; font: 800 13px -apple-system, system-ui, sans-serif; }
  #start { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #ffce47; font: 800 22px -apple-system, system-ui, sans-serif; background: #06130d; z-index: 1; }
</style>
</head>
<body>
<noscript>Włącz JavaScript, aby uruchomić grę.</noscript>
<div id="start"><img src="./ikona-180.png" width="96" height="96" style="border-radius:22px" alt="" /><div style="margin-top:14px">DZIEWIĄTKA</div><div style="font-size:12px;color:#9fb3a6;margin-top:6px">Ładowanie gry…</div>
  <div id="blad" style="display:none;margin:14px 22px 0;font:600 12px -apple-system,system-ui,sans-serif;color:#ff8a8a;text-align:center;word-break:break-word"></div>
  <button id="napraw" style="display:none;margin-top:16px;background:#ffce47;color:#15300c;border:0;border-radius:12px;padding:12px 16px;font:800 14px -apple-system,system-ui,sans-serif">Napraw i uruchom ponownie</button>
  <div id="naprawOpis" style="display:none;margin:8px 26px 0;font:500 11px -apple-system,system-ui,sans-serif;color:#9fb3a6;text-align:center">Pobiera grę od nowa. Twoje zapisy kariery zostają.</div>
</div>
<div id="root"></div>
<div id="nowa-wersja"><button id="nw-ok">Uruchom ponownie</button>⚽ Nowa wersja gry jest gotowa. Zapisz grę i uruchom ponownie — albo włączy się sama przy następnym otwarciu.</div>
<script>
  (function () {
    var start = document.getElementById("start");
    // diagnostyka: błąd uruchomienia widoczny na ekranie ładowania + przycisk naprawy
    function pokazBlad(t) { var b = document.getElementById("blad"); if (b && start.isConnected) { b.style.display = "block"; b.textContent = "Błąd: " + t; } pokazNaprawe(); }
    function pokazNaprawe() { if (!start.isConnected) return; document.getElementById("napraw").style.display = "inline-block"; document.getElementById("naprawOpis").style.display = "block"; }
    window.addEventListener("error", function (e) { pokazBlad((e && (e.message || (e.error && e.error.message))) || "nieznany"); });
    window.addEventListener("unhandledrejection", function (e) { if (!document.getElementById("root").children.length) pokazBlad(String(e && e.reason && (e.reason.message || e.reason))); });
    setTimeout(pokazNaprawe, 9000);
    document.getElementById("napraw").onclick = function () {
      var p = [];
      if ("serviceWorker" in navigator) p.push(navigator.serviceWorker.getRegistrations().then(function (r) { return Promise.all(r.map(function (x) { return x.unregister(); })); }));
      if (window.caches) p.push(caches.keys().then(function (k) { return Promise.all(k.map(function (x) { return caches.delete(x); })); }));
      Promise.all(p).catch(function () {}).then(function () { location.reload(); });
    };
    var obs = new MutationObserver(function () { if (document.getElementById("root").children.length) { start.remove(); obs.disconnect(); } });
    obs.observe(document.getElementById("root"), { childList: true });
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").then(function (reg) {
        function pokaz(w) {
          var b = document.getElementById("nowa-wersja"); b.style.display = "block";
          document.getElementById("nw-ok").onclick = function () { w.postMessage("AKTUALIZUJ"); };
        }
        if (reg.waiting && navigator.serviceWorker.controller) pokaz(reg.waiting);
        reg.addEventListener("updatefound", function () {
          var w = reg.installing; if (!w) return;
          w.addEventListener("statechange", function () { if (w.state === "installed" && navigator.serviceWorker.controller) pokaz(w); });
        });
        // sprawdzaj aktualizacje przy powrocie do gry (np. po włączeniu internetu)
        document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") reg.update().catch(function () {}); });
        window.addEventListener("online", function () { reg.update().catch(function () {}); });
      }).catch(function () {});
      var przeladowano = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () { if (przeladowano) return; przeladowano = true; location.reload(); });
    });
  })();
</script>
<script>window.__WERSJA = "${hash.slice(0, 6)}";</script>
<script src="./${appJs}" defer></script>
</body>
</html>`;
writeFileSync(join(OUT, "index.html"), html);

// 5) Lista plików do zapamiętania offline + service worker.
const pliki = [];
(function chodz(d) { for (const e of readdirSync(d)) { const p = join(d, e); if (statSync(p).isDirectory()) chodz(p); else pliki.push("/" + relative(OUT, p).split("\\").join("/")); } })(OUT);
const wersja = createHash("sha1").update(pliki.join("|") + hash).digest("hex").slice(0, 12);
const sw = `// Service worker gry „Dziewiątka" — wersja ${wersja}
const WERSJA = "dziewiatka-${wersja}";
const PLIKI = ${JSON.stringify(["./", ...pliki.filter((p) => p !== "/sw.js" && p !== "/_headers" && p !== "/.nojekyll").map((p) => "." + p)])};
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(WERSJA).then((c) => c.addAll(PLIKI)));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== WERSJA).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "AKTUALIZUJ") self.skipWaiting(); });
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") {
    const zSieci = new Promise((ok, nie) => { const t = setTimeout(nie, 3500); fetch(r).then((res) => { clearTimeout(t); res.ok ? ok(res) : nie(); }, nie); });
    e.respondWith(zSieci.catch(() => caches.match("./index.html")).then((x) => x || caches.match("./")));
    return;
  }
  e.respondWith(caches.match(r).then((c) => c || fetch(r).then((res) => { const kopia = res.clone(); caches.open(WERSJA).then((ca) => ca.put(r, kopia)); return res; })));
});
`;
writeFileSync(join(OUT, "sw.js"), sw);
writeFileSync(join(OUT, ".nojekyll"), "");
writeFileSync(join(OUT, "_headers"), `/index.html\n  Cache-Control: no-cache\n/sw.js\n  Cache-Control: no-cache\n/manifest.webmanifest\n  Cache-Control: no-cache\n/app-*\n  Cache-Control: public, max-age=31536000, immutable\n`);
let rozm = 0; for (const p of pliki) rozm += statSync(join(OUT, p)).size;
console.error(`Zapisano folder ${OUT}: ${pliki.length} plików, ${(rozm / 1048576).toFixed(1)} MB, wersja ${wersja}`);
