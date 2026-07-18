import { Hono } from 'hono'

import HttpResponse from '~/lib/http/response'

const homeRouter = new Hono()

homeRouter.get('/', (c) => {
  const response = HttpResponse.get({ message: 'Hono API' })
  return c.json(response)
})

homeRouter.get('/health', (c) => {
  const response = HttpResponse.get({ status: 'OK' })
  return c.json(response)
})

export default homeRouter
