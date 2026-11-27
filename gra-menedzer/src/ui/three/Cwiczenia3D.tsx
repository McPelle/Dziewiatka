// Boisko z ćwiczeniami w 3D — wspólne dla treningu w tygodniu i rozgrzewki przedmeczowej.
// Ćwiczenia: rozruch, rozciąganie, dziadek (rondo), podania w parach, sprinty, strzały na bramkarza, gierka, taktyka, stałe fragmenty.
// Sztab na boisku: trener (Ty), asystent z tabliczką, trener bramkarzy wybijający piłki, trener przygotowania fizycznego z gwizdkiem.
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";
import type { Klub, StanGry } from "../../engine/types";
import type { Kit } from "../strojeDane";
import { DL, SZ, swiatla, uproscMaterialy, zbudujStadion } from "./stadion3d";
import { animuj, stworzPostac, wyglad3D, type Postac } from "./zawodnik3d";
import { lekkaGrafika } from "./Stadion3DWidok";
import { gwizdek, kopniecie } from "./dzwiek";

export { CWICZENIA, type Cwiczenie } from "../../engine/treningLive";
import type { Cwiczenie } from "../../engine/treningLive";

export interface GrupaCw { ids: string[]; kit: Kit; kitBr: Kit; strona: -1 | 1; cwiczenie: Cwiczenie }

interface Zaw { id: string; p: Postac; br: boolean; cel: THREE.Vector3; bieg: number; znacznik: THREE.Mesh; grupa: number; i: number; cien?: THREE.Mesh }

export function Cwiczenia3D({ s, klub, grupy, tempo, widzowie, noc, pogoda, wyroznij, mowi, wysokosc }: {
  s: StanGry; klub: Klub; grupy: GrupaCw[]; tempo: number; widzowie: number; noc?: boolean; pogoda?: "slonce" | "deszcz" | "snieg" | "mgla";
  wyroznij?: string | null; mowi?: boolean; wysokosc?: number;
}) {
  const host = useRef<any>(null);
  const stan = useRef({ grupy, tempo, wyroznij, mowi }); stan.current = { grupy, tempo, wyroznij, mowi };
  useEffect(() => {
    const el = host.current as HTMLElement | null;
    if (!el || typeof document === "undefined") return;
    const lekka = lekkaGrafika();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !lekka }); } catch { return; }
    const W = () => el.clientWidth || 360, H = () => el.clientHeight || 220;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lekka ? 1.25 : 2)); renderer.setSize(W(), H());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(renderer.domElement);
    const scena = new THREE.Scene();
    swiatla(scena, !!noc, pogoda === "mgla", true);
    const stad = zbudujStadion(s, klub, { noc: !!noc, snieg: pogoda === "snieg", deszcz: pogoda === "deszcz", widzowie, lekka: true });
    scena.add(stad.grupa);
    const cam = new THREE.PerspectiveCamera(38, W() / H(), 0.5, 900);
    // piłki: jedna na grupę ćwiczeniową (do 6) + worek piłek przy bramce
    const mPil = new THREE.MeshLambertMaterial({ color: pogoda === "snieg" ? 0xff6a1a : 0xffffff });
    const pilki: { m: THREE.Mesh; a: THREE.Vector3; b: THREE.Vector3; t: number; dur: number; h: number }[] = [];
    const nowaPilka = () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mPil); scena.add(m); const o = { m, a: new THREE.Vector3(), b: new THREE.Vector3(), t: 1, dur: 1, h: 0 }; pilki.push(o); return o; };
    const kopnij = (o: ReturnType<typeof nowaPilka>, z: THREE.Vector3, d: THREE.Vector3, dur: number, h = 0) => { o.a.copy(z).setY(0.22); o.b.copy(d).setY(0.22); o.t = 0; o.dur = Math.max(0.2, dur); o.h = h; };
    // pachołki (znaczniki pola gry) — pomarańczowe stożki
    const mPach = new THREE.MeshLambertMaterial({ color: 0xff7a1a });
    const pachołki: THREE.Mesh[] = [];
    const pach = (x: number, z: number) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 8), mPach); c.position.set(x, 0.15, z); scena.add(c); pachołki.push(c); };
    // zawodnicy w strojach treningowych (dres z wykończeniem w barwach) i znaczniki do gierki
    const zaw: Zaw[] = [];
    const mZn = new THREE.MeshLambertMaterial({ color: 0xff8c1a });
    grupy.forEach((gr, gi) => gr.ids.forEach((id, i) => {
      const z = s.zawodnicy[id]; if (!z) return;
      const br = z.poz === "BR", k = br ? gr.kitBr : gr.kit;
      const p = stworzPostac({ ...wyglad3D(z), koszulka: br ? k.baza : "#262b33", dodatek: k.baza, wzor: br ? k.wzor : "rekaw", spodenki: br ? k.dodatek : "#262b33", getry: br ? k.baza : k.baza, nr: z.numer ?? 0, nazwisko: z.nazwisko, seed: [...id].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) });
      const zn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.52, 0.36), mZn); zn.position.y = 0.33; zn.visible = false; p.tulow.add(zn);
      p.g.position.set(gr.strona * (8 + i * 1.2), 0, SZ / 2 - 2); scena.add(p.g);
      zaw.push({ id, p, br, cel: new THREE.Vector3(), bieg: 6, znacznik: zn, grupa: gi, i, cien: p.g.children.find((c) => (c as THREE.Mesh).geometry instanceof THREE.CircleGeometry) as THREE.Mesh | undefined });
    }));
    // sztab: trener (Ty), asystent, trener bramkarzy, trener przygotowania fizycznego
    const dres = (seed: number, kol: string) => { const t = stworzPostac({ koszulka: kol, spodenki: "#1d2536", getry: "#1d2536", nr: 0, seed }); scena.add(t.g); return t; };
    const sztab = grupy.map((gr) => ({ trener: dres(21 + gr.strona, "#1d2536"), asystent: dres(55 + gr.strona, "#33415c"), tbr: dres(70 + gr.strona, "#2a4a3a"), kond: dres(90 + gr.strona, "#4a2a2a") }));
    sztab.forEach((sz) => { const tab = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.02), new THREE.MeshLambertMaterial({ color: 0xf4f4f4 })); tab.position.set(0, -0.45, 0.12); tab.rotation.x = -0.6; sz.asystent.ramiona[0].add(tab); });
    uproscMaterialy(scena);
    const piłkaGrupy = grupy.map(() => [nowaPilka(), nowaPilka()]);
    let czas = 0, ost = performance.now(), raf = 0, ostCw = grupy.map(() => ""), zmianaT = 0, krokT = grupy.map(() => 0), gkT = grupy.map(() => 1), ujecie = 0, ujT = 0;
    const tmp = new THREE.Vector3(), camPoz = new THREE.Vector3(0, 30, SZ / 2 + 40), camCel = new THREE.Vector3(), cel = new THREE.Vector3();
    const kierunek = (p: Postac, x: number, z: number) => { p.g.rotation.y = Math.atan2(x - p.g.position.x, z - p.g.position.z); };

    const petla = () => {
      raf = requestAnimationFrame(petla);
      const n = performance.now(), dtR = Math.min(0.1, (n - ost) / 1000), dt = Math.min(0.05, dtR); ost = n; czas += dt;
      const { grupy: gr, tempo: tp, wyroznij: wyr, mowi: trenerMowi } = stan.current;
      gr.forEach((g, gi) => {
        const sg = g.strona, cx = sg * 26; // środek „połowy" grupy
        const lista = zaw.filter((z) => z.grupa === gi && s.zawodnicy[z.id]);
        const pole = lista.filter((z) => !z.br), bramkarze = lista.filter((z) => z.br);
        const [pA, pB] = piłkaGrupy[gi];
        if (ostCw[gi] !== g.cwiczenie) { ostCw[gi] = g.cwiczenie; krokT[gi] = 0; zmianaT = 2.5; gwizdek(); lista.forEach((z) => (z.znacznik.visible = g.cwiczenie === "gierka" && z.i % 2 === 1)); }
        krokT[gi] -= dt * tp;
        const t = czas * tp;
        const bramkaX = sg * (DL / 2 - 0.4);
        // bramkarze: z trenerem bramkarzy przy bramce (w każdym ćwiczeniu poza rozruchem i rozciąganiem)
        const bramkarzeTrenuja = g.cwiczenie !== "rozruch" && g.cwiczenie !== "rozciaganie" && g.cwiczenie !== "strzaly" && g.cwiczenie !== "stale";
        bramkarze.forEach((z, j) => {
          if (bramkarzeTrenuja) { z.cel.set(bramkaX - sg * 0.3, 0, (j - (bramkarze.length - 1) / 2) * 3 + Math.sin(t * 1.3 + j) * 1.4); z.bieg = 4; }
        });
        const szt = sztab[gi];
        szt.tbr.g.position.lerp(tmp.set(bramkaX - sg * 11, 0, 0), dt); kierunek(szt.tbr, bramkaX, 0); animuj(szt.tbr, 0, dt);
        gkT[gi] -= dt * tp;
        if (bramkarzeTrenuja && bramkarze.length && gkT[gi] <= 0) { gkT[gi] = 2.2;
          const gk = bramkarze[Math.floor(t) % bramkarze.length]; szt.tbr.poza = "strzal"; szt.tbr.pozaT = 0.45; kopnij(pB, szt.tbr.g.position, tmp.copy(gk.p.g.position).add(new THREE.Vector3(0, 0, Math.random() < 0.5 ? -1.2 : 1.2)), 0.6, 0.8);
          setTimeout(() => { gk.p.poza = "rzut"; gk.p.pozaT = 0.7; gk.p.faza = Math.random() < 0.5 ? 1 : -1; }, 350 / tp);
        }
        // trener przygotowania fizycznego przy grupie, asystent z tabliczką przy linii, trener (Ty) obserwuje
        szt.kond.g.position.lerp(tmp.set(cx - sg * 6, 0, SZ / 2 - 6), dt); kierunek(szt.kond, cx, 0); animuj(szt.kond, 0, dt);
        szt.asystent.g.position.lerp(tmp.set(cx + sg * 4, 0, SZ / 2 - 4), dt); kierunek(szt.asystent, cx, 0); animuj(szt.asystent, 0, dt); szt.asystent.ramiona[0].rotation.x = -1.1;
        szt.trener.g.position.lerp(tmp.set(cx + Math.sin(t * 0.2) * 6, 0, SZ / 2 - 8), dt * 0.8); kierunek(szt.trener, cx, 0); animuj(szt.trener, 0.5, dt);
        if (gi === 0 && trenerMowi) { szt.trener.ramiona[0].rotation.x = -1.4 - Math.abs(Math.sin(czas * 5)) * 0.8; szt.trener.ramiona[1].rotation.x = -1.0; }
        const N = pole.length;
        switch (g.cwiczenie) {
          case "rozruch": { // trucht dookoła prostokąta w dwójkach
            const per = 2 * (30 + 24), v = 3.2 * tp;
            pole.forEach((z, i) => {
              const d = ((t * v * 0.35 - Math.floor(i / 2) * 2.4) % per + per) % per;
              const x0 = cx - sg * 15, z0 = -12;
              let px: number, pz: number;
              if (d < 30) { px = x0 + sg * d; pz = z0; } else if (d < 54) { px = x0 + sg * 30; pz = z0 + (d - 30); } else if (d < 84) { px = x0 + sg * (30 - (d - 54)); pz = z0 + 24; } else { px = x0; pz = z0 + 24 - (d - 84); }
              z.cel.set(px + (i % 2) * 0.9, 0, pz + (i % 2) * 0.9); z.bieg = 4.5 * tp;
            });
            pA.m.position.set(cx, 0.22, -14); break;
          }
          case "rozciaganie": { // rzędy, wypady
            pole.forEach((z, i) => { z.cel.set(cx + ((i % 5) - 2) * 2.2, 0, -6 + Math.floor(i / 5) * 2.4); z.bieg = 3; }); break;
          }
          case "dziadek": { // koło z 2 w środku
            const r = 4.2, nk = Math.max(3, N - 2);
            pole.forEach((z, i) => { if (i < nk) { const a = (i / nk) * Math.PI * 2; z.cel.set(cx + Math.cos(a) * r, 0, Math.sin(a) * r); z.bieg = 3; } else { z.cel.copy(pA.m.position).setY(0).add(tmp.set(i % 2 ? 0.8 : -0.8, 0, 0.6)); z.bieg = 5.5 * tp; } });
            if (pA.t >= 1 && nk >= 3) { const a = pole[Math.floor(Math.random() * nk)], b = pole[Math.floor(Math.random() * nk)]; if (a && b && a !== b) { kopnij(pA, a.p.g.position, b.p.g.position, 0.45 / tp); a.p.poza = "strzal"; a.p.pozaT = 0.3; kopniecie(0.25); } }
            break;
          }
          case "podania": { // pary w odległości 12 m
            pole.forEach((z, i) => { const para = Math.floor(i / 2); z.cel.set(cx + (i % 2 ? 6 : -6), 0, -14 + para * 3.2); z.bieg = 3; });
            if (pA.t >= 1 && N >= 2) { const para = Math.floor(Math.random() * Math.floor(N / 2)), a = pole[para * 2 + (Math.random() < 0.5 ? 0 : 1)], b = pole[para * 2 + (a === pole[para * 2] ? 1 : 0)]; if (a && b) { kopnij(pA, a.p.g.position, b.p.g.position, 0.7 / tp); a.p.poza = "strzal"; a.p.pozaT = 0.3; kopniecie(0.25); } }
            break;
          }
          case "sprinty": { // grupy po 4 — sprint i powrót
            pole.forEach((z, i) => { const fala = Math.floor(i / 4), faza = ((t * 0.25 - fala * 0.25) % 1 + 1) % 1; const tam = faza < 0.35; z.cel.set(cx - sg * 14 + (tam ? sg * 28 : 0), 0, -10 + (i % 4) * 2.5); z.bieg = tam ? 8.5 * tp : 2.5 * tp; });
            break;
          }
          case "strzaly": { // kolejka na 20 m, strzał, bramkarz broni
            const gk = bramkarze[0];
            if (gk) { gk.cel.set(bramkaX - sg * 0.5, 0, Math.sin(t * 0.9) * 0.8); gk.bieg = 3; }
            pole.forEach((z, i) => { z.cel.set(bramkaX - sg * (20 + i * 1.1), 0, -3 + (i % 3) * 0.6); z.bieg = 3; });
            if (pA.t >= 1 && pole.length) { const kto = pole[0]; kopnij(pA, kto.p.g.position, tmp.set(bramkaX + sg * 0.6, 0, (Math.random() - 0.5) * 6), 0.65 / tp, Math.random() * 1.5); kto.p.poza = "strzal"; kto.p.pozaT = 0.45; kopniecie(1);
              if (gk && Math.random() < 0.55) setTimeout(() => { gk.p.poza = "rzut"; gk.p.pozaT = 0.7; gk.p.faza = Math.random() < 0.5 ? 1 : -1; }, 300 / tp);
              pole.push(pole.shift()!); // następny w kolejce
              const ostatni = zaw.indexOf(kto); if (ostatni >= 0) { zaw.splice(ostatni, 1); zaw.push(kto); }
            }
            break;
          }
          case "gierka": { // 2 zespoły (znaczniki) na polu 30×24, wszyscy za piłką
            const pb = pA.m.position;
            pole.forEach((z, i) => { const mojZesp = i % 2; const kier = mojZesp ? 1 : -1; z.cel.set(Math.max(cx - 14, Math.min(cx + 14, pb.x + kier * (2 + (i % 5) * 1.5) * (i % 3 === 0 ? -1 : 1))), 0, Math.max(-11, Math.min(11, pb.z + ((i * 37) % 11) - 5))); z.bieg = 6.5 * tp; });
            if (pA.t >= 1 && N) { const a = pole.reduce((b, z) => z.p.g.position.distanceTo(pb) < b.p.g.position.distanceTo(pb) ? z : b, pole[0]); kopnij(pA, pb, tmp.set(cx + (Math.random() - 0.5) * 26, 0, (Math.random() - 0.5) * 20), 0.8 / tp, Math.random() < 0.2 ? 2 : 0); a.p.poza = "strzal"; a.p.pozaT = 0.3; kopniecie(0.5); }
            break;
          }
          case "taktyka": { // linia obrony 4, pomoc 4, atak 2 — przesuwanie za piłką
            const shift = Math.sin(t * 0.5) * 10, przod = Math.sin(t * 0.33) * 5;
            pole.forEach((z, i) => { const linia = i < 4 ? 0 : i < 8 ? 1 : 2; const w = linia === 2 ? i - 8 : i % 4; const ile = linia === 2 ? 2 : 4; z.cel.set(cx - sg * (12 - linia * 10 - przod), 0, (w - (ile - 1) / 2) * (linia === 2 ? 8 : 6) + shift * (linia === 0 ? 0.6 : 0.8)); z.bieg = 4.5 * tp; });
            pA.m.position.set(cx + sg * 14, 0.22, shift * 1.6); szt.asystent.ramiona[1].rotation.x = -2.6; break;
          }
          case "stale": { // rożny: dośrodkowujący w rogu, reszta wbiega w pole karne
            const gk = bramkarze[0]; if (gk) { gk.cel.set(bramkaX - sg * 0.6, 0, 0); gk.bieg = 3; }
            const faza = (t * 0.3) % 1;
            pole.forEach((z, i) => { if (i === 0) { z.cel.set(bramkaX - sg * 0.6, 0, SZ / 2 - 0.8); z.bieg = 3; return; } const start = tmp.set(bramkaX - sg * (17 + (i % 3) * 2), 0, -8 + (i % 6) * 3); const meta = new THREE.Vector3(bramkaX - sg * (5 + (i % 4) * 2), 0, -5 + (i % 5) * 2.5); z.cel.copy(faza < 0.4 ? start : meta); z.bieg = faza < 0.4 ? 2 : 6 * tp; });
            if (pA.t >= 1 && faza > 0.42 && faza < 0.5 && pole.length > 1) { const cel2 = pole[1 + Math.floor(Math.random() * (pole.length - 1))]; kopnij(pA, pole[0].p.g.position, cel2.p.g.position, 1.0 / tp, 4); pole[0].p.poza = "strzal"; pole[0].p.pozaT = 0.45; kopniecie(0.8); }
            break;
          }
        }
      });
      // ruch zawodników do celów
      for (const z of zaw) {
        cel.copy(z.cel); tmp.subVectors(cel, z.p.g.position); tmp.y = 0; const d = tmp.length();
        if (d > 0.08) { tmp.normalize().multiplyScalar(Math.min(d, z.bieg * dt)); z.p.g.position.add(tmp); kierunek(z.p, cel.x, cel.z); }
        else { const pb = piłkaGrupy[z.grupa][0].m.position; kierunek(z.p, pb.x, pb.z); }
        const v = d > 0.08 ? Math.min(z.bieg, d / Math.max(dt, 0.001)) : 0;
        animuj(z.p, v, dt);
        const cw = stan.current.grupy[z.grupa]?.cwiczenie;
        if (cw === "rozciaganie" && !z.br) { const f = Math.sin(czas * 1.4 + z.i); z.p.uda[0].rotation.x = -0.9 * Math.max(0, f); z.p.uda[1].rotation.x = 0.6 * Math.max(0, f); z.p.lydki[0].rotation.x = 0.9 * Math.max(0, f); z.p.ramiona[0].rotation.x = z.p.ramiona[1].rotation.x = -2.8 * Math.max(0, -f); z.p.g.position.y = -0.18 * Math.max(0, f); }
        if (cw === "rozruch" && !z.br && Math.sin(czas * 0.6 + z.i) > 0.85) { z.p.ramiona[0].rotation.x = -2.5 + Math.sin(czas * 9) * 0.6; z.p.ramiona[1].rotation.x = -2.5 - Math.sin(czas * 9) * 0.6; } // krążenia ramion
        // wyróżniony zawodnik — żółta obwódka pod stopami
        if (z.cien) { const mb = z.cien.material as THREE.MeshBasicMaterial; const w = z.id === stan.current.wyroznij; mb.color.set(w ? 0xffd23f : 0x000000); mb.opacity = w ? 0.8 : 0.28; }
      }
      for (const o of pilki) { if (o.t < 1) { o.t = Math.min(1, o.t + dt / o.dur); o.m.position.lerpVectors(o.a, o.b, o.t); o.m.position.y = 0.22 + Math.sin(o.t * Math.PI) * o.h; o.m.rotation.x += dt * 10; } }
      stad.aktualizuj(czas, 0.15);
      // kamera: szeroki plan ↔ zbliżenie na grupę ↔ wyróżniony zawodnik
      ujT -= dtR; if (ujT <= 0) { ujecie = (ujecie + 1) % 3; ujT = 7; }
      if (zmianaT > 0) { zmianaT -= dtR; ujecie = 1; }
      const g0 = stan.current.grupy[0]; const cx0 = (g0?.strona ?? -1) * 26;
      const wz = stan.current.wyroznij ? zaw.find((z) => z.id === stan.current.wyroznij) : undefined;
      if (wz) { camPoz.set(wz.p.g.position.x - 5, 3.2, wz.p.g.position.z + 8); camCel.copy(wz.p.g.position).setY(1.1); }
      else if (ujecie === 0) { camPoz.set(Math.sin(czas * 0.05) * 30, 34, SZ / 2 + 42); camCel.set(cx0 * 0.4, 0, 0); }
      else if (ujecie === 1) { camPoz.set(cx0 + 6, 9, 20); camCel.set(cx0, 1, -2); }
      else { camPoz.set(cx0 - (g0?.strona ?? -1) * 14, 6, SZ / 2 - 2); camCel.set(cx0, 1, -4); }
      cam.position.lerp(camPoz, 1 - Math.exp(-dtR * 1.6)); cam.lookAt(camCel);
      renderer.render(scena, cam);
    };
    raf = requestAnimationFrame(petla);
    const resize = () => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); };
    window.addEventListener("resize", resize); setTimeout(resize, 60);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); scena.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klub.id, grupy.map((g) => g.ids.join()).join("|")]);
  return <View ref={host} style={{ width: "100%", height: wysokosc, aspectRatio: wysokosc ? undefined : 16 / 10, backgroundColor: "#0b1226", borderRadius: 10, overflow: "hidden" }} />;
}
