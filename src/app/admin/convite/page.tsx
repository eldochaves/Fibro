import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext } from "@/lib/session";
import { SITE_URL } from "@/lib/config";
import { ConviteGenerator } from "./ConviteGenerator";

export const dynamic = "force-dynamic";

export default async function ConvitePage() {
  const { user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm font-medium text-teal-600"
        >
          ← Pacientes
        </Link>
        <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
          Convite por QR / link
        </h1>
        <p className="mb-6 mt-1 text-sm text-navy-500">
          Gere um QR Code para mostrar no consultório, ou um link para enviar
          antes da consulta. O paciente se cadastra e o questionário abre na hora.
        </p>
        <ConviteGenerator siteUrl={SITE_URL} />
      </main>
      <Footer />
    </>
  );
}
