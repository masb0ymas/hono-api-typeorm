import { getConnInfo } from '@hono/node-server/conninfo'
import type { Context } from 'hono'

/**
 * Resolve the client IP. `x-forwarded-for` is honoured only because the app is
 * expected to run behind a trusted proxy; the socket address is the fallback so
 * clients without the header don't all share one bucket.
 */
export function clientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded

  try {
    return getConnInfo(c).remote.address ?? 'unknown'
  } catch {
    return 'unknown'
  }
}
