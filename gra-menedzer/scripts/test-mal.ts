import { nowaGra, tabelaLigi } from "../src/engine/swiat";
import { MALOPOLSKA } from "../src/data/malopolska";
import { rozpocznijKariere, zagrajKolejke, nowySezon, mojaLiga } from "../src/engine/sezon";
const s = nowaGra("Test", MALOPOLSKA);
console.log("poziomów:", s.ligi.length, "| nazwy:", s.ligi.map(l=>`${l.nazwa}(${l.kluby.length})`).join(", "));
console.log("wymiana:", s.wymiana.join(","));
// start w klasie C
rozpocznijKariere(s, s.ligi[s.ligi.length-1].kluby[0]);
for (let i=0;i<6 && !s.zwolniony;i++){ while(!s.koniecSezonu && !s.zwolniony) zagrajKolejke(s); const t=tabelaLigi(s,mojaLiga(s)); console.log(s.sezon, mojaLiga(s).nazwa, "miejsce", t.findIndex(w=>w.klubId===s.mojKlub)+1,"/",t.length); if(!s.zwolniony) nowySezon(s);}
console.log("Ekstraklasa real:", s.ligi[0].kluby.slice(0,4).map(id=>s.kluby[id].nazwa).join(", "));
console.log("IV liga real:", s.ligi[4].kluby.slice(0,4).map(id=>s.kluby[id].nazwa).join(", "));
console.log("zapis KB:", (JSON.stringify(s).length/1024).toFixed(0));
