import { useState } from "react";
import { BrandMark } from "./BrandMark";
import { COMPANY_NAME } from "../branding";
import { auth } from "../lib/api";

export function ResetPasswordScreen({
  uid,
  token,
  onDone,
}: {
  uid: string;
  token: string;
  onDone: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await auth.confirmPasswordReset(uid, token, newPassword);
      setDone(true);
    } catch {
      setError(
        "This reset link is invalid or has expired. Request a new one from the login screen.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
            <p className="mt-1 text-sm text-indigo-200/85">Set a new password</p>
          </div>

          {done ? (
            <div className="grid gap-6">
              <p className="text-sm text-indigo-100">
                Your password has been updated. Any other signed-in devices have been signed out.
              </p>
              <button
                type="button"
                onClick={onDone}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-800/90 via-indigo-700/90 to-blue-400/90 text-xl font-semibold tracking-wide text-white shadow-lg transition hover:opacity-95"
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-base text-white/85">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="h-11 w-full rounded-sm border-0 border-b border-white/60 bg-transparent px-1 text-base text-white outline-none placeholder:text-white/55 focus:border-white focus-visible:ring-2 focus-visible:ring-violet-300/70"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-base text-white/85">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="h-11 w-full rounded-sm border-0 border-b border-white/60 bg-transparent px-1 text-base text-white outline-none placeholder:text-white/55 focus:border-white focus-visible:ring-2 focus-visible:ring-violet-300/70"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat the password above"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-800/90 via-indigo-700/90 to-blue-400/90 text-2xl font-semibold tracking-[0.15em] text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {submitting ? "SAVING..." : "SET NEW PASSWORD"}
              </button>

              {error ? (
                <div className="rounded-lg border border-rose-300/35 bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={onDone}
                className="w-full text-center text-sm text-white/70 underline-offset-2 hover:text-white hover:underline"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
