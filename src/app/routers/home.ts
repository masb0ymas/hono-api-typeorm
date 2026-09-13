import { Hono } from 'hono'

import { env } from '~/config/env'
import HttpResponse from '~/lib/http/response'

const homeRouter = new Hono()

homeRouter.get('/', (c) => {
  const response = HttpResponse.get({ message: env.app.name })
  return c.json(response)
})

homeRouter.get('/health', (c) => {
  const response = HttpResponse.get({
    status: 'OK',
    data: { name: env.app.name, url: env.app.url, machine_id: env.app.machineId },
  })
  return c.json(response, 200)
})

export default homeRouter
