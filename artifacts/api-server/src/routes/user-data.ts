import { Router } from "express";
import type { IRouter, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db, userDataTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const ALLOWED_KEYS = new Set([
  "orgone_operations",
  "orgone_cards",
  "orgone_transfer_diagram",
]);

router.get("/user-data/:key", async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const rawKey = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
  const key = String(rawKey);

  if (!ALLOWED_KEYS.has(key)) {
    res.status(400).json({ error: "Invalid key" });
    return;
  }

  const [row] = await db
    .select()
    .from(userDataTable)
    .where(and(eq(userDataTable.userId, userId), eq(userDataTable.key, key)));

  res.json({ data: row?.data ?? null });
});

router.put("/user-data/:key", async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const rawKey = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
  const key = String(rawKey);

  if (!ALLOWED_KEYS.has(key)) {
    res.status(400).json({ error: "Invalid key" });
    return;
  }

  const { data } = req.body as { data?: unknown };
  if (data === undefined) {
    res.status(400).json({ error: "Missing data" });
    return;
  }

  await db
    .insert(userDataTable)
    .values({ userId, key, data })
    .onConflictDoUpdate({
      target: [userDataTable.userId, userDataTable.key],
      set: { data, updatedAt: new Date() },
    });

  res.json({ ok: true });
});

export default router;
