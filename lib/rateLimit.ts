import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export type RateLimitRule = { max: number; windowMs: number };

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  /** Milliseconds until the current window resets. */
  retryAfterMs: number;
};

// Fixed-window counters stored in Postgres, since in-memory counters don't
// survive across serverless invocations on Vercel. IPs are hashed so no raw
// IPs are stored.
export function rateLimitKey(scope: string, ip: string): string {
  return `${scope}:${createHash("sha256").update(ip).digest("hex")}`;
}

export function getClientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

type Row = { count: number; windowStart: Date };

function toResult(row: Row | undefined, rule: RateLimitRule, allowWhenEqual: boolean): RateLimitResult {
  if (!row) return { allowed: true, count: 0, retryAfterMs: 0 };
  const count = Number(row.count);
  const retryAfterMs = Math.max(0, row.windowStart.getTime() + rule.windowMs - Date.now());
  return { allowed: allowWhenEqual ? count <= rule.max : count < rule.max, count, retryAfterMs };
}

/**
 * Counts one request against `key` and reports whether it's within the limit.
 * Check-and-increment happens in a single atomic statement, so concurrent
 * requests can't slip past the limit.
 */
export async function consumeRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<Row[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart")
      VALUES (${key}, 1, NOW() AT TIME ZONE 'UTC')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."windowStart" < (NOW() AT TIME ZONE 'UTC') - ${rule.windowMs} * INTERVAL '1 millisecond'
          THEN 1 ELSE "RateLimit"."count" + 1 END,
        "windowStart" = CASE
          WHEN "RateLimit"."windowStart" < (NOW() AT TIME ZONE 'UTC') - ${rule.windowMs} * INTERVAL '1 millisecond'
          THEN NOW() AT TIME ZONE 'UTC' ELSE "RateLimit"."windowStart" END
      RETURNING "count", "windowStart"`;
    return toResult(rows[0], rule, true);
  } catch (err) {
    // Fail open: a database hiccup shouldn't take the feature down.
    console.error(`[rateLimit] consume failed for ${key.split(":")[0]}, allowing:`, err);
    return { allowed: true, count: 0, retryAfterMs: 0 };
  }
}

/** Reports whether `key` is already at its limit, without counting anything. */
export async function peekRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT "count", "windowStart" FROM "RateLimit"
      WHERE "key" = ${key}
        AND "windowStart" >= (NOW() AT TIME ZONE 'UTC') - ${rule.windowMs} * INTERVAL '1 millisecond'`;
    return toResult(rows[0], rule, false);
  } catch (err) {
    console.error(`[rateLimit] peek failed for ${key.split(":")[0]}, allowing:`, err);
    return { allowed: true, count: 0, retryAfterMs: 0 };
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } }).catch((err) => {
    console.error("[rateLimit] reset failed:", err);
  });
}

export function minutesUntil(ms: number): number {
  return Math.max(1, Math.ceil(ms / 60000));
}
