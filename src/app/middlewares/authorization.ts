import './types'

import type { Context, Next } from 'hono'

import { AppDataSource } from '~/config/database'
import { Session } from '~/database/entities/sessions'
import ErrorResponse from '~/lib/http/errors'
import jwt from '~/lib/jwt/client'

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

    const sessionRepo = AppDataSource.getRepository(Session)
    const session = await sessionRepo.findOne({ where: { user_id: userId, token } })

    if (!session) {
      throw new ErrorResponse.Unauthorized('Session not found')
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
