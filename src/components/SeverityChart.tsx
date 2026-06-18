export interface ChartPoint {
  date: string; // ISO
  score: number;
}

/**
 * Gráfico de linha (SVG) da evolução de um escore ao longo do tempo, com
 * rótulos de data no eixo X. Recebe os pontos em ordem cronológica crescente.
 */
export function SeverityChart({
  points,
  maxScore = 31,
  caption,
}: {
  points: ChartPoint[];
  maxScore?: number;
  caption?: string;
}) {
  if (points.length === 0) return null;

  const W = 320;
  const H = 150;
  const padL = 26;
  const padR = 10;
  const padT = 12;
  const padB = 34;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = points.length;

  const x = (i: number) =>
    padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (score: number) =>
    padT + innerH - (Math.min(score, maxScore) / maxScore) * innerH;

  const line = points.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const gridScores = [0, Math.round(maxScore / 2), maxScore];

  // Quais pontos rotular no eixo X (evita sobreposição)
  const labelEvery = n <= 6 ? 1 : Math.ceil(n / 5);
  const labelIdx = new Set<number>();
  for (let i = 0; i < n; i += labelEvery) labelIdx.add(i);
  labelIdx.add(n - 1);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-lg"
        role="img"
        aria-label="Gráfico de evolução"
      >
        {/* Linhas de grade + rótulos Y */}
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
            <text x={2} y={y(s) + 3} fontSize={8} fill="#94a3b8">
              {s}
            </text>
          </g>
        ))}

        {/* Linha da evolução */}
        {n >= 2 && (
          <polyline
            points={line}
            fill="none"
            stroke="#1f7d70"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Pontos + valor + data */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.score)} r={3} fill="#1f7d70" />
            <text
              x={x(i)}
              y={y(p.score) - 6}
              fontSize={8}
              fill="#1b635a"
              textAnchor="middle"
              fontWeight="bold"
            >
              {p.score}
            </text>
            {labelIdx.has(i) && (
              <text
                x={x(i)}
                y={H - 12}
                fontSize={8}
                fill="#94a3b8"
                textAnchor="middle"
              >
                {fmt(p.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
      {caption && (
        <p className="mt-1 text-center text-xs text-navy-300">{caption}</p>
      )}
    </div>
  );
}
