import _ from 'lodash'
import type { MigrationInterface, QueryRunner } from 'typeorm'

import { AppDataSource } from '~/config/database'
import { ROLE_DATA } from '~/lib/constants/seed/role'

import { Role } from '../entities/role'

export class RoleSeeder1784380263013 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const formData: Record<string, unknown>[] = []

    if (!_.isEmpty(ROLE_DATA)) {
      for (let i = 0; i < ROLE_DATA.length; i += 1) {
        const item = ROLE_DATA[i]

        formData.push({
          ...item,
          created_at: new Date(),
          updated_at: new Date(),
        })
      }
    }

    // save
    await AppDataSource.getRepository(Role).save(formData)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM roles')
  }
}
