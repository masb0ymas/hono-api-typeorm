import type { MigrationInterface, QueryRunner } from 'typeorm'

import { env } from '~/config/env'

export class InitialSqlQuery1784380188362 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    const timezone = env.typeorm.timezone

    // `ALTER DATABASE ... SET timezone` is a utility statement, so it takes a
    // literal rather than a bind parameter. The value is checked against
    // Postgres's own timezone list first, then quoted as a literal.
    const known = await queryRunner.query('SELECT 1 FROM pg_timezone_names WHERE name = $1', [
      timezone,
    ])
    if (known.length === 0) {
      throw new Error(`Unknown timezone: ${timezone}`)
    }

    const database = queryRunner.connection.driver.escape(env.typeorm.database)
    await queryRunner.query(`ALTER DATABASE ${database} SET timezone TO '${timezone}';`)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no query needed
  }
}
