import { BrandMark } from "./BrandMark";
import { COMPANY_NAME } from "../branding";

export function LoginScreen({
  username,
  password,
  rememberMe,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onRememberMeChange,
  onForgotPassword,
  onSubmit,
}: {
  username: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  error: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onForgotPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#120825] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-700/30 blur-[120px]" />
        <div className="absolute right-[-120px] top-[80px] h-[460px] w-[460px] rounded-full bg-indigo-700/35 blur-[130px]" />
        <div className="absolute bottom-[-180px] left-[15%] h-[520px] w-[520px] rounded-full bg-rose-700/30 blur-[140px]" />
        <div className="absolute bottom-[-220px] right-[8%] h-[560px] w-[560px] rounded-full bg-blue-400/35 blur-[150px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[38px] border border-white/20 bg-white/10 px-6 py-8 shadow-[0_35px_80px_rgba(17,6,42,0.65)] backdrop-blur-xl sm:px-8 sm:py-9">
          <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
            <BrandMark className="h-24 w-24" />
          </div>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{COMPANY_NAME}</h1>
            <p className="mt-1 text-sm text-indigo-200/85">ISP service desk portal</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-7">
            <div className="space-y-1.5">
              <label htmlFor="username" className="flex items-center gap-3 text-xl text-white/85">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white/80"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20 4H4a2 2 0 0 0-2 2v.4l10 5.6 10-5.6V6a2 2 0 0 0-2-2Zm2 4.2-9.5 5.3a1 1 0 0 1-1 0L2 8.2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.2Z" />
                </svg>
                Username or Email
              </label>
              <input
                id="username"
                className="h-11 w-full rounded-sm border-0 border-b border-white/60 bg-transparent px-1 text-base text-white outline-none placeholder:text-white/55 focus:border-white focus-visible:ring-2 focus-visible:ring-violet-300/70"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                autoComplete="username"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="flex items-center gap-3 text-xl text-white/85">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white/80"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 8.7V18a1 1 0 1 0 2 0v-1.3a2 2 0 1 0-2 0ZM10 8V6a2 2 0 1 1 4 0v2h-4Z" />
                </svg>
                Password
              </label>
              <input
                id="password"
                type="password"
                className="h-11 w-full rounded-sm border-0 border-b border-white/60 bg-transparent px-1 text-base text-white outline-none placeholder:text-white/55 focus:border-white focus-visible:ring-2 focus-visible:ring-violet-300/70"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                autoComplete="current-password"
                placeholder="Password"
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-white/80">
              <label className="inline-flex items-center gap-2 text-base">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => onRememberMeChange(e.target.checked)}
                  className="h-4 w-4 rounded accent-fuchsia-500 focus-visible:ring-2 focus-visible:ring-violet-300/70"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-base italic text-white/70 underline-offset-2 transition hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-800/90 via-indigo-700/90 to-blue-400/90 text-3xl font-semibold tracking-[0.25em] text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {loading ? "SIGNING IN..." : "LOGIN"}
            </button>

            {error ? (
              <div className="rounded-lg border border-rose-300/35 bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-100">
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
