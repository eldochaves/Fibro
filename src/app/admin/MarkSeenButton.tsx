"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminMarkActivitySeen } from "@/app/actions";

export function MarkSeenButton() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  return (
    <button
      type="button"
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        await adminMarkActivitySeen();
        router.refresh();
      }}
      className="btn-outline shrink-0 text-sm"
    >
      {saving ? "..." : "Marcar como visto"}
    </button>
  );
}
