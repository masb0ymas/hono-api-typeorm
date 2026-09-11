import 'reflect-metadata'

import { join } from 'node:path'

import { DataSource, type DataSourceOptions } from 'typeorm'

import { env } from './env'

// Paths are resolved relative to this file (dist/config at runtime), not the
// process cwd, so migrations/CLI runs behave the same from any directory.
const root = join(import.meta.dirname, '..')

export const AppDataSource = new DataSource({
  type: env.typeorm.connection, // mysql | postgres | sqlite
  host: env.typeorm.host,
  port: env.typeorm.port,
  username: env.typeorm.username,
  password: env.typeorm.password,
  database: env.typeorm.database,
  synchronize: env.typeorm.synchronize,
  logging: env.typeorm.logging,
  migrationsRun: env.typeorm.migrationsRun,
  timezone: env.typeorm.timezone,
  entities: [join(root, 'database/entities/**/*{.js,.ts}')],
  migrations: [join(root, 'database/migrations/**/*{.js,.ts}')],
  subscribers: [join(root, 'database/subscribers/**/*{.js,.ts}')],
} as DataSourceOptions)

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize()
    console.log(`Database connection established: ${AppDataSource.options.database}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to initialize database: ${error.message}`)
    } else {
      console.error(`Failed to initialize database: ${error}`)
    }
    process.exit(1)
  }
}
