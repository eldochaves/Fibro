"use client";

import { BODY_AREAS } from "@/lib/acr2016";

const SKIN = "#e8c8b0";
const SKIN_D = "#c49e84";
const TEAL = "#289888";
const TEAL_D = "#1b635a";

const LABEL: Record<string, string> = Object.fromEntries(
  BODY_AREAS.map((a) => [a.id, a.label])
);

type Shape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; r: number }
  | { kind: "ell"; cx: number; cy: number; rx: number; ry: number };

interface RegionDef {
  id: string;
  shape: Shape;
}

// FRENTE — lado do paciente: direito = imagem-esquerda
const FRONT_DECOR: Shape[] = [
  { kind: "ell", cx: 110, cy: 64, rx: 34, ry: 42 }, // cabeça
  { kind: "ell", cx: 52, cy: 286, rx: 12, ry: 15 }, // mão E (imagem)
  { kind: "ell", cx: 168, cy: 286, rx: 12, ry: 15 }, // mão D (imagem)
  { kind: "ell", cx: 88, cy: 478, rx: 17, ry: 11 }, // pé
  { kind: "ell", cx: 132, cy: 478, rx: 17, ry: 11 },
];
const FRONT_REGIONS: RegionDef[] = [
  { id: "mandibula_dir", shape: { kind: "ell", cx: 88, cy: 96, rx: 11, ry: 11 } },
  { id: "mandibula_esq", shape: { kind: "ell", cx: 132, cy: 96, rx: 11, ry: 11 } },
  { id: "pescoco", shape: { kind: "rect", x: 96, y: 104, w: 28, h: 22, r: 7 } },
  { id: "ombro_dir", shape: { kind: "ell", cx: 64, cy: 142, rx: 23, ry: 16 } },
  { id: "ombro_esq", shape: { kind: "ell", cx: 156, cy: 142, rx: 23, ry: 16 } },
  { id: "torax", shape: { kind: "rect", x: 74, y: 134, w: 72, h: 48, r: 16 } },
  { id: "abdome", shape: { kind: "rect", x: 78, y: 186, w: 64, h: 46, r: 14 } },
  { id: "braco_sup_dir", shape: { kind: "rect", x: 42, y: 142, w: 22, h: 66, r: 11 } },
  { id: "braco_sup_esq", shape: { kind: "rect", x: 156, y: 142, w: 22, h: 66, r: 11 } },
  { id: "braco_inf_dir", shape: { kind: "rect", x: 42, y: 212, w: 20, h: 62, r: 10 } },
  { id: "braco_inf_esq", shape: { kind: "rect", x: 158, y: 212, w: 20, h: 62, r: 10 } },
  { id: "coxa_dir", shape: { kind: "rect", x: 76, y: 236, w: 30, h: 110, r: 15 } },
  { id: "coxa_esq", shape: { kind: "rect", x: 114, y: 236, w: 30, h: 110, r: 15 } },
  { id: "perna_dir", shape: { kind: "rect", x: 78, y: 350, w: 26, h: 120, r: 13 } },
  { id: "perna_esq", shape: { kind: "rect", x: 116, y: 350, w: 26, h: 120, r: 13 } },
];

// COSTAS — lado do paciente: direito = imagem-direita
const BACK_DECOR: Shape[] = [
  { kind: "ell", cx: 110, cy: 64, rx: 34, ry: 42 },
  { kind: "rect", x: 96, y: 104, w: 28, h: 22, r: 7 }, // pescoço (clicável só na frente)
  { kind: "ell", cx: 64, cy: 142, rx: 23, ry: 16 }, // ombros
  { kind: "ell", cx: 156, cy: 142, rx: 23, ry: 16 },
  { kind: "rect", x: 42, y: 142, w: 22, h: 66, r: 11 }, // braços
  { kind: "rect", x: 156, y: 142, w: 22, h: 66, r: 11 },
  { kind: "rect", x: 42, y: 212, w: 20, h: 62, r: 10 },
  { kind: "rect", x: 158, y: 212, w: 20, h: 62, r: 10 },
  { kind: "ell", cx: 52, cy: 286, rx: 12, ry: 15 },
  { kind: "ell", cx: 168, cy: 286, rx: 12, ry: 15 },
  { kind: "rect", x: 76, y: 300, w: 30, h: 100, r: 15 }, // coxas
  { kind: "rect", x: 114, y: 300, w: 30, h: 100, r: 15 },
  { kind: "rect", x: 78, y: 404, w: 26, h: 110, r: 13 }, // pernas
  { kind: "rect", x: 116, y: 404, w: 26, h: 110, r: 13 },
  { kind: "ell", cx: 88, cy: 520, rx: 17, ry: 11 },
  { kind: "ell", cx: 132, cy: 520, rx: 17, ry: 11 },
];
const BACK_REGIONS: RegionDef[] = [
  { id: "costas_sup", shape: { kind: "rect", x: 74, y: 134, w: 72, h: 58, r: 16 } },
  { id: "costas_inf", shape: { kind: "rect", x: 78, y: 196, w: 64, h: 48, r: 14 } },
  { id: "quadril_esq", shape: { kind: "ell", cx: 88, cy: 270, rx: 25, ry: 23 } },
  { id: "quadril_dir", shape: { kind: "ell", cx: 132, cy: 270, rx: 25, ry: 23 } },
];

function ShapeEl({
  shape,
  fill,
  stroke,
}: {
  shape: Shape;
  fill: string;
  stroke: string;
}) {
  if (shape.kind === "ell")
    return (
      <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={fill} stroke={stroke} strokeWidth={2} />
    );
  return (
    <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.r} ry={shape.r} fill={fill} stroke={stroke} strokeWidth={2} />
  );
}

function Figure({
  title,
  decor,
  regions,
  selected,
  onToggle,
  compact = false,
}: {
  title: string;
  decor: Shape[];
  regions: RegionDef[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex-1">
      <p className="mb-0.5 text-center text-[11px] font-medium text-navy-400">
        {title}
      </p>
      <svg
        viewBox="0 0 220 540"
        className="mx-auto block h-auto w-full select-none"
        style={{ maxWidth: compact ? 96 : 230 }}
      >
        {decor.map((s, i) => (
          <ShapeEl key={i} shape={s} fill={SKIN} stroke={SKIN_D} />
        ))}
        {regions.map((r) => {
          const active = selected.has(r.id);
          return (
            <g
              key={r.id}
              role="button"
              aria-pressed={active}
              aria-label={LABEL[r.id]}
              tabIndex={0}
              onClick={() => onToggle(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(r.id);
                }
              }}
              className="cursor-pointer outline-none [&>*]:transition-colors"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <title>{LABEL[r.id]}</title>
              <ShapeEl
                shape={r.shape}
                fill={active ? TEAL : SKIN}
                stroke={active ? TEAL_D : SKIN_D}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function BodyMap({
  selected,
  onToggle,
  compact = false,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex justify-center gap-3">
      <Figure
        title="Frente"
        decor={FRONT_DECOR}
        regions={FRONT_REGIONS}
        selected={selected}
        onToggle={onToggle}
        compact={compact}
      />
      <Figure
        title="Costas"
        decor={BACK_DECOR}
        regions={BACK_REGIONS}
        selected={selected}
        onToggle={onToggle}
        compact={compact}
      />
    </div>
  );
}
