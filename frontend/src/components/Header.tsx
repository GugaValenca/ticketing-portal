type User = {
  username: string;
  email?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

type HeaderProps = {
  user: User | null;
  onReload: () => void;
  onLogout: () => void;
  onNewTicket: () => void;
};

export default function Header({ user, onReload, onLogout, onNewTicket }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white">
                TP
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold leading-5">
                  Ticketing Portal
                </h1>
                <p className="truncate text-xs text-gray-500">
                  Projeto criado por Gustavo Valença.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewTicket}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              + Novo ticket
            </button>

            <button
              onClick={onReload}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Recarregar
            </button>

            <button
              onClick={onLogout}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Sair
            </button>
          </div>
        </div>

        {/* User bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm">
          <div className="text-gray-700">
            {user ? (
              <>
                <span className="font-medium">Logado como:</span>{" "}
                <span className="font-semibold">{user.username}</span>
                {user.email ? <span className="text-gray-500"> • {user.email}</span> : null}
              </>
            ) : (
              <span className="text-gray-500">Não autenticado</span>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-white px-2 py-1 border">
                staff: {String(!!user.is_staff)}
              </span>
              <span className="rounded-full bg-white px-2 py-1 border">
                superuser: {String(!!user.is_superuser)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
