import Link from "next/link";

export function Header({
  email,
  isAdmin = false,
}: {
  email?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href={isAdmin ? "/admin" : "/historico"} className="flex items-center gap-2 font-bold">
          <span className="text-xl">🩺</span>
          <span className="text-sm sm:text-base">
            Fibromialgia {isAdmin && <span className="text-brand-600">· Médico</span>}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden max-w-[140px] truncate text-xs text-slate-500 sm:inline">
              {email}
            </span>
          )}
          <form action="/auth/signout" method="post">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
