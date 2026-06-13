"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPainEpisode } from "@/app/actions";

function evaColor(v: number): string {
  // 0 = verde (120), 10 = vermelho (0)
  const hue = Math.round(120 - (v / 10) * 120);
  return `hsl(${hue}, 70%, 45%)`;
}

export function DiarioForm() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [open, setOpen] = useState(false);
  const [episodeDate, setEpisodeDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [eva, setEva] = useState<number | null>(null);
  const [radiation, setRadiation] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEpisodeDate(today);
    setStartTime("");
    setActivity("");
    setLocation("");
    setEva(null);
    setRadiation("");
    setEndTime("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await addPainEpisode({
      episode_date: episodeDate,
      start_time: startTime || null,
      activity: activity.trim() || null,
      location: location.trim() || null,
      eva,
      radiation: radiation.trim() || null,
      end_time: endTime || null,
    });
    setSaving(false);
    if (res.ok) {
      reset();
      setOpen(false);
      router.refresh();
    } else {
      setError(res.error ?? "Não foi possível salvar.");
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        + Registrar episódio de dor
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-bold">Novo episódio</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="ep-date">
            Data
          </label>
          <input
            id="ep-date"
            type="date"
            className="input"
            value={episodeDate}
            onChange={(e) => setEpisodeDate(e.target.value)}
            required
            max={today}
          />
        </div>
        <div>
          <label className="label" htmlFor="ep-start">
            Hora do início
          </label>
          <input
            id="ep-start"
            type="time"
            className="input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ep-act">
          O que estava fazendo quando a dor começou?
        </label>
        <input
          id="ep-act"
          className="input"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="Ex.: dormindo, andando, carregando peso..."
        />
      </div>

      <div>
        <label className="label" htmlFor="ep-loc">
          Onde dói?
        </label>
        <input
          id="ep-loc"
          className="input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex.: lombar, joelho direito..."
        />
      </div>

      <div>
        <span className="label">Intensidade da dor (EVA 0–10)</span>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {Array.from({ length: 11 }, (_, v) => {
            const active = eva === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setEva(v)}
                aria-pressed={active}
                className="rounded-lg border py-2 text-sm font-bold transition"
                style={
                  active
                    ? { backgroundColor: evaColor(v), color: "#fff", borderColor: evaColor(v) }
                    : { borderColor: "#e2e8f0", color: evaColor(v) }
                }
              >
                {v}
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>0 · sem dor</span>
          <span>10 · pior dor</span>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ep-rad">
          Irradiação — para onde a dor vai? <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="ep-rad"
          className="input"
          value={radiation}
          onChange={(e) => setRadiation(e.target.value)}
          placeholder="Ex.: desce pela perna"
        />
      </div>

      <div>
        <label className="label" htmlFor="ep-end">
          Hora do fim <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="ep-end"
          type="time"
          className="input"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving ? "Salvando..." : "Salvar episódio"}
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          disabled={saving}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
