import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const CLERK_API = "https://api.clerk.com/v1";

function clerkHeaders(secretKey: string) {
  return {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };
}

// Temporary founder seeding endpoint — protected by ADMIN_SECRET.
// Creates or upgrades the founder account in whichever Clerk environment
// the server is running in (dev or production). Safe to call multiple times.
router.post("/seed/founder", async (req: Request, res: Response) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Clerk not configured" });
    return;
  }

  const { email, password, firstName, lastName } = req.body as {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const headers = clerkHeaders(secretKey);

  // Check if user already exists
  const searchRes = await fetch(
    `${CLERK_API}/users?query=${encodeURIComponent(email)}&limit=1`,
    { headers }
  );
  const existing = await searchRes.json() as Array<{ id: string; email_addresses: Array<{ id: string }> }>;

  let userId: string;
  let emailId: string | undefined;

  if (Array.isArray(existing) && existing.length > 0) {
    // User exists — just upgrade role and verify email
    userId = existing[0].id;
    emailId = existing[0].email_addresses?.[0]?.id;
  } else {
    // Create fresh account
    const createRes = await fetch(`${CLERK_API}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email_address: [email],
        password,
        first_name: firstName ?? "Nathan",
        last_name: lastName ?? "Oakes",
        skip_password_checks: false,
        public_metadata: { role: "admin", title: "Founder" },
      }),
    });

    const created = await createRes.json() as {
      id?: string;
      email_addresses?: Array<{ id: string }>;
      errors?: unknown;
    };

    if (!createRes.ok) {
      res.status(500).json({ error: "Failed to create user", details: created });
      return;
    }

    userId = created.id!;
    emailId = created.email_addresses?.[0]?.id;
  }

  // Pre-verify the email (no OTP needed at sign-in)
  if (emailId) {
    await fetch(`${CLERK_API}/email_addresses/${emailId}/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({ strategy: "admin" }),
    });
  }

  // Set admin role + Founder title
  await fetch(`${CLERK_API}/users/${userId}/metadata`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      public_metadata: { role: "admin", title: "Founder" },
    }),
  });

  res.json({ message: "Founder account ready", userId });
});

export default router;
