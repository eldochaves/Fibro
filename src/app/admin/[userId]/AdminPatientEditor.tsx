"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateProfile } from "@/app/actions";

interface EditableProfile {
  id: string;
  full_name: string | null;
  birth_date: string | null;
  phone: string | null;
}

export function AdminPatientEditor({ profile }: { profile: EditableProfile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await adminUpdateProfile(profile.id, {
      full_name: fullName.trim(),
      birth_date: birthDate || null,
      phone: phone.trim() || null,
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(res.error ?? "Não foi possível salvar.");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline print:hidden"
      >
        ✏️ Editar dados
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 print:hidden"
    >
      <div>
        <label className="label" htmlFor="ed-name">
          Nome completo
        </label>
        <input
          id="ed-name"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ed-birth">
            Data de nascimento
          </label>
          <input
            id="ed-birth"
            type="date"
            className="input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ed-phone">
            Telefone
          </label>
          <input
            id="ed-phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setOpen(false)}
          disabled={saving}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
