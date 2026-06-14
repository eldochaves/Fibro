"use client";

import { useRef, useState } from "react";
import { updateProfile } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/Avatar";
import { formatCPF, formatPhone, isValidCPF } from "@/lib/masks";
import type { Profile } from "@/lib/session";

export function PerfilForm({
  profile,
  userId,
  defaultName,
  firstTime,
}: {
  profile: Profile | null;
  userId: string;
  defaultName?: string;
  firstTime: boolean;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(
    profile?.full_name ?? defaultName ?? ""
  );
  const [cpf, setCpf] = useState(formatCPF(profile?.cpf ?? ""));
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const [phone, setPhone] = useState(formatPhone(profile?.phone ?? ""));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    const path = `${userId}/avatar`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setError("Falha ao enviar a foto: " + upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(`${data.publicUrl}?v=${Date.now()}`);
    setUploading(false);
  }

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
      avatar_url: avatarUrl,
      redirectTo: firstTime ? "/questionario" : "/inicio",
    });
    setSaving(false);
    if (res && !res.ok) {
      setError(res.error ?? "Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {/* Foto de perfil */}
      <div className="flex items-center gap-4">
        <Avatar url={avatarUrl} name={fullName} size={64} />
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            className="btn-outline px-3 py-2 text-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Enviando..." : avatarUrl ? "Alterar foto" : "Adicionar foto"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              className="ml-2 text-sm font-medium text-red-600"
              onClick={() => setAvatarUrl(null)}
              disabled={uploading}
            >
              Remover
            </button>
          )}
        </div>
      </div>

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

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={saving || uploading}
      >
        {saving ? "Salvando..." : firstTime ? "Salvar e continuar" : "Salvar"}
      </button>
    </form>
  );
}
