import type { Context } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

import { clientIp } from '~/lib/http/client'

const LIMIT_DURATION = 1 * 60 * 1000 // 1 minute
const MAX_LIMIT = 100

export function rateLimitHandler() {
  return rateLimiter({
    windowMs: LIMIT_DURATION,
    limit: MAX_LIMIT, // Limit each client to MAX_LIMIT requests per window
    keyGenerator: (c: Context) => clientIp(c),
    handler: (c) => {
      return c.json(
        {
          success: false,
          name: 'Too Many Requests',
          message: 'Too many requests, please try again later.',
        },
        429
      )
    },
  })
}
