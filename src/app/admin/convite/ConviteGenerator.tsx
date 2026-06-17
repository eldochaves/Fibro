"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QUESTIONNAIRES } from "@/lib/questionnaires";
import { buildWhatsappLink, buildMailtoLink } from "@/lib/whatsapp";

export function ConviteGenerator({ siteUrl }: { siteUrl: string }) {
  const [key, setKey] = useState(QUESTIONNAIRES[0]?.key ?? "");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const def = QUESTIONNAIRES.find((q) => q.key === key);
  const link = `${siteUrl}/c/${key}`;

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
      {/* Escolha do questionário */}
      <div className="card">
        <span className="label">Questionário</span>
        <div className="flex flex-wrap gap-2">
          {QUESTIONNAIRES.map((q) => {
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
                {q.name}
              </button>
            );
          })}
        </div>
      </div>

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
