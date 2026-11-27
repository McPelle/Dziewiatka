// Konferencja prasowa w 3D: sala ze ścianką sponsorską (herb + sponsorzy klubu), stół z mikrofonami i butelkami wody,
// trener w garniturze (gestykuluje przy odpowiedzi), rzecznik klubu, dziennikarze z aparatami i kamerami TV na statywach;
// flesze przy pytaniach (poświata), kamera jak w transmisji. Pytania i odpowiedzi czytane polskim głosem.
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Klub } from "../../engine/types";
import { barwyKlubu } from "../../data/barwy";
import { HERBY } from "../../data/herby";
import { kluczHerbu } from "../Herb";
import { animuj, stworzPostac, type Postac } from "./zawodnik3d";
import { lekkaGrafika } from "./Stadion3DWidok";

export function uriObrazka(src: unknown): string | undefined {
  if (!src) return undefined;
  if (typeof src === "string") return src;
  const o = src as { uri?: string; default?: string };
  return o.uri ?? (typeof o.default === "string" ? o.default : undefined);
}

/** Ścianka sponsorska: kafelki z herbem klubu i nazwami sponsorów (jak na prawdziwych konferencjach). */
function scianka(klub: Klub, sponsorzy: string[], gotowe: () => void): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512; const g = c.getContext("2d")!;
  const [k1, k2] = barwyKlubu(klub.nazwa);
  g.fillStyle = "#f4f5f7"; g.fillRect(0, 0, 1024, 512);
  const lista = [klub.nazwa, ...(sponsorzy.length ? sponsorzy : ["Partner klubu"])];
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const herb = new Image(); const uri = uriObrazka(HERBY[kluczHerbu(klub) ?? ""]);
  const rysuj = (img?: HTMLImageElement) => {
    let i = 0;
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) {
      const x = k * 171 + (r % 2) * 85, y = r * 128 + 14;
      if ((r + k) % 2 === 0 && img) g.drawImage(img, x + 50, y + 8, 84, 84);
      else { const t = lista[i++ % lista.length]; g.fillStyle = (r + k) % 3 === 0 ? k1 : "#22262c"; g.font = `bold ${t.length > 14 ? 20 : 26}px Arial`; g.textAlign = "center"; g.fillText(t.toUpperCase().slice(0, 18), x + 92, y + 58); }
    }
    g.fillStyle = k1; g.fillRect(0, 500, 1024, 12); g.fillStyle = k2; g.fillRect(0, 494, 1024, 6);
    tex.needsUpdate = true; gotowe();
  };
  if (uri) { herb.crossOrigin = "anonymous"; herb.onload = () => rysuj(herb); herb.onerror = () => rysuj(); herb.src = uri; } else rysuj();
  return tex;
}

export function Konferencja3D({ klub, sponsorzy, typ, nastroj, nrPytania, nrOdpowiedzi }: {
  klub: Klub; sponsorzy: string[]; typ: "przed" | "po"; nastroj: number; nrPytania: number; nrOdpowiedzi: number;
}) {
  const host = useRef<any>(null);
  const zdarzenia = useRef({ pytanie: nrPytania, odpowiedz: nrOdpowiedzi });
  zdarzenia.current.pytanie = nrPytania; zdarzenia.current.odpowiedz = nrOdpowiedzi;
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    const lekka = lekkaGrafika();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !lekka }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 200;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : 2)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene(); scena.background = new THREE.Color(0x15171c);
    const [k1] = barwyKlubu(klub.nazwa);
    // światło: miękkie studyjne + punktowe na stół
    scena.add(new THREE.HemisphereLight(0xffffff, 0x333333, 0.55));
    const key = new THREE.SpotLight(0xfff1dd, 18, 30, 0.6, 0.5, 1.2); key.position.set(2, 7, 6); key.target.position.set(0, 1, 0); key.castShadow = true; scena.add(key, key.target);
    const fill = new THREE.DirectionalLight(0xcfe0ff, 0.35); fill.position.set(-5, 4, 4); scena.add(fill);
    // podłoga i ściany
    const pod = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.95 })); pod.rotation.x = -Math.PI / 2; pod.receiveShadow = true; scena.add(pod);
    const sciana = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), new THREE.MeshStandardMaterial({ color: 0x3a3f48, roughness: 1 })); sciana.position.set(0, 4, -3.2); scena.add(sciana);
    // ścianka sponsorska
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 3.6), new THREE.MeshStandardMaterial({ map: scianka(klub, sponsorzy, () => {}), roughness: 0.6 }));
    sc.position.set(0, 2.2, -3.0); scena.add(sc);
    // podest i stół z obrusem w barwach klubu
    const podest = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 2.6), new THREE.MeshStandardMaterial({ color: 0x1d2026 })); podest.position.set(0, 0.15, -1.6); podest.receiveShadow = true; scena.add(podest);
    const stol = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.85, 0.9), new THREE.MeshStandardMaterial({ color: k1, roughness: 0.8 })); stol.position.set(0, 0.72, -1.0); stol.castShadow = true; stol.receiveShadow = true; scena.add(stol);
    const blat = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.05, 1.0), new THREE.MeshStandardMaterial({ color: 0xf2f2f2 })); blat.position.set(0, 1.17, -1.0); scena.add(blat);
    // mikrofony + butelki
    for (const x of [-0.75, 0.75]) {
      const stat = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6 })); stat.position.set(x, 1.36, -0.75); stat.rotation.x = -0.4; scena.add(stat);
      const mik = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0x111111 })); mik.position.set(x, 1.5, -0.68); scena.add(mik);
      const but = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 10), new THREE.MeshStandardMaterial({ color: 0x9fd3ff, transparent: true, opacity: 0.55, roughness: 0.1 })); but.position.set(x + 0.3, 1.32, -0.85); scena.add(but);
    }
    // mikrofony telewizji (kostki z logo stacji)
    for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), new THREE.MeshStandardMaterial({ color: [0xc8102e, 0x1e3d8f, 0xf2c230, 0x0d8a4a, 0x222222][i] })); m.position.set(-0.35 + i * 0.14, 1.27, -0.62); scena.add(m); }
    // trener (garnitur) i rzecznik klubu — siedzą za stołem
    const siedz = (p: Postac) => { p.uda.forEach((u) => (u.rotation.x = -1.45)); p.lydki.forEach((l) => (l.rotation.x = 1.45)); p.g.position.y = -0.38; };
    const trener = stworzPostac({ koszulka: "#1d2536", dodatek: "#e8e8e8", spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed: 21, wzor: "jednolity" });
    trener.g.position.set(-0.75, 0.3, -1.65); scena.add(trener.g); siedz(trener);
    const krawat = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.02), new THREE.MeshStandardMaterial({ color: k1 })); krawat.position.set(0, 0.45, 0.16); trener.tulow.add(krawat);
    const rzecznik = stworzPostac({ koszulka: k1, dodatek: k1, spodenki: "#222", getry: "#222", nr: 0, seed: 34, wzor: "jednolity" });
    rzecznik.g.position.set(0.75, 0.3, -1.65); scena.add(rzecznik.g); siedz(rzecznik);
    // dziennikarze (rzędy krzeseł), aparaty, kamery TV na statywach
    const dzienn: { p: Postac; aparat: THREE.Mesh; lampa: THREE.PointLight }[] = [];
    const ubrania = ["#3b4a63", "#5a4636", "#2f2f2f", "#6b7a8a", "#7a2a2a", "#44553a", "#8a7a5a"];
    const ilu = lekka ? 8 : 14;
    for (let i = 0; i < ilu; i++) {
      const rz = Math.floor(i / 5), kol = i % 5;
      const p = stworzPostac({ koszulka: ubrania[i % ubrania.length], dodatek: ubrania[(i + 3) % ubrania.length], spodenki: "#25282e", getry: "#25282e", nr: 0, seed: 50 + i * 13, wzor: "jednolity" });
      p.g.position.set(-2.6 + kol * 1.3 + (rz % 2) * 0.4, 0, 1.6 + rz * 1.3); p.g.rotation.y = Math.PI; siedz(p); scena.add(p.g);
      const krzeslo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), new THREE.MeshStandardMaterial({ color: 0x8c1d1d })); krzeslo.position.set(p.g.position.x, 0.48, p.g.position.z + 0.05); scena.add(krzeslo);
      const aparat = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.11, 0.1), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0 }));
      aparat.position.set(0, 0.78, -0.25); p.tulow.add(aparat);
      const lampa = new THREE.PointLight(0xffffff, 0, 6); lampa.position.copy(p.g.position).add(new THREE.Vector3(0, 1.3, -0.4)); scena.add(lampa);
      dzienn.push({ p, aparat, lampa });
    }
    for (const x of [-3.6, 3.6]) {
      const kam = new THREE.Group();
      const korpus = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4 })); korpus.position.y = 1.55; kam.add(korpus);
      const obiektyw = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0x0a0a0a })); obiektyw.rotation.x = Math.PI / 2; obiektyw.position.set(0, 1.55, -0.4); kam.add(obiektyw);
      const dioda = new THREE.Mesh(new THREE.SphereGeometry(0.025), new THREE.MeshBasicMaterial({ color: 0xff2020 })); dioda.position.set(0.12, 1.72, -0.2); kam.add(dioda);
      for (const a of [0, 2.1, 4.2]) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5), new THREE.MeshStandardMaterial({ color: 0x555555 })); n.position.set(Math.sin(a) * 0.25, 0.7, Math.cos(a) * 0.25); n.rotation.z = Math.sin(a) * 0.2; n.rotation.x = Math.cos(a) * 0.2; kam.add(n); }
      kam.position.set(x, 0, 3.8); kam.lookAt(0, 1.4, -1); scena.add(kam);
    }
    const cam = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 100);
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scena, cam));
    if (!lekka) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.5, 0.4, 0.92));
    composer.addPass(new OutputPass());
    let ostP = -1, ostO = -1, t = 0, gest = 0, flesze = 0, ujecie = 0, ostT = performance.now(), raf = 0;
    const smutek = typeof nastroj === "number" && nastroj < 0;
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dt = Math.min(0.05, (n - ostT) / 1000); ostT = n; t += dt;
      const z = zdarzenia.current;
      if (z.pytanie !== ostP) { ostP = z.pytanie; flesze = smutek ? 2.2 : 1.4; ujecie = (ujecie + 1) % 3; }
      if (z.odpowiedz !== ostO) { ostO = z.odpowiedz; gest = 2.5; }
      // flesze aparatów
      flesze = Math.max(0, flesze - dt);
      for (const d of dzienn) {
        const blysk = flesze > 0 && Math.random() < 0.08 ? 1 : 0;
        d.lampa.intensity = blysk ? 4 : d.lampa.intensity * 0.6;
        (d.aparat.material as THREE.MeshStandardMaterial).emissiveIntensity = blysk ? 3 : (d.aparat.material as THREE.MeshStandardMaterial).emissiveIntensity * 0.6;
        d.p.ramiona[0].rotation.x = -1.3 + Math.sin(t * 0.7 + d.p.faza) * 0.05; d.p.ramiona[1].rotation.x = -1.3;
        d.p.tulow.rotation.y = Math.sin(t * 0.3 + d.p.faza) * 0.15;
      }
      // trener: gesty przy odpowiedzi, oddech, lekkie kiwanie głową; po porażce zgarbiony
      gest = Math.max(0, gest - dt);
      const [r1, r2] = trener.ramiona;
      r1.rotation.x = -0.9 - (gest > 0 ? Math.abs(Math.sin(t * 4)) * 0.6 : 0); r2.rotation.x = -0.9 - (gest > 0 ? Math.abs(Math.sin(t * 3 + 1)) * 0.4 : 0);
      r1.rotation.z = -0.2 - (gest > 0 ? Math.sin(t * 2) * 0.25 : 0);
      trener.tulow.rotation.x = (smutek ? 0.18 : 0.02) + Math.sin(t * 1.3) * 0.012; trener.tulow.rotation.y = gest > 0 ? Math.sin(t * 1.5) * 0.15 : Math.sin(t * 0.4) * 0.05;
      rzecznik.tulow.rotation.y = -0.3 + Math.sin(t * 0.5) * 0.05;
      // kamera: 3 ujęcia jak w transmisji, powolny najazd
      const najazd = Math.min(1, (t % 12) / 12) * 0.6;
      const cele: [THREE.Vector3, THREE.Vector3][] = [
        [new THREE.Vector3(0, 2.3, 6.5 - najazd), new THREE.Vector3(0, 1.7, -1.6)],
        [new THREE.Vector3(-0.2, 1.95, 2.6 - najazd * 0.5), new THREE.Vector3(-0.75, 1.75, -1.6)],
        [new THREE.Vector3(3.2, 2.4, 4.4), new THREE.Vector3(-0.4, 1.6, -1.5)],
      ];
      const [pc, lc] = cele[gest > 0 ? 1 : ujecie];
      cam.position.lerp(pc, 1 - Math.exp(-dt * 2)); cam.lookAt(lc);
      composer.render(dt);
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); scena.clear(); };
  }, [klub.id, typ]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#15171c", borderRadius: 12, overflow: "hidden" }} />;
}
