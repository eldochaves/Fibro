"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Face, moodFor } from "@/components/FaceScale";
import { scaleColor } from "@/lib/scaleColor";
import { saveEva, adminSaveEva } from "@/app/actions";

export function EvaForm({ targetUserId }: { targetUserId?: string }) {
  const router = useRouter();
  const [eva, setEva] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (eva === null) return;
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveEva(targetUserId, { eva })
      : await saveEva({ eva });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Não foi possível salvar.");
  }

  if (saved) {
    return (
      <div className="space-y-5">
        <div className="card flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>
          <h2 className="font-display text-xl font-semibold text-navy-800">
            Registrado!
          </h2>
          <p className="text-sm text-navy-500">
            Sua dor foi registrada como <strong>{eva}/10</strong>.
          </p>
        </div>
        <button
          onClick={() => {
            router.push(targetUserId ? `/admin/${targetUserId}` : "/inicio");
            router.refresh();
          }}
          className="btn-primary w-full"
        >
          {targetUserId ? "Voltar à ficha do paciente" : "Voltar ao início"}
        </button>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <p className="text-sm text-navy-500">
        Marque, de 0 a 10, a intensidade da sua dor neste momento.
      </p>
      {eva !== null && (
        <div className="flex items-center justify-center gap-2">
          <Face color={scaleColor(eva, 10)} mood={moodFor(eva, 10)} />
          <span className="text-lg font-bold" style={{ color: scaleColor(eva, 10) }}>
            {eva}/10
          </span>
        </div>
      )}
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {Array.from({ length: 11 }, (_, v) => {
          const active = eva === v;
          const color = scaleColor(v, 10);
          return (
            <button
              key={v}
              type="button"
              onClick={() => setEva(v)}
              aria-pressed={active}
              className="rounded-lg border py-2 text-sm font-bold transition"
              style={
                active
                  ? { backgroundColor: color, borderColor: color, color: "#fff" }
                  : { borderColor: "#dbe6ee", color }
              }
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-navy-300">
        <span>0 · sem dor</span>
        <span>10 · pior dor</span>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={eva === null || saving}
        className="btn-primary w-full"
      >
        {saving ? "Enviando..." : eva === null ? "Escolha um valor" : "Registrar dor"}
      </button>
    </div>
  );
}
