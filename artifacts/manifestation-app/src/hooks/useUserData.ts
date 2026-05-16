import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function fetchUserData<T>(key: string): Promise<T | null> {
  const r = await fetch(`${BASE}/api/user-data/${encodeURIComponent(key)}`);
  if (!r.ok) {
    // Throw so callers can distinguish "no data" (null) from "auth/network error"
    throw new Error(`Fetch failed (HTTP ${r.status})`);
  }
  const json = await r.json() as { data: T | null };
  return json?.data ?? null;
}

export async function putUserData<T>(key: string, data: T): Promise<void> {
  const r = await fetch(`${BASE}/api/user-data/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!r.ok) {
    const status = r.status;
    throw new Error(`Save failed (HTTP ${status})`);
  }
}

export function useUserData<T>(key: string, initialValue: T): readonly [T, (v: T | ((prev: T) => T)) => void] {
  const queryClient = useQueryClient();
  const initialRef = useRef(initialValue);

  const { data } = useQuery<T | null>({
    queryKey: ["user-data", key],
    queryFn: () => fetchUserData<T>(key),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const value = (data !== null && data !== undefined) ? data : initialRef.current;

  const setValue = useCallback(
    (v: T | ((prev: T) => T)) => {
      const cached = queryClient.getQueryData<T | null>(["user-data", key]);
      const current = (cached !== null && cached !== undefined) ? cached : initialRef.current;
      const next = v instanceof Function ? v(current) : v;

      // Optimistic update
      queryClient.setQueryData(["user-data", key], next);

      putUserData(key, next).catch((err: unknown) => {
        // Roll back to previous value
        queryClient.setQueryData(["user-data", key], cached ?? initialRef.current);

        const isPayloadTooLarge = err instanceof Error && err.message.includes("413");
        toast({
          title: "Save failed",
          description: isPayloadTooLarge
            ? "Your operations data is too large (likely due to large photos). Try reducing image sizes."
            : "Changes could not be saved. Please check your connection and try again.",
          variant: "destructive",
        });
      });
    },
    [queryClient, key],
  );

  return [value, setValue] as const;
}
