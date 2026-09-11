import { serve } from '@hono/node-server'

import app from './app/routers'
import { initializeDatabase } from './config/database'
import { env } from './config/env'

async function main() {
  // initialize database
  await initializeDatabase()

  if (env.app.debug) {
    console.debug('[debug] config:', {
      nodeEnv: env.app.nodeEnv,
      machineId: env.app.machineId,
      port: env.app.port,
      database: {
        connection: env.typeorm.connection,
        host: env.typeorm.host,
        port: env.typeorm.port,
        database: env.typeorm.database,
        synchronize: env.typeorm.synchronize,
        logging: env.typeorm.logging,
      },
    })
  }

  // start server
  serve({ fetch: app.fetch, port: env.app.port }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}

main()
