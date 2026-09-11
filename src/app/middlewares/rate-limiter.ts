import { getConnInfo } from '@hono/node-server/conninfo'
import type { Context } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

const LIMIT_DURATION = 1 * 60 * 1000 // 1 minute
const MAX_LIMIT = 100

/**
 * Resolve the client IP. `x-forwarded-for` is honoured only because the app is
 * expected to run behind a trusted proxy; the socket address is the fallback so
 * clients without the header don't all share one bucket.
 */
function clientKey(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded

  try {
    return getConnInfo(c).remote.address ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export function rateLimitHandler() {
  return rateLimiter({
    windowMs: LIMIT_DURATION,
    limit: MAX_LIMIT, // Limit each client to MAX_LIMIT requests per window
    keyGenerator: clientKey,
    handler: (c) => {
      return c.json({ success: false, message: 'Too many requests, please try again later.' }, 429)
    },
  })
}
