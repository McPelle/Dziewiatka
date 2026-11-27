import { nowaGra } from "../src/engine/swiat";
import { autoSklad, zagrajMecz } from "../src/engine/mecz";
let gole=0,m=0,rem=0,domW=0,domG=0,gosG=0,duze=0;
for(let it=0;it<3;it++){ const s=nowaGra("T");
  for(const liga of s.ligi){ for(const kolejka of liga.terminarz){ for(const [d,g] of kolejka){
    const w=zagrajMecz(s,{klubId:d,sklad:autoSklad(s,d,"4-4-2"),formacja:"4-4-2",nastawienie:"zrownowazone"},{klubId:g,sklad:autoSklad(s,g,"4-4-2"),formacja:"4-4-2",nastawienie:"zrownowazone"},false);
    gole+=w.gd+w.gg; m++; domG+=w.gd; gosG+=w.gg; if(w.gd===w.gg)rem++; if(w.gd>w.gg)domW++; if(w.gd+w.gg>=6)duze++;
  }}}
}
console.log("mecze",m,"| gole/mecz",(gole/m).toFixed(2),"| gosp",(domG/m).toFixed(2),"gość",(gosG/m).toFixed(2));
console.log("remisy",(100*rem/m).toFixed(0)+"% | wygrane gosp",(100*domW/m).toFixed(0)+"% | mecze 6+ goli",(100*duze/m).toFixed(1)+"%");
