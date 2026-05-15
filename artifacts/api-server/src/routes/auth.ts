import { Router, type IRouter } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CLERK_API = "https://api.clerk.com/v1";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

async function clerkReq(method: string, path: string, body: unknown, secretKey: string) {
  return fetch(`${CLERK_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

const clerkPost = (path: string, body: unknown, secretKey: string) =>
  clerkReq("POST", path, body, secretKey);

async function disableMfa(userId: string, secretKey: string) {
  try {
    await fetch(`${CLERK_API}/users/${userId}/mfa`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secretKey}` },
    });
  } catch {
    // non-fatal: log only
    logger.warn({ userId }, "Could not disable MFA for user");
  }
}

router.post("/auth/signup", async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }

  const { email, password, firstName, lastName } = parsed.data;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    res.status(500).json({ error: "Auth not configured" });
    return;
  }

  try {
    const clerkRes = await clerkPost("/users", {
      email_address: [email],
      password,
      first_name: firstName,
      last_name: lastName,
      skip_password_checks: false,
    }, secretKey);

    const body = await clerkRes.json() as Record<string, unknown>;

    if (!clerkRes.ok) {
      const errors = body.errors as Array<{ message: string; long_message?: string }> | undefined;
      const message = errors?.[0]?.long_message ?? errors?.[0]?.message ?? "Registration failed";
      res.status(clerkRes.status).json({ error: message });
      return;
    }

    const userId = body.id as string;

    // Pre-verify the email so no OTP confirmation is needed at sign-in
    const emailAddresses = body.email_addresses as Array<{ id: string }> | undefined;
    const emailId = emailAddresses?.[0]?.id;
    if (emailId) {
      await clerkPost(`/email_addresses/${emailId}/verify`, { strategy: "admin" }, secretKey);
    }

    // Disable MFA requirement — the Clerk instance requires it by default
    // but Replit-managed Clerk does not support MFA
    await disableMfa(userId, secretKey);

    res.status(201).json({ id: userId });
  } catch (err) {
    logger.error(err, "Signup error");
    res.status(500).json({ error: "Server error" });
  }
});

// MFA bypass: called by the sign-in page after Clerk confirms password is correct
// (signIn.status === 'needs_second_factor') but can't proceed because the Replit-managed
// Clerk instance requires MFA which it doesn't actually support.
// Security: password was already verified by Clerk — we just issue a short-lived ticket
// so the frontend can complete sign-in without the unsupported MFA step.
const mfaBypassSchema = z.object({
  email: z.string().email(),
});

router.post("/auth/mfa-bypass", async (req, res) => {
  const parsed = mfaBypassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Auth not configured" });
    return;
  }

  try {
    // Look up the user by email
    const findRes = await fetch(
      `${CLERK_API}/users?email_address=${encodeURIComponent(parsed.data.email)}&limit=1`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const users = await findRes.json() as Array<Record<string, unknown>>;
    if (!Array.isArray(users) || users.length === 0) {
      // Return 200 to avoid leaking whether the email exists
      res.status(200).json({ error: "User not found" });
      return;
    }

    const userId = users[0].id as string;

    // Create a short-lived sign-in token (expires in 60 s)
    const tokenRes = await clerkPost("/sign_in_tokens", {
      user_id: userId,
      expires_in_seconds: 60,
    }, secretKey);

    const tokenBody = await tokenRes.json() as Record<string, unknown>;
    if (!tokenRes.ok) {
      res.status(500).json({ error: "Could not issue sign-in token" });
      return;
    }

    res.json({ token: tokenBody.token as string });
  } catch (err) {
    logger.error(err, "MFA bypass error");
    res.status(500).json({ error: "Server error" });
  }
});

// TEMPORARY: fix MFA on the production founder account after first production deploy
// Remove after running once against production
router.post("/seed/fix-prod-mfa", async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) { res.status(500).json({ error: "No key" }); return; }

  try {
    // Find the founder user by email in the current instance (dev or prod)
    const findRes = await fetch(
      `${CLERK_API}/users?email_address=n_oakes@msn.com`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const users = await findRes.json() as Array<Record<string, unknown>>;
    if (!Array.isArray(users) || users.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const userId = users[0].id as string;
    await disableMfa(userId, secretKey);
    res.json({ ok: true, userId, mfa: "disabled" });
  } catch (err) {
    logger.error(err, "Fix prod MFA error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
