import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QUESTIONNAIRE_BY_KEY } from "@/lib/questionnaires";

export const dynamic = "force-dynamic";

/**
 * Link de convite: /c/<questionário>
 * Paciente acessa → faz login/cadastro → o questionário é liberado para ele
 * e o formulário abre automaticamente.
 */
export default async function ConvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ sites?: string }>;
}) {
  const { key } = await params;
  const { sites } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Não logado → login, voltando para cá depois
  if (!user) redirect(`/login?next=${encodeURIComponent(`/c/${key}`)}`);

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin) redirect("/admin");

  const def = QUESTIONNAIRE_BY_KEY[key];
  if (!def) redirect("/inicio");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, cpf, birth_date, diseases, questionnaires, questionnaire_requests"
    )
    .eq("id", user.id)
    .maybeSingle();

  // Libera o questionário e reabre (mesmo se já respondido antes), garantindo
  // que ele abra agora para este paciente. Também marca a(s) doença(s)
  // associada(s) ao questionário do convite (o médico já indicou ao convidar).
  const current: string[] = profile?.questionnaires ?? [];
  const requests: Record<string, string> =
    (profile?.questionnaire_requests as Record<string, string>) ?? {};
  requests[key] = new Date().toISOString();
  const currentDiseases: string[] = profile?.diseases ?? [];
  const nextDiseases = Array.from(
    new Set([...currentDiseases, ...def.diseases])
  );
  await supabase
    .from("profiles")
    .update({
      diseases: nextDiseases,
      questionnaires: current.includes(key) ? current : [...current, key],
      questionnaire_requests: requests,
    })
    .eq("id", user.id);

  // Feedback pós-infiltração: grava os locais vindos do link (pré-marcação).
  // Separado e tolerante: não bloqueia o convite se a migração 015 não rodou.
  if (key === "infiltracao_tend" && sites) {
    const siteKeys = sites
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (siteKeys.length > 0) {
      await supabase
        .from("profiles")
        .update({ infiltracao_sites: siteKeys })
        .eq("id", user.id);
    }
  }

  const complete = Boolean(
    profile?.full_name && profile?.cpf && profile?.birth_date
  );
  // Cadastro incompleto → completa primeiro, voltando ao questionário depois
  if (!complete) redirect(`/perfil?next=${encodeURIComponent(def.path)}`);

  redirect(def.path);
}
