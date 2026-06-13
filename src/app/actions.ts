"use server";

import { redirect } from "next/navigation";
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

/** Atualiza dados básicos do perfil do paciente. */
export async function updateProfile(data: {
  full_name?: string;
  birth_date?: string | null;
  phone?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      birth_date: data.birth_date || null,
      phone: data.phone || null,
    })
    .eq("id", user.id);

  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
