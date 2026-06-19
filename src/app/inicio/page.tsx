import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { getContext, isProfileComplete } from "@/lib/session";
import { QUESTIONNAIRES } from "@/lib/questionnaires";
import { normalizeFrequency, nextAvailable, isAvailableNow } from "@/lib/availability";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const diaryEnabled = profile?.pain_diary_enabled === true;
  const assignedKeys = profile?.questionnaires ?? [];
  const freqMap = profile?.questionnaire_freq ?? {};
  const reqMap = profile?.questionnaire_requests ?? {};
  const assigned = QUESTIONNAIRES.filter((q) => assignedKeys.includes(q.key));

  // Datas do último preenchimento por questionário
  const lastByKey: Record<string, string | null> = {};
  if (assigned.length > 0) {
    const [{ data: lastAcr }, { data: qrs }] = await Promise.all([
      supabase
        .from("assessments")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("questionnaire_responses")
        .select("questionnaire_key, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    lastByKey["acr2016"] = lastAcr?.created_at ?? null;
    for (const r of qrs ?? []) {
      if (!(r.questionnaire_key in lastByKey))
        lastByKey[r.questionnaire_key] = r.created_at;
    }
  }

  const items = assigned.map((q) => {
    const freq = normalizeFrequency(freqMap[q.key]);
    const last = lastByKey[q.key];
    const requested = reqMap[q.key];
    if (isAvailableNow(freq, last, requested)) {
      return { q, status: "available" as const, nextDate: null };
    }
    const na = nextAvailable(freq, last);
    return {
      q,
      status: na === "never" ? ("done" as const) : ("scheduled" as const),
      nextDate: na instanceof Date ? na : null,
    };
  });

  // Disponíveis primeiro, depois agendados, por fim concluídos.
  const rank = (s: string) =>
    s === "available" ? 0 : s === "scheduled" ? 1 : 2;
  const orderedItems = [...items].sort(
    (a, b) => rank(a.status) - rank(b.status)
  );
  const availableCount = items.filter((i) => i.status === "available").length;

  const hasSomething = assigned.length > 0 || diaryEnabled;

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex animate-fade-up items-center gap-4">
          <Avatar url={profile?.avatar_url} name={profile?.full_name} size={56} />
          <div>
            <p className="text-sm text-navy-400">
              Olá{firstName ? `, ${firstName}` : ""} 👋
            </p>
            <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
              O que você gostaria de fazer?
            </h1>
          </div>
        </div>
        <p className="mt-2 text-base text-navy-500">
          {hasSomething
            ? availableCount > 0
              ? `Você tem ${availableCount} ${
                  availableCount === 1
                    ? "questionário disponível"
                    : "questionários disponíveis"
                } para responder. Leva poucos minutos. 💙`
              : "Tudo em dia por aqui! Quando houver algo novo, aparecerá nesta tela."
            : "Assim que o seu médico liberar um questionário, ele aparecerá aqui."}
        </p>
        {hasSomething && (
          <p className="mt-1 text-sm text-navy-400">
            É só responder com sinceridade — quem analisa os resultados é o Dr.
            Eldo, no seu acompanhamento.
          </p>
        )}

        {!hasSomething ? (
          <div className="card mt-6 text-center">
            <div className="text-3xl">⏳</div>
            <p className="mt-2 text-navy-500">
              Nenhum questionário liberado ainda. Aguarde o seu médico — você
              será avisado quando algo estiver disponível.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {orderedItems.map(({ q, status, nextDate }) =>
              status === "available" ? (
                <ActionCard
                  key={q.key}
                  href={q.path}
                  icon={q.icon}
                  title={q.name}
                  desc={q.description}
                  cta="Responder"
                  badge="Disponível agora"
                />
              ) : (
                <LockedCard
                  key={q.key}
                  icon={q.icon}
                  title={q.name}
                  note={
                    status === "done"
                      ? "Já respondido."
                      : `Disponível novamente em ${formatDate(nextDate!)}`
                  }
                />
              )
            )}

            {diaryEnabled && (
              <ActionCard
                href="/diario"
                icon="📒"
                title="Diário de Dor"
                desc="Registre seus episódios de dor para acompanhamento."
                cta="Abrir diário"
              />
            )}
          </div>
        )}

        {/* Atalhos secundários */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/historico"
            className="card-flat flex items-center justify-between hover:border-teal-300"
          >
            <span className="text-sm font-medium text-navy-700">
              📊 Meu histórico
            </span>
            <span className="text-teal-600">→</span>
          </Link>
          <Link
            href="/perfil"
            className="card-flat flex items-center justify-between hover:border-teal-300"
          >
            <span className="text-sm font-medium text-navy-700">
              ⚙️ Meus dados
            </span>
            <span className="text-teal-600">→</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ActionCard({
  href,
  icon,
  title,
  desc,
  cta,
  badge,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  cta: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="card group flex flex-col transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-2xl">
          {icon}
        </div>
        {badge && (
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
            {badge}
          </span>
        )}
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-navy-800">
        {title}
      </h2>
      <p className="mt-1 flex-1 text-sm text-navy-500">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-teal-700">
        {cta}
        <span className="transition group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

function LockedCard({
  icon,
  title,
  note,
}: {
  icon: string;
  title: string;
  note: string;
}) {
  return (
    <div className="card flex flex-col opacity-75">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-2xl grayscale">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-navy-800">
        {title}
      </h2>
      <p className="mt-1 flex-1 text-sm text-navy-500">{note}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy-300">
        ✓ Concluído por enquanto
      </span>
    </div>
  );
}
