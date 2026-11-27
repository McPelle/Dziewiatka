// Szatnia w przerwie meczu (3D): szafki z koszulkami i numerami, ławki pod ścianami, zawodnicy w strojach meczowych
// (z twarzami i mimiką), trener na środku gestykuluje; reakcja drużyny na mowę (radość / spokój / zwieszone głowy).
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Klub, StanGry } from "../../engine/types";
import type { Kit } from "../strojeDane";
import { HERBY } from "../../data/herby";
import { kluczHerbu } from "../Herb";
import { minka, stworzPostac, wyglad3D, type Postac } from "./zawodnik3d";
import { lekkaGrafika } from "./Stadion3DWidok";
import { uriObrazka } from "./Konferencja3D";

export function Szatnia3D({ s, klub, zawodnicy, kit, kitBr, nastroj, mowi }: { s: StanGry; klub: Klub; zawodnicy: string[]; kit: Kit; kitBr: Kit; nastroj: number; mowi: boolean }) {
  const host = useRef<any>(null);
  const stan = useRef({ nastroj, mowi }); stan.current = { nastroj, mowi };
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    const lekka = lekkaGrafika();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 200;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : 2)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = !lekka; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene(); scena.background = new THREE.Color(0x1b1f24);
    scena.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.7));
    for (const x of [-2.5, 2.5]) { const l = new THREE.PointLight(0xfff1dd, 4, 12); l.position.set(x, 3.2, 0); l.castShadow = !lekka; scena.add(l); }
    const pod = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ color: 0x5a636b, roughness: 0.6 })); pod.rotation.x = -Math.PI / 2; pod.receiveShadow = true; scena.add(pod);
    // dywan z herbem klubu na środku
    const herbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true });
    const uri = uriObrazka(HERBY[kluczHerbu(klub) ?? ""]);
    if (uri) new THREE.TextureLoader().load(uri, (t) => { t.colorSpace = THREE.SRGBColorSpace; herbMat.map = t; herbMat.needsUpdate = true; });
    const dywan = new THREE.Mesh(new THREE.CircleGeometry(1.4, 40), new THREE.MeshStandardMaterial({ color: kit.baza, roughness: 0.9 })); dywan.rotation.x = -Math.PI / 2; dywan.position.y = 0.01; scena.add(dywan);
    const herb = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), herbMat); herb.rotation.x = -Math.PI / 2; herb.position.y = 0.02; scena.add(herb);
    // ściany z szafkami (koszulki z numerami) i ławki
    const sciana = new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.95 });
    const tyl = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), sciana); tyl.position.set(0, 2, -4); scena.add(tyl);
    for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), sciana); b.position.set(sx * 5.5, 2, 0); b.rotation.y = -sx * Math.PI / 2; scena.add(b); }
    const drewno = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.6 });
    const ids = zawodnicy.slice(0, 16);
    // rozstaw: 8 przy tylnej ścianie, po 4 przy bocznych
    const miejsca: { x: number; z: number; ry: number }[] = [];
    for (let i = 0; i < 8; i++) miejsca.push({ x: -3.5 + i, z: -3.3, ry: 0 });
    for (let i = 0; i < 4; i++) miejsca.push({ x: -4.8, z: -1.8 + i * 1.1, ry: Math.PI / 2 });
    for (let i = 0; i < 4; i++) miejsca.push({ x: 4.8, z: -1.8 + i * 1.1, ry: -Math.PI / 2 });
    const postacie: Postac[] = [];
    ids.forEach((id, i) => {
      const z = s.zawodnicy[id]; const m = miejsca[i]; if (!z || !m) return;
      const k = z.poz === "BR" ? kitBr : kit;
      // szafka z koszulką i numerem
      const szafka = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5 }));
      const back = new THREE.Vector3(m.x, 1.1, m.z).add(new THREE.Vector3(Math.sin(m.ry), 0, Math.cos(m.ry)).multiplyScalar(-0.55));
      szafka.position.copy(back); szafka.rotation.y = m.ry; scena.add(szafka);
      const c = document.createElement("canvas"); c.width = 64; c.height = 64; const g = c.getContext("2d")!;
      g.fillStyle = k.baza; g.fillRect(8, 10, 48, 50); g.fillStyle = k.dodatek; g.font = "bold 26px Arial"; g.textAlign = "center"; g.fillText(String(z.numer || ""), 32, 46);
      const kosz = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      kosz.position.copy(back).add(new THREE.Vector3(Math.sin(m.ry), 0.45, Math.cos(m.ry)).multiplyScalar(1)).setY(1.55); kosz.rotation.y = m.ry; scena.add(kosz);
      const lawka = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.45), drewno); lawka.position.set(m.x, 0.46, m.z); lawka.rotation.y = m.ry; scena.add(lawka);
      const p = stworzPostac({ ...wyglad3D(z), twarz: true, koszulka: k.baza, dodatek: k.dodatek, wzor: k.wzor, spodenki: k.dodatek, getry: k.baza, nr: z.numer, nazwisko: z.nazwisko, seed: [...id].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0) });
      p.g.position.set(m.x, -0.4 + 0.3, m.z + (m.ry === 0 ? 0.12 : 0)); p.g.rotation.y = m.ry;
      p.uda.forEach((u) => (u.rotation.x = -1.45)); p.lydki.forEach((l) => (l.rotation.x = 1.45));
      scena.add(p.g); postacie.push(p);
    });
    // trener na środku
    const trener = stworzPostac({ twarz: true, koszulka: "#1d2536", spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed: 21 });
    trener.g.position.set(0, 0, 0.6); trener.g.rotation.y = Math.PI; scena.add(trener.g);
    const cam = new THREE.PerspectiveCamera(48, W() / H(), 0.1, 60);
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scena, cam)); composer.addPass(new OutputPass());
    let t = 0, ost = performance.now(), raf = 0, emo = 0;
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dt = Math.min(0.05, (n - ost) / 1000); ost = n; t += dt;
      const { nastroj: e, mowi: m } = stan.current;
      emo += (e - emo) * Math.min(1, dt * 1.5);
      postacie.forEach((p, i) => {
        minka(p, emo + Math.sin(i * 7.1) * 0.15, t + i);
        // zwieszone głowy przy złym nastroju, kiwanie przy dobrym
        p.tulow.rotation.x = emo < -0.2 ? 0.35 : 0.06 + (emo > 0.3 ? Math.abs(Math.sin(t * 2.5 + i)) * 0.08 : 0);
        p.ramiona[0].rotation.x = p.ramiona[1].rotation.x = emo > 0.5 ? -2.6 + Math.sin(t * 6 + i) * 0.2 : -0.6;
      });
      // trener chodzi i gestykuluje
      trener.g.position.x = Math.sin(t * 0.5) * 1.2;
      trener.g.rotation.y = Math.PI + Math.sin(t * 0.5) * 0.6;
      minka(trener, m ? (e >= 0 ? 0.3 : -0.6) : 0, t, m);
      trener.ramiona[0].rotation.x = m ? -1.2 - Math.abs(Math.sin(t * 4)) * 0.8 : -0.3; trener.ramiona[1].rotation.x = m ? -0.9 - Math.abs(Math.sin(t * 3 + 1)) * 0.6 : -0.3;
      trener.uda[0].rotation.x = Math.sin(t * 2) * 0.25; trener.uda[1].rotation.x = -Math.sin(t * 2) * 0.25;
      cam.position.set(Math.sin(t * 0.12) * 1.2, 2.6, 4.2); cam.lookAt(0, 1.0, -1.2);
      composer.render(dt);
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); scena.clear(); };
  }, [klub.id]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: "#1b1f24", borderRadius: 12, overflow: "hidden" }} />;
}
