import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SymbolicCard as SymbolicCardType } from "@/types";
import { SymbolicCard } from "@/components/SymbolicCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Cards() {
  const [cards, setCards] = useLocalStorage<SymbolicCardType[]>("orgone_cards", []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = ["all", "chakra", "solfeggio", "protection", "manifestation", "elements", "numerology"];

  const handleToggleFavorite = (id: string) => {
    setCards(cards.map(c => 
      c.id === id ? { ...c, favorited: !c.favorited } : c
    ));
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase()) || 
                         card.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || card.category === category || (category === "favorites" && card.favorited);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-primary tracking-tight">Symbolic Library</h1>
          <p className="text-muted-foreground mt-2">Browse and curate energetic archetypes for your operations.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search symbols..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-primary/20"
          />
        </div>
      </header>

      <Tabs defaultValue="all" onValueChange={setCategory}>
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <TabsList className="bg-background/50 border border-border/50 h-auto p-1">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="capitalize tracking-wider text-xs px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                {cat}
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="favorites"
              className="capitalize tracking-wider text-xs px-4 py-2 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
            >
              Favorites
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map(card => (
            <SymbolicCard 
              key={card.id}
              {...card}
              onToggleFavorite={() => handleToggleFavorite(card.id)}
            />
          ))}
          
          {filteredCards.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No symbols found matching your criteria.
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
