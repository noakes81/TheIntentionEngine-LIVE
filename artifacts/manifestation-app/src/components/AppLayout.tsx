import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type BgPreset = "dark" | "nebula" | "matrix" | "plasma" | "aurora" | "golden" | "custom";

export interface BgSetting {
  preset: BgPreset;
  customUrl?: string;
}

export const BG_PRESETS: { id: BgPreset; label: string; swatch: string; style: React.CSSProperties }[] = [
  {
    id: "dark",
    label: "Dark",
    swatch: "linear-gradient(135deg, #0a0b14, #0d0e1c)",
    style: { background: "hsl(228,35%,5%)" },
  },
  {
    id: "nebula",
    label: "Nebula",
    swatch: "linear-gradient(135deg, #0d0520 0%, #0a0a22 50%, #050514 100%)",
    style: {
      background:
        "radial-gradient(ellipse at 20% 30%, hsla(270,65%,14%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 80% 70%, hsla(220,70%,10%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 55% 10%, hsla(290,55%,10%,1) 0%, transparent 40%)," +
        "hsl(240,40%,3%)",
    },
  },
  {
    id: "matrix",
    label: "Matrix",
    swatch: "linear-gradient(135deg, #010e01, #010a01)",
    style: {
      background:
        "radial-gradient(ellipse at 50% 20%, hsla(120,65%,7%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 20% 80%, hsla(120,50%,5%,1) 0%, transparent 50%)," +
        "hsl(120,40%,2%)",
    },
  },
  {
    id: "plasma",
    label: "Plasma",
    swatch: "linear-gradient(135deg, #120008, #0a000e)",
    style: {
      background:
        "radial-gradient(ellipse at 25% 35%, hsla(300,65%,12%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 75% 65%, hsla(340,70%,10%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 50% 90%, hsla(270,60%,8%,1) 0%, transparent 40%)," +
        "hsl(290,45%,2%)",
    },
  },
  {
    id: "aurora",
    label: "Aurora",
    swatch: "linear-gradient(135deg, #010e0c, #01090e)",
    style: {
      background:
        "radial-gradient(ellipse at 40% 10%, hsla(170,65%,8%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 70% 80%, hsla(195,70%,8%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 15% 60%, hsla(145,55%,6%,1) 0%, transparent 40%)," +
        "hsl(175,40%,2%)",
    },
  },
  {
    id: "golden",
    label: "Golden",
    swatch: "linear-gradient(135deg, #0e0800, #0a0600)",
    style: {
      background:
        "radial-gradient(ellipse at 35% 25%, hsla(38,70%,9%,1) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 70% 70%, hsla(28,65%,7%,1) 0%, transparent 50%)," +
        "hsl(35,40%,2%)",
    },
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [bg] = useLocalStorage<BgSetting>("orgone_bg", { preset: "dark" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeBg = BG_PRESETS.find(p => p.id === bg.preset) ?? BG_PRESETS[0];
  const bgStyle: React.CSSProperties =
    bg.preset === "custom" && bg.customUrl
      ? {
          backgroundImage: `url(${bg.customUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : activeBg.style;

  return (
    <div
      className="min-h-screen text-foreground flex"
      style={{ ...bgStyle, position: "relative" }}
    >
      {/* Subtle dot-grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(hsla(228,25%,14%,0.18) 1px, transparent 1px),
            linear-gradient(90deg, hsla(228,25%,14%,0.18) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at 60% 30%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 60% 30%, black 0%, transparent 80%)"
        }}
      />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: "hsla(228,40%,2%,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-64 min-h-screen relative z-10 flex flex-col">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 shrink-0 sticky top-0 z-20"
          style={{
            background: "linear-gradient(180deg, hsl(228,40%,4%) 0%, hsl(228,40%,3%) 100%)",
            borderBottom: "1px solid hsla(228,25%,11%,1)",
            boxShadow: "0 2px 16px hsla(0,0%,0%,0.4)",
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded transition-colors"
            style={{ color: "hsla(228,10%,45%,1)" }}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src="/intention-engine-logo.png"
            alt="The Intention Engine"
            className="h-14 w-auto object-contain"
          />
          <div className="w-9" />
        </div>

        {/* Desktop top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px hidden md:block"
          style={{ background: "linear-gradient(90deg, transparent 0%, hsla(270,75%,58%,0.15) 30%, hsla(270,75%,58%,0.15) 70%, transparent 100%)" }}
        />

        <div className="relative z-10 p-4 md:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
