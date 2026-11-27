import { nowaGra } from "../src/engine/swiat";
import { MALOPOLSKA_REGIONY } from "../src/data/malopolska";
import { rozpocznijKariere, zagrajKolejke, nowySezon } from "../src/engine/sezon";
import { etapPucharu } from "../src/engine/puchar";
function graj(opisStart: string, poziomOd: number) {
  const s = nowaGra("T", MALOPOLSKA_REGIONY[0]);
  const liga = s.ligi[poziomOd-1];
  rozpocznijKariere(s, liga.kluby[0]);
  console.log(`\n=== ${opisStart} (${liga.nazwa}) ===`);
  console.log("puchar start:", etapPucharu(s), "| harmonogram:", s.puchar?.harmonogram.join(","));
  let ostatni="";
  while(!s.koniecSezonu && !s.zwolniony){ zagrajKolejke(s); const e=etapPucharu(s); if(e!==ostatni){ console.log(`  kolejka ${s.kolejka}: ${e}${s.puchar?.ostatniMecz?` (${s.puchar.ostatniMecz.gd}:${s.puchar.ostatniMecz.gg} vs ${s.puchar.przeciwnik?s.kluby[s.puchar.przeciwnik].nazwa:'?'})`:''}`); ostatni=e; } }
  console.log("  KONIEC:", etapPucharu(s));
}
graj("AMATOR — klasa B", 9);
graj("AMATOR — IV liga", 5);
graj("ZAWODOWIEC — II liga", 3);
