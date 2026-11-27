"""Usuwa białe tło herbów (JPEG) metodą wypełnienia od krawędzi i zapisuje jako przezroczyste PNG.
Białe POŁĄCZONE z brzegiem = tło (przezroczyste). Białe wewnątrz herbu zostaje."""
import glob, os, sys
from collections import deque
from PIL import Image

D = sys.argv[1] if len(sys.argv) > 1 else "assets/herby"

def biale(p):
    return p[0] >= 224 and p[1] >= 224 and p[2] >= 224

def wytnij(plik):
    im = Image.open(plik).convert("RGBA")
    w, h = im.size
    px = im.load()
    widziane = [[False]*w for _ in range(h)]
    dq = deque()
    for x in range(w):
        for y in (0, h-1):
            if biale(px[x, y]): dq.append((x, y)); widziane[y][x] = True
    for y in range(h):
        for x in (0, w-1):
            if biale(px[x, y]) and not widziane[y][x]: dq.append((x, y)); widziane[y][x] = True
    while dq:
        x, y = dq.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)  # przezroczysty
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h and not widziane[ny][nx] and biale(px[nx, ny]):
                widziane[ny][nx] = True; dq.append((nx, ny))
    # lekkie zmiękczenie krawędzi: półprzezroczyste jasne piksele na granicy
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 255 and r >= 210 and g >= 210 and b >= 210:
                sasiad_przezr = any(
                    0 <= x+dx < w and 0 <= y+dy < h and px[x+dx, y+dy][3] == 0
                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))
                )
                if sasiad_przezr: px[x, y] = (r, g, b, 90)
    return im

if __name__ == "__main__":
    pliki = sorted(glob.glob(os.path.join(D, "*.jpg")))
    for i, f in enumerate(pliki, 1):
        out = f[:-4] + ".png"
        try:
            wytnij(f).save(out, "PNG")
            os.remove(f)
        except Exception as e:
            print("BŁĄD", f, e)
        if i % 60 == 0: print(f"  {i}/{len(pliki)}", flush=True)
    print(f"gotowe: {len(pliki)} herbów → PNG (przezroczyste tło)")
