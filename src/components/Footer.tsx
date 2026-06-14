import { CLINIC_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <div className="border-t border-navy-100 pt-6 text-center">
        <p className="text-xs text-navy-400">
          {CLINIC_NAME} · Reumatologia
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs text-navy-300">
          Ferramenta de apoio baseada nos critérios ACR 2016. Não substitui a
          avaliação médica nem constitui diagnóstico.
        </p>
      </div>
    </footer>
  );
}
