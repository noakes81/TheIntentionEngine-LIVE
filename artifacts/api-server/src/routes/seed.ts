import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const CLERK_API = "https://api.clerk.com/v1";

function clerkHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

// Temporary founder seeding endpoint — protected by ADMIN_SECRET, not Clerk auth.
// Call once to create the founder account in the production Clerk environment, then remove this file.
router.post("/seed/founder", async (req: Request, res: Response) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { email, password, firstName, lastName } = req.body as {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  // Check if user already exists
  const searchRes = await fetch(
    `${CLERK_API}/users?query=${encodeURIComponent(email)}&limit=1`,
    { headers: clerkHeaders() }
  );
  const existing = (await searchRes.json()) as Array<{ id: string }>;
  if (Array.isArray(existing) && existing.length > 0) {
    res.json({ message: "User already exists", userId: existing[0].id });
    return;
  }

  // Create user with admin role
  const createRes = await fetch(`${CLERK_API}/users`, {
    method: "POST",
    headers: clerkHeaders(),
    body: JSON.stringify({
      email_address: [email],
      password,
      first_name: firstName ?? "Nathan",
      last_name: lastName ?? "Oakes",
      skip_password_checks: false,
      skip_password_requirement: false,
      public_metadata: { role: "admin", title: "Founder" },
    }),
  });

  const created = await createRes.json() as { id?: string; errors?: unknown };

  if (!createRes.ok) {
    res.status(500).json({ error: "Failed to create user", details: created });
    return;
  }

  res.json({ message: "Founder account created", userId: created.id });
});

export default router;
