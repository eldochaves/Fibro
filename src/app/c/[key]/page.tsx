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
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
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
    .select("full_name, cpf, birth_date, questionnaires")
    .eq("id", user.id)
    .maybeSingle();

  // Libera o questionário para este paciente (se ainda não estiver)
  const current: string[] = profile?.questionnaires ?? [];
  if (!current.includes(key)) {
    await supabase
      .from("profiles")
      .update({ questionnaires: [...current, key] })
      .eq("id", user.id);
  }

  const complete = Boolean(
    profile?.full_name && profile?.cpf && profile?.birth_date
  );
  // Cadastro incompleto → completa primeiro, voltando ao questionário depois
  if (!complete) redirect(`/perfil?next=${encodeURIComponent(def.path)}`);

  redirect(def.path);
}
