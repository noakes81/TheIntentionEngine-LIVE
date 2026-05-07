import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { licenseKeysTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "node:crypto";

const router: IRouter = Router();

router.post("/licenses/validate", async (req, res) => {
  const schema = z.object({ key: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ valid: false, message: "Invalid request" });
    return;
  }

  const key = parsed.data.key.toUpperCase().trim();

  try {
    const [row] = await db
      .select()
      .from(licenseKeysTable)
      .where(eq(licenseKeysTable.key, key));

    if (!row || !row.isActive) {
      res.json({ valid: false, message: "License key not found or inactive" });
      return;
    }

    if (!row.activatedAt) {
      await db
        .update(licenseKeysTable)
        .set({ activatedAt: new Date() })
        .where(eq(licenseKeysTable.id, row.id));
    }

    res.json({ valid: true, label: row.label ?? null });
  } catch (err) {
    req.log.error(err, "License validation error");
    res.status(500).json({ valid: false, message: "Server error" });
  }
});

router.post("/licenses/generate", async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const schema = z.object({
    count: z.number().int().min(1).max(100).default(1),
    label: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { count, label } = parsed.data;
  const generated: string[] = [];

  for (let i = 0; i < count; i++) {
    const key =
      "ORGX-" +
      crypto.randomBytes(4).toString("hex").toUpperCase() +
      "-" +
      crypto.randomBytes(4).toString("hex").toUpperCase() +
      "-" +
      crypto.randomBytes(4).toString("hex").toUpperCase();

    await db.insert(licenseKeysTable).values({ key, label: label ?? null, isActive: true });
    generated.push(key);
  }

  res.json({ generated });
});

router.get("/licenses/list", async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(licenseKeysTable)
      .orderBy(licenseKeysTable.createdAt);
    res.json({ licenses: rows });
  } catch (err) {
    req.log.error(err, "License list error");
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/licenses/:key", async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await db
    .update(licenseKeysTable)
    .set({ isActive: false })
    .where(eq(licenseKeysTable.key, req.params.key.toUpperCase()));

  res.json({ revoked: true });
});

export default router;
