import { nowaGra, tabelaLigi } from "../src/engine/swiat";
import { MALOPOLSKA_REGIONY } from "../src/data/malopolska";
import { bilansKolejki, pensjaPoTransferze, rozpocznijKariere, zagrajKolejke, nowySezon, mojaLiga, rynek, kup, cenaKupna, zwolnijZawodnika } from "../src/engine/sezon";
import type { StanGry } from "../src/engine/types";
function wzmocnij(s: StanGry) {
  const moj = s.kluby[s.mojKlub];
  const kand = [...rynek(s).wolni, ...rynek(s).zKlubow].sort((a,b)=>b.umiej-a.umiej);
  let kup_=0;
  for (const z of kand) { if(kup_>=4)break;
    const zs=moj.zawodnicy.map(id=>s.zawodnicy[id]).filter(x=>x.poz===z.poz).sort((a,b)=>a.umiej-b.umiej);
    if(!zs[0]||z.umiej<zs[0].umiej+4)continue;
    if(cenaKupna(s,z.id)>moj.kasa*0.6)continue;
    if(bilansKolejki(s,pensjaPoTransferze(s,z.id)-zs[0].pensja).bilans<10)continue;
    if(kup(s,z.id)===null){kup_++; if(moj.zawodnicy.length>22)zwolnijZawodnika(s,zs[0].id);}
  }
}
let awanse=0, spadki=0, zwolnienia=0, mistrz=0, sezony=0;
const N=20;
for(let p=0;p<N;p++){
  const r=MALOPOLSKA_REGIONY[p%MALOPOLSKA_REGIONY.length];
  const s=nowaGra("Bot",r);
  rozpocznijKariere(s, s.ligi[s.ligi.length-1].kluby[p%4]);
  for(let sz=0; sz<10 && !s.zwolniony; sz++){ wzmocnij(s); while(!s.koniecSezonu&&!s.zwolniony){zagrajKolejke(s); if(s.kolejka===11)wzmocnij(s);} if(s.zwolniony)break; nowySezon(s); sezony++; }
  const h=s.historia;
  awanse+=h.filter(x=>x.wynik==="awans").length;
  spadki+=h.filter(x=>x.wynik==="spadek").length;
  mistrz+=h.filter(x=>x.wynik==="mistrz").length;
  if(s.zwolniony)zwolnienia++;
}
console.log(`${N} karier × do 10 sezonów | łącznie sezonów: ${sezony}`);
console.log(`awanse: ${awanse} | spadki: ${spadki} | mistrz Polski: ${mistrz} | zwolnienia: ${zwolnienia}`);
console.log(`awansów na sezon: ${(awanse/sezony).toFixed(2)} | % karier zakończonych zwolnieniem: ${(100*zwolnienia/N).toFixed(0)}%`);
