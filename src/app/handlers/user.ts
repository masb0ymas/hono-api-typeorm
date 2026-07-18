import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import { AppDataSource } from '~/config/database'
import { User } from '~/database/entities/user'
import { BAD_REQUEST, NOT_FOUND } from '~/lib/constants/error'
import HttpResponse from '~/lib/http/response'

import { BaseGetParamSchema } from '../dtos/base'
import { QuerySchema } from '../dtos/paginate'
import { UserChangePasswordSchema, UserCreateSchema, UserUpdateSchema } from '../dtos/user'
import { authorization } from '../middlewares/authorization'
import UserRepository from '../repositories/user'

const route = new Hono()
const repository = new UserRepository()

route.get('/', authorization(), zValidator('query', QuerySchema), async (c) => {
  const { offset, limit } = c.req.valid('query')
  const records = await repository.findWithRelations({ offset, limit })

  const response = HttpResponse.get({
    data: records.data,
    metadata: { offset, limit, total: records.total },
  })

  return c.json(response, 200)
})

route.get(
  '/:id',
  authorization(),
  zValidator('param', BaseGetParamSchema, (result, c) => {
    if (!result.success) {
      const response = HttpResponse.throwGetByID(result.error.issues)
      return c.json(response, 400)
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const record = await repository.findById(id)

    const response = HttpResponse.get({ data: record })
    return c.json(response, 200)
  }
)

route.post('/', authorization(), zValidator('json', UserCreateSchema), async (c) => {
  const values = c.req.valid('json')
  const record = await repository.create(values)

  const response = HttpResponse.created({ data: record })
  return c.json(response, 201)
})

route.put(
  '/:id/change-password',
  authorization(),
  zValidator('param', BaseGetParamSchema, (result, c) => {
    if (!result.success) {
      const response = HttpResponse.throwGetByID(result.error.issues)
      return c.json(response, 400)
    }
  }),
  zValidator('json', UserChangePasswordSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const values = c.req.valid('json')

    const repo = {
      user: AppDataSource.getRepository(User),
    }

    const getUser = await repo.user.findOne({
      select: { id: true, password: true },
      where: { id },
    })
    if (!getUser) {
      const response = HttpResponse.throwError(NOT_FOUND, 'User not found')
      return c.json(response, 404)
    }

    // compare old password
    const oldPasswordMatch = await getUser.comparePassword(values.old_password)
    if (!oldPasswordMatch) {
      const response = HttpResponse.throwError(BAD_REQUEST, 'current password is not correct')
      return c.json(response, 400)
    }

    // compare new password with current password
    const newPasswordMatch = await getUser.comparePassword(values.password)
    if (newPasswordMatch) {
      const response = HttpResponse.throwError(
        BAD_REQUEST,
        'new password cant be same with current password'
      )
      return c.json(response, 400)
    }

    await repo.user.save({ ...getUser, password: values.password })

    const response = HttpResponse.updated()
    return c.json(response, 200)
  }
)

route.put(
  '/:id',
  authorization(),
  zValidator('param', BaseGetParamSchema, (result, c) => {
    if (!result.success) {
      const response = HttpResponse.throwGetByID(result.error.issues)
      return c.json(response, 400)
    }
  }),
  zValidator('json', UserUpdateSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const values = c.req.valid('json')
    const record = await repository.update(id, values)

    const response = HttpResponse.updated({ data: record })
    return c.json(response, 200)
  }
)

route.put(
  '/restore/:id',
  authorization(),
  zValidator('param', BaseGetParamSchema, (result, c) => {
    if (!result.success) {
      const response = HttpResponse.throwGetByID(result.error.issues)
      return c.json(response, 400)
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    await repository.restore(id)

    const response = HttpResponse.restored()
    return c.json(response, 200)
  }
)

route.delete(
  '/soft-delete/:id',
  authorization(),
  zValidator('param', BaseGetParamSchema, (result, c) => {
    if (!result.success) {
      const response = HttpResponse.throwGetByID(result.error.issues)
      return c.json(response, 400)
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    await repository.softDelete(id)

    const response = HttpResponse.deleted()
    return c.json(response, 200)
  }
)

route.delete(
  '/force-delete/:id',
  authorization(),
  zValidator('param', BaseGetParamSchema, (result, c) => {
    if (!result.success) {
      const response = HttpResponse.throwGetByID(result.error.issues)
      return c.json(response, 400)
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    await repository.forceDelete(id)

    const response = HttpResponse.deleted()
    return c.json(response, 200)
  }
)

export { route as UserHandler }
