import Image from "next/image";
import { CLINIC_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-12 bg-navy-800 text-white print:hidden">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <Image
          src="/logo-white.png"
          alt={CLINIC_NAME}
          width={220}
          height={61}
          className="h-10 w-auto opacity-95"
        />
        <p className="max-w-md text-xs leading-relaxed text-white/60">
          Ferramenta de apoio baseada nos critérios ACR 2016. Não substitui a
          avaliação médica nem constitui diagnóstico.
        </p>
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} {CLINIC_NAME} · Reumatologia
        </p>
      </div>
    </footer>
  );
}
