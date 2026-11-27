// Gablota trofeów (3D) — puchary za mistrzostwa, awanse i puchary, medale za wyróżnienia, tabliczki z sezonami;
// Feta (3D) — po awansie / mistrzostwie / pucharze: drużyna na murawie, kapitan podnosi puchar, konfetti, fajerwerki, doping.
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Historia, Klub, StanGry } from "../../engine/types";
import { kity } from "../strojeDane";
import { lekkaGrafika } from "./Stadion3DWidok";
import { swiatla, zbudujStadion } from "./stadion3d";
import { animuj, minka, stworzPostac, wyglad3D, type Postac } from "./zawodnik3d";
import { reakcjaTrybun, startDzwieku } from "./dzwiek";
import { mow } from "./glos";

function puchar(kolor: number, skala = 1): THREE.Group {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: kolor, metalness: 0.95, roughness: 0.18 });
  const czasza = new THREE.Mesh(new THREE.LatheGeometry([0, 0.02, 0.1, 0.16, 0.19, 0.2, 0.2].map((x, i) => new THREE.Vector2(x, i * 0.06))), m); czasza.position.y = 0.32;
  const noga = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.24, 12), m); noga.position.y = 0.18;
  const podst = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 0.5 })); podst.position.y = 0.04;
  for (const sx of [-1, 1]) { const ucho = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 16, Math.PI), m); ucho.position.set(sx * 0.2, 0.5, 0); ucho.rotation.z = sx > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(ucho); }
  g.add(czasza, noga, podst); g.scale.setScalar(skala); return g;
}
function tabliczka(tekst: string): THREE.Mesh {
  const c = document.createElement("canvas"); c.width = 256; c.height = 64; const x = c.getContext("2d")!;
  x.fillStyle = "#c9a85a"; x.fillRect(0, 0, 256, 64); x.fillStyle = "#2b1d12"; x.font = "bold 22px Arial"; x.textAlign = "center"; x.fillText(tekst.slice(0, 22), 128, 40);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshStandardMaterial({ map: t, metalness: 0.6, roughness: 0.3 }));
}
function uruchomScene(el: HTMLElement, buduj: (scena: THREE.Scene, cam: THREE.PerspectiveCamera) => (t: number, dt: number) => void, bloom: number) {
  const lekka = lekkaGrafika();
  const renderer = new THREE.WebGLRenderer({ antialias: !lekka });
  const W = () => el.clientWidth || 360, H = () => el.clientHeight || 220;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1 : 2)); renderer.setSize(W(), H()); renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = !lekka;
  Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" }); el.appendChild(renderer.domElement);
  const scena = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 900);
  const krok = buduj(scena, cam);
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scena, cam));
  if (!lekka && bloom > 0) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), bloom, 0.5, 0.8));
  composer.addPass(new OutputPass());
  let raf = 0, t = 0, ost = performance.now(), stop = false;
  const petla = () => { raf = requestAnimationFrame(petla); const n = performance.now(), dt = Math.min(0.05, (n - ost) / 1000); ost = n; t += dt; krok(t, dt); composer.render(dt); };
  const r2 = renderer as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> };
  const go = () => { if (!stop) raf = requestAnimationFrame(petla); };
  if (r2.compileAsync) r2.compileAsync(scena, cam).then(go, go); else go();
  const resize = () => { renderer.setSize(W(), H()); composer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
  window.addEventListener("resize", resize); setTimeout(resize, 60);
  return () => { stop = true; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); scena.clear(); };
}

/** Gablota z trofeami kariery. */
export function Gablota3D({ historia }: { historia: Historia[] }) {
  const host = useRef<any>(null);
  useEffect(() => {
    const el = host.current as HTMLElement | null; if (!el || typeof document === "undefined") return;
    try {
      return uruchomScene(el, (scena, cam) => {
        scena.background = new THREE.Color(0x1a120c);
        scena.add(new THREE.HemisphereLight(0xfff3e0, 0x2a1a10, 0.6));
        const sp = new THREE.SpotLight(0xfff1d6, 30, 12, 0.7, 0.5, 1.2); sp.position.set(0, 4, 3); sp.target.position.set(0, 1.2, 0); scena.add(sp, sp.target);
        const drewno = new THREE.MeshStandardMaterial({ color: 0x4a2f1b, roughness: 0.45 });
        const tyl = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.8 })); tyl.position.set(0, 1.6, -0.45); scena.add(tyl);
        for (const y of [0.05, 1.05, 2.05, 3.1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.08, 0.9), drewno); p.position.set(0, y, 0); scena.add(p); }
        for (const x of [-2.2, 2.2]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 0.9), drewno); b.position.set(x, 1.6, 0); scena.add(b); }
        const szyba = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.1), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0, metalness: 0, clearcoat: 1 })); szyba.position.set(0, 1.6, 0.46); scena.add(szyba);
        const trofea = historia.flatMap((h) => {
          const sez = `${h.sezon}/${String((h.sezon + 1) % 100).padStart(2, "0")}`;
          const out: { obj: THREE.Object3D; tekst: string }[] = [];
          if (h.wynik === "mistrz") out.push({ obj: puchar(0xd4af37, 1.5), tekst: `Mistrz ${sez}` });
          else if (h.wynik === "awans") out.push({ obj: puchar(0xc0c0c8, 1.1), tekst: `Awans ${sez}` });
          if (h.puchar) out.push({ obj: puchar(h.puchar === "glowny" ? 0xd4af37 : 0xcd7f32, h.puchar === "glowny" ? 1.6 : 1.0), tekst: h.puchar === "glowny" ? `Puchar Polski ${sez}` : `Puchar ZPN ${sez}` });
          for (const w of (h.wyroznienia ?? []).slice(0, 2)) { const med = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 20), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 })); med.rotation.x = Math.PI / 2; med.position.y = 0.2; const g = new THREE.Group(); g.add(med); out.push({ obj: g, tekst: w.replace(/^\S+\s/, "").slice(0, 20) }); }
          return out;
        });
        if (!trofea.length) { const pusta = tabliczka("Miejsce na pierwsze trofeum"); pusta.position.set(0, 1.4, 0.2); pusta.scale.setScalar(2.5); scena.add(pusta); }
        trofea.slice(0, 15).forEach(({ obj, tekst }, i) => {
          const polka = Math.floor(i / 5), kol = i % 5;
          const x = -1.7 + kol * 0.85, y = 0.09 + polka * 1.0;
          obj.position.set(x, y, 0); scena.add(obj);
          const tab = tabliczka(tekst); tab.position.set(x, y + 0.04, 0.42); scena.add(tab);
        });
        cam.position.set(0, 1.6, 4.4); cam.lookAt(0, 1.4, 0);
        return (t) => { cam.position.x = Math.sin(t * 0.25) * 0.8; cam.lookAt(0, 1.4, 0); sp.intensity = 28 + Math.sin(t * 2) * 2; };
      }, 0.35);
    } catch { return; }
  }, [historia.length]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: "#1a120c", borderRadius: 12, overflow: "hidden" }} />;
}

/** Feta po sukcesie: drużyna na murawie, kapitan z pucharem, konfetti, fajerwerki, doping i spiker. */
export function Feta3D({ s, klub, tytul }: { s: StanGry; klub: Klub; tytul: string }) {
  const host = useRef<any>(null);
  useEffect(() => {
    const el = host.current as HTMLElement | null; if (!el || typeof document === "undefined") return;
    startDzwieku(1); setTimeout(() => reakcjaTrybun("gol", true), 400); setTimeout(() => mow(`${tytul}! ${klub.nazwa}!`, "spiker", { kto: `spiker-${klub.nazwa}`, plec: "M" }), 1200);
    try {
      return uruchomScene(el, (scena, cam) => {
        const noc = true;
        swiatla(scena, noc, false, lekkaGrafika());
        const stad = zbudujStadion(s, klub, { noc, snieg: false, deszcz: false, widzowie: klub.pojemnosc, lekka: lekkaGrafika() });
        scena.add(stad.grupa);
        const kit = kity(klub).pole[0];
        const gracze: Postac[] = [];
        const kadra = (s.taktyka.sklad.length ? s.taktyka.sklad : klub.zawodnicy).slice(0, 11);
        kadra.forEach((id, i) => {
          const z = s.zawodnicy[id]; if (!z) return;
          const p = stworzPostac({ ...wyglad3D(z), twarz: true, koszulka: kit.baza, dodatek: kit.dodatek, wzor: kit.wzor, spodenki: kit.dodatek, getry: kit.baza, nr: z.numer, nazwisko: z.nazwisko, seed: i * 37 + 11 });
          const kat = (i / kadra.length) * Math.PI * 2; p.g.position.set(Math.cos(kat) * 3.2, 0, Math.sin(kat) * 2.4 + 2); scena.add(p.g); gracze.push(p);
        });
        const kapitan = gracze[0]; const cup = puchar(0xd4af37, 2.2);
        if (kapitan) { kapitan.g.position.set(0, 0, 2); cup.position.set(0, 1.35, 0); kapitan.tulow.add(cup); }
        // konfetti w barwach klubu
        const n = lekkaGrafika() ? 600 : 2200, pos = new Float32Array(n * 3), kol = new Float32Array(n * 3);
        const c1 = new THREE.Color(kit.baza), c2 = new THREE.Color(kit.dodatek), c3 = new THREE.Color(0xffd700);
        for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 30; pos[i * 3 + 1] = Math.random() * 20; pos[i * 3 + 2] = (Math.random() - 0.5) * 20 + 2; const c = [c1, c2, c3][i % 3]; kol.set([c.r, c.g, c.b], i * 3); }
        const gm = new THREE.BufferGeometry(); gm.setAttribute("position", new THREE.BufferAttribute(pos, 3)); gm.setAttribute("color", new THREE.BufferAttribute(kol, 3));
        const konfetti = new THREE.Points(gm, new THREE.PointsMaterial({ size: 0.25, vertexColors: true })); scena.add(konfetti);
        // fajerwerki: rozbłyski nad trybunami
        const fajerwerki: { p: THREE.Points; t: number }[] = [];
        const wystrzel = () => {
          const m = 160, ps = new Float32Array(m * 3), v: THREE.Vector3[] = [];
          const sx = (Math.random() - 0.5) * 60, sy = 25 + Math.random() * 15, sz = -30 + Math.random() * 10;
          for (let i = 0; i < m; i++) { ps.set([sx, sy, sz], i * 3); v.push(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(6 + Math.random() * 4)); }
          const g2 = new THREE.BufferGeometry(); g2.setAttribute("position", new THREE.BufferAttribute(ps, 3)); (g2 as any).v = v;
          const pt = new THREE.Points(g2, new THREE.PointsMaterial({ color: [0xff4040, 0xffd700, 0x40c0ff, 0xffffff][Math.floor(Math.random() * 4)], size: 0.6, transparent: true }));
          scena.add(pt); fajerwerki.push({ p: pt, t: 0 });
        };
        cam.position.set(0, 4, 13); cam.lookAt(0, 1.5, 0);
        let doStrzalu = 0;
        return (t, dt) => {
          gracze.forEach((p, i) => { if (p === kapitan) { p.poza = "radosc"; p.pozaT = 0.2; animuj(p, 0, dt); p.ramiona[0].rotation.x = p.ramiona[1].rotation.x = -3.0; } else { p.poza = "radosc"; p.pozaT = 0.2; animuj(p, 0, dt); p.g.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.35; } minka(p, 1, t + i); });
          const a = gm.getAttribute("position") as THREE.BufferAttribute;
          for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * (1.5 + (i % 5) * 0.3); if (y < 0) y = 20; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * 2 + i) * dt * 0.6); } a.needsUpdate = true;
          doStrzalu -= dt; if (doStrzalu <= 0) { wystrzel(); doStrzalu = 0.6 + Math.random() * 0.8; }
          for (const f of [...fajerwerki]) {
            f.t += dt; const pa = f.p.geometry.getAttribute("position") as THREE.BufferAttribute; const v = (f.p.geometry as any).v as THREE.Vector3[];
            for (let i = 0; i < pa.count; i++) pa.setXYZ(i, pa.getX(i) + v[i].x * dt, pa.getY(i) + v[i].y * dt - f.t * dt * 3, pa.getZ(i) + v[i].z * dt);
            pa.needsUpdate = true; (f.p.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - f.t / 2.2);
            if (f.t > 2.2) { scena.remove(f.p); fajerwerki.splice(fajerwerki.indexOf(f), 1); }
          }
          stad.aktualizuj(t, 1);
          cam.position.set(Math.sin(t * 0.2) * 13, 4 + Math.sin(t * 0.3), Math.cos(t * 0.2) * 13); cam.lookAt(0, 1.6, 1.5);
        };
      }, 0.9);
    } catch { return; }
  }, [klub.id]);
  return <View ref={host} style={{ width: "100%", aspectRatio: 9 / 12, backgroundColor: "#0b1226", borderRadius: 12, overflow: "hidden" }} />;
}
