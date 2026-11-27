// Dźwięk meczu generowany w grze (Web Audio, bez plików): szum trybun zależny od frekwencji i akcji, przestrzenny
// (strona bliżej kamery głośniej), gwizdek sędziego, wybuch radości po golu, przyśpiewki, uderzenie piłki, jęk zawodu.
let ctx: AudioContext | null = null;
let tlum: { gain: GainNode; filtr: BiquadFilterNode; pan: StereoPannerNode } | null = null;
let glos = 1, wyciszony = false;

function szum(c: AudioContext, sek = 2): AudioBuffer {
  const b = c.createBuffer(1, c.sampleRate * sek, c.sampleRate), d = b.getChannelData(0);
  let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } // szum brązowy
  return b;
}
export function startDzwieku(frekwencja: number) {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    if (tlum) return;
    const src = ctx.createBufferSource(); src.buffer = szum(ctx, 4); src.loop = true;
    const filtr = ctx.createBiquadFilter(); filtr.type = "bandpass"; filtr.frequency.value = 700; filtr.Q.value = 0.6;
    const gain = ctx.createGain(); gain.gain.value = 0;
    const pan = ctx.createStereoPanner();
    src.connect(filtr).connect(gain).connect(pan).connect(ctx.destination); src.start();
    tlum = { gain, filtr, pan };
    glos = Math.max(0.08, Math.min(1, frekwencja));
  } catch { /* przeglądarka bez Web Audio */ }
}
export function wycisz(w: boolean) { wyciszony = w; if (tlum && ctx) tlum.gain.gain.setTargetAtTime(w ? 0 : 0.12 * glos, ctx.currentTime, 0.2); }
export const czyWyciszony = () => wyciszony;
/** Napięcie 0–1 (piłka pod bramką = głośniej), pan −1…1 (gdzie jest akcja względem kamery). */
export function napiecie(n: number, pan: number) {
  if (!ctx || !tlum || wyciszony) return;
  const t = ctx.currentTime;
  tlum.gain.gain.setTargetAtTime((0.1 + n * 0.25) * glos, t, 0.4);
  tlum.filtr.frequency.setTargetAtTime(600 + n * 900, t, 0.4);
  tlum.pan.pan.setTargetAtTime(Math.max(-0.7, Math.min(0.7, pan)), t, 0.3);
}
export function gwizdek(dlugi = false, ile = 1) {
  if (!ctx || wyciszony) return;
  for (let k = 0; k < ile; k++) {
    const t0 = ctx.currentTime + k * (dlugi ? 0.9 : 0.4), dur = dlugi ? 0.75 : 0.28;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.16, t0 + 0.02); g.gain.setValueAtTime(0.16, t0 + dur - 0.05); g.gain.linearRampToValueAtTime(0, t0 + dur);
    const trem = ctx.createOscillator(); trem.frequency.value = 32; const tg = ctx.createGain(); tg.gain.value = 0.07; trem.connect(tg).connect(g.gain);
    for (const f of [2950, 3150]) { const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; o.connect(g); o.start(t0); o.stop(t0 + dur); }
    trem.start(t0); trem.stop(t0 + dur); g.connect(ctx.destination);
  }
}
export function kopniecie(sila = 1) {
  if (!ctx || wyciszony) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.09);
  g.gain.setValueAtTime(0.25 * sila, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.13);
}
/** Wybuch radości po golu (+ przyśpiewka, gdy gol gospodarzy) albo jęk zawodu. */
export function reakcjaTrybun(typ: "gol" | "zawod" | "ooo", przyspiewka = false) {
  if (!ctx || wyciszony) return;
  const t = ctx.currentTime, src = ctx.createBufferSource(); src.buffer = szum(ctx, 5);
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = typ === "gol" ? 1100 : 500; f.Q.value = 0.7;
  const g = ctx.createGain();
  const szczyt = (typ === "gol" ? 0.9 : typ === "ooo" ? 0.35 : 0.3) * glos;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(szczyt, t + (typ === "gol" ? 0.35 : 0.5)); g.gain.exponentialRampToValueAtTime(0.01, t + (typ === "gol" ? 4.5 : 1.8));
  if (typ === "zawod" || typ === "ooo") f.frequency.linearRampToValueAtTime(typ === "ooo" ? 900 : 300, t + 1.2);
  src.connect(f).connect(g).connect(ctx.destination); src.start(t); src.stop(t + 5);
  if (przyspiewka && typ === "gol") {
    // rytmiczne „klaskanie i śpiew" — modulacja amplitudy w rytmie 2 uderzeń na sekundę
    const s2 = ctx.createBufferSource(); s2.buffer = szum(ctx, 8); const f2 = ctx.createBiquadFilter(); f2.type = "bandpass"; f2.frequency.value = 520; f2.Q.value = 1.4;
    const g2 = ctx.createGain(); g2.gain.value = 0;
    for (let i = 0; i < 14; i++) { const ti = t + 3 + i * 0.5; g2.gain.setValueAtTime(0.02 * glos, ti); g2.gain.linearRampToValueAtTime(0.32 * glos, ti + 0.05); g2.gain.linearRampToValueAtTime(0.06 * glos, ti + 0.35); }
    g2.gain.linearRampToValueAtTime(0, t + 10.5);
    s2.connect(f2).connect(g2).connect(ctx.destination); s2.start(t + 3); s2.stop(t + 11);
  }
}
export function stopDzwieku() { try { tlum?.gain.disconnect(); } catch { /* */ } tlum = null; }
