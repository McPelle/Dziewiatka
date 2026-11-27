// Tło menu: dokładnie ta wersja stadionu 3D, która działała w aplikacji z ikony na iPhonie (wersja 2), uruchamiana z ~1 s opóźnieniem.
// Stadion 3D do oglądania: w zakładce klubu (obracanie palcem, widać trwające budowy) i jako tło menu
// (wolno krążąca kamera, pora dnia wg zegara w telefonie, lekki ruch obrazu przy przechylaniu telefonu).
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Klub, StanGry } from "../../engine/types";
import { swiatla, zbudujStadion } from "./stadion3d";

const lekkaGrafikaV2 = () => typeof window !== "undefined" && window.localStorage?.getItem("dz_lekka") === "1";
const grafika3DV2 = () => typeof window !== "undefined" && !!window.WebGLRenderingContext && window.localStorage?.getItem("dz_3d") !== "0";

function Stadion3DV2({ s, klub, tlo, wysokosc, noc }: { s: StanGry | null; klub: Klub; tlo?: boolean; wysokosc?: number; noc?: boolean }) {
  const host = useRef<any>(null);
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    const lekka = lekkaGrafikaV2();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !lekka }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 240;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : tlo ? 1.5 : 2)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = false; // tło menu: bez cieni — błyskawiczne przygotowanie grafiki na iPhonie renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", touchAction: "none" });
    el.appendChild(renderer.domElement);
    const godz = new Date().getHours();
    const jestNoc = noc ?? (godz >= 19 || godz < 6);
    const scena = new THREE.Scene();
    // lekkie światło (bez reflektorów-spotów i cieni): kilka prostych shaderów zamiast kilkunastu ciężkich
    scena.background = new THREE.Color(jestNoc ? 0x0b1226 : 0x8fbbe8);
    scena.fog = new THREE.Fog(scena.background as THREE.Color, 160, 520);
    scena.add(new THREE.HemisphereLight(jestNoc ? 0x8a9ac8 : 0xdfeeff, jestNoc ? 0x1a2a1a : 0x445533, jestNoc ? 1.1 : 1.3));
    { const sl = new THREE.DirectionalLight(jestNoc ? 0xfff4dd : 0xfff2d8, jestNoc ? 1.4 : 2.2); sl.position.set(60, 80, 45); scena.add(sl); }
    const mies = new Date().getMonth() + 1;
    const stad = zbudujStadion(s, klub, { noc: jestNoc, snieg: mies === 12 || mies <= 2 ? new Date().getDate() % 3 === 0 : false, deszcz: false, widzowie: tlo ? klub.pojemnosc * 0.5 : 0, lekka, budowy: s?.budowy });
    // materiały „lekkie" (Lambert): wygląd prawie ten sam, a iPhone przygotowuje je w ułamku sekundy
    const cache = new Map<THREE.Material, THREE.Material>();
    stad.grupa.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m || Array.isArray(m) || !(m instanceof THREE.MeshStandardMaterial)) return;
      let n = cache.get(m);
      if (!n) { n = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, transparent: m.transparent, opacity: m.opacity, side: m.side, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, depthWrite: m.depthWrite }); cache.set(m, n); }
      (o as THREE.Mesh).material = n; (o as THREE.Mesh).castShadow = false; (o as THREE.Mesh).receiveShadow = false;
    });
    scena.add(stad.grupa);
    const cam = new THREE.PerspectiveCamera(40, W() / H(), 0.5, 1000);
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scena, cam));
    // bez poświaty w tle menu (oszczędza czas przygotowania)
    composer.addPass(new OutputPass());
    const rozmiar = 70 + Math.sqrt(klub.pojemnosc) * 0.9;
    let kat = 0.6, wys = tlo ? 0.45 : 0.6, przeciaganie = false, px = 0, py = 0, tiltX = 0, tiltY = 0;
    const dol = (e: PointerEvent) => { przeciaganie = true; px = e.clientX; py = e.clientY; };
    const ruch = (e: PointerEvent) => { if (!przeciaganie) return; kat -= (e.clientX - px) * 0.008; wys = Math.max(0.12, Math.min(1.35, wys + (e.clientY - py) * 0.005)); px = e.clientX; py = e.clientY; };
    const gora = () => { przeciaganie = false; };
    if (!tlo) { renderer.domElement.addEventListener("pointerdown", dol); window.addEventListener("pointermove", ruch); window.addEventListener("pointerup", gora); }
    // przechylanie telefonu → delikatna paralaksa (iPhone pyta o zgodę przy pierwszym dotknięciu)
    const orient = (e: DeviceOrientationEvent) => { tiltX = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30)); tiltY = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 30)); };
    window.addEventListener("deviceorientation", orient);
    const zgoda = () => { const D = (window as any).DeviceOrientationEvent; if (D?.requestPermission) D.requestPermission().catch(() => {}); };
    renderer.domElement.addEventListener("click", zgoda, { once: true });
    let raf = 0, ost = performance.now(), t = 0;
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dt = Math.min(0.05, (n - ost) / 1000); ost = n; t += dt;
      if (tlo || !przeciaganie) kat += dt * (tlo ? 0.05 : 0.08);
      const r = rozmiar * (tlo ? 1.15 : 1);
      cam.position.set(Math.cos(kat + tiltX * 0.25) * r, 18 + wys * r * 0.55 + tiltY * 6, Math.sin(kat + tiltX * 0.25) * r);
      cam.lookAt(0, 2, 0);
      stad.aktualizuj(t, tlo ? 0.15 : 0);
      renderer.render(scena, cam); void composer;
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("deviceorientation", orient);
      window.removeEventListener("pointermove", ruch); window.removeEventListener("pointerup", gora);
      renderer.dispose(); renderer.domElement.remove(); scena.clear();
    };
  }, [klub.id, klub.pojemnosc, s?.budowy?.length, noc, tlo]);
  return <View ref={host} style={tlo ? { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as any : { width: "100%", height: wysokosc ?? 260, borderRadius: 10, overflow: "hidden", backgroundColor: "#0b1226" }} />;
}

import { TloStadion } from "../TloStadion";
/** Tło menu: najpierw rysunek 2D (menu od razu klikalne), po ~1 s stadion 3D z wersji 2. */
export function Stadion3DMenu({ s, klub }: { s: StanGry | null; klub: Klub }) {
  // stadion 3D od razu (jak w wersji 2) — bez rysunku 2D na starcie
  if (!grafika3DV2()) return <TloStadion />;
  return <Stadion3DV2 s={s} klub={klub} tlo />;
}
