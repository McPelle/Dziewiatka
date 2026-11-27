// Sprawdza realne składy Ekstraklasa → II liga: dane osobowe, numery, pozycje, wiek; oraz daty urodzenia niższych lig.
import { nowaGra, dataUrodzenia } from "../src/engine/swiat";
import { narodowoscKraju } from "../src/data/narodowosci";
const s = nowaGra("Test");
let realni = 0, bezDaty = 0, zleWiek = 0, kluby = 0, dupNum = 0, bezFlagi = new Set<string>();
for (const l of s.ligi.filter((l) => l.poziom <= 3)) for (const kid of l.kluby) {
  const k = s.kluby[kid]; kluby++;
  const zs = k.zawodnicy.map((id) => s.zawodnicy[id]);
  const nums = zs.map((z) => z.numer); if (new Set(nums).size !== nums.length) dupNum++;
  for (const z of zs) if (z.realny) {
    realni++;
    if (!z.dataUr) bezDaty++;
    else { const r = +z.dataUr.split(".")[2]; if (Math.abs(2026 - r - z.wiek) > 1) zleWiek++; }
    if (z.kraj && !narodowoscKraju(z.kraj)) bezFlagi.add(z.kraj);
  }
}
console.log(`kluby 1-3: ${kluby}, realni: ${realni}, bez daty: ${bezDaty}, wiek niezgodny: ${zleWiek}, kluby z duplikatem numeru: ${dupNum}, kraje bez flagi: ${[...bezFlagi]}`);
const legia = Object.values(s.kluby).find((k) => k.nazwa === "Legia Warszawa")!;
for (const id of legia.zawodnicy.slice(0, 8)) { const z = s.zawodnicy[id]; console.log(`#${z.numer} ${z.imie} ${z.nazwisko} | ${z.pozS} | ur. ${dataUrodzenia(z, s.sezon)} (${z.wiek}) | ${z.kraj ?? "Polska"} | ${z.wzrost ?? "-"} cm | OVR ${Math.floor(z.umiej)}`); }
const top = Object.values(s.kluby).filter((k) => k.poziom === 1).map((k) => k.zawodnicy.map((id) => s.zawodnicy[id]).sort((a, b) => b.umiej - a.umiej)[0]).sort((a, b) => b.umiej - a.umiej).slice(0, 5);
console.log("najlepsi Ekstraklasy:", top.map((z) => `${z.imie} ${z.nazwisko} ${Math.floor(z.umiej)}`).join(", "));
const nizej = Object.values(s.zawodnicy).filter((z) => z.klubId && s.kluby[z.klubId].poziom >= 4);
let zle = 0; for (const z of nizej) { const r = +dataUrodzenia(z, s.sezon).split(".")[2]; if (Math.abs(2026 - r - z.wiek) > 1) zle++; }
console.log(`III liga → klasa B: ${nizej.length} zawodników, przykład: ${nizej[0].imie} ${nizej[0].nazwisko} ur. ${dataUrodzenia(nizej[0], s.sezon)} (${nizej[0].wiek} lat); niezgodnych z wiekiem: ${zle}`);
