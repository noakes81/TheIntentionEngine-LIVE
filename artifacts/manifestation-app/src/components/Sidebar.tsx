import { Link, useLocation } from "wouter";
import { Activity, Compass, Database, FileText, Layers, PlayCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Operation } from "@/data/presets";

export function Sidebar() {
  const [location] = useLocation();
  const [operations] = useLocalStorage<Operation[]>("orgone_operations", []);
  
  const activeOperation = operations.find(op => op.status === 'running');

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/builder", label: "Builder", icon: Compass },
    { href: "/sequencer", label: "Sequencer", icon: Layers },
    { href: "/cards", label: "Library", icon: Database },
    { href: "/operations", label: "Operations", icon: PlayCircle },
    { href: "/export", label: "Export", icon: FileText },
  ];

  return (
    <aside className="w-64 h-screen border-r bg-sidebar flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-serif text-primary font-bold tracking-widest">ORGONE STUDIO</h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(157,78,221,0.15)]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {activeOperation && (
        <div className="p-4 m-4 rounded-xl bg-card border border-primary/30 shadow-[0_0_20px_rgba(157,78,221,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Active</span>
          </div>
          <p className="text-sm font-medium truncate">{activeOperation.name}</p>
          <p className="text-xs text-muted-foreground truncate">{activeOperation.frequencyHz} Hz</p>
        </div>
      )}
    </aside>
  );
}
