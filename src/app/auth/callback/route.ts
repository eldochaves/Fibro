import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Troca o código OAuth por uma sessão e redireciona para a área do usuário. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`);
      const { data: isAdmin } = await supabase.rpc("is_admin");
      return NextResponse.redirect(
        `${origin}${isAdmin ? "/admin" : "/inicio"}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
