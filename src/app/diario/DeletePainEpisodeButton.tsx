"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePainEpisode } from "@/app/actions";

export function DeletePainEpisodeButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Apagar este episódio?")) return;
    setDeleting(true);
    const res = await deletePainEpisode(id);
    setDeleting(false);
    if (res.ok) router.refresh();
    else window.alert(res.error ?? "Não foi possível apagar.");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {deleting ? "..." : "Apagar"}
    </button>
  );
}
