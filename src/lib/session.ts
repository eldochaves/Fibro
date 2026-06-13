import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  birth_date: string | null;
  phone: string | null;
}

/**
 * Carrega o usuário autenticado, se é admin (médico) e o perfil.
 * Redireciona para /login se não houver sessão.
 */
export async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: isAdmin }, { data: profile }] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase
      .from("profiles")
      .select("id, full_name, email, birth_date, phone")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  return {
    supabase,
    user,
    isAdmin: Boolean(isAdmin),
    profile: (profile ?? null) as Profile | null,
  };
}

/** Perfil considerado completo quando há nome e data de nascimento. */
export function isProfileComplete(profile: Profile | null): boolean {
  return Boolean(profile?.full_name && profile?.birth_date);
}
