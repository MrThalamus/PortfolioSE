"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import {
  consumeRateLimit,
  getClientIp,
  minutesUntil,
  peekRateLimit,
  rateLimitKey,
  resetRateLimit,
} from "@/lib/rateLimit";

export type LoginState = { error?: string };

// 5 failed attempts per IP, then locked out until the 15-minute window ends.
const LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };

// Compared against when the username is wrong, so a bad username takes as
// long as a bad password and response timing doesn't reveal valid usernames.
const DUMMY_HASH = "$2b$12$Py1wveX0shA0/GTVTHNrEeFiUdnykYSl6VlsANcbPCARwtlWPRjL.";

function lockedOutMessage(retryAfterMs: number) {
  const minutes = minutesUntil(retryAfterMs);
  return `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const key = rateLimitKey("login", getClientIp(await headers()));

  const status = await peekRateLimit(key, LOGIN_LIMIT);
  if (!status.allowed) {
    return { error: lockedOutMessage(status.retryAfterMs) };
  }

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a username and password." };
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !adminPasswordHash) {
    return { error: "Admin credentials are not configured on the server." };
  }

  const usernameOk = parsed.data.username === adminUsername;
  const passwordOk = await bcrypt.compare(parsed.data.password, usernameOk ? adminPasswordHash : DUMMY_HASH);

  if (!usernameOk || !passwordOk) {
    const attempt = await consumeRateLimit(key, LOGIN_LIMIT);
    if (attempt.count >= LOGIN_LIMIT.max) {
      return { error: lockedOutMessage(attempt.retryAfterMs) };
    }
    const left = LOGIN_LIMIT.max - attempt.count;
    return { error: `Invalid username or password. ${left} attempt${left === 1 ? "" : "s"} left.` };
  }

  await resetRateLimit(key);
  await createSession();
  redirect("/admin");
}
