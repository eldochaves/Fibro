import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { QuestionarioForm } from "./QuestionarioForm";

export default async function QuestionarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header email={user?.email} />
      <main>
        <QuestionarioForm />
      </main>
    </>
  );
}
