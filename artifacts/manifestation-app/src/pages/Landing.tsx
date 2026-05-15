import { Link } from "wouter";
import { motion } from "framer-motion";
import { Radio, Zap, Layers, Target, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: "linear-gradient(160deg, hsl(228,35%,5%) 0%, hsl(228,40%,3%) 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 30%, hsla(270,75%,30%,0.09), transparent)",
        }}
      />

      {/* Header */}
      <header className="relative flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5"
        style={{ borderBottom: "1px solid hsla(270,45%,20%,0.25)" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <motion.div
            className="led-green shrink-0"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <span className="text-[13px] sm:text-[13px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.25em] text-white/40 truncate">
            The Intention Engine
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
          <Link href="/sign-in">
            <button
              className="px-3 sm:px-4 py-1.5 rounded text-[12px] font-mono transition-all whitespace-nowrap"
              style={{
                border: "1px solid hsla(270,45%,30%,0.4)",
                color: "hsla(270,75%,70%,0.85)",
                background: "hsla(270,35%,8%,0.8)",
              }}
            >
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button
              className="px-3 sm:px-4 py-1.5 rounded text-[12px] font-mono font-semibold transition-all whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,32%,1))",
                border: "1px solid hsla(270,75%,55%,0.5)",
                color: "white",
                boxShadow: "0 0 14px hsla(270,75%,58%,0.25)",
              }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="w-3.5 h-3.5 shrink-0" style={{ color: "hsla(270,75%,65%,0.7)" }} />
            <span className="text-[13px] font-mono uppercase tracking-[0.18em] text-white/35">
              ManifestIQ Professional Radionic System
            </span>
          </div>

          {/* Logo — hero branding */}
          <div>
            <img
              src="/intention-engine-logo.png"
              alt="The Intention Engine"
              className="mx-auto w-auto"
              style={{ maxWidth: "520px", maxHeight: "220px", width: "85vw" }}
            />
            <p className="mt-6 text-base sm:text-lg font-mono text-white/40 tracking-wide leading-relaxed">
              Virtual Radionic Device — Broadcast your intentions with precision
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-7 py-3 rounded text-sm font-mono font-semibold transition-all"
                style={{
                  background: "linear-gradient(135deg, hsla(270,75%,42%,1), hsla(270,65%,32%,1))",
                  border: "1px solid hsla(270,75%,58%,0.55)",
                  color: "white",
                  boxShadow: "0 0 24px hsla(270,75%,58%,0.3)",
                }}
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/sign-in">
              <button
                className="px-7 py-3 rounded text-sm font-mono transition-all"
                style={{
                  border: "1px solid hsla(270,45%,28%,0.4)",
                  color: "hsla(270,75%,70%,0.8)",
                  background: "hsla(270,35%,8%,0.6)",
                }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-16 w-full"
        >
          {[
            {
              icon: Target,
              title: "Radionic Operations",
              desc: "Define trend and target positions with precise rate dials and structural links.",
            },
            {
              icon: Zap,
              title: "Barrage Mode",
              desc: "Cycle through multiple operations automatically with configurable intervals.",
            },
            {
              icon: Layers,
              title: "Filter Library",
              desc: "Apply symbolic cards — chakras, solfeggio frequencies, and custom sigils.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="rounded p-4 text-left space-y-2"
              style={{
                background: "hsla(228,35%,7%,0.8)",
                border: "1px solid hsla(270,45%,18%,0.45)",
              }}
            >
              <f.icon className="w-4 h-4" style={{ color: "hsla(270,75%,65%,0.7)" }} />
              <p className="text-sm font-mono font-medium text-white/75">{f.title}</p>
              <p className="text-[12px] font-mono text-white/30 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative px-8 py-5 flex flex-col items-center justify-center gap-1.5"
        style={{ borderTop: "1px solid hsla(270,45%,15%,0.25)" }}>
        <div className="flex items-center gap-2">
          <Radio className="w-3 h-3" style={{ color: "hsla(228,25%,22%,1)" }} />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/15">
            ManifestIQ Professional Radionic System · theintentionengine.com
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/10">
          © 2026 The Intention Engine. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
