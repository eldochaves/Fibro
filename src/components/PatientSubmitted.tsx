"use client";

import type { ReactNode } from "react";

/**
 * Confirmação calorosa mostrada ao PACIENTE após enviar um questionário.
 * Pode exibir o NÚMERO da pontuação (feedback), mas nunca faixas de
 * referência, categorias ("leve/grave"), "atende critérios" ou conclusões —
 * a interpretação é do médico. Assim o paciente vê sua evolução sem se
 * autoavaliar.
 */
export function PatientSubmitted({
  onBack,
  backLabel = "Voltar ao início",
  score,
}: {
  onBack: () => void;
  backLabel?: string;
  score?: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="card flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-4xl">
          💙
        </div>
        <h2 className="font-display text-2xl font-semibold text-navy-800">
          Recebemos suas respostas!
        </h2>
        {score && (
          <div className="rounded-xl bg-navy-50 px-4 py-2 text-base font-semibold text-navy-800">
            {score}
          </div>
        )}
        <p className="max-w-md text-base text-navy-600">
          Muito obrigado por dedicar esse tempo. Suas respostas foram enviadas
          com segurança ao <strong>Dr. Eldo Chaves</strong>, que vai analisá-las
          no seu acompanhamento.
        </p>
        <p className="max-w-md text-sm text-navy-400">
          O número acima ajuda a acompanhar a sua evolução. Quem interpreta o
          resultado é o seu médico. 🌿
        </p>
      </div>
      <button onClick={onBack} className="btn-primary w-full text-base">
        {backLabel}
      </button>
    </div>
  );
}
