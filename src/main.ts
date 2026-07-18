import { serve } from '@hono/node-server'

import app from './app/routers'
import { initializeDatabase } from './config/database'
import { env } from './config/env'

async function main() {
  // initialize database
  await initializeDatabase()

  // start server
  serve({ fetch: app.fetch, port: env.app.port }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}

main()
