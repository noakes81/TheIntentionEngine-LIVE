import { Router, type IRouter } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/auth/signup", async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }

  const { email, password } = parsed.data;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    res.status(500).json({ error: "Auth not configured" });
    return;
  }

  try {
    const clerkRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        password,
        skip_password_checks: false,
      }),
    });

    const body = await clerkRes.json() as Record<string, unknown>;

    if (!clerkRes.ok) {
      const errors = body.errors as Array<{ message: string; long_message?: string }> | undefined;
      const message = errors?.[0]?.long_message ?? errors?.[0]?.message ?? "Registration failed";
      res.status(clerkRes.status).json({ error: message });
      return;
    }

    res.status(201).json({ id: body.id });
  } catch (err) {
    logger.error(err, "Signup error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
