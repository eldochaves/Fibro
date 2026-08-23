import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";
import { normalizeFrequency, isAvailableNow } from "@/lib/availability";
import { AgulhamentoForm } from "./AgulhamentoForm";

export const dynamic = "force-dynamic";

interface QrRow {
  id: string;
  created_at: string;
  by_doctor: boolean | null;
}

export default async function AgulhamentoPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");
  if (!(profile?.questionnaires ?? []).includes("agulhamento_miofascial"))
    redirect("/inicio");

  const { data } = await supabase
    .from("questionnaire_responses")
    .select("id, created_at, by_doctor")
    .eq("questionnaire_key", "agulhamento_miofascial")
    .order("created_at", { ascending: false });
  const history = (data ?? []) as QrRow[];

  const freq = normalizeFrequency(
    profile?.questionnaire_freq?.["agulhamento_miofascial"]
  );
  const available = isAvailableNow(
    freq,
    history[0]?.created_at ?? null,
    profile?.questionnaire_requests?.["agulhamento_miofascial"]
  );

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href="/inicio"
          className="mb-4 inline-block text-sm font-medium text-teal-600"
        >
          ← Início
        </Link>
        <h1 className="font-display text-2xl font-semibold text-navy-800">
          Como foi o seu agulhamento?
        </h1>
        <p className="mb-6 mt-1 text-sm text-navy-500">
          Um retorno rápido sobre a sessão de agulhamento que você realizou.
        </p>

        {available ? (
          <AgulhamentoForm />
        ) : (
          <div className="card text-center text-navy-500">
            <div className="mb-2 text-3xl">✅</div>
            <p>
              Você já enviou o seu feedback. Obrigado! Se precisar, o Dr. Eldo
              pode liberar novamente.
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold text-navy-700">
              Seus envios ({history.length})
            </h2>
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="card flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-800">
                    {formatDate(h.created_at)}
                  </span>
                  <span className="chip-teal">Enviado ✓</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
