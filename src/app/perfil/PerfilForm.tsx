"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions";
import type { Profile } from "@/lib/session";

export function PerfilForm({
  profile,
  firstTime,
}: {
  profile: Profile | null;
  firstTime: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await updateProfile({
      full_name: fullName.trim(),
      birth_date: birthDate || null,
      phone: phone.trim() || null,
    });
    setSaving(false);
    if (res.ok) {
      router.push(firstTime ? "/questionario" : "/historico");
      router.refresh();
    } else {
      setError(res.error ?? "Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="fullName">
          Nome completo
        </label>
        <input
          id="fullName"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div>
        <label className="label" htmlFor="birthDate">
          Data de nascimento
        </label>
        <input
          id="birthDate"
          type="date"
          className="input"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <div>
        <label className="label" htmlFor="phone">
          Telefone / WhatsApp <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          placeholder="(00) 00000-0000"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? "Salvando..." : firstTime ? "Salvar e continuar" : "Salvar"}
      </button>
    </form>
  );
}
