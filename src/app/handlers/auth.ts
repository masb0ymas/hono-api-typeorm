import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { EntityManager } from 'typeorm'

import { AppDataSource } from '~/config/database'
import { JWT_CONSTANTS } from '~/lib/constants/jwt'
import { ROLE_SEED } from '~/lib/constants/seed/role'
import { ms } from '~/lib/date'
import { clientIp } from '~/lib/http/client'
import ErrorResponse from '~/lib/http/errors'
import HttpResponse from '~/lib/http/response'
import jwt from '~/lib/jwt/client'

import { RefreshTokenSchema, SignInSchema, SignUpSchema } from '../dtos/auth'
import { authorization } from '../middlewares/authorization'
import { validateJson } from '../middlewares/validator'
import RefreshTokenRepository from '../repositories/refresh-token'
import RoleRepository from '../repositories/role'
import SessionRepository from '../repositories/session'
import UserRepository from '../repositories/user'

const route = new Hono()
const userRepository = new UserRepository()

/** Issue a refresh token row tied to a session; returns the token value. */
async function createRefreshToken(
  refreshTokens: RefreshTokenRepository,
  userId: string,
  sessionId: string,
  manager: EntityManager
): Promise<string> {
  const expiresIn = ms(JWT_CONSTANTS.DEFAULT_REFRESH_TOKEN_EXPIRES)
  const token = nanoid()

  await refreshTokens.create(
    {
      user_id: userId,
      token,
      id_token: sessionId,
      expires_at: new Date(Date.now() + expiresIn),
      expires_in: String(expiresIn / 1000),
    },
    manager
  )

  return token
}

route.post('/sign-up', validateJson(SignUpSchema), async (c) => {
  const values = c.req.valid('json')

  if (await userRepository.existsByEmail(values.email)) {
    throw new ErrorResponse.BadRequest('email is already registered')
  }

  // The template ships without an email-verification flow, so accounts are
  // active immediately; the UserEvent subscriber hashes the password.
  const user = await userRepository.create({
    ...values,
    is_active: true,
    is_blocked: false,
    role_id: ROLE_SEED.USER,
  })

  const response = HttpResponse.created({
    message: 'Sign up successfully',
    data: { id: user.id, fullname: user.fullname, email: user.email },
  })
  return c.json(response, 201)
})

route.post('/sign-in', validateJson(SignInSchema), async (c) => {
  const values = c.req.valid('json')

  const data = await AppDataSource.transaction(async (manager) => {
    const users = new UserRepository(manager)
    const roles = new RoleRepository(manager)
    const sessions = new SessionRepository(manager)
    const refreshTokens = new RefreshTokenRepository(manager)

    const user = await users.findByEmailWithPassword(values.email)

    // One message for both cases so sign-in cannot enumerate accounts.
    if (!user || !(await user.comparePassword(values.password))) {
      throw new ErrorResponse.Unauthorized('Invalid email or password')
    }

    if (user.is_blocked) throw new ErrorResponse.Forbidden('user is blocked')
    if (!user.is_active) throw new ErrorResponse.Forbidden('user is not active')

    const role = await roles.findById(user.role_id)

    const { token, expiresIn } = jwt.generate({ uid: user.id })
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    const session = await sessions.create(
      {
        user_id: user.id,
        token,
        ip_address: clientIp(c),
        user_agent: c.req.header('user-agent') ?? undefined,
        expires_at: expiresAt,
        expires_in: String(expiresIn),
      },
      manager
    )

    const refresh_token = await createRefreshToken(refreshTokens, user.id, session.id, manager)

    return {
      uid: user.id,
      display_name: user.fullname,
      email: user.email,
      access_token: token,
      refresh_token,
      id_token: session.id,
      expires_at: expiresAt,
      expires_in: expiresIn,
      role: role.name.toLowerCase(),
    }
  })

  const response = HttpResponse.get({ message: 'Sign In successfully', data })
  return c.json(response, 200)
})

route.get('/me', authorization(), async (c) => {
  const auth = c.get('auth')
  const user = await userRepository.findById(auth.userId, { relations: { role: true } })

  const response = HttpResponse.get({ data: user })
  return c.json(response, 200)
})

route.post('/refresh', validateJson(RefreshTokenSchema), async (c) => {
  const values = c.req.valid('json')

  const data = await AppDataSource.transaction(async (manager) => {
    const users = new UserRepository(manager)
    const sessions = new SessionRepository(manager)
    const refreshTokens = new RefreshTokenRepository(manager)

    // The refresh token is the credential here: this flow must work when the
    // access token has already expired, so it carries no Authorization header.
    const refreshToken = await refreshTokens.findByToken(values.refresh_token)
    if (!refreshToken) {
      throw new ErrorResponse.NotFound('refresh token not found')
    }

    if (refreshToken.expires_at < new Date()) {
      throw new ErrorResponse.BadRequest('refresh token expired')
    }

    const user = await users.findById(refreshToken.user_id, { relations: { role: true } })
    if (user.is_blocked) throw new ErrorResponse.Forbidden('user is blocked')
    if (!user.is_active) throw new ErrorResponse.Forbidden('user is not active')

    const session = await sessions.findByIdForUser(refreshToken.id_token, user.id)
    if (!session) {
      throw new ErrorResponse.NotFound('session not found')
    }

    const { token, expiresIn } = jwt.generate({ uid: user.id })
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await sessions.update(
      session.id,
      { token, expires_at: expiresAt, expires_in: String(expiresIn) },
      manager
    )

    // Rotate the refresh token so a leaked one cannot be replayed.
    await refreshTokens.deleteByIdToken(refreshToken.id_token, manager)
    const nextRefreshToken = await createRefreshToken(refreshTokens, user.id, session.id, manager)

    return {
      uid: user.id,
      display_name: user.fullname,
      email: user.email,
      access_token: token,
      refresh_token: nextRefreshToken,
      id_token: session.id,
      expires_at: expiresAt,
      expires_in: expiresIn,
      role: user.role.name.toLowerCase(),
    }
  })

  const response = HttpResponse.get({ message: 'Token refreshed successfully', data })
  return c.json(response, 200)
})

route.post('/sign-out', authorization(), async (c) => {
  const auth = c.get('auth')

  await AppDataSource.transaction(async (manager) => {
    const refreshTokens = new RefreshTokenRepository(manager)
    const sessions = new SessionRepository(manager)
    await refreshTokens.deleteByIdToken(auth.session.id, manager)
    await sessions.deleteById(auth.session.id, manager)
  })

  const response = HttpResponse.get({ message: 'Sign out successfully' })
  return c.json(response, 200)
})

export { route as AuthHandler }
