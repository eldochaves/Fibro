import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a SERVICE ROLE KEY — ignora RLS e permite operações
 * administrativas (ex.: excluir uma conta de usuário em auth.users).
 *
 * Use SOMENTE no servidor (Server Actions / Route Handlers). Nunca exponha
 * a chave no cliente. Retorna null se a chave não estiver configurada.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
