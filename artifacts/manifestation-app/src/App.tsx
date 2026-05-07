import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Builder from "@/pages/Builder";
import Sequencer from "@/pages/Sequencer";
import Cards from "@/pages/Cards";
import Operations from "@/pages/Operations";
import Export from "@/pages/Export";
import TransferDiagram from "@/pages/TransferDiagram";
import { useEffect } from "react";
import { PRESET_OPERATIONS, SYMBOLIC_CARDS_SEED } from "@/data/presets";
import { LicenseGate } from "@/components/LicenseGate";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/builder" component={Builder} />
        <Route path="/sequencer" component={Sequencer} />
        <Route path="/cards" component={Cards} />
        <Route path="/operations" component={Operations} />
        <Route path="/export" component={Export} />
        <Route path="/transfer-diagram" component={TransferDiagram} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    const initialized = localStorage.getItem("orgone_initialized");
    if (!initialized) {
      localStorage.setItem("orgone_operations", JSON.stringify(PRESET_OPERATIONS));
      localStorage.setItem("orgone_cards", JSON.stringify(SYMBOLIC_CARDS_SEED));
      localStorage.setItem("orgone_initialized", "true");
      window.dispatchEvent(new Event("local-storage-update"));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LicenseGate>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </LicenseGate>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
