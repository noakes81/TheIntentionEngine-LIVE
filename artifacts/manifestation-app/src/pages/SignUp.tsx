import { useState } from "react";
import { useSignIn, useClerk } from "@clerk/react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Radio, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Create account via backend (Clerk admin API — no verification email)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      // Account created — sign in immediately using the new Clerk signals API
      if (!signIn) {
        setLocation("/sign-in");
        return;
      }

      const { error: createErr } = await signIn.create({ identifier: email, password });
      if (createErr) {
        setError(createErr.message ?? "Sign-in failed after registration.");
        return;
      }

      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId });
        setLocation("/");
      } else {
        // Multi-factor or other step — fall back to sign-in page
        setLocation("/sign-in");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(160deg, hsl(228,35%,5%), hsl(228,40%,3%))" }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, hsla(270,75%,30%,0.08), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-[420px]"
      >
        {/* Card */}
        <div
          className="rounded-md overflow-hidden"
          style={{
            border: "1px solid hsla(270,75%,45%,0.35)",
            background: "linear-gradient(160deg, hsl(228,35%,8%), hsl(228,40%,5%))",
            boxShadow: "0 0 40px hsla(270,75%,30%,0.15), 0 8px 40px hsla(0,0%,0%,0.5)",
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.svg" alt="The Intention Engine" className="h-10 w-auto" />
            </div>
            <h1 className="text-lg font-mono font-semibold text-white/90 tracking-wide">
              Create your account
            </h1>
            <p className="mt-1 text-[12px] font-mono text-white/30">
              Start your radionic journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            {/* Error */}
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

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded px-3 py-2 text-[13px] font-mono outline-none transition-colors"
                style={{
                  background: "hsla(228,35%,7%,1)",
                  border: "1px solid hsla(270,45%,30%,0.35)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded px-3 py-2 pr-9 text-[13px] font-mono outline-none transition-colors"
                  style={{
                    background: "hsla(228,35%,7%,1)",
                    border: "1px solid hsla(270,45%,30%,0.35)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">
                Confirm password
              </label>
              <input
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded px-3 py-2 text-[13px] font-mono outline-none transition-colors"
                style={{
                  background: "hsla(228,35%,7%,1)",
                  border: "1px solid hsla(270,45%,30%,0.35)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded py-2.5 text-[13px] font-mono font-semibold tracking-wide transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, hsla(270,75%,42%,1), hsla(270,65%,32%,1))",
                border: "1px solid hsla(270,75%,55%,0.5)",
                color: "white",
                boxShadow: "0 0 18px hsla(270,75%,58%,0.25)",
              }}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </button>

            {/* Divider + sign-in link */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px" style={{ background: "hsla(270,45%,20%,0.4)" }} />
              <span className="text-[11px] font-mono text-white/20">or</span>
              <div className="flex-1 h-px" style={{ background: "hsla(270,45%,20%,0.4)" }} />
            </div>

            <p className="text-center text-[12px] font-mono text-white/30">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <Radio className="w-3 h-3" style={{ color: "hsla(270,45%,28%,0.6)" }} />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/15">
            The Intention Engine
          </span>
        </div>
      </motion.div>
    </div>
  );
}
