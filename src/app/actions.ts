"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildWhatsappLink, buildMailtoLink } from "@/lib/whatsapp";
import { CLINIC_NAME, SITE_URL } from "@/lib/config";
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

/**
 * Médico habilita/desabilita o Diário de Dor de um paciente.
 * Ao HABILITAR, envia email (se Resend configurado) e devolve um link de
 * WhatsApp já com a mensagem pronta para o médico enviar.
 */
export async function adminSetPainDiary(userId: string, enabled: boolean) {
  const supabase = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, pain_diary_enabled")
    .eq("id", userId)
    .maybeSingle();

  const wasEnabled = profile?.pain_diary_enabled === true;

  const { error } = await supabase
    .from("profiles")
    .update({ pain_diary_enabled: enabled })
    .eq("id", userId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);

  // Só notifica quando passa de desabilitado -> habilitado
  if (!enabled || wasEnabled) {
    return { ok: true as const, enabled, notified: false as const };
  }

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "Olá";
  const link = `${SITE_URL}/diario`;
  const message =
    `Olá ${firstName}! Aqui é da ${CLINIC_NAME}. ` +
    `O Dr. Eldo habilitou para você o Diário de Dor no nosso site. ` +
    `Acesse ${link} para registrar seus episódios de dor e traga no retorno. ` +
    `Qualquer dúvida, estamos à disposição.`;

  const emailSubject = `${CLINIC_NAME} — Diário de Dor habilitado`;
  const emailBody =
    `Olá ${firstName}!\n\n` +
    `O Dr. Eldo habilitou para você o Diário de Dor no nosso site.\n` +
    `Acesse: ${link}\n\n` +
    `Registre seus episódios de dor e traga no seu retorno.\n\n` +
    `${CLINIC_NAME} · Reumatologia`;

  // Envio automático por email só acontece se o Resend estiver configurado
  // (exige domínio verificado). Caso contrário, usamos o link mailto abaixo.
  let emailStatus: "sent" | "skipped" | "error" = "skipped";
  if (profile?.email && process.env.RESEND_API_KEY) {
    const r = await sendEmail({
      to: profile.email,
      subject: emailSubject,
      html: emailHtml(firstName, link),
    });
    emailStatus = r.ok ? "sent" : "error";
  }

  return {
    ok: true as const,
    enabled,
    notified: true as const,
    emailStatus,
    whatsappLink: buildWhatsappLink(profile?.phone, message),
    mailtoLink: buildMailtoLink(profile?.email, emailSubject, emailBody),
  };
}

function emailHtml(firstName: string, link: string): string {
  return `
  <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
    <h2 style="color:#2f44b8">${CLINIC_NAME}</h2>
    <p>Olá, ${firstName}!</p>
    <p>O Dr. Eldo habilitou para você o <strong>Diário de Dor</strong> no nosso site.</p>
    <p>Registre cada episódio de dor (data, horário, o que estava fazendo, onde dói,
    intensidade de 0 a 10, irradiação e quando passou) e traga no seu retorno.</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#3b56e0;color:#fff;padding:12px 20px;
      border-radius:10px;text-decoration:none;font-weight:bold">Abrir meu Diário de Dor</a>
    </p>
    <p style="color:#64748b;font-size:13px">Se o botão não funcionar, acesse: ${link}</p>
  </div>`;
}

// ---------------------------------------------------------------------
// Diário de Dor — ações do paciente
// ---------------------------------------------------------------------

export interface PainEpisodeInput {
  episode_date: string;
  start_time?: string | null;
  activity?: string | null;
  location?: string | null;
  eva?: number | null;
  radiation?: string | null;
  end_time?: string | null;
}

/** Paciente registra um novo episódio de dor. */
export async function addPainEpisode(data: PainEpisodeInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("pain_episodes").insert({
    user_id: user.id,
    episode_date: data.episode_date,
    start_time: data.start_time || null,
    activity: data.activity || null,
    location: data.location || null,
    eva: data.eva ?? null,
    radiation: data.radiation || null,
    end_time: data.end_time || null,
  });

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/diario");
  return { ok: true as const };
}

/** Paciente apaga um episódio de dor seu. */
export async function deletePainEpisode(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("pain_episodes").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/diario");
  return { ok: true as const };
}
