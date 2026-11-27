// Zawodnik 3D z przegubami (biodra, kolana, ramiona) — animacja biegu, strzału, wślizgu, rzutu bramkarza i cieszynki.
// Stroje: koszulka/spodenki/getry w barwach klubu, numer na plecach, osobny strój bramkarza; kolor skóry i włosów z nasionka.
import * as THREE from "three";

export interface Twarz3D { usta: THREE.Mesh; brwi: [THREE.Mesh, THREE.Mesh]; oczy: [THREE.Mesh, THREE.Mesh]; glowa: THREE.Object3D }
export interface Postac { twarz?: Twarz3D; g: THREE.Group; uda: [THREE.Object3D, THREE.Object3D]; lydki: [THREE.Object3D, THREE.Object3D]; ramiona: [THREE.Object3D, THREE.Object3D]; tulow: THREE.Object3D; faza: number; poza: "bieg" | "strzal" | "radosc" | "rzut" | "stoi" | "lezy"; pozaT: number; vS?: number; ostPoza?: string; przejT?: number; snap?: number[] }
const SKORA = [0xf1c9a5, 0xe8b48c, 0xd29b74, 0xb07a52, 0x7a4e30, 0x4e3220];
const WLOSY = [0x2b1d12, 0x4a3020, 0x8a6a3a, 0xc9a35a, 0x111111, 0x6b4a2a];

function teksturaNumeru(nr: number, kolor: string, tlo: string, nazwisko?: string): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = 128; c.height = 128; const g = c.getContext("2d")!;
  g.fillStyle = tlo; g.fillRect(0, 0, 128, 128);
  g.fillStyle = kolor; g.textAlign = "center";
  if (nazwisko) { g.font = "bold 16px Arial"; g.fillText(nazwisko.toUpperCase().slice(0, 11), 64, 26); }
  g.font = "bold 72px Arial"; g.textBaseline = "middle"; g.fillText(String(nr), 64, 76);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const kontrast = (hex: string) => { const c = new THREE.Color(hex); return c.r * 0.3 + c.g * 0.59 + c.b * 0.11 > 0.55 ? "#111111" : "#ffffff"; };

export function stworzPostac(o: { skora?: string; wlosy?: string; lysy?: boolean; styl?: number; zarost?: boolean; siwy?: boolean; twarz?: boolean; koszulka: string; dodatek?: string; spodenki: string; getry: string; nr: number; nazwisko?: string; seed: number; sedzia?: boolean; wzor?: "pasy" | "rekaw" | "jednolity" }): Postac {
  const g = new THREE.Group();
  const skora = new THREE.MeshStandardMaterial({ color: o.skora ?? SKORA[o.seed % 3], roughness: 0.7 });
  const kosz = new THREE.MeshStandardMaterial({ color: o.koszulka, roughness: 0.75 });
  const spod = new THREE.MeshStandardMaterial({ color: o.spodenki, roughness: 0.8 });
  const getr = new THREE.MeshStandardMaterial({ color: o.getry, roughness: 0.8 });
  const but = new THREE.MeshStandardMaterial({ color: o.seed % 3 === 0 ? 0xffffff : o.seed % 3 === 1 ? 0x111111 : 0xff5522, roughness: 0.4 });
  // tułów (koszulka) + numer z tyłu
  const tulow = new THREE.Group(); tulow.position.y = 1.0; g.add(tulow);
  const korpus = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 10), kosz); korpus.position.y = 0.32; korpus.scale.set(1.15, 1, 0.75); korpus.castShadow = true; tulow.add(korpus);
  const numer = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshStandardMaterial({ map: teksturaNumeru(o.nr, kontrast(o.koszulka), o.koszulka, o.nazwisko), roughness: 0.8 }));
  numer.position.set(0, 0.36, -0.158); numer.rotation.y = Math.PI; if (o.nr > 0) tulow.add(numer); // trener, sędziowie, kibice — bez numeru
  const dod = new THREE.MeshStandardMaterial({ color: o.dodatek ?? o.spodenki, roughness: 0.75 });
  if (o.wzor === "pasy") for (let i = -1; i <= 1; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.52, 0.315), dod); p.position.set(i * 0.13, 0.33, 0); tulow.add(p); }
  { const kol = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 6, 14), dod); kol.rotation.x = Math.PI / 2; kol.position.y = 0.68; tulow.add(kol); } // kołnierzyk w kolorze dodatku
  // atletyczna sylwetka: szersze barki (kopuły w kolorze koszulki), zwężenie w pasie
  for (const sx of [-1, 1]) { const bark = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 8), kosz); bark.position.set(sx * 0.21, 0.57, 0); bark.scale.set(1, 0.85, 0.9); bark.castShadow = true; tulow.add(bark); }
  korpus.scale.set(1.22, 1, 0.78);
  if (o.nr > 0) { const nrP = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), new THREE.MeshStandardMaterial({ map: teksturaNumeru(o.nr, kontrast(o.koszulka), o.koszulka), roughness: 0.8, transparent: true })); nrP.position.set(0.075, 0.5, 0.162); tulow.add(nrP); } // mały numer na piersi
  const szyja = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1), skora); szyja.position.y = 0.72; tulow.add(szyja);
  const glowa = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), skora); glowa.position.y = 0.88; glowa.scale.set(0.95, 1.08, 1); glowa.castShadow = true; tulow.add(glowa);
  // fryzura wg stylu (0 krótkie, 1 bardzo krótkie, 2 dłuższe z przedziałkiem, 3 łysy, 4 kręcone), siwienie z wiekiem, zarost
  const kolW = o.siwy ? "#a7a7a2" : o.wlosy ?? WLOSY[(o.seed >> 2) % WLOSY.length];
  const matW = new THREE.MeshStandardMaterial({ color: kolW, roughness: 0.9 });
  const zasieg = o.styl === 1 ? 0.34 : o.styl === 2 ? 0.5 : o.styl === 4 ? 0.42 : 0.3 + (o.seed % 4) * 0.06;
  const wl = new THREE.Mesh(new THREE.SphereGeometry(o.styl === 4 ? 0.15 : o.styl === 1 ? 0.133 : 0.137, 14, 10, 0, Math.PI * 2, 0, Math.PI * zasieg), matW);
  wl.visible = !o.lysy; wl.position.y = 0.9; wl.rotation.x = -0.25; tulow.add(wl);
  if (o.styl === 4 && !o.lysy) for (let i = 0; i < 7; i++) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), matW); const a = (i / 7) * Math.PI * 2; k.position.set(Math.cos(a) * 0.1, 0.97 + (i % 2) * 0.03, Math.sin(a) * 0.1 - 0.02); tulow.add(k); }
  if (o.styl === 2 && !o.lysy) { const tyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.13, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), matW); tyl.position.set(0, 0.84, -0.02); tyl.rotation.y = Math.PI; tulow.add(tyl); }
  if (o.zarost) { const br = new THREE.Mesh(new THREE.SphereGeometry(0.134, 12, 8, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.64, Math.PI * 0.24), new THREE.MeshStandardMaterial({ color: kolW, roughness: 1 })); br.position.y = 0.88; br.scale.set(0.96, 1.08, 1.02); tulow.add(br); }
  // twarz z mimiką (zbliżenia: rozmowy, konferencje, szatnia)
  let twarz: Twarz3D | undefined;
  if (o.twarz) {
    const czarny = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.5 });
    const bialko = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const oko = (x: number) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), bialko); b.position.set(x, 0.905, 0.112); const z = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), czarny); z.position.set(0, 0, 0.014); b.add(z); tulow.add(b); return b; };
    const brew = (x: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.009, 0.01), new THREE.MeshStandardMaterial({ color: WLOSY[(o.seed >> 2) % WLOSY.length] })); m.position.set(x, 0.945, 0.118); tulow.add(m); return m; };
    const usta = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 6, 16, Math.PI), new THREE.MeshStandardMaterial({ color: 0x8a3a3a }));
    usta.position.set(0, 0.835, 0.118); usta.rotation.z = Math.PI; tulow.add(usta);
    const nos = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 8), skora); nos.rotation.x = Math.PI / 2; nos.position.set(0, 0.875, 0.135); tulow.add(nos);
    twarz = { usta, brwi: [brew(-0.045), brew(0.045)], oczy: [oko(-0.045), oko(0.045)], glowa };
  }
  // spodenki
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.26, 12), spod); sp.position.y = 0.95; sp.scale.z = 0.75; sp.castShadow = true; g.add(sp);
  for (const sx of [-1, 1]) { const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.25, 0.08), dod); lamp.position.set(sx * 0.2, 0.95, 0); g.add(lamp); } // lampasy
  // nogi: udo (pivot w biodrze) → łydka (pivot w kolanie)
  const noga = (x: number): [THREE.Object3D, THREE.Object3D] => {
    const biodro = new THREE.Group(); biodro.position.set(x, 0.92, 0); g.add(biodro);
    const udoSk = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.3, 3, 8), skora); udoSk.position.y = -0.24; udoSk.castShadow = true; biodro.add(udoSk); // udo (skóra)
    const udo = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.088, 0.16, 10), spod); udo.position.y = -0.07; udo.castShadow = true; biodro.add(udo); // nogawka spodenek
    const kolano = new THREE.Group(); kolano.position.y = -0.45; biodro.add(kolano);
    const lyd = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.36, 10), getr); lyd.position.y = -0.2; lyd.castShadow = true; kolano.add(lyd); // łydka zwężająca się ku kostce
    const mank = new THREE.Mesh(new THREE.CylinderGeometry(0.079, 0.077, 0.05, 10), dod); mank.position.y = -0.03; kolano.add(mank); // mankiet getrów pod kolanem
    const stopa = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.06, 0.2), but); stopa.position.set(0, -0.415, 0.03); stopa.castShadow = true; kolano.add(stopa);
    const czubek = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), but); czubek.scale.set(0.95, 0.6, 1.2); czubek.position.set(0, -0.42, 0.13); kolano.add(czubek);
    const pasek = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.012, 0.12), new THREE.MeshStandardMaterial({ color: o.seed % 3 === 0 ? 0x111111 : 0xffffff })); pasek.position.set(0, -0.39, 0.05); kolano.add(pasek); // pasek na korku
    const podeszwa = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.26), new THREE.MeshStandardMaterial({ color: 0x222222 })); podeszwa.position.set(0, -0.448, 0.06); kolano.add(podeszwa);
    return [biodro, kolano];
  };
  const [u1, k1] = noga(-0.1), [u2, k2] = noga(0.1);
  // ręce (pivot w barku)
  const reka = (x: number) => {
    const bark = new THREE.Group(); bark.position.set(x, 0.58, 0); tulow.add(bark);
    const r1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 3, 8), o.wzor === "rekaw" ? dod : kosz); r1.position.y = -0.14; bark.add(r1);
    const r2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 3, 8), skora); r2.position.y = -0.4; bark.add(r2);
    const mankR = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.035, 10), dod); mankR.position.y = -0.26; bark.add(mankR); // mankiet rękawka
    const dlon = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skora); dlon.position.y = -0.56; dlon.scale.set(0.9, 1.1, 0.8); bark.add(dlon);
    return bark;
  };
  const ramiona: [THREE.Object3D, THREE.Object3D] = [reka(-0.27), reka(0.27)];
  // cień kontaktowy (miękka plamka pod stopami — „miękkie cienie")
  const cien = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
  cien.rotation.x = -Math.PI / 2; cien.position.y = 0.015; g.add(cien);
  g.scale.setScalar(1.05 + ((o.seed >> 3) % 5) * 0.025); // wzrost 1,72–1,92 m
  return { twarz, g, uda: [u1, u2], lydki: [k1, k2], ramiona, tulow, faza: (o.seed % 100) / 15, poza: "stoi", pozaT: 0 };
}

/** Płynny obrót w stronę kąta `cel` (najkrótszą drogą). */
export function obrocDo(g: THREE.Object3D, cel: number, dt: number, szybkosc = 10) {
  let d = cel - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
  g.rotation.y += d * (1 - Math.exp(-dt * szybkosc));
}

const STAWY = (p: Postac) => [p.uda[0].rotation, p.uda[1].rotation, p.lydki[0].rotation, p.lydki[1].rotation, p.ramiona[0].rotation, p.ramiona[1].rotation, p.tulow.rotation];
const PRZEJSCIE = 0.18;

/** Animacja postaci: v = prędkość (m/s), dt = czas klatki. Prędkość jest wygładzana, a zmiana pozy (bieg → strzał → radość…)
 *  przechodzi płynnie (krótkie przenikanie ze starej pozy do nowej), w miejscu — oddech i lekkie przestępowanie. */
export function animuj(p: Postac, vSur: number, dt: number) {
  p.vS = (p.vS ?? vSur) + (vSur - (p.vS ?? vSur)) * (1 - Math.exp(-dt * 7)); const v = p.vS;
  p.pozaT = Math.max(0, p.pozaT - dt);
  if (p.pozaT <= 0 && p.poza !== "lezy") p.poza = v > 0.4 ? "bieg" : "stoi";
  const grupaPozy = p.poza === "stoi" ? "bieg" : p.poza;
  if (p.ostPoza !== undefined && p.ostPoza !== grupaPozy) { p.snap = STAWY(p).flatMap((r) => [r.x, r.y, r.z]); p.snap.push(p.g.position.y); p.przejT = PRZEJSCIE; }
  p.ostPoza = grupaPozy;
  const [u1, u2] = p.uda, [k1, k2] = p.lydki, [r1, r2] = p.ramiona;
  p.tulow.rotation.y = 0;
  if (p.poza === "bieg" || p.poza === "stoi") {
    p.faza += dt * (4 + Math.min(v, 9) * 1.15);
    const amp = Math.min(1, v / 6) * 0.9, spok = 1 - Math.min(1, v / 1.2);
    u1.rotation.x = Math.sin(p.faza) * amp; u2.rotation.x = -Math.sin(p.faza) * amp;
    k1.rotation.x = Math.max(0, -Math.sin(p.faza + 0.6)) * amp * 1.4 + 0.06; k2.rotation.x = Math.max(0, Math.sin(p.faza + 0.6)) * amp * 1.4 + 0.06;
    const oddech = Math.sin(p.faza * 0.38) * spok;
    r1.rotation.x = -Math.sin(p.faza) * amp * 0.8 + oddech * 0.04; r2.rotation.x = Math.sin(p.faza) * amp * 0.8 + oddech * 0.04;
    r1.rotation.z = -0.12 - spok * 0.05; r2.rotation.z = 0.12 + spok * 0.05;
    p.tulow.rotation.x = Math.min(0.25, v * 0.03) + oddech * 0.025; p.tulow.rotation.y = Math.sin(p.faza) * 0.14 * amp;
    p.tulow.rotation.z = Math.sin(p.faza * 0.19) * 0.03 * spok; // przenoszenie ciężaru w miejscu
    p.g.position.y = Math.abs(Math.sin(p.faza)) * 0.05 * amp;
  } else if (p.poza === "strzal") {
    const t = 1 - p.pozaT / 0.45; // zamach i uderzenie prawą nogą
    u2.rotation.x = t < 0.5 ? 0.9 * t * 2 : 0.9 - (t - 0.5) * 2 * 2.1; k2.rotation.x = t < 0.5 ? 1.2 : Math.max(0, 1.2 - (t - 0.5) * 4);
    u1.rotation.x = 0.1; k1.rotation.x = 0.2; r1.rotation.z = -0.9; r2.rotation.z = 0.5; p.tulow.rotation.x = -0.1;
  } else if (p.poza === "radosc") {
    p.faza += dt * 10;
    r1.rotation.x = Math.PI * 0.95 + Math.sin(p.faza) * 0.1; r2.rotation.x = Math.PI * 0.95 - Math.sin(p.faza) * 0.1; r1.rotation.z = -0.3; r2.rotation.z = 0.3;
    u1.rotation.x = Math.sin(p.faza) * 0.6; u2.rotation.x = -Math.sin(p.faza) * 0.6; k1.rotation.x = 0.3; k2.rotation.x = 0.3;
    p.g.position.y = Math.abs(Math.sin(p.faza * 0.5)) * 0.25; p.tulow.rotation.x = -0.15;
  } else if (p.poza === "rzut") {
    const t = 1 - p.pozaT / 0.7; // rzut bramkarza w bok
    p.tulow.rotation.z = Math.sin(t * Math.PI * 0.5) * 1.3 * (p.faza > 0 ? 1 : -1); r1.rotation.z = -2.6; r2.rotation.z = 2.6;
    p.g.position.y = Math.sin(t * Math.PI) * 0.5;
  } else if (p.poza === "lezy") {
    p.tulow.rotation.x = -1.45; u1.rotation.x = -0.2; u2.rotation.x = 0.3; p.g.position.y = 0.02;
  }
  // przenikanie ze starej pozy (gładka zmiana zamiast skoku)
  if (p.przejT && p.przejT > 0 && p.snap) {
    const w0 = 1 - p.przejT / PRZEJSCIE, w = w0 * w0 * (3 - 2 * w0);
    STAWY(p).forEach((r, i) => { r.x = p.snap![i * 3] + (r.x - p.snap![i * 3]) * w; r.y = p.snap![i * 3 + 1] + (r.y - p.snap![i * 3 + 1]) * w; r.z = p.snap![i * 3 + 2] + (r.z - p.snap![i * 3 + 2]) * w; });
    p.g.position.y = p.snap[21] + (p.g.position.y - p.snap[21]) * w;
    p.przejT -= dt;
  }
}

/** Mimika: emocja −1 (złość/smutek) … 0 (neutralnie) … +1 (radość). `mowi` = ruch ust. Mruganie co kilka sekund. */
export function minka(p: Postac, emocja: number, t: number, mowi = false) {
  const tw = p.twarz; if (!tw) return;
  const e = Math.max(-1, Math.min(1, emocja));
  // usta: łuk w górę (uśmiech) albo w dół (smutek/złość), skala przy mówieniu
  tw.usta.rotation.z = e >= 0 ? Math.PI : 0;
  tw.usta.position.y = e >= 0 ? 0.84 : 0.825;
  tw.usta.scale.set(0.8 + Math.abs(e) * 0.5, (0.3 + Math.abs(e) * 0.9) * (mowi ? 0.7 + Math.abs(Math.sin(t * 14)) * 0.8 : 1), 1);
  // brwi: zmarszczone przy złości, uniesione przy radości
  tw.brwi[0].rotation.z = e < 0 ? -0.35 * -e : 0.1 * e; tw.brwi[1].rotation.z = -tw.brwi[0].rotation.z;
  tw.brwi[0].position.y = tw.brwi[1].position.y = 0.945 + e * 0.008;
  const mrug = (t % 3.7) < 0.12 ? 0.15 : 1; tw.oczy[0].scale.y = tw.oczy[1].scale.y = mrug;
}

import { domyslneCechy, SKORY, WLOSY as WLOSY_2D } from "../Twarz";
import type { Zawodnik } from "../../engine/types";
/** Kolor skóry i włosów 3D zgodny z portretem zawodnika w grze (karnacja wg kraju). */
export function wyglad3D(z?: Zawodnik): { skora?: string; wlosy?: string; lysy?: boolean; styl?: number; zarost?: boolean; siwy?: boolean } {
  if (!z) return {};
  const c = z.twarz ?? domyslneCechy(z.imie + z.nazwisko, z.kraj);
  let h = 0; for (const ch of z.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const lysy = c.stylWlosow === 3 || (z.wiek >= 33 && h % 5 === 0); // z wiekiem łysienie i siwizna
  return { skora: SKORY[c.skora % SKORY.length], wlosy: WLOSY_2D[c.wlosy % WLOSY_2D.length], lysy, styl: c.stylWlosow, zarost: !!c.zarost || (z.wiek >= 28 && h % 4 === 1), siwy: z.wiek >= 34 && h % 3 === 0 };
}
