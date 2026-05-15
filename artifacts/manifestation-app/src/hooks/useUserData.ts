import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function fetchUserData<T>(key: string): Promise<T | null> {
  const r = await fetch(`${BASE}/api/user-data/${encodeURIComponent(key)}`);
  if (!r.ok) return null;
  const json = await r.json() as { data: T | null };
  return json?.data ?? null;
}

export async function putUserData<T>(key: string, data: T): Promise<void> {
  await fetch(`${BASE}/api/user-data/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
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
      queryClient.setQueryData(["user-data", key], next);
      putUserData(key, next).catch(() => {});
    },
    [queryClient, key],
  );

  return [value, setValue] as const;
}
