"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  evaluate,
  fibromyalgiaSeverityScore,
  type FibroAnswers,
} from "@/lib/acr2016";

/** Salva uma avaliação ACR 2016 para o usuário autenticado. */
export async function saveAssessment(answers: FibroAnswers) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const result = evaluate(answers);

  const { error } = await supabase.from("assessments").insert({
    user_id: user.id,
    answers,
    wpi: result.wpi,
    sss: result.sss,
    regions_with_pain: result.regionsWithPain,
    severity_score: fibromyalgiaSeverityScore(result),
    meets_criteria: result.meetsCriteria,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, result };
}

/** Atualiza/cria os dados do perfil do paciente. */
export async function updateProfile(data: {
  full_name?: string;
  cpf?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  redirectTo?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // upsert garante que a linha exista mesmo se o trigger não a tiver criado
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: data.full_name,
      cpf: data.cpf || null,
      birth_date: data.birth_date || null,
      phone: data.phone || null,
    },
    { onConflict: "id" }
  );

  if (error) return { ok: false as const, error: error.message };

  // Redirect no servidor evita a condição de corrida do router.push no cliente
  if (data.redirectTo) redirect(data.redirectTo);
  return { ok: true as const };
}

// ---------------------------------------------------------------------
// Ações do médico (admin) — protegidas por verificação de admin + RLS
// ---------------------------------------------------------------------

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/historico");
  return supabase;
}

/** Médico edita os dados cadastrais de um paciente. */
export async function adminUpdateProfile(
  userId: string,
  data: {
    full_name?: string;
    cpf?: string | null;
    birth_date?: string | null;
    phone?: string | null;
  }
) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      cpf: data.cpf || null,
      birth_date: data.birth_date || null,
      phone: data.phone || null,
    })
    .eq("id", userId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Médico apaga uma avaliação de um paciente. */
export async function adminDeleteAssessment(assessmentId: string, userId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", assessmentId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}
