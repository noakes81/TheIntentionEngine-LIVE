import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Compass, Database, FileText, Layers, PlayCircle, Hexagon, Palette, Upload, X, Check, Zap, LogOut, User, Shield } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { BG_PRESETS, BgSetting, BgPreset } from "./AppLayout";
import { useClerk, useUser } from "@clerk/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [operations] = useLocalStorage<Operation[]>("orgone_operations", []);
  const [bg, setBg] = useLocalStorage<BgSetting>("orgone_bg", { preset: "dark" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const customFileRef = useRef<HTMLInputElement>(null);
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const activeOperation = operations.find(op => op.status === 'running');
  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  const navItems = [
    { href: "/", label: "Control Panel", icon: Activity },
    { href: "/builder", label: "Position Builder", icon: Compass },
    { href: "/barrage", label: "Barrage Mode", icon: Zap },
    { href: "/sequencer", label: "Sequencer", icon: Layers },
    { href: "/cards", label: "Filter Library", icon: Database },
    { href: "/operations", label: "Operations", icon: PlayCircle },
    { href: "/transfer-diagram", label: "Transfer Diagram", icon: Hexagon },
    { href: "/export", label: "Export", icon: FileText },
  ];

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setBg({ preset: "custom", customUrl: url });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <aside
      className={`w-64 h-screen flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } md:z-20`}
      style={{
        background: "linear-gradient(180deg, hsl(228,40%,4%) 0%, hsl(228,40%,3%) 100%)",
        borderRight: "1px solid hsla(228,25%,12%,1)",
        boxShadow: "2px 0 20px hsla(0,0%,0%,0.4)"
      }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid hsla(228,25%,11%,1)" }}
      >
        <img
          src="/intention-engine-logo.png"
          alt="The Intention Engine"
          className="h-auto object-contain"
          style={{ maxHeight: "140px", width: "calc(100% - 2rem)" }}
        />
        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-1.5 rounded shrink-0 transition-colors"
          style={{ color: "hsla(228,10%,35%,1)" }}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
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
      <nav className="flex-1 py-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded text-xs font-medium transition-all duration-150 ${
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
              <Icon className="w-4 h-4 md:w-3.5 md:h-3.5 shrink-0" />
              <span className="tracking-wide">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* Admin link — only visible to admins */}
        {isLoaded && isAdmin && (
          <Link
            href="/admin"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded text-xs font-medium transition-all duration-150 mt-1 ${
              location === "/admin"
                ? "text-primary"
                : "text-white/35 hover:text-white/65 hover:bg-white/4"
            }`}
            style={location === "/admin" ? {
              background: "linear-gradient(90deg, hsla(270,55%,15%,1), hsla(270,35%,9%,1))",
              border: "1px solid hsla(270,75%,45%,0.3)",
              boxShadow: "0 0 10px hsla(270,75%,58%,0.08)"
            } : { border: "1px solid transparent" }}
          >
            <Shield className="w-4 h-4 md:w-3.5 md:h-3.5 shrink-0" />
            <span className="tracking-wide">Admin Panel</span>
            {location === "/admin" && <div className="ml-auto w-1 h-1 rounded-full bg-primary" />}
          </Link>
        )}
      </nav>

      {/* Bottom info + BG picker */}
      <div className="px-3 pb-3 shrink-0"
        style={{ borderTop: "1px solid hsla(228,25%,10%,1)" }}
      >
        <div className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="led-off" />
            <span className="text-[11px] font-mono text-white/20 uppercase tracking-widest">
              {activeOperation ? "Field Active" : "Standby"}
            </span>
          </div>

          {/* Background picker toggle */}
          <button
            type="button"
            onClick={() => setPickerOpen(v => !v)}
            className="flex items-center gap-1 px-2 py-1 rounded transition-all"
            style={{
              background: pickerOpen ? "hsla(270,45%,14%,1)" : "hsla(228,25%,9%,1)",
              border: pickerOpen ? "1px solid hsla(270,75%,40%,0.4)" : "1px solid hsla(228,25%,15%,0.8)",
              color: pickerOpen ? "hsla(270,75%,65%,1)" : "hsla(228,10%,35%,1)"
            }}
            title="Change background"
          >
            <Palette className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase tracking-widest">BG</span>
          </button>
        </div>

        {/* Background picker panel */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: "hsla(228,10%,30%,1)" }}>
                  Background
                </div>

                {/* Preset swatches grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {BG_PRESETS.map(preset => {
                    const isActive = bg.preset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setBg({ preset: preset.id as BgPreset })}
                        className="relative rounded overflow-hidden transition-all"
                        style={{
                          border: isActive
                            ? "1.5px solid hsla(270,75%,55%,0.8)"
                            : "1.5px solid hsla(228,25%,14%,0.8)",
                          boxShadow: isActive ? "0 0 8px hsla(270,75%,45%,0.3)" : "none"
                        }}
                        title={preset.label}
                      >
                        <div
                          className="h-8 w-full"
                          style={{ background: preset.swatch }}
                        />
                        <div className="py-0.5 px-1 text-center"
                          style={{ background: "hsla(228,35%,5%,0.9)" }}>
                          <span className="text-[9px] font-mono"
                            style={{ color: isActive ? "hsla(270,75%,65%,1)" : "hsla(228,10%,35%,1)" }}>
                            {preset.label}
                          </span>
                        </div>
                        {isActive && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ background: "hsla(270,75%,55%,1)" }}>
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Custom upload */}
                  <button
                    type="button"
                    onClick={() => customFileRef.current?.click()}
                    className="relative rounded overflow-hidden transition-all flex flex-col items-center justify-center gap-0.5"
                    style={{
                      height: "52px",
                      border: bg.preset === "custom"
                        ? "1.5px solid hsla(270,75%,55%,0.8)"
                        : "1.5px dashed hsla(228,25%,20%,0.8)",
                      background: bg.preset === "custom" && bg.customUrl
                        ? `url(${bg.customUrl}) center/cover no-repeat`
                        : "hsla(228,25%,7%,0.8)",
                      boxShadow: bg.preset === "custom" ? "0 0 8px hsla(270,75%,45%,0.3)" : "none"
                    }}
                    title="Upload custom background"
                  >
                    {bg.preset === "custom" && bg.customUrl ? (
                      <>
                        <div className="absolute inset-0" style={{ background: "hsla(228,35%,3%,0.55)" }} />
                        <Check className="w-3 h-3 relative z-10" style={{ color: "hsla(270,75%,65%,1)" }} />
                        <span className="text-[9px] font-mono relative z-10" style={{ color: "hsla(270,65%,65%,1)" }}>Custom</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" style={{ color: "hsla(228,10%,30%,1)" }} />
                        <span className="text-[9px] font-mono" style={{ color: "hsla(228,10%,30%,1)" }}>Upload</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clear custom */}
                {bg.preset === "custom" && (
                  <button
                    type="button"
                    onClick={() => setBg({ preset: "dark" })}
                    className="w-full flex items-center justify-center gap-1 py-1 rounded text-[10px] font-mono transition-all"
                    style={{
                      background: "hsla(0,35%,8%,0.8)",
                      border: "1px solid hsla(0,50%,25%,0.4)",
                      color: "hsla(0,70%,55%,0.7)"
                    }}
                  >
                    <X className="w-2.5 h-2.5" /> Clear Custom
                  </button>
                )}

                <input
                  ref={customFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomUpload}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User profile + sign out */}
      {isLoaded && user && (
        <div
          className="px-3 py-3 mt-auto"
          style={{ borderTop: "1px solid hsla(270,45%,15%,0.35)" }}
        >
          <div className="flex items-center gap-2.5 rounded px-2 py-2"
            style={{ background: "hsla(228,35%,7%,0.6)" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              style={{ border: "1px solid hsla(270,75%,45%,0.4)", background: "hsla(270,35%,12%,1)" }}
            >
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5" style={{ color: "hsla(270,75%,65%,0.8)" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono text-white/60 truncate leading-tight">
                {user.primaryEmailAddress?.emailAddress ?? user.username ?? "Account"}
              </p>
              <p className="text-[10px] font-mono text-white/25 truncate leading-tight">Active</p>
            </div>
            <button
              type="button"
              onClick={() => void signOut().then(() => setLocation("/"))}
              title="Sign out"
              className="shrink-0 p-1 rounded transition-colors hover:text-red-400"
              style={{ color: "hsla(228,10%,35%,1)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
