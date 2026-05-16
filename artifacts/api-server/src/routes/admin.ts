import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, userDataTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const CLERK_API = "https://api.clerk.com/v1";

function clerkHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

// Middleware: require admin role — fetches live user data from Clerk API
// (JWT session claims don't reliably include publicMetadata in all deployments)
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }
  try {
    const r = await fetch(`${CLERK_API}/users/${userId}`, { headers: clerkHeaders() });
    if (!r.ok) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    const user = await r.json() as { public_metadata?: { role?: string } };
    if (user.public_metadata?.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
  } catch (err) {
    logger.error(err, "requireAdmin lookup failed");
    res.status(500).json({ error: "Auth check failed" });
    return;
  }
  next();
}

// List all users
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const params = new URLSearchParams({ limit: "100", order_by: "-created_at" });
    const r = await fetch(`${CLERK_API}/users?${params}`, { headers: clerkHeaders() });
    const users = await r.json() as unknown[];
    res.json({ users });
  } catch (err) {
    req.log.error(err, "Admin list users error");
    res.status(500).json({ error: "Server error" });
  }
});

// Create user (admin-side, no verification)
const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
});

router.post("/admin/users", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { email, password, firstName, lastName, role } = parsed.data;

  try {
    const body: Record<string, unknown> = {
      email_address: [email],
      public_metadata: { role },
      skip_password_checks: true,
    };
    if (password) {
      body.password = password;
    } else {
      body.skip_password_requirement = true;
    }
    if (firstName) body.first_name = firstName;
    if (lastName) body.last_name = lastName;

    const r = await fetch(`${CLERK_API}/users`, {
      method: "POST",
      headers: clerkHeaders(),
      body: JSON.stringify(body),
    });
    const data = await r.json() as Record<string, unknown>;
    if (!r.ok) {
      const errors = data.errors as Array<{ message: string; long_message?: string }> | undefined;
      const message = errors?.[0]?.long_message ?? errors?.[0]?.message ?? "Failed to create user";
      res.status(r.status).json({ error: message });
      return;
    }
    res.status(201).json({ id: data.id });
  } catch (err) {
    req.log.error(err, "Admin create user error");
    res.status(500).json({ error: "Server error" });
  }
});

// Update user role
router.patch("/admin/users/:userId/role", requireAdmin, async (req, res) => {
  const { role } = z.object({ role: z.enum(["user", "admin"]) }).parse(req.body);
  try {
    const r = await fetch(`${CLERK_API}/users/${req.params.userId}`, {
      method: "PATCH",
      headers: clerkHeaders(),
      body: JSON.stringify({ public_metadata: { role } }),
    });
    if (!r.ok) {
      res.status(r.status).json({ error: "Failed to update role" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "Admin update role error");
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user
router.delete("/admin/users/:userId", requireAdmin, async (req, res) => {
  const { userId } = getAuth(req);
  if (req.params.userId === userId) {
    res.status(400).json({ error: "You cannot delete your own account" });
    return;
  }
  try {
    const r = await fetch(`${CLERK_API}/users/${req.params.userId}`, {
      method: "DELETE",
      headers: clerkHeaders(),
    });
    if (!r.ok) {
      res.status(r.status).json({ error: "Failed to delete user" });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    req.log.error(err, "Admin delete user error");
    res.status(500).json({ error: "Server error" });
  }
});

// TEMPORARY: copy all user-data rows from one account to another
// Used once to merge two accounts that exist due to separate Clerk sessions.
// Accepts X-Admin-Secret header as an alternative to Clerk session auth.
router.post("/admin/sync-user-data", async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== "SMX-ADMIN-A3E0DC333195C73107E46F455C6E4A57") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const schema = z.object({ fromUserId: z.string(), toUserId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "fromUserId and toUserId required" }); return; }
  const { fromUserId, toUserId } = parsed.data;
  try {
    const rows = await db.select().from(userDataTable).where(eq(userDataTable.userId, fromUserId));
    const results: string[] = [];
    for (const row of rows) {
      await db.insert(userDataTable)
        .values({ userId: toUserId, key: row.key, data: row.data })
        .onConflictDoUpdate({
          target: [userDataTable.userId, userDataTable.key],
          set: { data: row.data, updatedAt: new Date() },
        });
      results.push(row.key);
    }
    res.json({ ok: true, copiedKeys: results });
  } catch (err) {
    req.log.error(err, "sync-user-data error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
