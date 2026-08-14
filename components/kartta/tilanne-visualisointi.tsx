import { VYOHYKKEET, YHTEYDET, type VyohykeStatus } from "@/lib/urakka-mock";

// Statusvärit — liikennevalologiikka (valmis / käynnissä / aloittamatta).
const STATUS_VARI: Record<VyohykeStatus, { fill: string; ring: string }> = {
  valmis: { fill: "#16a34a", ring: "rgba(22,163,74,0.18)" },
  kaynnissa: { fill: "#d97706", ring: "rgba(217,119,6,0.22)" },
  aloittamatta: { fill: "#dc2626", ring: "rgba(220,38,38,0.16)" },
};

function paikka(id: string) {
  const v = VYOHYKKEET.find((z) => z.id === id);
  return v ? { x: v.x, y: v.y } : { x: 0, y: 0 };
}

export function TilanneVisualisointi() {
  return (
    <svg
      viewBox="0 0 320 320"
      className="h-auto w-full"
      role="img"
      aria-label="Urakan tilannekuva: abstrakti edistymän visualisointi"
    >
      {/* Yhteydet vyöhykkeiden välillä */}
      <g stroke="rgba(27,42,71,0.16)" strokeWidth={1.5}>
        {YHTEYDET.map(([a, b]) => {
          const p1 = paikka(a);
          const p2 = paikka(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
            />
          );
        })}
      </g>

      {/* Vyöhykkeet */}
      {VYOHYKKEET.map((v) => {
        const vari = STATUS_VARI[v.status];
        const aktiivinen = v.status === "kaynnissa";
        return (
          <g key={v.id}>
            {/* Pehmeä halo */}
            <circle cx={v.x} cy={v.y} r={17} fill={vari.ring}>
              {aktiivinen && (
                <animate
                  attributeName="r"
                  values="17;24;17"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              )}
              {aktiivinen && (
                <animate
                  attributeName="opacity"
                  values="0.9;0.3;0.9"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            {/* Vyöhyke */}
            <circle
              cx={v.x}
              cy={v.y}
              r={11}
              fill={vari.fill}
              stroke="#ffffff"
              strokeWidth={2.5}
            />
          </g>
        );
      })}
    </svg>
  );
}
