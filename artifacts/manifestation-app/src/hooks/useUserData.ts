import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function storageKey(key: string) {
  return key;
}

function readLocalUserData<T>(key: string): T | null {
  const raw = localStorage.getItem(storageKey(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeLocalUserData<T>(key: string, data: T): void {
  localStorage.setItem(storageKey(key), JSON.stringify(data));
}

export async function fetchUserData<T>(key: string): Promise<T | null> {
  if (!API_BASE) {
    return readLocalUserData<T>(key);
  }

  const r = await fetch(`${API_BASE}/api/user-data/${encodeURIComponent(key)}`, {
    credentials: "include",
  });
  if (!r.ok) {
    throw new Error(`Fetch failed (HTTP ${r.status})`);
  }
  const json = await r.json() as { data: T | null };
  return json?.data ?? null;
}

export async function putUserData<T>(key: string, data: T): Promise<void> {
  if (!API_BASE) {
    writeLocalUserData(key, data);
    return;
  }

  const r = await fetch(`${API_BASE}/api/user-data/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ data }),
  });
  if (!r.ok) {
    throw new Error(`Save failed (HTTP ${r.status})`);
  }
}

export interface SetValueOptions {
  /** When true, a failed save is dropped silently - no toast, no cache rollback.
   *  Use for high-frequency background writes (e.g. timer ticks) where a transient
   *  network error should not interrupt the user. */
  silent?: boolean;
}

export function useUserData<T>(key: string, initialValue: T): readonly [T, (v: T | ((prev: T) => T), opts?: SetValueOptions) => void] {
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
    (v: T | ((prev: T) => T), opts?: SetValueOptions) => {
      const cached = queryClient.getQueryData<T | null>(["user-data", key]);
      const current = (cached !== null && cached !== undefined) ? cached : initialRef.current;
      const next = v instanceof Function ? v(current) : v;

      queryClient.setQueryData(["user-data", key], next);

      putUserData(key, next).catch((err: unknown) => {
        if (opts?.silent) return;

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
