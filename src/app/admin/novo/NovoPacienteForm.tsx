"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreatePatient } from "@/app/actions";
import { formatCPF, formatPhone, isValidCPF } from "@/lib/masks";
import {
  DISEASES,
  DISEASE_LABEL,
  QUESTIONNAIRES,
} from "@/lib/questionnaires";
import { diseaseTheme } from "@/lib/diseaseTheme";

export function NovoPacienteForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [questionnaires, setQuestionnaires] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleQ(key: string) {
    setQuestionnaires((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (cpf && !isValidCPF(cpf)) {
      setError("CPF inválido. Confira os números (ou deixe em branco).");
      return;
    }
    setSaving(true);
    const res = await adminCreatePatient({
      full_name: fullName.trim(),
      cpf: cpf.replace(/\D/g, "") || null,
      birth_date: birthDate || null,
      phone: phone.replace(/\D/g, "") || null,
      email: email.trim() || null,
      questionnaires,
    });
    if (res.ok) {
      router.push(`/admin/${res.userId}`);
      router.refresh();
    } else {
      setSaving(false);
      setError(res.error ?? "Não foi possível cadastrar.");
    }
  }

  // Questionários agrupados por doença (genéricos como a EVA ficam em "Geral").
  const groups = [
    ...DISEASES.map((d) => ({
      key: d.key,
      label: DISEASE_LABEL[d.key],
      icon: diseaseTheme(d.key).icon,
      items: QUESTIONNAIRES.filter((q) => q.diseases.includes(d.key)),
    })),
    {
      key: "_geral",
      label: "Geral",
      icon: "📏",
      items: QUESTIONNAIRES.filter((q) => q.diseases.length === 0),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="n-name">
          Nome completo
        </label>
        <input
          id="n-name"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="n-cpf">
            CPF <span className="text-navy-300">(opcional)</span>
          </label>
          <input
            id="n-cpf"
            className="input"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            inputMode="numeric"
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <label className="label" htmlFor="n-birth">
            Data de nascimento <span className="text-navy-300">(opcional)</span>
          </label>
          <input
            id="n-birth"
            type="date"
            className="input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="n-phone">
            Telefone <span className="text-navy-300">(opcional)</span>
          </label>
          <input
            id="n-phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            inputMode="tel"
            placeholder="(00) 00000-0000"
          />
        </div>
        <div>
          <label className="label" htmlFor="n-email">
            E-mail <span className="text-navy-300">(opcional)</span>
          </label>
          <input
            id="n-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            placeholder="paciente@email.com"
          />
        </div>
      </div>

      {/* Questionários (opcional) — marcam a doença automaticamente */}
      <div>
        <span className="label">
          Questionários para liberar{" "}
          <span className="font-normal text-navy-300">(opcional)</span>
        </span>
        <p className="mb-2 text-xs text-navy-400">
          Ao marcar um questionário, a doença correspondente já é atribuída ao
          paciente. Você pode ajustar tudo depois na ficha.
        </p>
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-400">
                {g.icon} {g.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((q) => {
                  const active = questionnaires.includes(q.key);
                  return (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => toggleQ(q.key)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500"
                          : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
                      }`}
                    >
                      {q.indexLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="text-xs text-navy-400">
        A conta é criada para você acompanhar o paciente. Se informar um e-mail,
        ele poderá acessar depois com aquele endereço.
      </p>

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? "Cadastrando..." : "Cadastrar paciente"}
      </button>
    </form>
  );
}
