import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'

import corsOptions from '~/lib/constants/cors'
import ErrorResponse from '~/lib/http/errors'

import { errorHandler } from '../middlewares/error-handler'
import { rateLimitHandler } from '../middlewares/rate-limiter'
import homeRouter from './home'
import v1Router from './v1'

const app = new Hono()

app.use(logger())
app.use(compress())
app.use(requestId())
app.use(bodyLimit({ maxSize: 1024 * 1024 })) // 1MB limit
app.use(cors(corsOptions))
app.use(rateLimitHandler())

app.use('/static/*', serveStatic({ root: './public' }))

app.route('/', homeRouter)
app.route('/v1', v1Router)

app.notFound((c) => {
  throw new ErrorResponse.NotFound(`Endpoint ${c.req.method} ${c.req.path} not found`)
})

app.onError(errorHandler)

export default app
