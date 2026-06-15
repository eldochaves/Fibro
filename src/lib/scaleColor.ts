/** Cor de uma escala (verde → vermelho) conforme o valor. */
export function scaleColor(value: number, max: number): string {
  const t = Math.max(0, Math.min(1, value / max));
  const hue = Math.round(120 - t * 120); // 120=verde, 0=vermelho
  return `hsl(${hue}, 68%, 42%)`;
}
