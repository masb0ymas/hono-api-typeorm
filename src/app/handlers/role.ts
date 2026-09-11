import { Hono } from 'hono'

import HttpResponse from '~/lib/http/response'

import { BaseGetParamSchema } from '../dtos/base'
import { QuerySchema } from '../dtos/paginate'
import { RoleSchema } from '../dtos/role'
import { authorization } from '../middlewares/authorization'
import { validateJson, validateParam, validateQuery } from '../middlewares/validator'
import RoleRepository from '../repositories/role'

const route = new Hono()
const repository = new RoleRepository()

route.get('/', authorization(), validateQuery(QuerySchema), async (c) => {
  const { offset, limit, filtered, sorted } = c.req.valid('query')
  const records = await repository.find({ offset, limit, filtered, sorted })

  const response = HttpResponse.paginated({ ...records, offset, limit })
  return c.json(response, 200)
})

route.get('/:id', authorization(), validateParam(BaseGetParamSchema), async (c) => {
  const { id } = c.req.valid('param')
  const record = await repository.findById(id)

  const response = HttpResponse.get({ data: record })
  return c.json(response, 200)
})

route.post('/', authorization(), validateJson(RoleSchema), async (c) => {
  const values = c.req.valid('json')
  const record = await repository.create(values)

  const response = HttpResponse.created({ data: record })
  return c.json(response, 201)
})

route.put(
  '/:id',
  authorization(),
  validateParam(BaseGetParamSchema),
  validateJson(RoleSchema),
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

export { route as RoleHandler }
