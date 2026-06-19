"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { buildWhatsappLink, buildMailtoLink } from "@/lib/whatsapp";
import { CLINIC_NAME, SITE_URL } from "@/lib/config";
import {
  evaluate,
  fibromyalgiaSeverityScore,
  type FibroAnswers,
} from "@/lib/acr2016";
import { computeFiqr } from "@/lib/fiqr";
import { computeCsi } from "@/lib/csi";
import { computePcs } from "@/lib/pcs";
import { computeWomac } from "@/lib/womac";
import { computeEva } from "@/lib/eva";
import { computeBpi } from "@/lib/bpi";
import { computeScored } from "@/lib/scored";
import { SCORED_DEFS } from "@/lib/lequesne";
import { computeCriteria, CRITERIA_DEFS } from "@/lib/criteria";
import { computeLikert } from "@/lib/likert";
import { LIKERT_DEFS } from "@/lib/koos";
import { QUESTIONNAIRE_BY_KEY } from "@/lib/questionnaires";
import type { DiseaseResource } from "@/lib/diseaseInfo";

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
  avatar_url?: string | null;
  redirectTo?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload: Record<string, unknown> = {
    id: user.id,
    email: user.email,
    full_name: data.full_name,
    cpf: data.cpf || null,
    birth_date: data.birth_date || null,
    phone: data.phone || null,
  };
  // só atualiza a foto se foi informada (evita apagar ao salvar outros campos)
  if (data.avatar_url !== undefined) payload.avatar_url = data.avatar_url;

  // upsert garante que a linha exista mesmo se o trigger não a tiver criado
  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

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

/** Médico marca a atividade dos pacientes como vista (zera as "Novidades"). */
export async function adminMarkActivitySeen() {
  const supabase = await requireAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase
    .from("profiles")
    .update({ admin_last_seen_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Médico edita o conteúdo educativo (resumo + links) de uma doença. */
export async function adminSaveDiseaseInfo(
  diseaseKey: string,
  data: { summary: string; resources: DiseaseResource[] }
) {
  const supabase = await requireAdmin();
  const resources = (data.resources ?? [])
    .map((r) => ({
      title: (r.title ?? "").trim(),
      source: (r.source ?? "").trim(),
      url: (r.url ?? "").trim(),
    }))
    .filter((r) => r.title && r.url);

  const { error } = await supabase.from("disease_info").upsert(
    {
      disease_key: diseaseKey,
      summary: data.summary.trim(),
      resources,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "disease_key" }
  );
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/saude");
  revalidatePath("/admin/saude");
  return { ok: true as const };
}

/** Médico define as doenças (etiquetas) e os questionários liberados ao paciente. */
export async function adminSetPatientCare(
  userId: string,
  data: {
    diseases: string[];
    questionnaires: string[];
    questionnaire_freq?: Record<string, string>;
  }
) {
  const supabase = await requireAdmin();
  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      diseases: data.diseases,
      questionnaires: data.questionnaires,
      questionnaire_freq: data.questionnaire_freq ?? {},
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (!updated) {
    return {
      ok: false as const,
      error:
        "Não foi possível salvar (sem permissão). Rode as migrações do médico no Supabase.",
    };
  }
  revalidatePath(`/admin/${userId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}

/**
 * Médico solicita uma NOVA resposta de um questionário (reabre, inclusive os
 * "apenas uma vez"). Garante que o questionário esteja liberado ao paciente.
 */
export async function adminRequestQuestionnaire(userId: string, key: string) {
  const supabase = await requireAdmin();
  const { data: p } = await supabase
    .from("profiles")
    .select("questionnaires, questionnaire_requests")
    .eq("id", userId)
    .maybeSingle();

  const questionnaires: string[] = p?.questionnaires ?? [];
  const requests: Record<string, string> = p?.questionnaire_requests ?? {};
  requests[key] = new Date().toISOString();
  const nextAssigned = questionnaires.includes(key)
    ? questionnaires
    : [...questionnaires, key];

  const { error } = await supabase
    .from("profiles")
    .update({
      questionnaires: nextAssigned,
      questionnaire_requests: requests,
    })
    .eq("id", userId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}

/**
 * Médico dispensa (apaga) a pendência de um questionário: silencia até surgir
 * um novo motivo (ex.: nova solicitação ou novo ciclo recorrente). Também
 * cancela uma solicitação em aberto desse questionário.
 */
export async function adminDismissPendency(userId: string, key: string) {
  const supabase = await requireAdmin();
  const { data: p } = await supabase
    .from("profiles")
    .select("questionnaire_requests, questionnaire_dismissed")
    .eq("id", userId)
    .maybeSingle();

  const requests: Record<string, string> = p?.questionnaire_requests ?? {};
  delete requests[key];
  const dismissed: Record<string, string> = p?.questionnaire_dismissed ?? {};
  dismissed[key] = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update({
      questionnaire_requests: requests,
      questionnaire_dismissed: dismissed,
    })
    .eq("id", userId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Médico cancela uma solicitação de nova resposta. */
export async function adminCancelRequest(userId: string, key: string) {
  const supabase = await requireAdmin();
  const { data: p } = await supabase
    .from("profiles")
    .select("questionnaire_requests")
    .eq("id", userId)
    .maybeSingle();
  const requests: Record<string, string> = p?.questionnaire_requests ?? {};
  delete requests[key];
  const { error } = await supabase
    .from("profiles")
    .update({ questionnaire_requests: requests })
    .eq("id", userId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}

// ---------------------------------------------------------------------
// Cadastro assistido e preenchimento em nome do paciente (Pacote C)
// ---------------------------------------------------------------------

/** Médico cria a conta de um paciente (ex.: idoso, sem celular). */
export async function adminCreatePatient(data: {
  full_name: string;
  cpf?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  email?: string | null;
  questionnaires?: string[];
}) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false as const,
      error:
        "Cadastro indisponível: defina SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.",
    };
  }

  const email =
    data.email?.trim() ||
    `paciente.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@sem-email.fibro`;

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: { full_name: data.full_name },
  });
  if (error) return { ok: false as const, error: error.message };
  const uid = created.user!.id;

  // Questionários escolhidos no cadastro → infere a(s) doença(s) associada(s).
  const questionnaires = (data.questionnaires ?? []).filter(
    (k) => QUESTIONNAIRE_BY_KEY[k]
  );
  const diseases = Array.from(
    new Set(
      questionnaires.flatMap((k) => QUESTIONNAIRE_BY_KEY[k]?.diseases ?? [])
    )
  );

  await admin.from("profiles").upsert(
    {
      id: uid,
      full_name: data.full_name,
      cpf: data.cpf || null,
      birth_date: data.birth_date || null,
      phone: data.phone || null,
      email,
      diseases,
      questionnaires,
    },
    { onConflict: "id" }
  );

  revalidatePath("/admin");
  return { ok: true as const, userId: uid };
}

/** Médico salva uma avaliação ACR 2016 em nome do paciente. */
export async function adminSaveAssessment(userId: string, answers: FibroAnswers) {
  const supabase = await requireAdmin();
  const result = evaluate(answers);
  const { error } = await supabase.from("assessments").insert({
    user_id: userId,
    answers,
    wpi: result.wpi,
    sss: result.sss,
    regions_with_pain: result.regionsWithPain,
    severity_score: fibromyalgiaSeverityScore(result),
    meets_criteria: result.meetsCriteria,
    by_doctor: true,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);
  return { ok: true as const, result };
}

async function adminSaveResponse(
  userId: string,
  key: string,
  answers: Record<string, unknown>,
  score: number,
  summary: Record<string, unknown>
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: userId,
    questionnaire_key: key,
    answers,
    score,
    summary,
    by_doctor: true,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/${userId}`);
  return { ok: true as const };
}

export async function adminSaveFiqr(
  userId: string,
  answers: Record<string, number>
) {
  const r = computeFiqr(answers);
  return adminSaveResponse(userId, "fiqr", answers, r.total, {
    function: r.functionScore,
    overall: r.overallScore,
    symptoms: r.symptomsScore,
    category: r.category.label,
  });
}

export async function adminSaveCsi(
  userId: string,
  answers: Record<string, number>
) {
  const r = computeCsi(answers);
  return adminSaveResponse(userId, "csi", answers, r.total, {
    category: r.category.label,
  });
}

export async function adminSavePcs(
  userId: string,
  answers: Record<string, number>
) {
  const r = computePcs(answers);
  return adminSaveResponse(userId, "pcs", answers, r.total, {
    rumination: r.rumination,
    magnification: r.magnification,
    helplessness: r.helplessness,
    category: r.category.label,
    clinical: r.clinical,
  });
}

export async function adminSaveWomac(
  userId: string,
  answers: Record<string, number>
) {
  const r = computeWomac(answers);
  return adminSaveResponse(userId, "womac", answers, r.total, {
    pain: r.pain,
    stiffness: r.stiffness,
    function: r.function,
  });
}

export async function adminSaveEva(
  userId: string,
  answers: { eva: number }
) {
  const r = computeEva(answers);
  return adminSaveResponse(userId, "eva", answers as Record<string, number>, r.total, {});
}

export async function adminSaveBpi(
  userId: string,
  answers: Record<string, number>
) {
  const r = computeBpi(answers);
  return adminSaveResponse(userId, "bpi", answers, r.interference, {
    severity: r.severity,
    interference: r.interference,
  });
}

/**
 * Médico exclui um paciente por completo (conta + dados).
 * Usa a SERVICE ROLE KEY para remover a conta em auth.users; as tabelas
 * (profiles, assessments, pain_episodes) são apagadas em cascata.
 */
export async function adminDeleteUser(userId: string) {
  const supabase = await requireAdmin();

  // Impedir auto-exclusão
  const {
    data: { user: me },
  } = await supabase.auth.getUser();
  if (me?.id === userId) {
    return { ok: false as const, error: "Você não pode excluir a si mesmo." };
  }

  // Impedir excluir outro médico/admin
  const { data: target } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  if (target?.email) {
    const { data: isTargetAdmin } = await supabase
      .from("admin_emails")
      .select("email")
      .ilike("email", target.email)
      .maybeSingle();
    if (isTargetAdmin) {
      return { ok: false as const, error: "Não é possível excluir um médico." };
    }
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false as const,
      error:
        "Exclusão indisponível: defina SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.",
    };
  }

  // Remove a(s) foto(s) do Storage (não são apagadas em cascata)
  const { data: files } = await admin.storage.from("avatars").list(userId);
  if (files && files.length > 0) {
    await admin.storage
      .from("avatars")
      .remove(files.map((f) => `${userId}/${f.name}`));
  }

  // Apaga a conta — profiles/assessments/pain_episodes caem em cascata
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false as const, error: error.message };

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

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ pain_diary_enabled: enabled })
    .eq("id", userId)
    .select("pain_diary_enabled")
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (!updated) {
    return {
      ok: false as const,
      error:
        "A alteração não foi salva (sem permissão). Rode a migração de políticas do médico (migration_002) no Supabase.",
    };
  }
  const savedEnabled = updated.pain_diary_enabled === true;
  revalidatePath(`/admin/${userId}`);

  // Só notifica quando passa de desabilitado -> habilitado
  if (!savedEnabled || wasEnabled) {
    return { ok: true as const, enabled: savedEnabled, notified: false as const };
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
    enabled: savedEnabled,
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

  // Verifica se o diário ainda está habilitado (tela pode estar desatualizada)
  const { data: prof } = await supabase
    .from("profiles")
    .select("pain_diary_enabled")
    .eq("id", user.id)
    .maybeSingle();
  if (prof?.pain_diary_enabled !== true) {
    return {
      ok: false as const,
      error: "O Diário de Dor não está mais habilitado pelo seu médico.",
    };
  }

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

/** Paciente salva uma resposta do FIQR (cálculo feito no servidor). */
export async function saveFiqr(answers: Record<string, number>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = computeFiqr(answers);

  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: "fiqr",
    answers,
    score: result.total,
    summary: {
      function: result.functionScore,
      overall: result.overallScore,
      symptoms: result.symptomsScore,
      category: result.category.label,
    },
  });

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/fiqr");
  return { ok: true as const, result };
}

/** Paciente salva uma resposta do CSI (cálculo no servidor). */
export async function saveCsi(answers: Record<string, number>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = computeCsi(answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: "csi",
    answers,
    score: result.total,
    summary: { category: result.category.label },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/csi");
  return { ok: true as const, result };
}

/** Paciente salva uma resposta do PCS (cálculo no servidor). */
export async function savePcs(answers: Record<string, number>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = computePcs(answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: "pcs",
    answers,
    score: result.total,
    summary: {
      rumination: result.rumination,
      magnification: result.magnification,
      helplessness: result.helplessness,
      category: result.category.label,
      clinical: result.clinical,
    },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/pcs");
  return { ok: true as const, result };
}

/** Paciente salva uma resposta do WOMAC. */
export async function saveWomac(answers: Record<string, number>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const r = computeWomac(answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: "womac",
    answers,
    score: r.total,
    summary: { pain: r.pain, stiffness: r.stiffness, function: r.function },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/womac");
  return { ok: true as const, result: r };
}

/** Paciente salva uma resposta da EVA de dor. */
export async function saveEva(answers: { eva: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const r = computeEva(answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: "eva",
    answers,
    score: r.total,
    summary: {},
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/eva");
  return { ok: true as const, result: r };
}

/** Paciente salva uma resposta do BPI (Inventário Breve de Dor). */
export async function saveBpi(answers: Record<string, number>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const r = computeBpi(answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: "bpi",
    answers,
    score: r.interference,
    summary: { severity: r.severity, interference: r.interference },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/bpi");
  return { ok: true as const, result: r };
}

/** Paciente salva uma resposta de questionário "por escolhas pontuadas" (Lequesne). */
export async function saveScored(
  key: string,
  answers: Record<string, number>
) {
  const def = SCORED_DEFS[key];
  if (!def) return { ok: false as const, error: "Questionário inválido." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const r = computeScored(def, answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: key,
    answers,
    score: r.total,
    summary: { category: r.category },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/q/${key}`);
  return { ok: true as const, result: r };
}

export async function adminSaveScored(
  userId: string,
  key: string,
  answers: Record<string, number>
) {
  const def = SCORED_DEFS[key];
  if (!def) return { ok: false as const, error: "Questionário inválido." };
  const r = computeScored(def, answers);
  return adminSaveResponse(userId, key, answers, r.total, {
    category: r.category,
  });
}

/** Paciente salva um questionário Likert normalizado por subescalas (KOOS/HOOS). */
export async function saveLikert(
  key: string,
  answers: Record<string, number>
) {
  const def = LIKERT_DEFS[key];
  if (!def) return { ok: false as const, error: "Questionário inválido." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const r = computeLikert(def, answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: key,
    answers,
    score: r.score,
    summary: { subscales: r.subscales },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/q/${key}`);
  return { ok: true as const, result: r };
}

export async function adminSaveLikert(
  userId: string,
  key: string,
  answers: Record<string, number>
) {
  const def = LIKERT_DEFS[key];
  if (!def) return { ok: false as const, error: "Questionário inválido." };
  const r = computeLikert(def, answers);
  return adminSaveResponse(userId, key, answers, r.score, {
    subscales: r.subscales,
  });
}

/** Paciente salva um critério diagnóstico/classificatório (checklist). */
export async function saveCriteria(
  key: string,
  answers: Record<string, boolean>
) {
  const def = CRITERIA_DEFS[key];
  if (!def) return { ok: false as const, error: "Critério inválido." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const r = computeCriteria(def, answers);
  const { error } = await supabase.from("questionnaire_responses").insert({
    user_id: user.id,
    questionnaire_key: key,
    answers,
    score: r.count,
    summary: { met: r.met, count: r.count, gateOk: r.gateOk },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/q/${key}`);
  return { ok: true as const, result: r };
}

export async function adminSaveCriteria(
  userId: string,
  key: string,
  answers: Record<string, boolean>
) {
  const def = CRITERIA_DEFS[key];
  if (!def) return { ok: false as const, error: "Critério inválido." };
  const r = computeCriteria(def, answers);
  return adminSaveResponse(userId, key, answers as Record<string, unknown>, r.count, {
    met: r.met,
    count: r.count,
    gateOk: r.gateOk,
  });
}

/** Apaga uma resposta de questionário (paciente: as próprias; médico: qualquer). */
export async function deleteQuestionnaireResponse(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("questionnaire_responses")
    .delete()
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
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
