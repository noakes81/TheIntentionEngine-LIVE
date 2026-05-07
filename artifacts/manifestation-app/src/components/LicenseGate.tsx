import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Loader2, ShieldCheck, ShieldX, Radio } from "lucide-react";

const STORAGE_KEY = "orgone_license_key";

async function validateKeyRemote(key: string): Promise<boolean> {
  try {
    const res = await fetch("/api/licenses/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

function LicenseScreen({
  onUnlock,
}: {
  onUnlock: (key: string) => void;
}) {
  const [inputKey, setInputKey] = useState("");
  const [phase, setPhase] = useState<"idle" | "validating" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = inputKey.trim().toUpperCase();
    if (!key) return;
    setPhase("validating");
    setErrorMsg("");

    const valid = await validateKeyRemote(key);
    if (valid) {
      localStorage.setItem(STORAGE_KEY, key);
      onUnlock(key);
    } else {
      setPhase("error");
      setErrorMsg("Invalid or inactive license key.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: "linear-gradient(160deg, hsla(228,35%,5%,1) 0%, hsla(228,40%,3%,1) 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, hsla(270,75%,30%,0.08), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Header panel */}
        <div
          className="rounded-t p-6 text-center"
          style={{
            background:
              "linear-gradient(160deg, hsla(228,35%,8%,1), hsla(228,40%,6%,1))",
            border: "1px solid hsla(270,75%,45%,0.3)",
            borderBottom: "none",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              className="led-green"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/25">
              SMX Virtual Device — Activation Required
            </span>
          </div>

          <div className="flex justify-center mb-3">
            <div
              className="w-16 h-16 rounded flex items-center justify-center"
              style={{
                background: "hsla(270,45%,12%,1)",
                border: "1px solid hsla(270,75%,40%,0.4)",
                boxShadow: "0 0 30px hsla(270,75%,40%,0.15)",
              }}
            >
              <Key className="w-7 h-7" style={{ color: "hsla(270,75%,65%,0.9)" }} />
            </div>
          </div>

          <h1 className="text-xl font-mono font-bold text-white/90 tracking-wide mb-1">
            The Intention Engine
          </h1>
          <p className="text-xs font-mono text-white/35 tracking-wider">
            Super Manifestation X — Professional Radionic System
          </p>
        </div>

        {/* Key entry panel */}
        <form
          onSubmit={handleSubmit}
          className="rounded-b p-6 space-y-4"
          style={{
            background:
              "linear-gradient(160deg, hsla(228,35%,7%,1), hsla(228,40%,5%,1))",
            border: "1px solid hsla(270,75%,45%,0.3)",
            borderTop: "1px solid hsla(228,25%,14%,1)",
            boxShadow: "0 8px 40px hsla(270,75%,30%,0.12)",
          }}
        >
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">
              License Key
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  if (phase === "error") setPhase("idle");
                }}
                placeholder="ORGX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                spellCheck={false}
                autoComplete="off"
                className="w-full px-4 py-3 rounded font-mono text-sm tracking-wider outline-none transition-all"
                style={{
                  background: "hsla(228,35%,5%,1)",
                  border:
                    phase === "error"
                      ? "1px solid hsla(0,70%,45%,0.6)"
                      : "1px solid hsla(270,45%,30%,0.4)",
                  color: "hsla(270,70%,80%,1)",
                  caretColor: "hsla(270,75%,65%,1)",
                  boxShadow:
                    phase === "error"
                      ? "0 0 12px hsla(0,70%,40%,0.12)"
                      : "0 0 12px hsla(270,75%,40%,0.08)",
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              {phase === "error" && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 mt-2"
                >
                  <ShieldX className="w-3.5 h-3.5 shrink-0" style={{ color: "hsla(0,70%,55%,0.9)" }} />
                  <span className="text-[11px] font-mono" style={{ color: "hsla(0,70%,60%,0.9)" }}>
                    {errorMsg}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={phase === "validating" || !inputKey.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-mono text-sm font-medium transition-all disabled:opacity-50"
            style={
              phase === "validating"
                ? {
                    background: "hsla(270,45%,15%,1)",
                    border: "1px solid hsla(270,75%,40%,0.3)",
                    color: "hsla(270,75%,65%,0.8)",
                  }
                : {
                    background:
                      "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,32%,1))",
                    border: "1px solid hsla(270,75%,55%,0.5)",
                    color: "white",
                    boxShadow: "0 0 16px hsla(270,75%,50%,0.25)",
                  }
            }
          >
            {phase === "validating" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Activate License
              </>
            )}
          </button>

          <p className="text-center text-[11px] font-mono text-white/20 leading-relaxed">
            Enter the license key provided with your purchase.
            <br />
            Keys follow the format{" "}
            <span style={{ color: "hsla(270,60%,55%,0.6)" }}>
              ORGX-XXXXXXXX-XXXXXXXX-XXXXXXXX
            </span>
          </p>
        </form>

        {/* Bottom device info */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Radio className="w-3 h-3" style={{ color: "hsla(228,25%,22%,1)" }} />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/15">
            SMX Professional Radionic Software
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function BootScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "hsla(228,40%,3%,1)" }}
    >
      <div className="text-center space-y-3">
        <motion.div
          className="w-10 h-10 mx-auto rounded border flex items-center justify-center"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            border: "1px solid hsla(270,75%,45%,0.4)",
            background: "hsla(270,45%,10%,1)",
          }}
        >
          <Key className="w-5 h-5" style={{ color: "hsla(270,75%,65%,0.8)" }} />
        </motion.div>
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/25">
          Verifying License...
        </p>
      </div>
    </div>
  );
}

export function LicenseGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"booting" | "unlocked" | "locked">("booting");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setPhase("locked");
      return;
    }
    validateKeyRemote(saved).then((valid) => {
      if (valid) {
        setPhase("unlocked");
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setPhase("locked");
      }
    });
  }, []);

  if (phase === "booting") return <BootScreen />;
  if (phase === "locked")
    return <LicenseScreen onUnlock={() => setPhase("unlocked")} />;
  return <>{children}</>;
}
