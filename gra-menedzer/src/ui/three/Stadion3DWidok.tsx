// Stadion 3D do oglądania: w zakładce klubu (obracanie palcem, widać trwające budowy) i jako tło menu
// (wolno krążąca kamera, pora dnia wg zegara w telefonie, lekki ruch obrazu przy przechylaniu telefonu).
import { useEffect, useRef, useState } from "react";
import { TloStadion } from "../TloStadion";
import { Text, View } from "react-native";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Klub, StanGry } from "../../engine/types";
import { swiatla, zbudujStadion } from "./stadion3d";

export const lekkaGrafika = () => typeof window !== "undefined" && window.localStorage?.getItem("dz_lekka") === "1";
export const grafika3D = () => typeof window !== "undefined" && !!window.WebGLRenderingContext && window.localStorage?.getItem("dz_3d") !== "0";

export function Stadion3DWidok({ s, klub, tlo, wysokosc, noc }: { s: StanGry | null; klub: Klub; tlo?: boolean; wysokosc?: number; noc?: boolean }) {
  const host = useRef<any>(null);
  const [awaria, setAwaria] = useState<false | string>(false); // 3D nie ruszyło → rysunek 2D zamiast czarnego tła
  const [proba, setProba] = useState(0);
  const [start, setStart] = useState(!tlo); // tło menu: start 3D dopiero gdy gra jest już gotowa do klikania
  const [widoczny, setWidoczny] = useState(!tlo);
  const [diag, setDiag] = useState(false);
  const etap = useRef("czeka na start");
  const info = useRef({ gpu: "?", w: 0, h: 0, klatki: 0, blad: "" });
  const [, przerysuj] = useState(0);
  useEffect(() => { if (!tlo) return; const iv = setInterval(() => przerysuj((x) => x + 1), 1500); return () => clearInterval(iv); }, [tlo]);
  useEffect(() => {
    if (!tlo) return;
    const t = setTimeout(() => setStart(true), 700); // bez requestIdleCallback — na iPhonie potrafi nigdy nie zadziałać
    const diag = setTimeout(() => setDiag(true), 6000);
    return () => { clearTimeout(t); clearTimeout(diag); };
  }, [tlo]);
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined" || !start) return;
    etap.current = "tworzenie grafiki";
    const lekka = lekkaGrafika();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !lekka, failIfMajorPerformanceCaveat: false }); } catch (e) { setAwaria("brak WebGL: " + String((e as Error)?.message ?? e).slice(0, 60)); return; }
    let klatki = 0, zEfektami = !lekka;
    try { const gl = renderer.getContext(); const dbg = gl.getExtension("WEBGL_debug_renderer_info"); info.current.gpu = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).slice(0, 28) + (renderer.capabilities.isWebGL2 ? " ·GL2" : " ·GL1"); } catch { /* */ }
    const strata = (e: Event) => { e.preventDefault(); setTimeout(() => setProba((p) => p + 1), 800); }; // iPhone wyłączył grafikę → start od nowa
    renderer.domElement.addEventListener("webglcontextlost", strata);
    const straznik = setTimeout(() => { if (klatki === 0) setAwaria("grafika nie ruszyła w 30 s"); }, 30000);
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 240;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : tlo ? 1.5 : 2)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = !tlo && !lekka; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    if (tlo) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", touchAction: "none" });
    el.appendChild(renderer.domElement);
    const godz = new Date().getHours();
    const jestNoc = noc ?? (godz >= 19 || godz < 6);
    const scena = new THREE.Scene();
    swiatla(scena, jestNoc, false, lekka);
    const mies = new Date().getMonth() + 1;
    etap.current = "budowa stadionu";
    let stad: ReturnType<typeof zbudujStadion>;
    try { stad = zbudujStadion(s, klub, { noc: jestNoc, snieg: mies === 12 || mies <= 2 ? new Date().getDate() % 3 === 0 : false, deszcz: false, widzowie: tlo ? klub.pojemnosc * 0.5 : 0, lekka: lekka || !!tlo, budowy: s?.budowy }); } catch (e) { clearTimeout(straznik); renderer.dispose(); renderer.domElement.remove(); setAwaria("budowa sceny: " + String((e as Error)?.message ?? e).slice(0, 60)); return; }
    scena.add(stad.grupa);
    const cam = new THREE.PerspectiveCamera(40, W() / H(), 0.5, 1000);
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scena, cam));
    if (!lekka) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), jestNoc ? 0.8 : 0.15, 0.6, jestNoc ? 0.8 : 0.95));
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
      try { if (zEfektami) composer.render(dt); else renderer.render(scena, cam); klatki++; info.current.klatki = klatki; info.current.w = renderer.domElement.width; info.current.h = renderer.domElement.height; if (klatki === 3) etap.current = "OK"; }
      catch (e) { info.current.blad = String((e as Error)?.message ?? e).slice(0, 50); if (zEfektami) zEfektami = false; else { cancelAnimationFrame(raf); setAwaria("rysowanie: " + String((e as Error)?.message ?? e).slice(0, 60)); } } // bez poświaty, a gdy i to nie działa — 2D
    };
    let anulowano = false;
    etap.current = "kompilacja";
    const uruchom = () => { etap.current = "rysowanie"; if (anulowano) return; raf = requestAnimationFrame(petla); setTimeout(() => !anulowano && setWidoczny(true), 120); };
    const r2 = renderer as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> };
    { let ruszyl = false; const raz = () => { if (!ruszyl) { ruszyl = true; uruchom(); } };
      setTimeout(raz, 2000); // iPhone: gdy kompilacja w tle się nie kończy — startujemy i tak (jak dawniej)
      try { if (r2.compileAsync) r2.compileAsync(scena, cam).then(raz, raz); else raz(); } catch { raz(); } }
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => {
      anulowano = true; clearTimeout(straznik); renderer.domElement.removeEventListener("webglcontextlost", strata);
      cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("deviceorientation", orient);
      window.removeEventListener("pointermove", ruch); window.removeEventListener("pointerup", gora);
      renderer.dispose(); renderer.domElement.remove(); scena.clear();
    };
  }, [klub.id, klub.pojemnosc, s?.budowy?.length, noc, tlo, proba, awaria, start]);
  if (awaria) return tlo ? <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as any}><TloStadion /><Text style={{ position: "absolute", left: 6, bottom: 4, color: "rgba(255,255,255,0.55)", fontSize: 9 }}>3D: {awaria}</Text></View> : <View style={{ width: "100%", height: wysokosc ?? 260, borderRadius: 10, overflow: "hidden" }}><TloStadion /></View>;
  if (tlo) return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as any}>
      {/* grafika 3D zawsze w pełni widoczna (Safari na iPhonie nie pokazuje 3D pod przezroczystością) — to rysunek 2D na wierzchu znika */}
      <View ref={host} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as any} />
      {!widoczny && <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as any}><TloStadion /></View>}
      {diag && <Text style={{ position: "absolute", left: 6, bottom: 4, color: "rgba(255,255,255,0.75)", fontSize: 9, backgroundColor: "rgba(0,0,0,0.45)" }}>3D: {etap.current}{start ? "" : " (start=nie)"} · widać={widoczny ? "tak" : "nie"} · kl={info.current.klatki} · {info.current.w}×{info.current.h} · {info.current.gpu}{info.current.blad ? ` · BŁĄD: ${info.current.blad}` : ""}</Text>}
    </View>
  );
  return <View ref={host} style={{ width: "100%", height: wysokosc ?? 260, borderRadius: 10, overflow: "hidden", backgroundColor: "#0b1226" }} />;
}
