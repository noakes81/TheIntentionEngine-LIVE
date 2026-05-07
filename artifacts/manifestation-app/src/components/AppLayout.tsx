import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen relative">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(hsla(228,25%,14%,0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsla(228,25%,14%,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 80% at 60% 30%, black 0%, transparent 80%)"
          }}
        />
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, hsla(270,75%,58%,0.15) 30%, hsla(270,75%,58%,0.15) 70%, transparent 100%)" }} />
        <div className="relative z-10 p-6 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
