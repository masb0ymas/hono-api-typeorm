import './types'

import type { Context, Next } from 'hono'

import SessionRepository from '~/app/repositories/session'
import ErrorResponse from '~/lib/http/errors'
import jwt from '~/lib/jwt/client'

const sessionRepository = new SessionRepository()

export function authorization() {
  return async (c: Context, next: Next) => {
    const token = jwt.extract(c)

    if (!token) {
      throw new ErrorResponse.Unauthorized('Cannot extract token from request')
    }

    const { data } = jwt.verify(token)

    if (!data) {
      throw new ErrorResponse.Unauthorized('Invalid token')
    }

    const userId = (data as Record<string, unknown>).uid
    if (typeof userId !== 'string' || userId === '') {
      throw new ErrorResponse.Unauthorized('Invalid token payload')
    }

    const session = await sessionRepository.findByUserAndToken(userId, token)

    if (!session) {
      throw new ErrorResponse.Unauthorized('Session not found')
    }

    if (session.expires_at < new Date()) {
      throw new ErrorResponse.Unauthorized('Session expired')
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
