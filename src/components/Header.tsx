import Link from "next/link";
import Image from "next/image";
import { CLINIC_NAME } from "@/lib/config";

export function Header({
  email,
  isAdmin = false,
}: {
  email?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-navy-100/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href={isAdmin ? "/admin" : "/historico"}
          className="flex items-center gap-2.5"
          aria-label={CLINIC_NAME}
        >
          <Image
            src="/logo.png"
            alt={CLINIC_NAME}
            width={170}
            height={47}
            priority
            className="h-8 w-auto sm:h-9"
          />
          {isAdmin && (
            <span className="chip-teal hidden sm:inline-flex">Médico</span>
          )}
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {email && (
            <span className="hidden max-w-[180px] truncate text-sm text-navy-400 md:inline">
              {email}
            </span>
          )}
          <form action="/auth/signout" method="post">
            <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-navy-600 transition hover:bg-navy-50 hover:text-navy-900">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
