import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext } from "@/lib/session";
import { SITE_URL } from "@/lib/config";
import { QUESTIONNAIRE_BY_KEY } from "@/lib/questionnaires";
import { normalizeFrequency, isPending } from "@/lib/availability";
import { LembretesList, type ReminderItem } from "./LembretesList";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  questionnaires: string[] | null;
  questionnaire_freq: Record<string, string> | null;
  questionnaire_requests: Record<string, string> | null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function LembretesPage() {
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const [{ data: profiles }, { data: acr }, { data: qrs }, { data: admins }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, avatar_url, questionnaires, questionnaire_freq, questionnaire_requests"
        ),
      supabase
        .from("assessments")
        .select("user_id, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("questionnaire_responses")
        .select("user_id, questionnaire_key, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("admin_emails").select("email"),
    ]);

  const adminEmails = new Set(
    (admins ?? []).map((a: { email: string }) => a.email.toLowerCase())
  );

  // Última data por (paciente, questionário)
  const last = new Map<string, string>(); // `${user}|${key}`
  for (const a of (acr ?? []) as { user_id: string; created_at: string }[]) {
    const k = `${a.user_id}|acr2016`;
    if (!last.has(k)) last.set(k, a.created_at);
  }
  for (const r of (qrs ?? []) as {
    user_id: string;
    questionnaire_key: string;
    created_at: string;
  }[]) {
    const k = `${r.user_id}|${r.questionnaire_key}`;
    if (!last.has(k)) last.set(k, r.created_at);
  }

  const items: ReminderItem[] = [];
  for (const p of (profiles ?? []) as ProfileRow[]) {
    if (p.email && adminEmails.has(p.email.toLowerCase())) continue;
    const freqMap = p.questionnaire_freq ?? {};
    const reqMap = p.questionnaire_requests ?? {};
    for (const key of p.questionnaires ?? []) {
      const def = QUESTIONNAIRE_BY_KEY[key];
      if (!def) continue;
      const freq = normalizeFrequency(freqMap[key]);
      const lastIso = last.get(`${p.id}|${key}`) ?? null;
      if (!isPending(freq, lastIso, reqMap[key])) continue;
      items.push({
        userId: p.id,
        name: p.full_name,
        email: p.email,
        phone: p.phone,
        avatarUrl: p.avatar_url,
        questionnaireKey: key,
        questionnaireName: def.name,
        reason: lastIso
          ? `Reaberto — última resposta em ${fmt(lastIso)}`
          : "Ainda não respondeu",
      });
    }
  }

  items.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm font-medium text-teal-600"
        >
          ← Pacientes
        </Link>
        <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
          Para responder agora
        </h1>
        <p className="mb-6 mt-1 text-sm text-navy-500">
          Pacientes com questionário em aberto: ainda não respondido (inclui
          &quot;apenas uma vez&quot;) ou recorrente que reabriu. Envie o lembrete
          com um toque.
        </p>
        <LembretesList items={items} siteUrl={SITE_URL} />
      </main>
      <Footer />
    </>
  );
}
