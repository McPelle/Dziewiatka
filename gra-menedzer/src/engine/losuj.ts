export const los = (a: number, b: number) => a + Math.random() * (b - a);
export const losInt = (a: number, b: number) => Math.floor(los(a, b + 1));
export const wybierz = <T>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)];
export const szansa = (p: number) => Math.random() < p;

export function wybierzWazone<T>(t: T[], waga: (x: T) => number): T {
  const suma = t.reduce((s, x) => s + waga(x), 0);
  let r = Math.random() * suma;
  for (const x of t) {
    r -= waga(x);
    if (r <= 0) return x;
  }
  return t[t.length - 1];
}

export function poisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export function tasuj<T>(t: T[]): T[] {
  const a = [...t];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const zl = (n: number) =>
  `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} zł`;
