"use client";

/**
 * Confirmação calorosa mostrada ao PACIENTE após enviar um questionário.
 * Propositalmente NÃO mostra escores, categorias nem conclusões clínicas —
 * o paciente não deve se autoavaliar; os números ficam para o médico. Ainda
 * assim dá um retorno acolhedor para não desestimular o preenchimento.
 */
export function PatientSubmitted({
  onBack,
  backLabel = "Voltar ao início",
}: {
  onBack: () => void;
  backLabel?: string;
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
        <p className="max-w-md text-base text-navy-600">
          Muito obrigado por dedicar esse tempo. Suas respostas foram enviadas
          com segurança ao <strong>Dr. Eldo Chaves</strong>, que vai analisá-las
          no seu acompanhamento.
        </p>
        <p className="max-w-md text-sm text-navy-400">
          Você não precisa entender ou interpretar números — responder com
          sinceridade já é o que mais ajuda no seu cuidado. 🌿
        </p>
      </div>
      <button onClick={onBack} className="btn-primary w-full text-base">
        {backLabel}
      </button>
    </div>
  );
}
