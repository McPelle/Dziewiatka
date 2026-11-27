#!/bin/bash
# Powolne pobieranie wikitekstu stron z pl.wikipedia (REST), z ponawianiem przy 429.
# Użycie: wiki.sh KATALOG "Tytuł 1" "Tytuł 2" ...
kat="$1"; shift; mkdir -p "$kat"
UA="gra-menedzer/0.1 (prywatny projekt)"
for t in "$@"; do
  plik="$kat/$(echo "$t" | tr '/' '_').json"
  [ -s "$plik" ] && { echo "JEST: $t"; continue; }
  enc=$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1].replace(" ","_"), safe=""))' "$t")
  for p in 1 2 3 4 5 6 7 8 9 10; do
    code=$(curl -sS --max-time 30 -A "$UA" -o "$plik.tmp" -w "%{http_code}" "https://pl.wikipedia.org/w/rest.php/v1/page/$enc")
    [ "$code" = 429 ] && { sleep 20; continue; }
    break
  done
  if [ "$code" = 200 ]; then mv "$plik.tmp" "$plik"; echo "OK: $t"; else rm -f "$plik.tmp"; echo "BRAK($code): $t"; fi
  sleep 2
done
