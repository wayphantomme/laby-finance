import type { Redis } from "@upstash/redis";

// ── Rate-limit key design ─────────────────────────────────────────────────────
// Most protected routes use a per-user, per-resource bucket:
//   rl:<resource>:<userId>  (e.g. "rl:transactions:abc123", "rl:ai:abc123")
// This ensures one resource class cannot exhaust another user's quota.
// The only intentional shared-bucket routes are /api/register and
// /api/auth/callback/credentials, which are keyed by IP:
//   rl:register:<ip>   (10 req / 15 min)
//   rl:login:<ip>      (10 req / 15 min)
// All other routes use 200 req / 3600 s per user per resource.
// ─────────────────────────────────────────────────────────────────────────────

// Backend selection: true only when both Upstash env vars are present.
// Evaluated once at module load; never changes at runtime.
const USE_UPSTASH =
  typeof process.env.UPSTASH_REDIS_REST_URL === "string" &&
  process.env.UPSTASH_REDIS_REST_URL.length > 0 &&
  typeof process.env.UPSTASH_REDIS_REST_TOKEN === "string" &&
  process.env.UPSTASH_REDIS_REST_TOKEN.length > 0;

// ── Upstash lazy singleton (Redis client only — Ratelimit is created per call) ──
// upstashRedis is the only module-level singleton. Ratelimit instances are cheap
// to construct and are created fresh on each checkUpstash call, which avoids the
// need for a (limit, windowSeconds)-keyed instance cache.
let upstashRedis: Redis | undefined;

// ── In-memory store for local dev ──────────────────────────────────────────────
const memStore = new Map<string, { count: number; resetAt: number }>();

// ── Public types ───────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix timestamp in seconds. 0 = error sentinel (see FR-2.7): omit headers. */
  resetAt: number;
}

// ── Public functions ───────────────────────────────────────────────────────────

/**
 * checkRateLimit — dispatches to Upstash (prod) or in-memory (dev).
 * Fail-open: on any error returns { success: true, resetAt: 0 }.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    if (USE_UPSTASH) {
      return await checkUpstash(identifier, limit, windowSeconds);
    }
    return checkMemory(identifier, limit, windowSeconds);
  } catch (err) {
    console.error("rate-limit check failed:", err);
    // Fail-open: allow the request, use resetAt=0 as error sentinel.
    return { success: true, limit, remaining: -1, resetAt: 0 };
  }
}

/**
 * getClientIp — extracts the best-effort client IP from a NextRequest.
 * If no proxy headers are set, returns "unknown" (all unknown-IP requests
 * share one bucket, acceptable in local dev where this occurs).
 */
export function getClientIp(req: import("next/server").NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

/**
 * rateLimitHeaders — maps a RateLimitResult to HTTP header fields.
 * Returns {} when resetAt === 0 (error sentinel) so spreading is always safe.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  if (result.resetAt === 0) return {}; // error sentinel: omit headers per FR-2.7
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
  };
}

// ── Private: Upstash backend ──────────────────────────────────────────────────

async function checkUpstash(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  // Lazy-init Redis singleton.
  if (!upstashRedis) {
    const { Redis } = await import("@upstash/redis");
    upstashRedis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  // Create a new Ratelimit instance per call (constructor is cheap; Redis is the
  // expensive singleton). This avoids a (limit, windowSeconds)-keyed cache and
  // correctly supports callers with different limit/window pairs.
  //
  // Concurrent first calls are harmless — Node module cache returns the same
  // module object on every import; duplicate instantiation is a no-op.
  const { Ratelimit } = await import("@upstash/ratelimit");
  const ratelimit = new Ratelimit({
    redis: upstashRedis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
  });

  const result = await ratelimit.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    // Upstash returns reset in milliseconds; convert to seconds.
    resetAt: Math.floor(result.reset / 1000),
  };
}

// ── Private: in-memory backend (local dev) ────────────────────────────────────

function checkMemory(
  identifier: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const nowSec = Math.floor(Date.now() / 1000);
  const entry = memStore.get(identifier);

  let count: number;
  let resetAt: number;

  if (entry && entry.resetAt > nowSec) {
    // Window still active — increment.
    count = entry.count + 1;
    resetAt = entry.resetAt;
    memStore.set(identifier, { count, resetAt });
  } else {
    // Window expired or new key — start fresh.
    count = 1;
    resetAt = nowSec + windowSeconds;
    memStore.set(identifier, { count, resetAt });
  }

  // Lazy eviction: sweep expired entries when the map grows large.
  // Threshold is 100 (not 500) to keep memory footprint small in dev.
  if (memStore.size > 100) {
    for (const [key, val] of memStore) {
      if (val.resetAt <= nowSec) memStore.delete(key);
    }
  }

  return {
    success: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}
