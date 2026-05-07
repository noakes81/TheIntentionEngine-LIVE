import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SymbolicCard as SymbolicCardType } from "@/types";
import { SymbolicCard } from "@/components/SymbolicCard";
import { Input } from "@/components/ui/input";
import { Search, Database } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["all", "chakra", "solfeggio", "protection", "manifestation", "elements", "numerology"];

export default function Cards() {
  const [cards, setCards] = useLocalStorage<SymbolicCardType[]>("orgone_cards", []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const handleToggleFavorite = (id: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, favorited: !c.favorited } : c));
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch =
      card.title.toLowerCase().includes(search.toLowerCase()) ||
      card.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" ||
      card.category === category ||
      (category === "favorites" && card.favorited);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in fade-in duration-400 space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/25 mb-0.5">Orgone Manifestation X</div>
          <h1 className="text-2xl font-mono font-bold text-white/85">Filter Library</h1>
          <p className="text-xs font-mono text-white/30 mt-0.5">
            Browse and curate energetic archetypes for your radionic operations.
          </p>
        </div>
        {/* Search */}
        <div className="relative w-full md:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <Input
            placeholder="Search symbols..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-sm font-mono h-9"
            style={{
              background: "hsla(228,35%,6%,1)",
              border: "1px solid hsla(228,25%,16%,0.8)",
              color: "hsla(210,15%,78%,1)"
            }}
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div
        className="flex items-center gap-1 overflow-x-auto pb-1 flex-wrap"
      >
        {CATEGORIES.concat(["favorites"]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all capitalize"
            style={{
              background: category === cat
                ? "linear-gradient(135deg, hsla(270,55%,20%,1), hsla(270,45%,14%,1))"
                : "hsla(228,35%,6%,0.8)",
              border: category === cat
                ? "1px solid hsla(270,75%,50%,0.4)"
                : "1px solid hsla(228,25%,14%,0.8)",
              color: category === cat
                ? "hsla(270,75%,72%,1)"
                : "hsla(228,10%,38%,1)",
              boxShadow: category === cat ? "0 0 10px hsla(270,75%,58%,0.1)" : "none"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid divider */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-px" style={{ background: "hsla(270,75%,58%,0.4)" }} />
        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/25">
          {filteredCards.length} symbol{filteredCards.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards grid */}
      {filteredCards.length === 0 ? (
        <div
          className="rounded p-12 text-center"
          style={{
            background: "hsla(228,35%,6%,0.8)",
            border: "1px dashed hsla(228,25%,16%,0.8)"
          }}
        >
          <Database className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-sm font-mono text-white/25">No symbols found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredCards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <SymbolicCard
                {...card}
                onToggleFavorite={() => handleToggleFavorite(card.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
