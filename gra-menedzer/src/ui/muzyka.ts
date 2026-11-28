// Soundtrack „Dziewiątki" — własne, oryginalne utwory generowane na żywo przez Web Audio (bez plików, zero MB):
// kilkanaście pełnych kawałków w różnych gatunkach (house, synthwave, indie rock, drum'n'bass, funk, lo-fi, trance, chill…),
// każdy z własnym tytułem, wykonawcą, tempem, tonacją i budową (intro → zwrotka → refren → mostek → refren → outro).
// Odtwarzacz jak w grach sportowych: playlista, następny/poprzedni, losowo, głośność, „Teraz gra". W meczu na żywo
// muzyka cichnie (wyciszenie), po meczu wraca. Plus krótkie dźwięki interfejsu (kartka, gwizdek, kasa, klik).

type Gatunek = "house" | "synthwave" | "indie" | "dnb" | "funk" | "lofi" | "trance" | "chill" | "rock" | "electro" | "hymn" | "ambient";
export interface Utwor { tytul: string; wykonawca: string; gatunek: Gatunek; bpm: number; tonika: number; moll: boolean; progresja: number[]; ziarno: number }

/** Playlista — oryginalne utwory (fikcyjni wykonawcy). */
export const UTWORY: Utwor[] = [
  { tytul: "Stadion o świcie", wykonawca: "Biała Linia", gatunek: "indie", bpm: 124, tonika: 52, moll: false, progresja: [0, 4, 5, 3], ziarno: 11 },
  { tytul: "Neon nad Bałtykiem", wykonawca: "Kapitan Retro", gatunek: "synthwave", bpm: 100, tonika: 45, moll: true, progresja: [0, 5, 2, 6], ziarno: 23 },
  { tytul: "Kibice nocą", wykonawca: "DJ Orlik", gatunek: "house", bpm: 124, tonika: 48, moll: true, progresja: [0, 5, 3, 4], ziarno: 37 },
  { tytul: "Ostatnia kolejka", wykonawca: "Spalony", gatunek: "dnb", bpm: 172, tonika: 50, moll: true, progresja: [0, 3, 5, 4], ziarno: 41 },
  { tytul: "Wiosna w B-klasie", wykonawca: "Trampki", gatunek: "indie", bpm: 132, tonika: 55, moll: false, progresja: [0, 3, 4, 3], ziarno: 53 },
  { tytul: "Szatnia o 22:00", wykonawca: "Lo-Fi Ławka", gatunek: "lofi", bpm: 80, tonika: 50, moll: false, progresja: [1, 4, 0, 5], ziarno: 61 },
  { tytul: "Derby", wykonawca: "Młyn", gatunek: "rock", bpm: 140, tonika: 52, moll: true, progresja: [0, 5, 6, 4], ziarno: 73 },
  { tytul: "Mazurskie jezioro", wykonawca: "Mgła nad Wodą", gatunek: "chill", bpm: 92, tonika: 53, moll: false, progresja: [0, 2, 3, 4], ziarno: 89 },
  { tytul: "Złota bramka", wykonawca: "Funk Okręgówki", gatunek: "funk", bpm: 112, tonika: 50, moll: false, progresja: [0, 3, 1, 4], ziarno: 97 },
  { tytul: "Tifo", wykonawca: "Sektorówka", gatunek: "electro", bpm: 128, tonika: 46, moll: true, progresja: [0, 6, 5, 6], ziarno: 101 },
  { tytul: "Noc awansu", wykonawca: "Baraż", gatunek: "trance", bpm: 136, tonika: 45, moll: true, progresja: [0, 5, 3, 6], ziarno: 113 },
  { tytul: "Zimowa przerwa", wykonawca: "Kalendarz", gatunek: "ambient", bpm: 70, tonika: 48, moll: false, progresja: [0, 3, 5, 4], ziarno: 127 },
  { tytul: "Odra w nocy", wykonawca: "Prawy Brzeg", gatunek: "house", bpm: 122, tonika: 53, moll: false, progresja: [1, 4, 0, 3], ziarno: 131 },
  { tytul: "Okno transferowe", wykonawca: "Klauzula", gatunek: "electro", bpm: 140, tonika: 50, moll: true, progresja: [0, 0, 5, 6], ziarno: 149 },
  { tytul: "Hymn kibica", wykonawca: "Trybuna Północ", gatunek: "hymn", bpm: 96, tonika: 48, moll: false, progresja: [0, 4, 5, 3], ziarno: 157 },
  { tytul: "Przedsezonowy obóz", wykonawca: "Dwa Treningi", gatunek: "funk", bpm: 104, tonika: 55, moll: true, progresja: [0, 3, 0, 4], ziarno: 163 },
  { tytul: "Pod jupiterami", wykonawca: "Kapitan Retro", gatunek: "synthwave", bpm: 110, tonika: 52, moll: false, progresja: [0, 4, 5, 3], ziarno: 173 },
  { tytul: "Gol w doliczonym", wykonawca: "Spalony", gatunek: "dnb", bpm: 174, tonika: 47, moll: true, progresja: [0, 5, 6, 4], ziarno: 181 },
  { tytul: "Kawa z prezesem", wykonawca: "Lo-Fi Ławka", gatunek: "lofi", bpm: 76, tonika: 55, moll: true, progresja: [0, 3, 6, 4], ziarno: 191 },
  { tytul: "Mecz wyjazdowy", wykonawca: "Biała Linia", gatunek: "rock", bpm: 150, tonika: 45, moll: false, progresja: [0, 4, 3, 4], ziarno: 197 },
];

// ——— Ustawienia (localStorage) ———
const LS = (k: string, d: string) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
const zapisz = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* */ } };
export const muzykaWlaczona = () => LS("muzyka", "1") === "1";
export const dzwiekiWlaczone = () => LS("dzwiekiUI", "1") === "1";
export const glosnosc = () => Math.max(0, Math.min(1, Number(LS("muzykaGlosnosc", "0.6"))));
export const losowo = () => LS("muzykaLosowo", "1") === "1";

let ctx: AudioContext | null = null;
let master: GainNode | null = null, duck: GainNode | null = null, pogl: GainNode | null = null;
let echoIn: GainNode | null = null, pogIn: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let idx = Number(LS("muzykaUtwor", "0")) || 0;
let krok = 0, nastepnyCzas = 0, plan: Plan | null = null, startCzas = 0;
const sluchacze = new Set<() => void>();
const powiadom = () => sluchacze.forEach((f) => { try { f(); } catch { /* */ } });
/** Subskrypcja zmian (utwór, start/stop) — dla odtwarzacza i „Teraz gra". */
export function subskrybuj(f: () => void) { sluchacze.add(f); return () => { sluchacze.delete(f); }; }

const ac = () => {
  if (typeof window === "undefined" || !(window as any).AudioContext) return null;
  ctx ??= new (window as any).AudioContext();
  if (ctx!.state === "suspended") ctx!.resume();
  return ctx;
};

// ——— Deterministyczny generator (ten sam utwór brzmi zawsze tak samo) ———
function rng(z: number) { let a = z >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const DUR = [0, 2, 4, 5, 7, 9, 11], MOL = [0, 2, 3, 5, 7, 8, 10];
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

interface Sekcja { nazwa: "intro" | "zwrotka" | "refren" | "mostek" | "outro"; takty: number; energia: number }
interface Plan { u: Utwor; sekcje: Sekcja[]; taktyRazem: number; motywA: number[]; motywB: number[]; bas: number[]; perk: { k: number[]; s: number[]; h: number[] } }

function zbudujPlan(u: Utwor): Plan {
  const r = rng(u.ziarno);
  const sekcje: Sekcja[] = [
    { nazwa: "intro", takty: 8, energia: 0.35 }, { nazwa: "zwrotka", takty: 16, energia: 0.6 }, { nazwa: "refren", takty: 16, energia: 1 },
    { nazwa: "mostek", takty: 8, energia: 0.5 }, { nazwa: "zwrotka", takty: 8, energia: 0.7 }, { nazwa: "refren", takty: 16, energia: 1 }, { nazwa: "outro", takty: 8, energia: 0.3 },
  ];
  // motywy melodii: 16 kroków (szesnastki taktu), -1 = pauza, inaczej stopień skali (0–9)
  const motyw = (gest: number) => Array.from({ length: 16 }, (_, i) => (r() < gest * (i % 4 === 0 ? 1.4 : i % 2 === 0 ? 0.9 : 0.55) ? Math.floor(r() * 8) : -1));
  const gest = u.gatunek === "lofi" || u.gatunek === "ambient" || u.gatunek === "chill" ? 0.32 : u.gatunek === "dnb" || u.gatunek === "trance" ? 0.55 : 0.45;
  const bas = Array.from({ length: 16 }, (_, i) => {
    switch (u.gatunek) {
      case "house": case "electro": return i % 4 === 2 ? 0 : i % 8 === 7 && r() < 0.5 ? 7 : -1;          // offbeat
      case "synthwave": case "trance": return i % 2 === 0 ? (i % 8 === 6 ? 7 : 0) : -1;                    // ósemki
      case "funk": return [0, -1, -1, 0, -1, 7, -1, 10, -1, 0, -1, -1, 5, -1, 7, -1][i];                     // synkopy
      case "dnb": return [0, -1, -1, -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, -1, -1][i];
      case "rock": case "indie": return i % 2 === 0 ? 0 : -1;
      case "hymn": return i % 4 === 0 ? 0 : -1;
      default: return i % 8 === 0 ? 0 : i === 10 && r() < 0.5 ? 7 : -1;                                     // lofi/chill/ambient
    }
  });
  const P = (k: number[], s: number[], h: number[]) => ({ k, s, h });
  const sz = (str: string) => str.split("").map((c) => (c === "x" ? 1 : c === "o" ? 0.5 : 0));
  const perk = {
    house: P(sz("x...x...x...x..."), sz("....x.......x..."), sz("..x...x...x...xo")),
    electro: P(sz("x...x...x...x..."), sz("....x.......x..x"), sz("xoxoxoxoxoxoxoxo")),
    synthwave: P(sz("x.......x......."), sz("....x.......x..."), sz("x.x.x.x.x.x.x.x.")),
    trance: P(sz("x...x...x...x..."), sz("....x.......x..."), sz("..x...x...x...x.")),
    funk: P(sz("x..x..x...x....."), sz("....x..o....x.o."), sz("xoxoxoxoxoxoxoxo")),
    dnb: P(sz("x.........x....."), sz("....x.......x..."), sz("x.x.x.x.x.x.x.x.")),
    rock: P(sz("x.....x.x......."), sz("....x.......x..."), sz("x.x.x.x.x.x.x.x.")),
    indie: P(sz("x.....x...x....."), sz("....x.......x..."), sz("x.x.x.x.x.x.x.x.")),
    hymn: P(sz("x.......x......."), sz("....x.......x..."), sz("x...x...x...x...")),
    lofi: P(sz("x......x..x....."), sz("....x.......x..."), sz("x.xox.x.x.xox.x.")),
    chill: P(sz("x.......x..x...."), sz("....o.......x..."), sz("..x...x...x...x.")),
    ambient: P(sz("................"), sz("................"), sz("................")),
  }[u.gatunek];
  return { u, sekcje, taktyRazem: sekcje.reduce((a, x) => a + x.takty, 0), motywA: motyw(gest), motywB: motyw(gest * 1.15), bas, perk };
}

// ——— Instrumenty ———
function szum(c: AudioContext, sek: number) { const b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * sek)), c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
let _szum: AudioBuffer | null = null;
function stopa(c: AudioContext, t: number, g: number) {
  const o = c.createOscillator(), v = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.001, t + 0.32); o.connect(v); v.connect(master!); o.start(t); o.stop(t + 0.35);
}
function werbel(c: AudioContext, t: number, g: number, klask = false) {
  _szum ??= szum(c, 0.5);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), v = c.createGain(); s.buffer = _szum; f.type = "bandpass"; f.frequency.value = klask ? 1500 : 1900; f.Q.value = klask ? 1.4 : 0.8;
  v.gain.setValueAtTime(g * 0.8, t); v.gain.exponentialRampToValueAtTime(0.001, t + (klask ? 0.14 : 0.2)); s.connect(f); f.connect(v); v.connect(master!); if (pogIn) v.connect(pogIn); s.start(t); s.stop(t + 0.25);
  if (!klask) { const o = c.createOscillator(), w = c.createGain(); o.frequency.value = 190; w.gain.setValueAtTime(g * 0.4, t); w.gain.exponentialRampToValueAtTime(0.001, t + 0.1); o.connect(w); w.connect(master!); o.start(t); o.stop(t + 0.12); }
}
function talerz(c: AudioContext, t: number, g: number, otwarty: boolean) {
  _szum ??= szum(c, 0.5);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), v = c.createGain(); s.buffer = _szum; f.type = "highpass"; f.frequency.value = 7500;
  const d = otwarty ? 0.22 : 0.05; v.gain.setValueAtTime(g * 0.35, t); v.gain.exponentialRampToValueAtTime(0.001, t + d); s.connect(f); f.connect(v); v.connect(master!); s.start(t, Math.random() * 0.2); s.stop(t + d + 0.02);
}
function ton(c: AudioContext, m: number, t: number, dl: number, g: number, typ: OscillatorType, filtr: number, wyjscie: { echo?: number; pogl?: number } = {}, detune = 0) {
  const o = c.createOscillator(), f = c.createBiquadFilter(), v = c.createGain(); o.type = typ; o.frequency.value = hz(m); o.detune.value = detune;
  f.type = "lowpass"; f.frequency.setValueAtTime(filtr, t); f.Q.value = 2;
  v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + Math.min(0.02, dl * 0.2)); v.gain.setTargetAtTime(g * 0.6, t + 0.03, dl * 0.4); v.gain.linearRampToValueAtTime(0, t + dl);
  o.connect(f); f.connect(v); v.connect(master!);
  if (wyjscie.echo && echoIn) { const e = c.createGain(); e.gain.value = wyjscie.echo; v.connect(e); e.connect(echoIn); }
  if (wyjscie.pogl && pogIn) { const p = c.createGain(); p.gain.value = wyjscie.pogl; v.connect(p); p.connect(pogIn); }
  o.start(t); o.stop(t + dl + 0.05);
}
function akord(c: AudioContext, nuty: number[], t: number, dl: number, g: number, gat: Gatunek) {
  const typ: OscillatorType = gat === "lofi" || gat === "chill" || gat === "ambient" ? "triangle" : gat === "rock" || gat === "indie" ? "sawtooth" : "sawtooth";
  const filtr = gat === "synthwave" || gat === "trance" ? 2400 : gat === "lofi" ? 900 : gat === "rock" ? 2800 : 1600;
  for (const n of nuty) { ton(c, n, t, dl, g, typ, filtr, { pogl: 0.5 }, -7); ton(c, n, t, dl, g * 0.7, typ, filtr, { pogl: 0.4 }, 7); }
}

// ——— Sekwencer ———
function stopien(u: Utwor, st: number, okt = 0) { const sk = u.moll ? MOL : DUR; const o = Math.floor(st / 7); return u.tonika + sk[((st % 7) + 7) % 7] + 12 * (o + okt); }
function akordNuty(u: Utwor, st: number) { return [stopien(u, st), stopien(u, st + 2), stopien(u, st + 4)]; }

function zagrajKrok(c: AudioContext, t: number) {
  if (!plan) return;
  const u = plan.u, takt = Math.floor(krok / 16), s = krok % 16;
  if (takt >= plan.taktyRazem) { nastepny(true); return; }
  let acc = 0, sek = plan.sekcje[0]; for (const x of plan.sekcje) { if (takt < acc + x.takty) { sek = x; break; } acc += x.takty; }
  const wSek = takt - acc, E = sek.energia;
  const st16 = 60 / u.bpm / 4;
  const chordSt = u.progresja[Math.floor(takt / (u.bpm > 150 ? 2 : 1)) % u.progresja.length];
  const dnbHalf = u.gatunek === "dnb";
  // perkusja (wejście stopniowe; mostek i intro lżej; przejście na ostatnim takcie sekcji)
  const p = plan.perk; const fill = wSek === sek.takty - 1 && s >= 12;
  if (sek.nazwa !== "intro" || wSek >= 4) {
    if (p.k[s] && E >= 0.45) stopa(c, t, 0.9 * (p.k[s]));
    if ((p.s[s] || (fill && s % 2 === 0)) && E >= 0.55) werbel(c, t, (fill ? 0.5 + (s - 12) * 0.08 : 0.55) * (p.s[s] || 1), u.gatunek === "house" || u.gatunek === "electro" || u.gatunek === "funk");
  }
  if (p.h[s] && E >= 0.3) talerz(c, t, 0.4 * p.h[s] * (sek.nazwa === "refren" ? 1.2 : 0.9), u.gatunek === "house" && s % 4 === 2);
  // akordy: na „1" każdego taktu (lofi/chill/ambient/hymn — dłuższe, synthwave/trance — rytmiczne ósemki w refrenie)
  const nuty = akordNuty(u, chordSt).map((n) => n + 12);
  if (s === 0 && !(u.gatunek === "trance" && sek.nazwa === "refren")) akord(c, nuty, t, st16 * 16 * 0.98, (u.gatunek === "rock" ? 0.05 : 0.045) * (0.6 + E * 0.5), u.gatunek);
  if (u.gatunek === "trance" && sek.nazwa === "refren" && s % 2 === 0) akord(c, nuty, t, st16 * 1.6, 0.04, u.gatunek);
  if ((u.gatunek === "funk" || u.gatunek === "indie") && (s === 6 || s === 10) && E > 0.5) akord(c, nuty, t, st16 * 1.5, 0.035, u.gatunek);
  // bas
  const b = plan.bas[dnbHalf ? s : s];
  if (b >= 0 && sek.nazwa !== "intro" && E >= 0.45) ton(c, stopien(u, chordSt, -1) + (b === 7 ? 7 : b === 10 ? 10 : b === 5 ? 5 : 0), t, st16 * (u.gatunek === "synthwave" || u.gatunek === "trance" ? 1.8 : 2.6), 0.16, u.gatunek === "funk" ? "square" : "sawtooth", u.gatunek === "funk" ? 1100 : 600);
  // melodia (refren — motyw A wyżej i z echem; zwrotka — motyw B; mostek — oszczędnie)
  if (sek.nazwa === "refren" || sek.nazwa === "zwrotka" || (sek.nazwa === "mostek" && wSek % 2 === 1)) {
    const mot = sek.nazwa === "refren" ? plan.motywA : plan.motywB;
    const m = mot[s];
    if (m >= 0) {
      const typ: OscillatorType = u.gatunek === "lofi" || u.gatunek === "chill" ? "triangle" : u.gatunek === "rock" || u.gatunek === "indie" ? "sawtooth" : u.gatunek === "hymn" ? "triangle" : "square";
      const okt = sek.nazwa === "refren" ? 2 : 1;
      ton(c, stopien(u, chordSt + m, okt) - (u.tonika > 52 ? 12 : 0), t, st16 * (u.gatunek === "ambient" || u.gatunek === "hymn" ? 4 : 1.7), (sek.nazwa === "refren" ? 0.07 : 0.055) * (typ === "square" ? 0.6 : 1), typ, typ === "square" ? 2600 : 3200, { echo: 0.45, pogl: 0.35 });
    }
  }
  // arpeggio w synthwave/trance/electro (zwrotka i refren)
  if ((u.gatunek === "synthwave" || u.gatunek === "trance" || u.gatunek === "electro") && E >= 0.6) {
    const n = nuty[s % 3] + 12; ton(c, n, t, st16 * 0.9, 0.028, "square", 3000, { echo: 0.5 });
  }
  // ambient — długie plamy dźwięku
  if (u.gatunek === "ambient" && s === 0) for (const n of nuty) ton(c, n + 12, t, st16 * 16, 0.03, "sine", 2000, { pogl: 0.8 });
  // lo-fi — trzaski płyty
  if (u.gatunek === "lofi" && Math.random() < 0.12) talerz(c, t + Math.random() * st16, 0.08, false);
}

function zbudujLancuch(c: AudioContext) {
  master = c.createGain(); master.gain.value = 1;
  duck = c.createGain(); duck.gain.value = 1;
  const gl = c.createGain(); gl.gain.value = 0.32 * glosnosc(); (zbudujLancuch as any).gl = gl;
  const komp = c.createDynamicsCompressor(); komp.threshold.value = -18; komp.ratio.value = 4;
  master.connect(komp); komp.connect(duck); duck.connect(gl); gl.connect(c.destination);
  // echo (delay z feedbackiem)
  echoIn = c.createGain(); const del = c.createDelay(1); del.delayTime.value = 0.36; const fb = c.createGain(); fb.gain.value = 0.32; const ef = c.createBiquadFilter(); ef.type = "lowpass"; ef.frequency.value = 2500;
  echoIn.connect(del); del.connect(ef); ef.connect(fb); fb.connect(del); ef.connect(master);
  // pogłos (splot z syntetyczną odpowiedzią impulsową)
  pogIn = c.createGain(); const conv = c.createConvolver(); const dl = 2.4, b = c.createBuffer(2, c.sampleRate * dl, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); }
  conv.buffer = b; pogl = c.createGain(); pogl.gain.value = 0.35; pogIn.connect(conv); conv.connect(pogl); pogl.connect(komp);
}

function uruchomUtwor(i: number) {
  idx = ((i % UTWORY.length) + UTWORY.length) % UTWORY.length; zapisz("muzykaUtwor", String(idx));
  plan = zbudujPlan(UTWORY[idx]); krok = 0;
  const c = ctx!; nastepnyCzas = c.currentTime + 0.12; startCzas = nastepnyCzas;
  powiadom();
}
function petla() {
  const c = ctx; if (!c || !plan) return;
  const st16 = 60 / plan.u.bpm / 4;
  while (nastepnyCzas < c.currentTime + 0.18) { zagrajKrok(c, nastepnyCzas); if (!plan) return; krok++; nastepnyCzas += st16 * (plan.u.gatunek === "lofi" && krok % 2 === 1 ? 1.12 : plan.u.gatunek === "lofi" ? 0.88 : 1); }
}

export function startMuzyki() {
  if (!muzykaWlaczona() || timer) return;
  const c = ac(); if (!c) return;
  if (!master) zbudujLancuch(c);
  uruchomUtwor(idx);
  timer = setInterval(petla, 30);
  powiadom();
}
export function stopMuzyki() {
  if (timer) clearInterval(timer); timer = null; plan = null;
  try { master?.disconnect(); } catch { /* */ } master = null; duck = null; echoIn = null; pogIn = null;
  powiadom();
}
export const gra = () => !!timer;
export function ustawMuzyke(v: boolean) { zapisz("muzyka", v ? "1" : "0"); if (v) startMuzyki(); else stopMuzyki(); }
export function ustawDzwieki(v: boolean) { zapisz("dzwiekiUI", v ? "1" : "0"); }
export function ustawGlosnosc(v: number) { zapisz("muzykaGlosnosc", String(Math.max(0, Math.min(1, v)))); const gl = (zbudujLancuch as any).gl as GainNode | undefined; if (gl && ctx) gl.gain.setTargetAtTime(0.32 * glosnosc(), ctx.currentTime, 0.05); powiadom(); }
export function ustawLosowo(v: boolean) { zapisz("muzykaLosowo", v ? "1" : "0"); powiadom(); }
/** Następny utwór (losowo albo po kolei). */
export function nastepny(auto = false) {
  if (!ctx || !timer) { idx = (idx + 1) % UTWORY.length; zapisz("muzykaUtwor", String(idx)); powiadom(); return; }
  let n = idx + 1;
  if (losowo()) { do { n = Math.floor(Math.random() * UTWORY.length); } while (n === idx && UTWORY.length > 1); }
  void auto; uruchomUtwor(n);
}
export function poprzedni() { if (!ctx || !timer) { idx = (idx - 1 + UTWORY.length) % UTWORY.length; powiadom(); return; } uruchomUtwor(idx - 1); }
export function grajUtwor(i: number) { if (!timer) { idx = i; zapisz("muzykaUtwor", String(i)); zapisz("muzyka", "1"); startMuzyki(); } else uruchomUtwor(i); }
/** Aktualny utwór + postęp 0–1. */
export function aktualny(): { i: number; u: Utwor; postep: number } {
  const u = UTWORY[idx]; const p = plan && ctx ? Math.min(1, (ctx.currentTime - startCzas) / ((plan.taktyRazem * 16 * 60) / u.bpm / 4)) : 0;
  return { i: idx, u, postep: p };
}
/** Wyciszenie na czas meczu na żywo / treningu (muzyka cichnie, po meczu wraca). */
export function wycisz(v: boolean) { if (duck && ctx) duck.gain.setTargetAtTime(v ? 0.0 : 1, ctx.currentTime, 0.4); }
export const NAZWA_GATUNKU: Record<Gatunek, string> = { house: "house", synthwave: "synthwave", indie: "indie rock", dnb: "drum'n'bass", funk: "funk", lofi: "lo-fi", trance: "trance", chill: "chillout", rock: "rock", electro: "electro", hymn: "hymn stadionowy", ambient: "ambient" };

/** Krótkie dźwięki interfejsu. */
export function dzwiekUI(typ: "kartka" | "gwizdek" | "kasa" | "klik") {
  if (!dzwiekiWlaczone()) return; const c = ac(); if (!c) return;
  const t = c.currentTime, out = c.createGain(); out.gain.value = 0.25; out.connect(c.destination);
  if (typ === "kartka") {
    const b = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / d.length) * Math.PI) * 0.6;
    const s = c.createBufferSource(), f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 3500; f.Q.value = 0.7; s.buffer = b; s.connect(f); f.connect(out); s.start(t);
  } else if (typ === "gwizdek") {
    const o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), v = c.createGain(); o.frequency.value = 2900; l.frequency.value = 38; lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency);
    v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.5, t + 0.03); v.gain.setValueAtTime(0.5, t + 0.32); v.gain.linearRampToValueAtTime(0, t + 0.4);
    o.connect(v); v.connect(out); o.start(t); l.start(t); o.stop(t + 0.42); l.stop(t + 0.42);
  } else if (typ === "kasa") {
    for (const [fr, dt] of [[1318.5, 0], [1975.5, 0.09]] as const) { const o = c.createOscillator(), v = c.createGain(); o.type = "triangle"; o.frequency.value = fr; v.gain.setValueAtTime(0.5, t + dt); v.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.5); o.connect(v); v.connect(out); o.start(t + dt); o.stop(t + dt + 0.55); }
  } else { const o = c.createOscillator(), v = c.createGain(); o.frequency.value = 900; v.gain.setValueAtTime(0.2, t); v.gain.exponentialRampToValueAtTime(0.001, t + 0.06); o.connect(v); v.connect(out); o.start(t); o.stop(t + 0.07); }
}
