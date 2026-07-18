import { rateLimiter } from 'hono-rate-limiter'

const LIMIT_DURATION = 1 * 60 * 1000 // 1 minute
const MAX_LIMIT = 100

export function rateLimitHandler() {
  return rateLimiter({
    windowMs: LIMIT_DURATION,
    limit: MAX_LIMIT, // Limit each client to MAX_LIMIT requests per window
    keyGenerator: (c) => c.req.header('x-forwarded-for') ?? '', // Use IP address as key
    handler: (c) => {
      return c.json({ success: false, message: 'Too many requests, please try again later.' }, 429)
    },
  })
}
