import { nowaGra } from "../src/engine/swiat";
import { MALOPOLSKA_REGIONY } from "../src/data/malopolska";
import { rozpocznijKariere, zagrajKolejke } from "../src/engine/sezon";
let region=0, glowny=0, zdobyteReg=0, zdobytePP=0, maxRund=0;
const N=40;
for(let i=0;i<N;i++){ const s=nowaGra("T",MALOPOLSKA_REGIONY[0]); const liga=s.ligi[6+(i%3)]; rozpocznijKariere(s,liga.kluby[i%5]);
  let rund=0; let lastFaza=s.puchar!.faza;
  while(!s.koniecSezonu && !s.zwolniony){ const przed=s.puchar!.faza; const r0=s.puchar!.runda; zagrajKolejke(s); const p=s.puchar!; if((p.faza==="glowny"||p.faza==="regionalny")&&p.runda>r0)rund++; if(przed==="regionalny"&&p.faza==="glowny")zdobyteReg++; if(p.faza==="zdobyty"){zdobytePP++;break;} }
  maxRund=Math.max(maxRund,rund);
}
console.log(`${N} amatorów: zdobyli Puchar Małopolski (awans do głównego): ${zdobyteReg} | zdobyli Puchar Polski: ${zdobytePP} | max wygranych rund: ${maxRund}`);
