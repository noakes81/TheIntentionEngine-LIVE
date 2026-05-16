import { useState } from "react";
import { useUser } from "@clerk/react";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, Loader2, Check, Radio } from "lucide-react";

export default function AccountPage() {
  const { user, isLoaded } = useUser();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPw !== confirmPw) {
      setError("New passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await user.updatePassword({ currentPassword: currentPw, newPassword: newPw });
      setSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        (err instanceof Error ? err.message : "Password update failed.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <div className="animate-in fade-in duration-400 max-w-lg pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="hidden sm:flex items-center gap-2 mb-0.5">
          <KeyRound className="w-3.5 h-3.5" style={{ color: "hsla(270,75%,65%,0.6)" }} />
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/25">Account Security</span>
        </div>
        <h1 className="text-xl md:text-2xl font-mono font-bold text-white/90 tracking-wide">Change Password</h1>
        <p className="text-xs font-mono text-white/30 mt-1">
          Update the password for <span className="text-white/50">{user?.primaryEmailAddress?.emailAddress}</span>
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-md overflow-hidden"
        style={{
          border: "1px solid hsla(270,75%,45%,0.25)",
          background: "linear-gradient(160deg, hsl(228,35%,8%), hsl(228,40%,5%))",
          boxShadow: "0 0 30px hsla(270,75%,30%,0.1), 0 4px 24px hsla(0,0%,0%,0.4)",
        }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: "1px solid hsla(228,25%,11%,1)" }}
        >
          <div className="led-off" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/25">Security Settings</span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Success banner */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded px-3 py-2.5 flex items-center gap-2 text-[12px] font-mono"
              style={{
                background: "hsla(120,60%,10%,0.6)",
                border: "1px solid hsla(120,60%,30%,0.4)",
                color: "hsla(120,75%,58%,0.9)",
              }}
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              Password updated successfully.
            </motion.div>
          )}

          {/* Error banner */}
          {error && (
            <div
              className="rounded px-3 py-2.5 text-[12px] font-mono text-red-400/90"
              style={{
                background: "hsla(0,70%,20%,0.3)",
                border: "1px solid hsla(0,70%,45%,0.3)",
              }}
            >
              {error}
            </div>
          )}

          {/* Current password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">
              Current password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                required
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className="w-full rounded px-3 py-2 pr-9 text-[13px] font-mono outline-none transition-colors"
                style={{
                  background: "hsla(228,35%,7%,1)",
                  border: "1px solid hsla(270,45%,30%,0.35)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                required
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="w-full rounded px-3 py-2 pr-9 text-[13px] font-mono outline-none transition-colors"
                style={{
                  background: "hsla(228,35%,7%,1)",
                  border: "1px solid hsla(270,45%,30%,0.35)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">
              Confirm new password
            </label>
            <input
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full rounded px-3 py-2 text-[13px] font-mono outline-none transition-colors"
              style={{
                background: "hsla(228,35%,7%,1)",
                border: "1px solid hsla(270,45%,30%,0.35)",
                color: "rgba(255,255,255,0.85)",
              }}
            />
          </div>

          {/* Strength hint */}
          <p className="text-[11px] font-mono text-white/20">
            Minimum 8 characters. Use a mix of letters, numbers, and symbols for a strong password.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !currentPw || !newPw || !confirmPw}
            className="w-full rounded py-2.5 text-[13px] font-mono font-semibold tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            style={{
              background: "linear-gradient(135deg, hsla(270,75%,42%,1), hsla(270,65%,32%,1))",
              border: "1px solid hsla(270,75%,55%,0.5)",
              color: "white",
              boxShadow: "0 0 18px hsla(270,75%,58%,0.2)",
            }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>

      {/* Session diagnostics */}
      <div
        className="rounded-md mt-5 px-4 py-3 space-y-1.5"
        style={{
          border: "1px solid hsla(228,25%,14%,1)",
          background: "hsla(228,35%,6%,0.6)",
        }}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Session info</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-white/25">User ID</span>
          <span className="text-[11px] font-mono text-white/45 break-all text-right select-all">
            {user?.id ?? "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-white/25">Email</span>
          <span className="text-[11px] font-mono text-white/45 text-right">
            {user?.primaryEmailAddress?.emailAddress ?? "—"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Radio className="w-3 h-3" style={{ color: "hsla(270,45%,28%,0.5)" }} />
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/15">
          The Intention Engine
        </span>
      </div>
    </div>
  );
}
