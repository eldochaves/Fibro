"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QUESTIONNAIRES,
  DISEASES,
  DISEASE_LABEL,
  TENDINITE_SUBTYPES,
} from "@/lib/questionnaires";
import { diseaseTheme } from "@/lib/diseaseTheme";
import { buildWhatsappLink, buildMailtoLink } from "@/lib/whatsapp";
import { adminSendInfiltracao } from "@/app/actions";

export function ConviteGenerator({
  siteUrl,
  initialPhone = "",
  targetUserId,
}: {
  siteUrl: string;
  initialPhone?: string;
  targetUserId?: string;
}) {
  const [key, setKey] = useState(QUESTIONNAIRES[0]?.key ?? "");
  const [phone, setPhone] = useState(initialPhone);
  const [copied, setCopied] = useState(false);
  const [sites, setSites] = useState<string[]>([]);
  const [sentSites, setSentSites] = useState(false);

  const def = QUESTIONNAIRES.find((q) => q.key === key);
  const sitesParam =
    key === "infiltracao_tend" && sites.length > 0
      ? `?sites=${sites.join(",")}`
      : "";
  const link = `${siteUrl}/c/${key}${sitesParam}`;

  // Questionários agrupados por doença (genéricos como a EVA vão em "Geral").
  const groups = useMemo(
    () =>
      [
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
      ].filter((g) => g.items.length > 0),
    []
  );

  const diseaseTags = (def?.diseases ?? []).map((d) => DISEASE_LABEL[d] ?? d);

  const message = useMemo(
    () =>
      `Olá! O Dr. Eldo Chaves preparou um questionário para você responder ` +
      `antes da consulta: ${def?.name ?? ""}. Acesse o link, faça seu cadastro ` +
      `e responda — é rápido e gratuito: ${link}`,
    [def, link]
  );

  const wa = buildWhatsappLink(phone || "", message);
  const mail = buildMailtoLink(
    "",
    `${def?.name ?? "Questionário"} — Dr. Eldo Chaves`,
    message
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      {/* Escolha do questionário (agrupado por doença) */}
      <div className="card">
        <span className="label">Questionário do convite</span>
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-400">
                {g.icon} {g.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((q) => {
                  const active = q.key === key;
                  return (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => setKey(q.key)}
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
        {def && (
          <p className="mt-3 text-xs text-navy-500">
            Selecionado: <strong>{def.name}</strong>
            {diseaseTags.length > 0 && (
              <>
                {" "}
                · ao acessar, marca{" "}
                <strong>{diseaseTags.join(", ")}</strong> no paciente
              </>
            )}
          </p>
        )}
      </div>

      {/* Locais infiltrados — só para o feedback pós-infiltração */}
      {key === "infiltracao_tend" && (
        <div className="card">
          <span className="label">Locais infiltrados</span>
          <div className="flex flex-wrap gap-2">
            {TENDINITE_SUBTYPES.map((s) => {
              const active = sites.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setSentSites(false);
                    setSites((prev) =>
                      prev.includes(s.key)
                        ? prev.filter((k) => k !== s.key)
                        : [...prev, s.key]
                    );
                  }}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "border-purple-500 bg-purple-100 text-purple-800 ring-1 ring-purple-400"
                      : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {targetUserId ? (
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                disabled={sites.length === 0}
                onClick={async () => {
                  const r = await adminSendInfiltracao(targetUserId, sites);
                  if (r.ok) setSentSites(true);
                }}
                className="btn-outline text-sm"
              >
                Registrar locais para este paciente
              </button>
              {sentSites && (
                <span className="text-sm text-teal-700">✓ Registrado</span>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-navy-400">
              Os locais marcados já vão no link/QR e aparecerão{" "}
              <strong>pré-marcados</strong> para o paciente — ele pode ajustar se
              precisar.
            </p>
          )}
        </div>
      )}

      {/* QR + link */}
      <div className="card flex flex-col items-center gap-4 text-center">
        <div className="rounded-2xl border border-navy-100 bg-white p-4">
          <QRCodeSVG value={link} size={220} fgColor="#083858" level="M" />
        </div>
        <p className="text-sm text-navy-500">
          Mostre este QR ao paciente no consultório, ou envie o link. Ao
          escanear, ele faz o cadastro e o questionário <strong>{def?.name}</strong>{" "}
          abre automaticamente.
        </p>
        <div className="flex w-full items-center gap-2">
          <input className="input text-sm" readOnly value={link} />
          <button onClick={copy} className="btn-outline shrink-0">
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Enviar para o paciente */}
      <div className="card space-y-3">
        <span className="label">Enviar para o paciente</span>
        <input
          className="input"
          inputMode="tel"
          placeholder="WhatsApp do paciente (com DDD)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ backgroundColor: "#25D366" }}
            >
              💬 Enviar WhatsApp
            </a>
          ) : (
            <button className="btn-primary" disabled style={{ opacity: 0.5 }}>
              💬 Informe o WhatsApp
            </button>
          )}
          {mail && (
            <a href={mail} className="btn-outline">
              ✉️ Enviar por e-mail
            </a>
          )}
        </div>
        <p className="text-xs text-navy-400">
          O link serve para qualquer paciente: cada um que acessar terá este
          questionário liberado na própria conta.
        </p>
      </div>
    </div>
  );
}
