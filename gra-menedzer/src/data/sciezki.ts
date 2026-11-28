// Regiony do wyboru przy nowej grze. Małopolska (podokręgi krakowskie) + Pomorskie (podokręg Gdańsk).
import type { Sciezka } from "./kluby";
import { SCIEZKA_DOMYSLNA } from "../engine/swiat";
import { MALOPOLSKA_REGIONY } from "./malopolska";
import { POMORSKIE_REGIONY } from "./pomorskie";
import { ZACHODNIOPOMORSKIE_REGIONY } from "./zachodniopomorskie";
import { WARMINSKO_MAZURSKIE_REGIONY } from "./warminsko-mazurskie";
import { LUBUSKIE_REGIONY } from "./lubuskie";
import { OPOLSKIE_REGIONY } from "./opolskie";
import { PODLASKIE_REGIONY } from "./podlaskie";
import { KUJAWSKO_POMORSKIE_REGIONY } from "./kujawsko-pomorskie";

export const SCIEZKI: Sciezka[] = [...MALOPOLSKA_REGIONY, ...POMORSKIE_REGIONY, ...ZACHODNIOPOMORSKIE_REGIONY, ...KUJAWSKO_POMORSKIE_REGIONY, ...WARMINSKO_MAZURSKIE_REGIONY, ...PODLASKIE_REGIONY, ...LUBUSKIE_REGIONY, ...OPOLSKIE_REGIONY, SCIEZKA_DOMYSLNA];

// Realne stadiony i adresy klubów szczebli krajowych — na wszystkie ścieżki (w tym własne obiekty małopolski), nie nadpisuje istniejących pól.
import { nalozKrajowe } from "./krajowe-adresy";
for (const sc of SCIEZKI) for (const liga of sc.ligi) nalozKrajowe(liga.kluby);

// Realne stadiony i adresy niższych lig (IV liga → klasa B) wszystkich województw.
import { nalozRegionalne } from "./regionalne-adresy";
for (const sc of SCIEZKI) for (const liga of sc.ligi) nalozRegionalne(liga.kluby);
