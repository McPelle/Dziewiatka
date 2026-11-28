import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { aktualizujTypyKontraktow, wartoscKontraktuTrenera } from "../engine/sezon";
import { zarejestrujBarwy } from "../engine/wlasnyKlub";
import { losujAgenta, maAgenta, odswiezKarieryRealne } from "../engine/swiat";
import type { StanGry } from "../engine/types";

const KLUCZ = "menedzer-zapis-1";

// ——— Magazyn ———
// Na webie localStorage ma tylko ~5 MB, a zapis kariery waży ok. 2–3 MB → drugi zapis się nie mieścił (błąd „Zapisz grę").
// Dlatego na webie używamy IndexedDB (setki MB). Na telefonach (natywnie) zostaje AsyncStorage.
const WEB = Platform.OS === "web" && typeof indexedDB !== "undefined";
let _db: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!_db) _db = new Promise((ok, zle) => {
    const r = indexedDB.open("dziewiatka", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => ok(r.result);
    r.onerror = () => zle(r.error);
  });
  return _db;
}
async function idb<T>(tryb: IDBTransactionMode, f: (st: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((ok, zle) => {
    const tx = d.transaction("kv", tryb);
    const req = f(tx.objectStore("kv"));
    tx.oncomplete = () => ok(req.result);
    tx.onerror = () => zle(tx.error);
    tx.onabort = () => zle(tx.error);
  });
}
let _migracja: Promise<void> | null = null;
/** Jednorazowo przenosi stare zapisy z localStorage do IndexedDB (i zwalnia localStorage). */
function migrujZLocalStorage(): Promise<void> {
  if (!_migracja) _migracja = (async () => {
    try {
      const klucze: string[] = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("menedzer-")) klucze.push(k); }
      for (const k of klucze) {
        const v = localStorage.getItem(k);
        if (v != null) await idb("readwrite", (st) => st.put(v, k));
        localStorage.removeItem(k);
      }
    } catch { /* brak localStorage — pomijamy */ }
  })();
  return _migracja;
}
async function pobierz(k: string): Promise<string | null> {
  if (!WEB) return AsyncStorage.getItem(k);
  await migrujZLocalStorage();
  const v = await idb<unknown>("readonly", (st) => st.get(k));
  return typeof v === "string" ? v : null;
}
async function wstaw(k: string, v: string): Promise<void> {
  if (!WEB) return AsyncStorage.setItem(k, v);
  await migrujZLocalStorage();
  await idb("readwrite", (st) => st.put(v, k));
}
async function usun(k: string): Promise<void> {
  if (!WEB) return AsyncStorage.removeItem(k);
  await migrujZLocalStorage();
  await idb("readwrite", (st) => st.delete(k));
}

export async function wczytaj(): Promise<StanGry | null> {
  try {
    const t = await pobierz(KLUCZ);
    if (!t) return null;
    return przygotuj(JSON.parse(t) as StanGry);
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

/** Krótka wizytówka zapisu (klub, liga, sezon) — menu pokazuje ją od razu, zanim wczyta się cała kariera. */
export type MetaMenu = { nazwa: string; herb?: string; liga: string; sezon: number };
export function metaMenu(): MetaMenu | null { try { return JSON.parse(window.localStorage.getItem("dz_meta") ?? "null"); } catch { return null; } }
export async function zapisz(s: StanGry) {
  try {
    const k = s.kluby[s.mojKlub];
    try { if (k) window.localStorage.setItem("dz_meta", JSON.stringify({ nazwa: k.nazwa, herb: k.herb, liga: s.ligi[k.poziom - 1]?.nazwa ?? "", sezon: s.sezon })); } catch { /* */ }
    await wstaw(KLUCZ, JSON.stringify(s));
  } catch {
    // autozapis nieudany — gra działa dalej; ręczny zapis zgłosi błąd
  }
}

export async function usunZapis() {
  try { window.localStorage.removeItem("dz_meta"); } catch { /* */ }
  await usun(KLUCZ);
}

// ——— Wiele zapisów (sloty) — „Zapisz grę" / „Wczytaj grę" ———
const INDEKS = "menedzer-sloty";
const SLOT = (id: string) => "menedzer-slot-" + id;

export type MetaZapisu = { id: string; nazwa: string; liga: string; sezon: number; kiedy: number; trener?: string; rozmiarKB?: number };

export async function listaZapisow(): Promise<MetaZapisu[]> {
  try {
    const t = await pobierz(INDEKS);
    const arr = t ? (JSON.parse(t) as MetaZapisu[]) : [];
    return arr.sort((a, b) => b.kiedy - a.kiedy);
  } catch {
    return [];
  }
}

/** Zapisuje bieżący stan do slotu. Bez `id` nadpisuje slot tej kariery (s.slotId), a gdy go nie ma — tworzy nowy.
 *  `nowy: true` wymusza nowy slot. Zwraca metę albo rzuca czytelny błąd. */
export async function zapiszSlot(s: StanGry, opcje: { nowy?: boolean; id?: string } = {}): Promise<MetaZapisu> {
  const klub = s.kluby?.[s.mojKlub];
  const id = opcje.id ?? (!opcje.nowy && s.slotId ? s.slotId : String(Date.now()));
  s.slotId = id;
  const json = JSON.stringify(s);
  const meta: MetaZapisu = {
    id,
    nazwa: klub?.nazwa ?? "Kariera",
    liga: s.ligi?.[(klub?.poziom ?? 1) - 1]?.nazwa ?? "",
    sezon: s.sezon,
    kiedy: Date.now(),
    trener: s.trener,
    rozmiarKB: Math.round(json.length / 1024),
  };
  try {
    await wstaw(SLOT(meta.id), json);
    const lista = (await listaZapisow()).filter((x) => x.id !== meta.id);
    lista.unshift(meta);
    await wstaw(INDEKS, JSON.stringify(lista));
  } catch (e) {
    throw new Error(`Nie udało się zapisać gry (${e instanceof Error ? e.message : "brak miejsca w pamięci przeglądarki"}). Spróbuj usunąć stare zapisy albo użyj „Eksportuj do pliku".`);
  }
  return meta;
}

function przygotuj(s: StanGry): StanGry {
  migrujKariere(s);
  migrujTrenera(s);
  odswiezKarieryRealne(s); // prawdziwe historie zawodników (Ekstraklasa → II liga) także w starych zapisach
  zarejestrujBarwy(s);          // barwy klubów stworzonych przez gracza
  aktualizujTypyKontraktow(s); // stare zapisy: wyrównaj kontrakty do szczebla klubu (np. amatorzy w IV/III lidze)
  return s;
}

export async function wczytajSlot(id: string): Promise<StanGry | null> {
  try {
    const t = await pobierz(SLOT(id));
    if (!t) return null;
    const s = przygotuj(JSON.parse(t) as StanGry);
    s.slotId = id;
    return s;
  } catch {
    return null;
  }
}

export async function usunSlot(id: string) {
  try {
    await usun(SLOT(id));
    const lista = (await listaZapisow()).filter((x) => x.id !== id);
    await wstaw(INDEKS, JSON.stringify(lista));
  } catch { /* nic */ }
}

// ——— Eksport / import pliku zapisu (przenoszenie gry między urządzeniami, kopia zapasowa) ———
/** Pobiera plik .json z zapisem (web). */
export function eksportujDoPliku(s: StanGry): string | null {
  if (Platform.OS !== "web") return "Eksport do pliku działa w wersji przeglądarkowej.";
  const klub = s.kluby?.[s.mojKlub];
  const nazwa = `dziewiatka-${(klub?.nazwa ?? "kariera").replace(/[^\p{L}\p{N}]+/gu, "-")}-sezon-${s.sezon}.json`;
  const blob = new Blob([JSON.stringify(s)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nazwa;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return null;
}
/** Otwiera wybór pliku i wczytuje zapis (web). */
export function importujZPliku(): Promise<StanGry> {
  return new Promise((ok, zle) => {
    if (Platform.OS !== "web") { zle(new Error("Import z pliku działa w wersji przeglądarkowej.")); return; }
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = () => {
      const f = inp.files?.[0];
      if (!f) { zle(new Error("Nie wybrano pliku.")); return; }
      f.text().then((t) => {
        const s = JSON.parse(t) as StanGry;
        if (!s || !s.kluby || !s.mojKlub || !s.ligi) throw new Error("To nie jest plik zapisu DZIEWIĄTKI.");
        delete s.slotId; // zaimportowany zapis dostanie własny slot przy zapisie
        ok(przygotuj(s));
      }).catch((e) => zle(e instanceof Error ? e : new Error("Nie udało się odczytać pliku.")));
    };
    inp.click();
  });
}
