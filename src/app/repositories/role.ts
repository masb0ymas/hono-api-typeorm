import type { EntityManager } from 'typeorm'

import { AppDataSource } from '~/config/database'
import { Role } from '~/database/entities/roles'

import BaseRepository from './base'

export default class RoleRepository extends BaseRepository<Role> {
  constructor(manager?: EntityManager) {
    super({
      repository: (manager ?? AppDataSource).getRepository(Role),
      model: 'roles',
      entity: Role,
    })
  }
}
