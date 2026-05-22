import { SignIn } from "@clerk/react";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";

export default function SignInPage() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(160deg, hsl(228,35%,5%), hsl(228,40%,3%))" }}
    >
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
        className="relative w-full max-w-[460px]"
      >
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />

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
