import _ from 'lodash'
import type { MigrationInterface, QueryRunner } from 'typeorm'
import { v7 as uuidv7 } from 'uuid'

import { AppDataSource } from '~/config/database'
import { env } from '~/config/env'
import { USER_DATA } from '~/lib/constants/seed/user'

import { User } from '../entities/user'

export class UserSeeder1784380981508 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const formData: Record<string, unknown>[] = []

    if (!_.isEmpty(USER_DATA)) {
      for (let i = 0; i < USER_DATA.length; i += 1) {
        const item = USER_DATA[i]

        formData.push({
          ...item,
          id: uuidv7(),
          is_active: true,
          password: env.app.defaultPass,
          created_at: new Date(),
          updated_at: new Date(),
        })
      }
    }

    // save
    await AppDataSource.getRepository(User).save(formData)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM users')
  }
}
