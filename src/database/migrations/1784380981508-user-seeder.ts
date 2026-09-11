import argon2 from 'argon2'
import type { MigrationInterface, QueryRunner } from 'typeorm'
import { v7 as uuidv7 } from 'uuid'

import { env } from '~/config/env'
import { USER_DATA } from '~/lib/constants/seed/user'

import { User } from '../entities/users'

export class UserSeeder1784380981508 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (USER_DATA.length === 0) return

    // The password is hashed here rather than left to the UserEvent subscriber:
    // the TypeORM CLI loads only the DataSource, so entity subscribers are not
    // registered during migrations and the hash would never run.
    const password = await argon2.hash(env.app.defaultPass)

    await queryRunner.manager.save(
      User,
      USER_DATA.map((item) => ({
        ...item,
        id: uuidv7(),
        is_active: true,
        password,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM users')
  }
}
