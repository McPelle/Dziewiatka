import { nowaGra, tabelaLigi } from "../src/engine/swiat";
import { rozpocznijKariere, zagrajKolejke, nowySezon, mojaLiga, rynek, kup } from "../src/engine/sezon";
const s = nowaGra("Test");
const klubC = s.ligi[8].kluby[0];
rozpocznijKariere(s, klubC);
let gole = 0, mecze = 0, remisy = 0, domWyg = 0;
for (let sezon = 0; sezon < 10 && !s.zwolniony; sezon++) {
  while (!s.koniecSezonu && !s.zwolniony) zagrajKolejke(s);
  for (const l of s.ligi) for (const k of l.wyniki) for (const w of k) { gole += w.gd + w.gg; mecze++; if (w.gd===w.gg) remisy++; if (w.gd>w.gg) domWyg++; }
  const t = tabelaLigi(s, mojaLiga(s));
  const m = t.findIndex(w => w.klubId === s.mojKlub) + 1;
  const k = s.kluby[s.mojKlub];
  console.log(s.sezon, mojaLiga(s).nazwa.padEnd(15), "miejsce", m, "/", t.length, "pkt", t[m-1].pkt, "kasa", Math.round(k.kasa), "zarząd", Math.round(s.zarzad), "kadra", k.zawodnicy.length, "cel", s.cel);
  if (s.zwolniony) break;
  nowySezon(s);
}
console.log("śr. goli/mecz", (gole/mecze).toFixed(2), "remisy %", (100*remisy/mecze).toFixed(0), "wygrane gosp. %", (100*domWyg/mecze).toFixed(0));
console.log("ligi:", s.ligi.map(l => l.kluby.length).join(","), "zawodników", Object.keys(s.zawodnicy).length);
console.log("rozmiar zapisu KB", (JSON.stringify(s).length/1024).toFixed(0));
const r = rynek(s); console.log("rynek wolni", r.wolni.length, "z klubów", r.zKlubow.length, kup(s, r.wolni[0].id));
console.log(s.historia);
