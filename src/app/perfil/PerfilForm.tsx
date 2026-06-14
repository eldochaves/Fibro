"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import { formatCPF, formatPhone, isValidCPF } from "@/lib/masks";
import type { Profile } from "@/lib/session";

export function PerfilForm({
  profile,
  defaultName,
  firstTime,
}: {
  profile: Profile | null;
  defaultName?: string;
  firstTime: boolean;
}) {
  const [fullName, setFullName] = useState(
    profile?.full_name ?? defaultName ?? ""
  );
  const [cpf, setCpf] = useState(formatCPF(profile?.cpf ?? ""));
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const [phone, setPhone] = useState(formatPhone(profile?.phone ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidCPF(cpf)) {
      setError("CPF inválido. Confira os números digitados.");
      return;
    }

    setSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      cpf: cpf.replace(/\D/g, ""),
      birth_date: birthDate || null,
      phone: phone.replace(/\D/g, "") || null,
      redirectTo: firstTime ? "/questionario" : "/historico",
    });
    // Só chega aqui se NÃO houve redirect no servidor (ou seja, deu erro)
    setSaving(false);
    if (res && !res.ok) {
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
        <label className="label" htmlFor="cpf">
          CPF
        </label>
        <input
          id="cpf"
          className="input"
          value={cpf}
          onChange={(e) => setCpf(formatCPF(e.target.value))}
          required
          inputMode="numeric"
          placeholder="000.000.000-00"
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
          Telefone / WhatsApp <span className="text-navy-300">(opcional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          className="input"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
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
