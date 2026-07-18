import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { v7 as uuidv7 } from 'uuid'

import { AppDataSource } from '~/config/database'
import { env } from '~/config/env'
import { RefreshToken } from '~/database/entities/refresh_token'
import { Role } from '~/database/entities/role'
import { Session } from '~/database/entities/session'
import { User } from '~/database/entities/user'
import { JWT_CONSTANTS } from '~/lib/constants/jwt'
import { ROLE_SEED } from '~/lib/constants/seed/role'
import { ms } from '~/lib/date'
import ErrorResponse from '~/lib/http/errors'
import HttpResponse from '~/lib/http/response'
import JwtToken from '~/lib/jwt'

import { RefreshTokenSchema, SignInSchema, SignUpSchema } from '../dtos/auth'
import { authorization } from '../middlewares/authorization'

const route = new Hono()

route.post('/sign-up', zValidator('json', SignUpSchema), async (c) => {
  const values = c.req.valid('json')

  const jwt = new JwtToken({
    secret: env.jwt.secret,
    expires: JWT_CONSTANTS.DEFAULT_TOKEN_EXPIRES,
  })

  const payload = JSON.parse(JSON.stringify({ uid: uuidv7() }))
  const { token } = jwt.generate(payload)

  const formValues = {
    ...values,
    is_active: false,
    is_blocked: false,
    token_verify: token,
    role_id: ROLE_SEED.USER,
  }

  const userRepo = AppDataSource.getRepository(User)
  await userRepo.save(formValues)

  const response = HttpResponse.created({ message: 'Sign up successfully' })
  return c.json(response, 201)
})

route.post('/sign-in', zValidator('json', SignInSchema), async (c) => {
  const values = c.req.valid('json')

  let data: Record<string, unknown> = {}

  await AppDataSource.transaction(async (manager) => {
    const repo = {
      user: manager.getRepository(User),
      role: manager.getRepository(Role),
      session: manager.getRepository(Session),
      refreshToken: manager.getRepository(RefreshToken),
    }

    const getUser = await repo.user.findOne({
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

    if (!getUser) {
      throw new ErrorResponse.NotFound('user not found')
    }

    if (!getUser.is_active) {
      throw new ErrorResponse.BadRequest('user is not active, please verify your email')
    }

    const isPasswordMatch = await getUser.comparePassword(values.password)
    if (!isPasswordMatch) {
      throw new ErrorResponse.BadRequest('current password is incorrect')
    }

    const getRole = await repo.role.findOne({ where: { id: getUser.role_id } })
    if (!getRole) {
      throw new ErrorResponse.NotFound('role not found')
    }

    const jwt = new JwtToken({
      secret: env.jwt.secret,
      expires: JWT_CONSTANTS.DEFAULT_TOKEN_EXPIRES,
    })

    const payload = JSON.parse(JSON.stringify({ uid: getUser.id }))
    const { token, expiresIn } = jwt.generate(payload)

    // Session
    const sessionEntity = new Session()

    const session = await repo.session.save({
      ...sessionEntity,
      user_id: getUser.id,
      token,
      expires_at: new Date(Date.now() + expiresIn * 1000),
      expires_in: expiresIn,
    } as unknown as Session)

    // Refresh Token
    const refreshTokenEntity = new RefreshToken()
    const refreshTokenExpires = ms(JWT_CONSTANTS.DEFAULT_REFRESH_TOKEN_EXPIRES)
    const refresh_token = nanoid()

    await repo.refreshToken.save({
      ...refreshTokenEntity,
      user_id: getUser.id,
      token: refresh_token,
      id_token: session.id,
      expires_at: new Date(Date.now() + refreshTokenExpires),
      expires_in: refreshTokenExpires / 1000,
    } as unknown as RefreshToken)

    data = {
      uid: getUser.id,
      display_name: getUser.fullname,
      email: getUser.email,
      access_token: token,
      refresh_token: refresh_token,
      id_token: session.id,
      expires_at: new Date(Date.now() + expiresIn * 1000),
      expires_in: expiresIn,
      role: getRole.name.toLowerCase(),
    }
  })

  const response = HttpResponse.get({ message: 'Sign In successfully', data })
  return c.json(response, 200)
})

route.get('/me', authorization(), async (c) => {
  const auth = c.get('auth')

  const repo = {
    user: AppDataSource.getRepository(User),
    session: AppDataSource.getRepository(Session),
  }

  const user = await repo.user.findOne({ where: { id: auth.userId } })
  if (!user) {
    throw new ErrorResponse.NotFound('user not found')
  }

  const session = await repo.session.findOne({ where: { user_id: user.id, token: auth.token } })
  if (!session) {
    throw new ErrorResponse.NotFound('session not found')
  }

  const jwt = new JwtToken({
    secret: env.jwt.secret,
    expires: JWT_CONSTANTS.DEFAULT_TOKEN_EXPIRES,
  })

  const decodeToken = jwt.verify(auth.token)
  const uid = (decodeToken.data as Record<string, string>).uid

  if (!_.isEmpty(uid) && uid !== user.id) {
    throw new ErrorResponse.BadRequest('user id not match')
  }

  const response = HttpResponse.get({ data: user })
  return c.json(response, 200)
})

route.post('/refresh', authorization(), zValidator('json', RefreshTokenSchema), async (c) => {
  const auth = c.get('auth')
  const values = c.req.valid('json')

  const repo = {
    user: AppDataSource.getRepository(User),
    session: AppDataSource.getRepository(Session),
    refreshToken: AppDataSource.getRepository(RefreshToken),
  }

  const user = await repo.user.findOne({ where: { id: auth.userId }, relations: { role: true } })
  if (!user) {
    throw new ErrorResponse.NotFound('user not found')
  }

  const refreshToken = await repo.refreshToken.findOne({
    where: { user_id: user.id, token: values.refresh_token },
  })
  if (!refreshToken) {
    throw new ErrorResponse.NotFound('refresh token not found')
  }

  if (refreshToken.expires_at < new Date()) {
    throw new ErrorResponse.BadRequest('refresh token expired')
  }

  const jwt = new JwtToken({
    secret: env.jwt.secret,
    expires: JWT_CONSTANTS.DEFAULT_TOKEN_EXPIRES,
  })

  const payload = JSON.parse(JSON.stringify({ uid: user.id }))
  const { token, expiresIn } = jwt.generate(payload)

  const session = await repo.session.findOne({ where: { user_id: user.id, token: auth.token } })

  if (!session) {
    throw new ErrorResponse.NotFound('session not found')
  }

  await repo.session.save({
    ...session,
    user_id: user.id,
    token,
    expires_at: new Date(Date.now() + expiresIn * 1000),
    expires_in: expiresIn,
  } as unknown as Session)

  const response = HttpResponse.get({
    data: {
      uid: user.id,
      display_name: user.fullname,
      email: user.email,
      access_token: token,
      refresh_token: values.refresh_token,
      id_token: session.id,
      expires_at: new Date(Date.now() + expiresIn * 1000),
      expires_in: expiresIn,
      role: user.role.name.toLowerCase(),
    },
  })
  return c.json(response, 200)
})

route.post('/sign-out', authorization(), async (c) => {
  const auth = c.get('auth')

  const repo = {
    user: AppDataSource.getRepository(User),
    session: AppDataSource.getRepository(Session),
    refreshToken: AppDataSource.getRepository(RefreshToken),
  }

  const user = await repo.user.findOne({ where: { id: auth.userId } })
  if (!user) {
    throw new ErrorResponse.NotFound('user not found')
  }

  const session = await repo.session.findOne({ where: { user_id: user.id, token: auth.token } })
  if (!session) {
    throw new ErrorResponse.NotFound('session not found')
  }

  await repo.refreshToken.delete({ id_token: session.id })

  await repo.session.delete({ token: auth.token })

  const response = HttpResponse.get({ message: 'Sign out successfully' })
  return c.json(response, 200)
})

export { route as AuthHandler }
