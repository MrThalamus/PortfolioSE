import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20; // per visitor per window

// Fixed-window limiter backed by Postgres, since in-memory counters don't
// survive across serverless invocations on Vercel. Returns true if allowed.
export async function checkChatRateLimit(ip: string): Promise<boolean> {
  const key = createHash("sha256").update(`chat:${ip}`).digest("hex");
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - WINDOW_MS);

  try {
    const row = await prisma.chatRateLimit.findUnique({ where: { key } });

    if (!row || row.windowStart < windowCutoff) {
      await prisma.chatRateLimit.upsert({
        where: { key },
        update: { count: 1, windowStart: now },
        create: { key, count: 1, windowStart: now },
      });
      return true;
    }

    if (row.count >= MAX_REQUESTS) return false;

    await prisma.chatRateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return true;
  } catch (err) {
    // Fail open: a database hiccup (or the migration not being applied yet)
    // shouldn't take the chatbot down. Gemini's own quota is the backstop.
    console.error("[chat] Rate limit check failed, allowing request:", err);
    return true;
  }
}
