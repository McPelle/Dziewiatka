// Bot: przed sezonem i w połowie sezonu wzmacnia skład w granicach budżetu.
import { nowaGra } from "../src/engine/swiat";
import { bilansKolejki, pensjaPoTransferze, rozpocznijKariere, zagrajKolejke, nowySezon, rynek, kup, cenaKupna, zwolnijZawodnika } from "../src/engine/sezon";
import type { StanGry } from "../src/engine/types";
function wzmocnij(s: StanGry) {
  const moj = s.kluby[s.mojKlub];
  const r = rynek(s);
  const kand = [...r.wolni, ...r.zKlubow].sort((a, b) => b.umiej - a.umiej);
  let kupione = 0;
  for (const z of kand) {
    if (kupione >= 4) break;
    const zs = moj.zawodnicy.map(id => s.zawodnicy[id]).filter(x => x.poz === z.poz).sort((a, b) => a.umiej - b.umiej);
    const najsl = zs[0];
    if (!najsl || z.umiej < najsl.umiej + 4) continue;
    if (cenaKupna(s, z.id) > moj.kasa * 0.6) continue;
    if (bilansKolejki(s, pensjaPoTransferze(s, z.id) - najsl.pensja).bilans < 20) continue;
    if (kup(s, z.id) === null) { kupione++; if (moj.zawodnicy.length > 22) zwolnijZawodnika(s, najsl.id); }
  }
}
const wyniki: string[] = [];
for (let proba = 0; proba < 6; proba++) {
  const s = nowaGra("Bot");
  rozpocznijKariere(s, s.ligi[8].kluby[proba]);
  for (let sezon = 0; sezon < 15 && !s.zwolniony; sezon++) {
    wzmocnij(s);
    while (!s.koniecSezonu && !s.zwolniony) { zagrajKolejke(s); if (s.kolejka === 11) wzmocnij(s); }
    if (s.zwolniony) break;
    nowySezon(s);
  }
  wyniki.push(`próba ${proba}: ` + s.historia.map(h => `${h.liga.replace("Klasa ","").replace("Betclic ","")}:${h.miejsce}${h.wynik==="awans"?"↑":h.wynik==="spadek"?"↓":""}`).join(" ") + (s.zwolniony ? " ZWOLNIONY" : "") + ` | kasa ${Math.round(s.kluby[s.mojKlub].kasa)} | KB ${(JSON.stringify(s).length/1024).toFixed(0)}`);
}
console.log(wyniki.join("\n"));
