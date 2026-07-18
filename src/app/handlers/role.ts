import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import HttpResponse from '~/lib/http/response'

import { BaseGetParamSchema } from '../dtos/base'
import { QuerySchema } from '../dtos/paginate'
import { RoleSchema } from '../dtos/role'
import { authorization } from '../middlewares/authorization'
import RoleRepository from '../repositories/role'

const route = new Hono()
const repository = new RoleRepository()

route.get('/', authorization(), zValidator('query', QuerySchema), async (c) => {
  const { offset, limit } = c.req.valid('query')
  const records = await repository.find({ offset, limit })

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

route.post('/', authorization(), zValidator('json', RoleSchema), async (c) => {
  const values = c.req.valid('json')
  const record = await repository.create(values)

  const response = HttpResponse.created({ data: record })
  return c.json(response, 201)
})

route.put(
  '/:id',
  authorization(),
  zValidator('param', BaseGetParamSchema, (result, c) => {
    if (!result.success) {
      const response = HttpResponse.throwGetByID(result.error.issues)
      return c.json(response, 400)
    }
  }),
  zValidator('json', RoleSchema),
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

export { route as RoleHandler }
