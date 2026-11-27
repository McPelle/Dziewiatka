// Rozmowa z zawodnikiem w gabinecie trenera (3D): biurko, okno z widokiem na boisko, tablica taktyczna, gablota z pucharami,
// herb klubu na ścianie. Zawodnik siedzi naprzeciwko w stroju treningowym klubu i reaguje mimiką i gestami.
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Klub, Zawodnik } from "../../engine/types";
import { HERBY } from "../../data/herby";
import { kluczHerbu } from "../Herb";
import { kity } from "../strojeDane";
import { minka, stworzPostac, wyglad3D, type Postac } from "./zawodnik3d";
import { lekkaGrafika } from "./Stadion3DWidok";
import { uriObrazka } from "./Konferencja3D";

export function Rozmowa3D({ klub, z, emocja, mowi, trofea }: { klub: Klub; z: Zawodnik; emocja: number; mowi: "trener" | "zawodnik" | null; trofea: number }) {
  const host = useRef<any>(null);
  const stan = useRef({ emocja, mowi }); stan.current = { emocja, mowi };
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    const lekka = lekkaGrafika();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 200;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : 2)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene(); scena.background = new THREE.Color(0x2a2520);
    const kity0 = kity(klub); const kit = z.poz === "BR" ? kity0.bramkarz[0] : kity0.pole[0];
    scena.add(new THREE.HemisphereLight(0xfff4e6, 0x3a2f25, 0.8));
    const okno = new THREE.DirectionalLight(0xfff2dd, 1.3); okno.position.set(-4, 4, 1); okno.castShadow = true; scena.add(okno);
    const lampa = new THREE.PointLight(0xffd9a0, 1.5, 6); lampa.position.set(0.8, 2.1, 0.2); scena.add(lampa);
    const drewno = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.55 });
    const pod = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 0.85 })); pod.rotation.x = -Math.PI / 2; pod.receiveShadow = true; scena.add(pod);
    const sciana = (w: number, x: number, z: number, ry: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 3.2), new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 1 })); m.position.set(x, 1.6, z); m.rotation.y = ry; scena.add(m); };
    sciana(8, 0, -2.5, 0); sciana(8, -3, 0, Math.PI / 2); sciana(8, 3, 0, -Math.PI / 2);
    // okno z widokiem na boisko
    const widok = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshBasicMaterial({ color: 0x4caf50 })); widok.position.set(-2.98, 1.7, -0.4); widok.rotation.y = Math.PI / 2; scena.add(widok);
    const niebo = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ color: 0x9cc8f0 })); niebo.position.set(-2.97, 2.25, -0.4); niebo.rotation.y = Math.PI / 2; scena.add(niebo);
    for (const dy of [0, 0.7, 1.4]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.5), new THREE.MeshStandardMaterial({ color: 0xffffff })); r.position.set(-2.95, 1.0 + dy, -0.4); scena.add(r); }
    // tablica taktyczna z ustawieniem
    const c = document.createElement("canvas"); c.width = 512; c.height = 320; const g = c.getContext("2d")!;
    g.fillStyle = "#1f6f3a"; g.fillRect(0, 0, 512, 320); g.strokeStyle = "#fff"; g.lineWidth = 3; g.strokeRect(10, 10, 492, 300); g.beginPath(); g.moveTo(256, 10); g.lineTo(256, 310); g.stroke(); g.beginPath(); g.arc(256, 160, 40, 0, 7); g.stroke();
    for (let i = 0; i < 10; i++) { g.fillStyle = kit.baza; g.beginPath(); g.arc(80 + (i % 4) * 50 + (i > 7 ? 120 : 0), 50 + Math.floor(i / 4) * 90 + (i % 2) * 20, 11, 0, 7); g.fill(); }
    g.strokeStyle = "#ffeb3b"; g.beginPath(); g.moveTo(180, 140); g.quadraticCurveTo(300, 60, 400, 140); g.stroke();
    const tt = new THREE.CanvasTexture(c); tt.colorSpace = THREE.SRGBColorSpace;
    const tablica = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshStandardMaterial({ map: tt })); tablica.position.set(0.9, 1.8, -2.48); scena.add(tablica);
    // herb klubu w ramie
    const herbMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const uri = uriObrazka(HERBY[kluczHerbu(klub) ?? ""]);
    if (uri) new THREE.TextureLoader().load(uri, (t) => { t.colorSpace = THREE.SRGBColorSpace; herbMat.map = t; herbMat.needsUpdate = true; });
    const rama = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.04), new THREE.MeshStandardMaterial({ color: 0x3a2a1a })); rama.position.set(-1.0, 2.0, -2.47); scena.add(rama);
    const herb = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), herbMat); herb.position.set(-1.0, 2.0, -2.44); scena.add(herb);
    // gablota z pucharami
    const gab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 1.4), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.4 })); gab.position.set(2.72, 0.9, -1.2); scena.add(gab);
    const zloto = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
    for (let i = 0; i < Math.min(8, trofea); i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.22, 10), zloto); p.position.set(2.5, 0.55 + Math.floor(i / 3) * 0.45, -1.7 + (i % 3) * 0.45); scena.add(p); }
    // biurko, laptop, krzesła
    const biurko = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.0), drewno); biurko.position.set(0, 0.78, 0); biurko.castShadow = true; biurko.receiveShadow = true; scena.add(biurko);
    for (const [x, zz] of [[-0.9, -0.42], [0.9, -0.42], [-0.9, 0.42], [0.9, 0.42]]) { const n = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.06), drewno); n.position.set(x, 0.39, zz); scena.add(n); }
    const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.28), new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.7 })); laptop.position.set(0.45, 0.83, 0.15); scena.add(laptop);
    const ekran = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshStandardMaterial({ color: 0x223355, emissive: new THREE.Color(0x335588), emissiveIntensity: 0.8 })); ekran.position.set(0.45, 0.96, 0.02); ekran.rotation.x = -0.2; scena.add(ekran);
    const kubek = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 12), new THREE.MeshStandardMaterial({ color: kit.baza })); kubek.position.set(-0.5, 0.87, 0.1); scena.add(kubek);
    const krzeslo = (zz: number) => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222 })); k.position.set(0, 0.48, zz); scena.add(k); const opar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.06), new THREE.MeshStandardMaterial({ color: 0x222222 })); opar.position.set(0, 0.8, zz + Math.sign(zz) * 0.25); scena.add(opar); };
    krzeslo(-0.95); krzeslo(0.95);
    // zawodnik (strój treningowy klubu) — siedzi naprzeciw kamery
    const zaw: Postac = stworzPostac({ ...wyglad3D(z), twarz: true, koszulka: kit.baza, dodatek: kit.dodatek, wzor: kit.wzor === "pasy" ? "jednolity" : kit.wzor, spodenki: kit.dodatek, getry: kit.baza, nr: z.numer, nazwisko: z.nazwisko, seed: [...z.id].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0) });
    zaw.g.position.set(0, -0.38 + 0.3, -0.95); zaw.uda.forEach((u) => (u.rotation.x = -1.45)); zaw.lydki.forEach((l) => (l.rotation.x = 1.45)); scena.add(zaw.g);
    // trener (od tyłu, przy kamerze)
    const trener = stworzPostac({ koszulka: "#1d2536", spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed: 21 });
    trener.g.position.set(0.45, -0.08, 0.95); trener.g.rotation.y = Math.PI; trener.uda.forEach((u) => (u.rotation.x = -1.45)); trener.lydki.forEach((l) => (l.rotation.x = 1.45)); scena.add(trener.g);
    const cam = new THREE.PerspectiveCamera(36, W() / H(), 0.05, 50);
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scena, cam)); composer.addPass(new OutputPass());
    let t = 0, ost = performance.now(), raf = 0, emo = 0;
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dt = Math.min(0.05, (n - ost) / 1000); ost = n; t += dt;
      const { emocja: e, mowi: m } = stan.current;
      emo += (e - emo) * Math.min(1, dt * 2);
      minka(zaw, emo, t, m === "zawodnik");
      // mowa ciała: zadowolony — otwarte ręce i kiwanie; zły — skrzyżowane ręce, odchylony; neutralny — słucha
      const [r1, r2] = zaw.ramiona;
      if (emo < -0.3) { r1.rotation.x = -1.2; r2.rotation.x = -1.2; r1.rotation.z = 0.9; r2.rotation.z = -0.9; zaw.tulow.rotation.x = -0.12; zaw.tulow.rotation.y = Math.sin(t * 0.8) * 0.12; }
      else if (emo > 0.3) { r1.rotation.x = -0.9 - Math.abs(Math.sin(t * 2)) * 0.3; r2.rotation.x = -0.9; r1.rotation.z = -0.25; r2.rotation.z = 0.25; zaw.tulow.rotation.x = 0.1 + Math.sin(t * 3) * 0.03; zaw.tulow.rotation.y = 0; }
      else { r1.rotation.x = -0.7; r2.rotation.x = -0.7; r1.rotation.z = 0.05; r2.rotation.z = -0.05; zaw.tulow.rotation.x = 0.05 + Math.sin(t * 1.2) * 0.01; zaw.tulow.rotation.y = 0; }
      trener.tulow.rotation.y = m === "trener" ? Math.sin(t * 2) * 0.1 : 0; trener.ramiona[0].rotation.x = m === "trener" ? -1.0 - Math.abs(Math.sin(t * 3)) * 0.5 : -0.8;
      // kamera: zza ramienia trenera, przy reakcji zbliżenie na twarz zawodnika
      const blisko = m === "zawodnik" || Math.abs(emo) > 0.5;
      const pc = blisko ? new THREE.Vector3(-0.35, 1.95, 0.55) : new THREE.Vector3(-1.05, 1.95, 2.0);
      cam.position.lerp(pc, 1 - Math.exp(-dt * 1.8)); cam.lookAt(0, blisko ? 1.9 : 1.6, -0.95);
      composer.render(dt);
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); scena.clear(); };
  }, [klub.id, z.id]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: "#2a2520", borderRadius: 12, overflow: "hidden" }} />;
}
