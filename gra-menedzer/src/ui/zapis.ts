import AsyncStorage from "@react-native-async-storage/async-storage";
import { wartoscKontraktuTrenera } from "../engine/sezon";
import { losujAgenta, maAgenta } from "../engine/swiat";
import type { StanGry } from "../engine/types";

const KLUCZ = "menedzer-zapis-1";

export async function wczytaj(): Promise<StanGry | null> {
  try {
    const t = await AsyncStorage.getItem(KLUCZ);
    if (!t) return null;
    const s = JSON.parse(t) as StanGry;
    migrujKariere(s);
    migrujTrenera(s);
    return s;
  } catch {
    return null;
  }
}

/** Stare zapisy miały karierę jako listę nazw klubów — zamień na wpisy z sezonami. */
function migrujKariere(s: StanGry) {
  for (const z of Object.values(s.zawodnicy ?? {})) {
    const k = z.kariera as unknown[];
    if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
      z.kariera = (k as string[]).map((klub, i) => ({
        klub,
        od: s.sezon - (k.length - 1 - i),
        do: i === k.length - 1 ? null : s.sezon - (k.length - 1 - i) + 1,
        mecze: 0,
        gole: 0,
      }));
    }
  }
}

/** Stare zapisy nie miały historii ani kontraktu trenera — uzupełnij od bieżącego klubu. */
function migrujTrenera(s: StanGry) {
  const klub = s.mojKlub ? s.kluby?.[s.mojKlub] : undefined;
  if (!s.trenerKariera && klub) {
    s.trenerKariera = [{ klub: klub.nazwa, od: s.sezon, do: null, mecze: 0, w: 0, r: 0, p: 0, bz: 0, bp: 0, awanse: 0, spadki: 0, tytuly: 0 }];
  }
  if (s.trenerKontraktDo == null && klub && !s.zwolniony) {
    s.trenerKontraktDo = s.sezon + 1;
    s.trenerPensja = wartoscKontraktuTrenera(klub.poziom, klub.renoma);
  }
  if (!s.trenerAgent) s.trenerAgent = losujAgenta();
  // Dołóż agentów istniejącym profesjonalistom bez agenta.
  for (const z of Object.values(s.zawodnicy ?? {})) {
    if (!z.agent && z.klubId && s.kluby?.[z.klubId] && maAgenta(s.kluby[z.klubId].poziom)) z.agent = losujAgenta();
  }
}

export async function zapisz(s: StanGry) {
  try {
    await AsyncStorage.setItem(KLUCZ, JSON.stringify(s));
  } catch {
    // brak miejsca — gra dalej działa, tylko bez zapisu
  }
}

export async function usunZapis() {
  await AsyncStorage.removeItem(KLUCZ);
}

// ——— Wiele zapisów (sloty) — „Zapisz grę" / „Wczytaj grę" ———
const INDEKS = "menedzer-sloty";
const SLOT = (id: string) => "menedzer-slot-" + id;

export type MetaZapisu = { id: string; nazwa: string; liga: string; sezon: number; kiedy: number };

export async function listaZapisow(): Promise<MetaZapisu[]> {
  try {
    const t = await AsyncStorage.getItem(INDEKS);
    const arr = t ? (JSON.parse(t) as MetaZapisu[]) : [];
    return arr.sort((a, b) => b.kiedy - a.kiedy);
  } catch {
    return [];
  }
}

/** Zapisuje bieżący stan do slotu (nowy id albo nadpisanie). Zwraca metę zapisu. */
export async function zapiszSlot(s: StanGry, id?: string): Promise<MetaZapisu | null> {
  try {
    const klub = s.kluby?.[s.mojKlub];
    const meta: MetaZapisu = {
      id: id ?? String(Date.now()),
      nazwa: klub?.nazwa ?? "Kariera",
      liga: s.ligi?.[(klub?.poziom ?? 1) - 1]?.nazwa ?? "",
      sezon: s.sezon,
      kiedy: Date.now(),
    };
    await AsyncStorage.setItem(SLOT(meta.id), JSON.stringify(s));
    const lista = (await listaZapisow()).filter((x) => x.id !== meta.id);
    lista.unshift(meta);
    await AsyncStorage.setItem(INDEKS, JSON.stringify(lista));
    return meta;
  } catch {
    return null;
  }
}

export async function wczytajSlot(id: string): Promise<StanGry | null> {
  try {
    const t = await AsyncStorage.getItem(SLOT(id));
    if (!t) return null;
    const s = JSON.parse(t) as StanGry;
    migrujKariere(s);
    migrujTrenera(s);
    return s;
  } catch {
    return null;
  }
}

export async function usunSlot(id: string) {
  try {
    await AsyncStorage.removeItem(SLOT(id));
    const lista = (await listaZapisow()).filter((x) => x.id !== id);
    await AsyncStorage.setItem(INDEKS, JSON.stringify(lista));
  } catch { /* nic */ }
}
