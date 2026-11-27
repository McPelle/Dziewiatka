// Muzyka w menu (spokojny motyw generowany w grze przez Web Audio — akordy pad + delikatna melodia, bez plików)
// i dźwięki interfejsu (szelest kartki przy umowie, gwizdek przy rozpoczęciu dnia, kasa przy przychodzie, klik).
// Ustawienia zapamiętywane w localStorage.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const LS = (k: string, d: boolean) => { try { const v = localStorage.getItem(k); return v == null ? d : v === "1"; } catch { return d; } };
const zapisz = (k: string, v: boolean) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch { /* */ } };
const ac = () => { if (typeof window === "undefined" || !(window as any).AudioContext) return null; ctx ??= new (window as any).AudioContext(); if (ctx!.state === "suspended") ctx!.resume(); return ctx; };

export const muzykaWlaczona = () => LS("muzyka", true);
export const dzwiekiWlaczone = () => LS("dzwiekiUI", true);
export function ustawMuzyke(v: boolean) { zapisz("muzyka", v); if (v) startMuzyki(); else stopMuzyki(); }
export function ustawDzwieki(v: boolean) { zapisz("dzwiekiUI", v); }

// progresja I–V–vi–IV w C-dur (częstotliwości), melodia pentatoniczna
const AKORDY = [[261.63, 329.63, 392.0], [196.0, 246.94, 293.66], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63]];
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0];
function nuta(c: AudioContext, f: number, t: number, dl: number, g: number, typ: OscillatorType) {
  const o = c.createOscillator(), v = c.createGain(); o.type = typ; o.frequency.value = f;
  v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + dl * 0.3); v.gain.linearRampToValueAtTime(0, t + dl);
  o.connect(v); v.connect(master!); o.start(t); o.stop(t + dl + 0.05);
}
export function startMuzyki() {
  if (!muzykaWlaczona() || timer) return;
  const c = ac(); if (!c) return;
  master = c.createGain(); master.gain.value = 0.05; const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1800; master.connect(f); f.connect(c.destination);
  let i = 0;
  const takt = () => {
    if (!ctx || !master) return;
    const t = ctx.currentTime + 0.05, a = AKORDY[i % 4];
    for (const fr of a) nuta(ctx, fr / 2, t, 3.9, 0.35, "sine");
    for (let k = 0; k < 4; k++) if (Math.random() < 0.55) nuta(ctx, PENTA[Math.floor(Math.random() * PENTA.length)] / (Math.random() < 0.5 ? 1 : 2), t + k * 0.95, 0.9, 0.18, "triangle");
    i++; timer = setTimeout(takt, 3800);
  };
  takt();
}
export function stopMuzyki() { if (timer) clearTimeout(timer); timer = null; try { master?.disconnect(); } catch { /* */ } master = null; }

/** Krótkie dźwięki interfejsu. */
export function dzwiekUI(typ: "kartka" | "gwizdek" | "kasa" | "klik") {
  if (!dzwiekiWlaczone()) return; const c = ac(); if (!c) return;
  const t = c.currentTime, out = c.createGain(); out.gain.value = 0.25; out.connect(c.destination);
  if (typ === "kartka") { // szelest: krótki filtrowany szum
    const b = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / d.length) * Math.PI) * 0.6;
    const s = c.createBufferSource(), f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 3500; f.Q.value = 0.7; s.buffer = b; s.connect(f); f.connect(out); s.start(t);
  } else if (typ === "gwizdek") {
    const o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), v = c.createGain(); o.frequency.value = 2900; l.frequency.value = 38; lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency);
    v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.5, t + 0.03); v.gain.setValueAtTime(0.5, t + 0.32); v.gain.linearRampToValueAtTime(0, t + 0.4);
    o.connect(v); v.connect(out); o.start(t); l.start(t); o.stop(t + 0.42); l.stop(t + 0.42);
  } else if (typ === "kasa") { // „ka-ching”: dwa dzwonki
    for (const [fr, dt] of [[1318.5, 0], [1975.5, 0.09]] as const) { const o = c.createOscillator(), v = c.createGain(); o.type = "triangle"; o.frequency.value = fr; v.gain.setValueAtTime(0.5, t + dt); v.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.5); o.connect(v); v.connect(out); o.start(t + dt); o.stop(t + dt + 0.55); }
  } else { const o = c.createOscillator(), v = c.createGain(); o.frequency.value = 900; v.gain.setValueAtTime(0.2, t); v.gain.exponentialRampToValueAtTime(0.001, t + 0.06); o.connect(v); v.connect(out); o.start(t); o.stop(t + 0.07); }
}
