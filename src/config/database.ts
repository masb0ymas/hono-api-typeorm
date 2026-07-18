import 'reflect-metadata'

import { DataSource, type DataSourceOptions } from 'typeorm'

import { env } from './env'

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
  entities: [`${process.cwd()}/dist/database/entities/**/*{.js,.ts}`],
  migrations: [`${process.cwd()}/dist/database/migrations/**/*{.js,.ts}`],
  subscribers: [`${process.cwd()}/dist/database/subscribers/**/*{.js,.ts}`],
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
