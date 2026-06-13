"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteAssessment } from "@/app/actions";

export function DeleteAssessmentButton({
  assessmentId,
  userId,
}: {
  assessmentId: string;
  userId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        "Apagar esta avaliação? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }
    setDeleting(true);
    const res = await adminDeleteAssessment(assessmentId, userId);
    setDeleting(false);
    if (res.ok) {
      router.refresh();
    } else {
      window.alert(res.error ?? "Não foi possível apagar.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 print:hidden"
    >
      {deleting ? "Apagando..." : "🗑️ Apagar"}
    </button>
  );
}
