function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Foto de perfil com fallback para iniciais. */
export function Avatar({
  url,
  name,
  size = 48,
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
}) {
  const dim = { width: size, height: size };
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name ?? "Foto de perfil"}
        style={dim}
        className="shrink-0 rounded-full object-cover ring-1 ring-navy-100"
      />
    );
  }
  return (
    <div
      style={dim}
      className="flex shrink-0 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700 ring-1 ring-navy-100"
    >
      <span style={{ fontSize: size * 0.38 }}>{initials(name)}</span>
    </div>
  );
}
