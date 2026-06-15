export interface ChartPoint {
  date: string; // ISO
  score: number; // 0–31 (FS = WPI + SSS)
}

/**
 * Gráfico de linha simples (SVG) da evolução do escore de severidade (FS, 0–31).
 * Recebe os pontos em ordem cronológica crescente.
 */
export function SeverityChart({
  points,
  maxScore = 31,
  caption = "Escore de severidade (FS) ao longo do tempo — quanto menor, melhor.",
}: {
  points: ChartPoint[];
  maxScore?: number;
  caption?: string;
}) {
  if (points.length < 2) return null;

  const W = 320;
  const H = 120;
  const padL = 28;
  const padR = 8;
  const padT = 10;
  const padB = 20;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const x = (i: number) =>
    padL + (points.length === 1 ? 0 : (i / (points.length - 1)) * innerW);
  const y = (score: number) =>
    padT + innerH - (Math.min(score, maxScore) / maxScore) * innerH;

  const line = points.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const gridScores = [0, Math.round(maxScore / 2), maxScore];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-md"
        role="img"
        aria-label="Gráfico de evolução do escore de severidade"
      >
        {/* Linhas de grade */}
        {gridScores.map((s) => (
          <g key={s}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(s)}
              y2={y(s)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text x={4} y={y(s) + 3} fontSize={8} fill="#94a3b8">
              {s}
            </text>
          </g>
        ))}

        {/* Linha da evolução */}
        <polyline
          points={line}
          fill="none"
          stroke="#1f7d70"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Pontos */}
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.score)} r={3} fill="#1f7d70" />
        ))}
      </svg>
      <p className="mt-1 text-center text-xs text-navy-300">{caption}</p>
    </div>
  );
}
