import { DeletePainEpisodeButton } from "@/app/diario/DeletePainEpisodeButton";

export interface PainEpisode {
  id: string;
  episode_date: string;
  start_time: string | null;
  activity: string | null;
  location: string | null;
  eva: number | null;
  radiation: string | null;
  end_time: string | null;
}

function evaColor(v: number): string {
  const hue = Math.round(120 - (v / 10) * 120);
  return `hsl(${hue}, 70%, 45%)`;
}

export function PainEpisodeList({
  episodes,
  patientView = false,
}: {
  episodes: PainEpisode[];
  patientView?: boolean;
}) {
  if (episodes.length === 0) {
    return (
      <div className="card text-center text-navy-500">
        Nenhum episódio registrado ainda.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {episodes.map((ep) => (
        <li key={ep.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-navy-800">
                {formatDate(ep.episode_date)}
                {ep.start_time && (
                  <span className="font-normal text-navy-400">
                    {" · "}
                    {ep.start_time}
                    {ep.end_time ? ` – ${ep.end_time}` : ""}
                  </span>
                )}
              </div>
              {ep.location && (
                <div className="mt-1 text-sm text-navy-700">
                  <span className="text-navy-300">Onde: </span>
                  {ep.location}
                </div>
              )}
              {ep.activity && (
                <div className="text-sm text-navy-700">
                  <span className="text-navy-300">Fazendo: </span>
                  {ep.activity}
                </div>
              )}
              {ep.radiation && (
                <div className="text-sm text-navy-700">
                  <span className="text-navy-300">Irradiação: </span>
                  {ep.radiation}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {ep.eva !== null && (
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: evaColor(ep.eva) }}
                  title="Intensidade (EVA)"
                >
                  {ep.eva}
                </span>
              )}
              {patientView && <DeletePainEpisodeButton id={ep.id} />}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
