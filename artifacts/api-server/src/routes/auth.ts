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

async function clerkPost(path: string, body: unknown, secretKey: string) {
  return fetch(`${CLERK_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
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
    // Create user via Clerk admin API
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

    // Pre-verify the email so no OTP confirmation is needed at sign-in
    const emailAddresses = body.email_addresses as Array<{ id: string }> | undefined;
    const emailId = emailAddresses?.[0]?.id;
    if (emailId) {
      await clerkPost(`/email_addresses/${emailId}/verify`, { strategy: "admin" }, secretKey);
    }

    res.status(201).json({ id: body.id });
  } catch (err) {
    logger.error(err, "Signup error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
