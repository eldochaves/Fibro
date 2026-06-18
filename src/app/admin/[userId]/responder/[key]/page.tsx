import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext } from "@/lib/session";
import { QUESTIONNAIRE_BY_KEY } from "@/lib/questionnaires";
import { QuestionarioForm } from "@/app/questionario/QuestionarioForm";
import { FiqrForm } from "@/app/fiqr/FiqrForm";
import { CsiForm } from "@/app/csi/CsiForm";
import { PcsForm } from "@/app/pcs/PcsForm";
import { WomacForm } from "@/app/womac/WomacForm";
import { EvaForm } from "@/app/eva/EvaForm";
import { ScoredChoiceForm } from "@/components/ScoredChoiceForm";
import { SCORED_DEFS } from "@/lib/lequesne";
import { CriteriaForm } from "@/components/CriteriaForm";
import { CRITERIA_DEFS } from "@/lib/criteria";

export const dynamic = "force-dynamic";

export default async function AdminResponderPage({
  params,
}: {
  params: Promise<{ userId: string; key: string }>;
}) {
  const { userId, key } = await params;
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const def = QUESTIONNAIRE_BY_KEY[key];
  if (!def) redirect(`/admin/${userId}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) notFound();

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href={`/admin/${userId}`}
          className="mb-3 inline-block text-sm font-medium text-teal-600"
        >
          ← Voltar à ficha
        </Link>
        <div className="card mb-5 border-amber-200 bg-amber-50/60">
          <p className="text-sm text-navy-700">
            ✍️ Você está respondendo <strong>{def.name}</strong> em nome de{" "}
            <strong>{profile.full_name || "(sem nome)"}</strong>.
          </p>
        </div>

        {key === "acr2016" && <QuestionarioForm targetUserId={userId} />}
        {key === "fiqr" && (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold text-navy-800">
              {def.name}
            </h1>
            <FiqrForm targetUserId={userId} />
          </>
        )}
        {key === "csi" && (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold text-navy-800">
              {def.name}
            </h1>
            <CsiForm targetUserId={userId} />
          </>
        )}
        {key === "pcs" && (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold text-navy-800">
              {def.name}
            </h1>
            <PcsForm targetUserId={userId} />
          </>
        )}
        {key === "womac" && (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold text-navy-800">
              {def.name}
            </h1>
            <WomacForm targetUserId={userId} />
          </>
        )}
        {key === "eva" && (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold text-navy-800">
              {def.name}
            </h1>
            <EvaForm targetUserId={userId} />
          </>
        )}
        {SCORED_DEFS[key] && (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold text-navy-800">
              {def.name}
            </h1>
            <ScoredChoiceForm questionnaireKey={key} targetUserId={userId} />
          </>
        )}
        {CRITERIA_DEFS[key] && (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold text-navy-800">
              {def.name}
            </h1>
            <CriteriaForm questionnaireKey={key} targetUserId={userId} />
          </>
        )}
      </main>
    </>
  );
}
