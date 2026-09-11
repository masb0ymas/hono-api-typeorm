import { Hono } from 'hono'

import HttpResponse from '~/lib/http/response'

import { BaseGetParamSchema } from '../dtos/base'
import { QuerySchema } from '../dtos/paginate'
import { authorization } from '../middlewares/authorization'
import { validateParam, validateQuery } from '../middlewares/validator'
import SessionRepository from '../repositories/session'

const route = new Hono()
const repository = new SessionRepository()

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

route.delete('/:id', authorization(), validateParam(BaseGetParamSchema), async (c) => {
  const { id } = c.req.valid('param')
  await repository.forceDelete(id)

  const response = HttpResponse.deleted()
  return c.json(response, 200)
})

export { route as SessionHandler }
