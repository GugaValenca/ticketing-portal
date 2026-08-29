import { useState } from "react";
import { Modal } from "./ui/Modal";
import { auth } from "../lib/api";

export function ForgotPasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (sending) return;
    setEmail("");
    setSent(false);
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await auth.requestPasswordReset(email);
      setSent(true);
    } catch {
      setError("Could not send the reset link. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} title="Reset your password" onClose={handleClose}>
      {sent ? (
        <div className="grid gap-4">
          <p className="text-sm text-slate-100">
            If an account exists for <span className="font-semibold">{email}</span>, we've sent a
            link to reset the password. Check your inbox (and spam folder).
          </p>
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-400"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="reset-email" className="text-sm font-semibold text-slate-200">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              className="h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
            />
            <p className="text-xs text-slate-400">
              We'll email a link to set a new password if that address has an account.
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-300/35 bg-rose-500/15 p-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={sending}
              className="h-10 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-slate-100 hover:bg-white/20 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-400 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send reset link"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
