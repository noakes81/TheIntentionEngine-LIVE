import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Builder from "@/pages/Builder";
import Sequencer from "@/pages/Sequencer";
import Cards from "@/pages/Cards";
import Operations from "@/pages/Operations";
import Export from "@/pages/Export";
import TransferDiagram from "@/pages/TransferDiagram";
import Barrage from "@/pages/Barrage";
import Landing from "@/pages/Landing";
import { PRESET_OPERATIONS, SYMBOLIC_CARDS_SEED } from "@/data/presets";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(270, 75%, 58%)",
    colorForeground: "rgba(255,255,255,0.88)",
    colorMutedForeground: "rgba(255,255,255,0.38)",
    colorDanger: "hsl(0, 70%, 55%)",
    colorBackground: "hsl(228, 40%, 6%)",
    colorInput: "hsl(228, 35%, 9%)",
    colorInputForeground: "rgba(255,255,255,0.85)",
    colorNeutral: "hsl(270, 45%, 35%)",
    fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: {
      width: "440px",
      maxWidth: "100%",
      overflow: "hidden",
      borderRadius: "0.375rem",
      border: "1px solid hsla(270,75%,45%,0.35)",
      background: "linear-gradient(160deg, hsl(228,35%,8%), hsl(228,40%,5%))",
      boxShadow: "0 0 40px hsla(270,75%,30%,0.15), 0 8px 40px hsla(0,0%,0%,0.5)",
    } as React.CSSProperties,
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-mono text-white/90 tracking-wide",
    headerSubtitle: "font-mono text-white/35",
    socialButtonsBlockButtonText: "font-mono text-white/65",
    formFieldLabel: "font-mono text-white/40 text-[11px] uppercase tracking-widest",
    footerActionLink: "font-mono text-purple-400 hover:text-purple-300",
    footerActionText: "font-mono text-white/30",
    dividerText: "font-mono text-white/20",
    identityPreviewEditButton: "font-mono text-purple-400",
    formFieldSuccessText: "font-mono text-green-400",
    alertText: "font-mono text-red-400/90",
    logoBox: "mb-1",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: {
      border: "1px solid hsla(270,45%,30%,0.4)",
      background: "hsla(270,35%,8%,1)",
      color: "rgba(255,255,255,0.7)",
    } as React.CSSProperties,
    formButtonPrimary: "font-mono font-semibold tracking-wide",
    formFieldInput: {
      background: "hsla(228,35%,7%,1)",
      border: "1px solid hsla(270,45%,30%,0.35)",
      color: "rgba(255,255,255,0.85)",
      fontFamily: "inherit",
    } as React.CSSProperties,
    footerAction: "bg-transparent",
    dividerLine: { background: "hsla(270,45%,20%,0.4)" } as React.CSSProperties,
    alert: {
      background: "hsla(0,70%,20%,0.3)",
      border: "1px solid hsla(0,70%,45%,0.3)",
    } as React.CSSProperties,
    otpCodeFieldInput: "font-mono",
    formFieldRow: "",
    main: "",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevIdRef.current !== undefined && prevIdRef.current !== id) qc.clear();
      prevIdRef.current = id;
    });
    return unsub;
  }, [addListener, qc]);

  return null;
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!localStorage.getItem("orgone_initialized")) {
      localStorage.setItem("orgone_operations", JSON.stringify(PRESET_OPERATIONS));
      localStorage.setItem("orgone_cards", JSON.stringify(SYMBOLIC_CARDS_SEED));
      localStorage.setItem("orgone_initialized", "true");
      window.dispatchEvent(new Event("local-storage-update"));
    }
  }, []);
  return <>{children}</>;
}

function MainApp() {
  return (
    <AppInitializer>
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/builder" component={Builder} />
          <Route path="/sequencer" component={Sequencer} />
          <Route path="/cards" component={Cards} />
          <Route path="/operations" component={Operations} />
          <Route path="/export" component={Export} />
          <Route path="/transfer-diagram" component={TransferDiagram} />
          <Route path="/barrage" component={Barrage} />
        </Switch>
      </AppLayout>
    </AppInitializer>
  );
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in"><MainApp /></Show>
      <Show when="signed-out"><Landing /></Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <AppInitializer>
          <AppLayout>
            <Component />
          </AppLayout>
        </AppInitializer>
      </Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function SignInPage() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(160deg, hsl(228,35%,5%), hsl(228,40%,3%))" }}
    >
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(160deg, hsl(228,35%,5%), hsl(228,40%,3%))" }}
    >
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to The Intention Engine",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Start your radionic journey",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/builder">
              <ProtectedRoute component={Builder} />
            </Route>
            <Route path="/sequencer">
              <ProtectedRoute component={Sequencer} />
            </Route>
            <Route path="/cards">
              <ProtectedRoute component={Cards} />
            </Route>
            <Route path="/operations">
              <ProtectedRoute component={Operations} />
            </Route>
            <Route path="/export">
              <ProtectedRoute component={Export} />
            </Route>
            <Route path="/transfer-diagram">
              <ProtectedRoute component={TransferDiagram} />
            </Route>
            <Route path="/barrage">
              <ProtectedRoute component={Barrage} />
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
