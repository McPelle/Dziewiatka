// Biuro trenera 3D (#54) — tło menu głównego przy trwającej karierze: biurko z laptopem (herb klubu na ekranie),
// tablica taktyczna, półka z pucharami (liczba wg tytułów i awansów), szalik w barwach klubu, kalendarz, kubek kawy,
// okno z widokiem na stadion — za oknem pora dnia według zegara w telefonie. Kamera powoli „oddycha”.
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { barwyKlubu } from "../../data/barwy";
import { HERBY } from "../../data/herby";
import type { Klub, StanGry } from "../../engine/types";
import { kluczHerbu } from "../Herb";

const box = (w: number, h: number, d: number, kolor: number | string, x: number, y: number, z: number, g: THREE.Object3D) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: kolor })); m.position.set(x, y, z); g.add(m); return m;
};

export function Biuro3D({ s, klub }: { s: StanGry; klub: Klub }) {
  const host = useRef<any>(null);
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 300;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setSize(W(), H());
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(renderer.domElement);
    const godz = new Date().getHours(), noc = godz >= 19 || godz < 6, wieczor = godz >= 17 && godz < 19;
    const [k1, k2] = barwyKlubu(klub.nazwa);
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1a1410);
    sc.add(new THREE.HemisphereLight(0xfff1dd, 0x3a2a1c, noc ? 0.7 : 1.1));
    const lampa = new THREE.PointLight(0xffd9a0, noc ? 2.2 : 1.0, 9); lampa.position.set(-1.2, 2.2, 0.8); sc.add(lampa);
    const okno = new THREE.DirectionalLight(noc ? 0x7a8cff : wieczor ? 0xffa060 : 0xfff6e0, noc ? 0.3 : 1.4); okno.position.set(2, 3, -3); sc.add(okno);
    const g = new THREE.Group(); sc.add(g);
    // pokój: podłoga, ściany, pas w barwach klubu
    box(8, 0.05, 6, 0x6b4a2e, 0, 0, 0, g);
    box(8, 3.2, 0.05, 0xd9d2c3, 0, 1.6, -2.5, g); box(0.05, 3.2, 6, 0xcfc8b8, -3.5, 1.6, 0, g);
    box(8, 0.25, 0.06, k1, 0, 1.0, -2.47, g); box(8, 0.08, 0.06, k2, 0, 1.17, -2.47, g);
    // okno z widokiem na stadion (pora dnia)
    const niebo = noc ? 0x0b1630 : wieczor ? 0xf08a4b : 0x8fc2f0;
    box(2.4, 1.5, 0.04, niebo, 1.8, 1.95, -2.46, g);
    const stad = new THREE.Group(); stad.position.set(1.8, 1.4, -2.43); g.add(stad);
    box(2.2, 0.35, 0.02, 0x7d8a96, 0, 0.05, 0, stad); box(2.2, 0.06, 0.03, k1, 0, 0.24, 0.01, stad);
    for (const x of [-1, 1]) { box(0.04, 0.8, 0.02, 0x555555, x * 0.95, 0.45, 0.01, stad); if (noc) box(0.22, 0.08, 0.02, 0xfff7c0, x * 0.95, 0.86, 0.02, stad); }
    box(2.5, 0.06, 0.08, 0xffffff, 1.8, 1.2, -2.42, g); box(2.5, 0.06, 0.08, 0xffffff, 1.8, 2.72, -2.42, g); box(0.06, 1.55, 0.08, 0xffffff, 1.8, 1.95, -2.42, g);
    // biurko, laptop z herbem, kubek, kalendarz
    box(2.6, 0.08, 1.2, 0x4a3020, -0.4, 0.78, 0.2, g); for (const [x, z] of [[-1.6, -0.3], [0.8, -0.3], [-1.6, 0.7], [0.8, 0.7]]) box(0.07, 0.75, 0.07, 0x3a2416, x, 0.39, z, g);
    box(0.7, 0.03, 0.48, 0x2b2b2b, -0.4, 0.835, 0.35, g);
    const ekran = box(0.7, 0.45, 0.025, 0x111111, -0.4, 1.07, 0.11, g); ekran.rotation.x = -0.18;
    const kl = kluczHerbu(klub); const src = kl ? (HERBY[kl] as unknown as { uri?: string } | string) : undefined; const uri = typeof src === "string" ? src : src?.uri;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), new THREE.MeshBasicMaterial({ color: new THREE.Color(k1).lerp(new THREE.Color(0xffffff), 0.15) }));
    panel.position.set(-0.4, 1.07, 0.125); panel.rotation.x = -0.18; g.add(panel);
    if (uri) new THREE.TextureLoader().load(uri, (tx) => { const herb = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshBasicMaterial({ map: tx, transparent: true })); herb.position.set(-0.4, 1.07, 0.13); herb.rotation.x = -0.18; g.add(herb); });
    const kubek = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 14), new THREE.MeshLambertMaterial({ color: k1 })); kubek.position.set(0.35, 0.88, 0.45); g.add(kubek);
    box(0.32, 0.02, 0.24, 0xf4f1e8, 0.55, 0.83, 0.05, g); // notatki / kalendarz meczów
    // tablica taktyczna na ścianie
    box(1.5, 0.95, 0.04, 0x1f6b3a, -1.6, 2.0, -2.45, g);
    const kropki = [[-0.45, 0.25], [-0.45, -0.25], [-0.15, 0.35], [-0.15, 0.1], [-0.15, -0.1], [-0.15, -0.35], [0.15, 0.2], [0.15, -0.2], [0.4, 0.3], [0.4, 0], [0.4, -0.3]];
    for (const [x, y] of kropki) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); d.position.set(-1.6 + x, 2.0 + y, -2.42); g.add(d); }
    // szalik w barwach klubu (pasy)
    for (let i = 0; i < 10; i++) box(0.16, 0.18, 0.02, i % 2 ? k2 : k1, -3.0 + 0.16 * i, 2.75, -2.44, g);
    // półka z pucharami (tytuły, awanse, puchary z historii)
    box(1.4, 0.05, 0.3, 0x5a3a24, -3.25, 1.5, -1.0, g).rotation.y = Math.PI / 2;
    const trofea = Math.min(6, (s.historia ?? []).filter((h) => h.wynik === "mistrz" || h.wynik === "awans" || h.puchar).length);
    for (let i = 0; i < trofea; i++) {
      const p = new THREE.Group(); p.position.set(-3.3, 1.53, -1.55 + i * 0.22); g.add(p);
      const zl = new THREE.MeshStandardMaterial({ color: 0xd4a72c, metalness: 0.8, roughness: 0.3 });
      const czasza = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.035, 0.12, 12), zl); czasza.position.y = 0.16; p.add(czasza);
      const noga = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), zl); noga.position.y = 0.07; p.add(noga);
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.09), new THREE.MeshLambertMaterial({ color: 0x222222 })); pod.position.y = 0.02; p.add(pod);
    }
    // piłka w kącie i krzesło
    const pilka = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshLambertMaterial({ color: 0xf3f3f3 })); pilka.position.set(1.4, 0.11, 0.9); g.add(pilka);
    box(0.5, 0.06, 0.5, 0x1d1d1d, -0.4, 0.5, 1.0, g); box(0.5, 0.6, 0.06, 0x1d1d1d, -0.4, 0.82, 1.25, g);
    const cam = new THREE.PerspectiveCamera(48, W() / H(), 0.05, 50);
    let raf = 0, t = 0, ost = performance.now();
    const petla = () => { raf = requestAnimationFrame(petla); const n = performance.now(); t += Math.min(0.05, (n - ost) / 1000); ost = n;
      cam.position.set(0.9 + Math.sin(t * 0.15) * 0.5, 1.75 + Math.sin(t * 0.23) * 0.06, 2.9); cam.lookAt(-0.3 + Math.sin(t * 0.15) * 0.3, 1.35, -1.6);
      pilka.rotation.y += 0.002; renderer.render(sc, cam); };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); sc.clear(); };
  }, [klub.id]);
  return <View ref={host} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as any} />;
}
