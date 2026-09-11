import { Hono } from 'hono'

import { AppDataSource } from '~/config/database'
import { User } from '~/database/entities/users'
import ErrorResponse from '~/lib/http/errors'
import HttpResponse from '~/lib/http/response'

import { BaseGetParamSchema } from '../dtos/base'
import { QuerySchema } from '../dtos/paginate'
import { UserChangePasswordSchema, UserCreateSchema, UserUpdateSchema } from '../dtos/user'
import { authorization } from '../middlewares/authorization'
import { validateJson, validateParam, validateQuery } from '../middlewares/validator'
import UserRepository from '../repositories/user'

const route = new Hono()
const repository = new UserRepository()

route.get('/', authorization(), validateQuery(QuerySchema), async (c) => {
  const { offset, limit, filtered, sorted } = c.req.valid('query')
  const records = await repository.findWithRelations({ offset, limit, filtered, sorted })

  const response = HttpResponse.paginated({ ...records, offset, limit })
  return c.json(response, 200)
})

route.get('/:id', authorization(), validateParam(BaseGetParamSchema), async (c) => {
  const { id } = c.req.valid('param')
  const record = await repository.findById(id, { relations: { role: true } })

  const response = HttpResponse.get({ data: record })
  return c.json(response, 200)
})

route.post('/', authorization(), validateJson(UserCreateSchema), async (c) => {
  const values = c.req.valid('json')
  const record = await repository.create(values)

  // Never echo the password (hash or otherwise) back to the client.
  const { password: _password, ...safeRecord } = record
  void _password

  const response = HttpResponse.created({ data: safeRecord })
  return c.json(response, 201)
})

route.put(
  '/:id/change-password',
  authorization(),
  validateParam(BaseGetParamSchema),
  validateJson(UserChangePasswordSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const values = c.req.valid('json')

    const repo = AppDataSource.getRepository(User)

    const getUser = await repo.findOne({
      select: { id: true, password: true },
      where: { id },
    })
    if (!getUser) {
      throw new ErrorResponse.NotFound('User not found')
    }

    // compare old password
    const oldPasswordMatch = await getUser.comparePassword(values.old_password)
    if (!oldPasswordMatch) {
      throw new ErrorResponse.BadRequest('current password is not correct')
    }

    // compare new password with current password
    const newPasswordMatch = await getUser.comparePassword(values.password)
    if (newPasswordMatch) {
      throw new ErrorResponse.BadRequest('new password cant be same with current password')
    }

    await repo.save(repo.merge(getUser, { password: values.password }))

    const response = HttpResponse.updated()
    return c.json(response, 200)
  }
)

route.put(
  '/:id',
  authorization(),
  validateParam(BaseGetParamSchema),
  validateJson(UserUpdateSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const values = c.req.valid('json')
    const record = await repository.update(id, values)

    const response = HttpResponse.updated({ data: record })
    return c.json(response, 200)
  }
)

route.put('/restore/:id', authorization(), validateParam(BaseGetParamSchema), async (c) => {
  const { id } = c.req.valid('param')
  await repository.restore(id)

  const response = HttpResponse.restored()
  return c.json(response, 200)
})

route.delete('/soft-delete/:id', authorization(), validateParam(BaseGetParamSchema), async (c) => {
  const { id } = c.req.valid('param')
  await repository.softDelete(id)

  const response = HttpResponse.deleted()
  return c.json(response, 200)
})

route.delete('/force-delete/:id', authorization(), validateParam(BaseGetParamSchema), async (c) => {
  const { id } = c.req.valid('param')
  await repository.forceDelete(id)

  const response = HttpResponse.deleted()
  return c.json(response, 200)
})

export { route as UserHandler }
