import './types'

import type { Context, Next } from 'hono'

import { AppDataSource } from '~/config/database'
import { env } from '~/config/env'
import { Session } from '~/database/entities/session'
import { UNAUTHORIZED } from '~/lib/constants/error'
import { JWT_CONSTANTS } from '~/lib/constants/jwt'
import HttpResponse from '~/lib/http/response'
import JwtToken from '~/lib/jwt'

const jwt = new JwtToken({
  secret: env.jwt.secret,
  expires: JWT_CONSTANTS.DEFAULT_TOKEN_EXPIRES,
})

export function authorization() {
  return async (c: Context, next: Next) => {
    const token = jwt.extract(c)

    if (!token) {
      const response = HttpResponse.throwError(UNAUTHORIZED, 'Cannot extract token from request')
      return c.json(response, 401)
    }

    const decoded = jwt.verify(token)

    if (!decoded) {
      const response = HttpResponse.throwError(UNAUTHORIZED, 'Invalid token')
      return c.json(response, 401)
    }

    const userId = (decoded.data as Record<string, string>)?.uid
    if (!userId) {
      const response = HttpResponse.throwError(UNAUTHORIZED, 'Invalid token payload')
      return c.json(response, 401)
    }

    const sessionRepo = AppDataSource.getRepository(Session)
    const session = await sessionRepo.findOne({ where: { user_id: userId, token } })

    if (!session) {
      const response = HttpResponse.throwError(UNAUTHORIZED, 'Session not found')
      return c.json(response, 401)
    }

    const auth = {
      userId,
      token,
      session,
    }

    c.set('auth', auth)

    await next()
  }
}
