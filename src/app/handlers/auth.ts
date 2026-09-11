import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { v7 as uuidv7 } from 'uuid'

import { AppDataSource } from '~/config/database'
import { env } from '~/config/env'
import { RefreshToken } from '~/database/entities/refresh_tokens'
import { Role } from '~/database/entities/roles'
import { Session } from '~/database/entities/sessions'
import { User } from '~/database/entities/users'
import { JWT_CONSTANTS } from '~/lib/constants/jwt'
import { ROLE_SEED } from '~/lib/constants/seed/role'
import { ms } from '~/lib/date'
import ErrorResponse from '~/lib/http/errors'
import HttpResponse from '~/lib/http/response'
import jwt from '~/lib/jwt/client'

import { RefreshTokenSchema, SignInSchema, SignUpSchema } from '../dtos/auth'
import { authorization } from '../middlewares/authorization'
import { validateJson } from '../middlewares/validator'

const route = new Hono()

route.post('/sign-up', validateJson(SignUpSchema), async (c) => {
  const values = c.req.valid('json')

  const payload = { uid: uuidv7() }
  const { token } = jwt.generate(payload)

  const repo = AppDataSource.getRepository(User)

  const user = repo.create({
    ...values,
    is_active: false,
    is_blocked: false,
    token_verify: token,
    role_id: ROLE_SEED.USER,
  })

  await repo.save(user)

  const response = HttpResponse.created({ message: 'Sign up successfully' })
  return c.json(response, 201)
})

route.post('/sign-in', validateJson(SignInSchema), async (c) => {
  const values = c.req.valid('json')

  const data = await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User)
    const roleRepo = manager.getRepository(Role)
    const sessionRepo = manager.getRepository(Session)
    const refreshTokenRepo = manager.getRepository(RefreshToken)

    const user = await userRepo.findOne({
      select: {
        id: true,
        fullname: true,
        email: true,
        password: true,
        is_active: true,
        role_id: true,
      },
      where: { email: values.email },
    })

    if (!user) {
      throw new ErrorResponse.NotFound('user not found')
    }

    if (!user.is_active) {
      throw new ErrorResponse.BadRequest('user is not active, please verify your email')
    }

    const isPasswordMatch = await user.comparePassword(values.password)
    if (!isPasswordMatch) {
      throw new ErrorResponse.BadRequest('current password is incorrect')
    }

    const role = await roleRepo.findOne({ where: { id: user.role_id } })
    if (!role) {
      throw new ErrorResponse.NotFound('role not found')
    }

    const { token, expiresIn } = jwt.generate({ uid: user.id })

    const session = await sessionRepo.save(
      sessionRepo.create({
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + expiresIn * 1000),
        expires_in: String(expiresIn),
      })
    )

    const refreshTokenExpires = ms(JWT_CONSTANTS.DEFAULT_REFRESH_TOKEN_EXPIRES)
    const refresh_token = nanoid()

    await refreshTokenRepo.save(
      refreshTokenRepo.create({
        user_id: user.id,
        token: refresh_token,
        id_token: session.id,
        expires_at: new Date(Date.now() + refreshTokenExpires),
        expires_in: String(refreshTokenExpires / 1000),
      })
    )

    return {
      uid: user.id,
      display_name: user.fullname,
      email: user.email,
      access_token: token,
      refresh_token,
      id_token: session.id,
      expires_at: new Date(Date.now() + expiresIn * 1000),
      expires_in: expiresIn,
      role: role.name.toLowerCase(),
    }
  })

  const response = HttpResponse.get({ message: 'Sign In successfully', data })
  return c.json(response, 200)
})

route.get('/me', authorization(), async (c) => {
  const auth = c.get('auth')

  const repo = AppDataSource.getRepository(User)
  const user = await repo.findOne({ where: { id: auth.userId }, relations: { role: true } })

  if (!user) {
    throw new ErrorResponse.NotFound('user not found')
  }

  const response = HttpResponse.get({ data: user })
  return c.json(response, 200)
})

route.post('/refresh', validateJson(RefreshTokenSchema), async (c) => {
  const values = c.req.valid('json')

  const data = await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User)
    const sessionRepo = manager.getRepository(Session)
    const refreshTokenRepo = manager.getRepository(RefreshToken)

    const refreshToken = await refreshTokenRepo.findOne({
      where: { token: values.refresh_token },
    })

    if (!refreshToken) {
      throw new ErrorResponse.NotFound('refresh token not found')
    }

    if (refreshToken.expires_at < new Date()) {
      throw new ErrorResponse.BadRequest('refresh token expired')
    }

    const user = await userRepo.findOne({
      where: { id: refreshToken.user_id },
      relations: { role: true },
    })

    if (!user) {
      throw new ErrorResponse.NotFound('user not found')
    }

    if (!user.is_active) {
      throw new ErrorResponse.BadRequest('user is not active, please verify your email')
    }

    const session = await sessionRepo.findOne({ where: { id: refreshToken.id_token } })
    if (!session) {
      throw new ErrorResponse.NotFound('session not found')
    }

    const { token, expiresIn } = jwt.generate({ uid: user.id })

    await sessionRepo.save(
      sessionRepo.merge(session, {
        token,
        expires_at: new Date(Date.now() + expiresIn * 1000),
        expires_in: String(expiresIn),
      })
    )

    // Rotate the refresh token so a leaked one cannot be replayed.
    const nextRefreshToken = nanoid()
    await refreshTokenRepo.save(refreshTokenRepo.merge(refreshToken, { token: nextRefreshToken }))

    return {
      uid: user.id,
      display_name: user.fullname,
      email: user.email,
      access_token: token,
      refresh_token: nextRefreshToken,
      id_token: session.id,
      expires_at: new Date(Date.now() + expiresIn * 1000),
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
    await manager.getRepository(RefreshToken).delete({ id_token: auth.session.id })
    await manager.getRepository(Session).delete({ id: auth.session.id })
  })

  const response = HttpResponse.get({ message: 'Sign out successfully' })
  return c.json(response, 200)
})

export { route as AuthHandler }
