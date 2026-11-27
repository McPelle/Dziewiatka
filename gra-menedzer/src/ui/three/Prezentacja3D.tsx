// Prezentacja nowego zawodnika w 3D: ścianka z herbem klubu, stolik z kontraktem, prezes, trener i zawodnik w koszulce
// z numerem; flesze fotoreporterów; kto mówi — gestykuluje; akcje: podpis, szalik w górę, całowanie herbu, żonglerka.
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import type { Klub, StanGry, Zawodnik } from "../../engine/types";
import type { KtoMowi } from "../../engine/prezentacja";
import { HERBY } from "../../data/herby";
import { kluczHerbu } from "../Herb";
import { kity } from "../strojeDane";
import { uriObrazka } from "./Konferencja3D";
import { uproscMaterialy } from "./stadion3d";
import { animuj, minka, stworzPostac, wyglad3D, type Postac } from "./zawodnik3d";

export function Prezentacja3D({ s, klub, z, mowi, akcja }: { s: StanGry; klub: Klub; z: Zawodnik; mowi: KtoMowi | null; akcja?: string }) {
  const host = useRef<any>(null);
  const stan = useRef({ mowi, akcja }); stan.current = { mowi, akcja };
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 220;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setSize(W(), H());
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene(); scena.background = new THREE.Color(0x15181d);
    scena.add(new THREE.HemisphereLight(0xffffff, 0x404040, 1.1));
    const reflektor = new THREE.PointLight(0xfff3e0, 3, 20); reflektor.position.set(0, 4, 4); scena.add(reflektor);
    const flesz = new THREE.PointLight(0xffffff, 0, 25); flesz.position.set(0, 2, 5); scena.add(flesz);
    const kit = kity(klub).pole[0];
    // ścianka sponsorska: herb powtórzony + nazwa klubu
    const c = document.createElement("canvas"); c.width = 1024; c.height = 512; const g = c.getContext("2d")!;
    g.fillStyle = kit.baza; g.fillRect(0, 0, 1024, 512); g.fillStyle = kit.dodatek; g.font = "bold 34px Arial"; g.textAlign = "center";
    for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) g.fillText(klub.nazwa.toUpperCase(), 110 + x * 205 + (y % 2) * 100, 80 + y * 120);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const uri = uriObrazka(HERBY[kluczHerbu(klub) ?? ""]);
    if (uri) { const im = new Image(); im.onload = () => { for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) g.drawImage(im, 20 + x * 205 + ((y + 1) % 2) * 100, 30 + y * 120, 70, 70); tex.needsUpdate = true; }; im.src = uri; }
    const scianka = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshLambertMaterial({ map: tex })); scianka.position.set(0, 2.25, -1.6); scena.add(scianka);
    const pod = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshLambertMaterial({ color: 0x2b2f36 })); pod.rotation.x = -Math.PI / 2; scena.add(pod);
    const stol = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.9), new THREE.MeshLambertMaterial({ color: 0x1d2530 })); stol.position.set(0, 0.78, 0.6); scena.add(stol);
    const obrus = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 0.04), new THREE.MeshLambertMaterial({ color: new THREE.Color(kit.baza) })); obrus.position.set(0, 0.42, 1.05); scena.add(obrus);
    const kontrakt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.01, 0.4), new THREE.MeshLambertMaterial({ color: 0xf5f5f5 })); kontrakt.position.set(0, 0.83, 0.6); scena.add(kontrakt);
    // postacie
    const prezes = stworzPostac({ twarz: true, koszulka: "#3b3f46", spodenki: "#2a2d33", getry: "#2a2d33", nr: 0, seed: 777, lysy: true } as any);
    const trener = stworzPostac({ twarz: true, koszulka: "#1d2536", spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed: 21 });
    const zaw = stworzPostac({ ...wyglad3D(z), twarz: true, koszulka: kit.baza, dodatek: kit.dodatek, wzor: kit.wzor, spodenki: kit.dodatek, getry: kit.baza, nr: z.numer ?? 0, nazwisko: z.nazwisko, seed: [...z.id].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0) });
    const ustaw = (p: Postac, x: number) => { p.g.position.set(x, 0, 0); scena.add(p.g); };
    ustaw(prezes, -1.3); ustaw(zaw, 0); ustaw(trener, 1.3);
    // koszulka trzymana w rękach + szalik
    const kc = document.createElement("canvas"); kc.width = 128; kc.height = 128; const kg = kc.getContext("2d")!; kg.fillStyle = kit.baza; kg.fillRect(0, 0, 128, 128); kg.fillStyle = kit.dodatek; kg.textAlign = "center"; kg.font = "bold 18px Arial"; kg.fillText(z.nazwisko.toUpperCase().slice(0, 11), 64, 30); kg.font = "bold 64px Arial"; kg.fillText(String(z.numer ?? ""), 64, 96);
    const koszulka = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(kc), side: THREE.DoubleSide })); koszulka.position.set(-0.65, 1.25, 0.25); scena.add(koszulka);
    const szalik = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.02), new THREE.MeshLambertMaterial({ color: new THREE.Color(kit.dodatek) })); szalik.visible = false; scena.add(szalik);
    const pilka = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), new THREE.MeshLambertMaterial({ color: 0xffffff })); pilka.visible = false; scena.add(pilka);
    uproscMaterialy(scena);
    const cam = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 60);
    let t = 0, ost = performance.now(), raf = 0, fleszT = 0;
    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dt = Math.min(0.05, (n - ost) / 1000); ost = n; t += dt;
      const { mowi: m, akcja: a } = stan.current;
      for (const [p, kto] of [[prezes, "prezes"], [trener, "trener"], [zaw, "zawodnik"]] as const) {
        animuj(p, 0, dt); minka(p, 0.4, t, m === kto);
        if (m === kto) { p.ramiona[0].rotation.x = -0.9 - Math.abs(Math.sin(t * 4)) * 0.6; }
      }
      // akcje
      szalik.visible = a === "szalik" || a === "herb";
      if (szalik.visible) { zaw.ramiona[0].rotation.x = zaw.ramiona[1].rotation.x = -2.9; szalik.position.set(0, 2.35, 0.1); }
      koszulka.visible = a !== "szalik" && a !== "herb" && a !== "zonglerka";
      if (a === "herb") { zaw.tulow.rotation.x = 0.15; }
      pilka.visible = a === "zonglerka";
      if (a === "zonglerka") { pilka.position.set(0.15, 0.25 + Math.abs(Math.sin(t * 5)) * 0.9, 0.35); zaw.uda[1].rotation.x = -Math.max(0, Math.sin(t * 5)) * 0.8; }
      if (a === "podpis") { zaw.ramiona[1].rotation.x = -0.9; zaw.tulow.rotation.x = 0.35; }
      // flesze fotoreporterów
      fleszT -= dt; if (fleszT <= 0) { fleszT = 0.25 + Math.random() * (a === "flesz" || a === "szalik" || a === "herb" ? 0.4 : 1.6); flesz.intensity = 14; flesz.position.set((Math.random() - 0.5) * 6, 1.5 + Math.random(), 4 + Math.random() * 2); }
      flesz.intensity *= 0.82;
      const cel = m === "prezes" ? -1.3 : m === "trener" ? 1.3 : 0;
      cam.position.set(cel * 0.6 + Math.sin(t * 0.2) * 0.3, 1.7, 4.3); cam.lookAt(cel * 0.8, 1.3, 0);
      renderer.render(scena, cam);
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); scena.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [z.id]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: "#15181d", borderRadius: 12, overflow: "hidden" }} />;
}
