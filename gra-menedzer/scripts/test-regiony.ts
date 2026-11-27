import { nowaGra } from "../src/engine/swiat";
import { MALOPOLSKA_REGIONY } from "../src/data/malopolska";
import { rozpocznijKariere, zagrajKolejke, nowySezon } from "../src/engine/sezon";
for (const r of MALOPOLSKA_REGIONY) {
  const s = nowaGra("Test", r);
  rozpocznijKariere(s, s.ligi[s.ligi.length-1].kluby[0]);
  let ok = true;
  try { for (let i=0;i<2 && !s.zwolniony;i++){ while(!s.koniecSezonu && !s.zwolniony) zagrajKolejke(s); if(!s.zwolniony) nowySezon(s);} } catch(e){ ok=false; console.log("BŁĄD", r.nazwa, e); }
  console.log(`${ok?"OK":"XX"} ${r.nazwa} — ${s.ligi.length} poz, ${Object.keys(s.kluby).length} klubów, dół: ${s.ligi[s.ligi.length-1].nazwa}`);
}
