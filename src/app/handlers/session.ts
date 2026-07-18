import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

import HttpResponse from '~/lib/http/response'

import { BaseGetParamSchema } from '../dtos/base'
import { QuerySchema } from '../dtos/paginate'
import { authorization } from '../middlewares/authorization'
import SessionRepository from '../repositories/session'

const route = new Hono()
const repository = new SessionRepository()

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

export { route as SessionHandler }
