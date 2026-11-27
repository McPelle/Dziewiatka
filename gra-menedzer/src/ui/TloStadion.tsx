import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Polygon, RadialGradient, Rect, Stop } from "react-native-svg";

// Oryginalna, wektorowa scena tytułowa: nocny stadion, jupitery, boisko w perspektywie,
// wielka piłka ze smugami ruchu i sylwetka piłkarza w wyskoku. Rysowane w całości (bez zdjęć).
export function TloStadion() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 390 440" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="niebo" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#04110b" />
          <Stop offset="0.55" stopColor="#0a2d1b" />
          <Stop offset="1" stopColor="#0e3f27" />
        </LinearGradient>
        <RadialGradient id="glowL" cx="0.15" cy="0.08" r="0.5">
          <Stop offset="0" stopColor="#dff3e6" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#dff3e6" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowR" cx="0.85" cy="0.08" r="0.5">
          <Stop offset="0" stopColor="#dff3e6" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#dff3e6" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="murawa" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1a7a3e" />
          <Stop offset="1" stopColor="#0f5a2c" />
        </LinearGradient>
        <RadialGradient id="winieta" cx="0.5" cy="0.42" r="0.75">
          <Stop offset="0.6" stopColor="#000000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.55" />
        </RadialGradient>
        <RadialGradient id="spot" cx="0.5" cy="0.3" r="0.55">
          <Stop offset="0" stopColor="#ffce47" stopOpacity="0.16" />
          <Stop offset="1" stopColor="#ffce47" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* niebo */}
      <Rect x="0" y="0" width="390" height="440" fill="url(#niebo)" />
      {/* snop światła z jupiterów */}
      <Polygon points="20,10 70,10 150,300 -40,300" fill="#eafff1" opacity="0.05" />
      <Polygon points="320,10 370,10 430,300 240,300" fill="#eafff1" opacity="0.05" />
      {/* poświaty jupiterów */}
      <Rect x="0" y="0" width="390" height="300" fill="url(#glowL)" />
      <Rect x="0" y="0" width="390" height="300" fill="url(#glowR)" />
      {/* maszty i reflektory */}
      {[40, 350].map((x, i) => (
        <G key={i}>
          <Rect x={x - 1.5} y="6" width="3" height="60" fill="#0c2016" />
          <Rect x={x - 16} y="2" width="32" height="12" rx="2" fill="#13261b" />
          {[-12, -4, 4, 12].map((dx, j) => <Circle key={j} cx={x + dx} cy="8" r="2.2" fill="#f4ffe9" opacity="0.9" />)}
        </G>
      ))}
      {/* trybuny (zarys) */}
      <Polygon points="0,120 390,120 390,210 0,210" fill="#0b2417" opacity="0.65" />
      {Array.from({ length: 10 }).map((_, r) => (
        <Rect key={r} x="0" y={126 + r * 8} width="390" height="2.5" fill="#12402a" opacity="0.5" />
      ))}

      {/* boisko w perspektywie */}
      <Polygon points="-60,210 450,210 330,440 60,440" fill="url(#murawa)" />
      {/* pasy murawy (zbieżne) */}
      {[
        ["-60,210 20,210 90,440 60,440", 0.0],
        ["80,210 140,210 180,440 120,440", 0.07],
        ["200,210 260,210 250,440 210,440", 0.0],
        ["320,210 380,210 310,440 280,440", 0.07],
      ].map(([p, o], i) => <Polygon key={i} points={p as string} fill="#ffffff" opacity={o as number} />)}
      {/* linia środkowa + koło */}
      <Rect x="-60" y="210" width="510" height="2" fill="#ffffff" opacity="0.25" />
      <Ellipse cx="195" cy="210" rx="70" ry="16" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" fill="none" />

      {/* reflektor-spot na centrum (pod tytuł) */}
      <Rect x="0" y="0" width="390" height="300" fill="url(#spot)" />

      {/* sylwetka piłkarza w pędzie/uderzeniu — niżej, na boisku (po lewej) */}
      <G opacity="0.9" fill="#05130c" stroke="#ffce47" strokeOpacity="0.4" strokeWidth="0.8" strokeLinejoin="round">
        {/* głowa */}
        <Circle cx="120" cy="326" r="9.5" />
        {/* tułów pochylony do przodu */}
        <Polygon points="114,336 130,332 138,360 124,370 110,356" />
        {/* ręka z przodu (wymach) */}
        <Polygon points="132,340 157,332 160,340 135,350" />
        {/* ręka z tyłu */}
        <Polygon points="113,344 90,356 94,364 117,354" />
        {/* udo nogi podporowej */}
        <Polygon points="120,366 134,366 132,392 118,392" />
        {/* łydka nogi podporowej */}
        <Polygon points="118,390 132,390 138,420 126,422" />
        {/* udo nogi uderzającej (wyrzut do przodu) */}
        <Polygon points="132,360 164,372 162,384 130,378" />
        {/* łydka + stopa do piłki */}
        <Polygon points="158,374 190,392 190,403 156,390" />
      </G>

      {/* piłka ze smugami ruchu — nisko, na boisku (środek-prawo) */}
      <G>
        <Ellipse cx="205" cy="400" rx="46" ry="9" fill="#ffffff" opacity="0.07" />
        <Ellipse cx="218" cy="400" rx="30" ry="6" fill="#ffffff" opacity="0.1" />
        <Circle cx="252" cy="400" r="27" fill="#ffffff" />
        <Circle cx="252" cy="400" r="27" fill="none" stroke="#cfe6d6" strokeWidth="1" />
        <Polygon points="252,389 262,396 258,408 246,408 242,396" fill="#122018" />
        {[0, 72, 144, 216, 288].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const x = 252 + Math.cos(rad - Math.PI / 2) * 20.5, y = 400 + Math.sin(rad - Math.PI / 2) * 20.5;
          return <Circle key={i} cx={x} cy={y} r="3.6" fill="#122018" />;
        })}
      </G>

      {/* winieta */}
      <Rect x="0" y="0" width="390" height="440" fill="url(#winieta)" />
    </Svg>
  );
}
