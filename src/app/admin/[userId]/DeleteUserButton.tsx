"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteUser } from "@/app/actions";

export function DeleteUserButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirm1 = window.confirm(
      `Excluir o paciente ${name}? Isso apaga a conta e TODOS os dados ` +
        `(avaliações e diário de dor). Esta ação não pode ser desfeita.`
    );
    if (!confirm1) return;
    const typed = window.prompt('Para confirmar, digite EXCLUIR:');
    if (typed?.trim().toUpperCase() !== "EXCLUIR") return;

    setDeleting(true);
    setError(null);
    const res = await adminDeleteUser(userId);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(res.error ?? "Não foi possível excluir.");
      setDeleting(false);
    }
  }

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="btn-outline border-red-200 text-red-700 hover:bg-red-50"
      >
        {deleting ? "Excluindo..." : "🗑️ Excluir paciente"}
      </button>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
