import { Link, useLocation } from "wouter";
import { Activity, Compass, Database, FileText, Layers, PlayCircle, Hexagon, Radio } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation } from "@/types";
import { motion } from "framer-motion";

export function Sidebar() {
  const [location] = useLocation();
  const [operations] = useLocalStorage<Operation[]>("orgone_operations", []);
  
  const activeOperation = operations.find(op => op.status === 'running');

  const navItems = [
    { href: "/", label: "Control Panel", icon: Activity },
    { href: "/builder", label: "Position Builder", icon: Compass },
    { href: "/sequencer", label: "Sequencer", icon: Layers },
    { href: "/cards", label: "Filter Library", icon: Database },
    { href: "/operations", label: "Operations", icon: PlayCircle },
    { href: "/transfer-diagram", label: "Transfer Diagram", icon: Hexagon },
    { href: "/export", label: "Export", icon: FileText },
  ];

  return (
    <aside className="w-56 h-screen flex flex-col fixed left-0 top-0 z-20"
      style={{
        background: "linear-gradient(180deg, hsl(228,40%,4%) 0%, hsl(228,40%,3%) 100%)",
        borderRight: "1px solid hsla(228,25%,12%,1)",
        boxShadow: "2px 0 20px hsla(0,0%,0%,0.4)"
      }}
    >
      {/* Logo / Brand */}
      <div className="h-14 flex items-center px-4 gap-3 shrink-0"
        style={{ borderBottom: "1px solid hsla(228,25%,11%,1)" }}
      >
        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, hsla(270,75%,45%,1), hsla(270,75%,30%,1))",
            boxShadow: "0 0 10px hsla(270,75%,58%,0.4), inset 0 1px 0 hsla(255,100%,100%,0.15)"
          }}
        >
          <Radio className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/90 leading-none">Orgone</div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-primary/70 leading-none mt-0.5">Manifestation X</div>
        </div>
      </div>

      {/* Transmission status */}
      {activeOperation && (
        <div className="mx-3 mt-3 rounded px-3 py-2 shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsla(270,45%,10%,1), hsla(270,35%,7%,1))",
            border: "1px solid hsla(270,75%,45%,0.4)",
            boxShadow: "0 0 16px hsla(270,75%,45%,0.12)"
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, hsla(270,75%,58%,0.6), transparent)" }} />
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              className="led-green"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary/80">Transmitting</span>
          </div>
          <p className="text-[11px] font-medium text-white/80 truncate leading-tight">{activeOperation.name}</p>
          <p className="text-[11px] font-mono text-primary/50 mt-0.5">{activeOperation.frequencyHz} Hz</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "text-primary"
                  : "text-white/35 hover:text-white/65 hover:bg-white/4"
              }`}
              style={isActive ? {
                background: "linear-gradient(90deg, hsla(270,55%,15%,1), hsla(270,35%,9%,1))",
                border: "1px solid hsla(270,75%,45%,0.3)",
                boxShadow: "0 0 10px hsla(270,75%,58%,0.08)"
              } : { border: "1px solid transparent" }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="tracking-wide">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="px-3 pb-3 shrink-0"
        style={{ borderTop: "1px solid hsla(228,25%,10%,1)" }}
      >
        <div className="pt-3 flex items-center gap-2">
          <div className="led-off" />
          <span className="text-[11px] font-mono text-white/20 uppercase tracking-widest">
            {activeOperation ? "Field Active" : "Standby"}
          </span>
        </div>
      </div>
    </aside>
  );
}
