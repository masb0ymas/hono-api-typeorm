import type { MigrationInterface, QueryRunner } from 'typeorm'

import { ROLE_DATA } from '~/lib/constants/seed/role'

import { Role } from '../entities/roles'

export class RoleSeeder1784380263013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (ROLE_DATA.length === 0) return

    // Use the migration's own manager so the seeds commit with the migration.
    await queryRunner.manager.save(
      Role,
      ROLE_DATA.map((item) => ({
        ...item,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM roles')
  }
}
