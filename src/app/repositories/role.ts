import { AppDataSource } from '~/config/database'
import { Role } from '~/database/entities/roles'

import BaseRepository from './base'

export default class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super({
      repository: AppDataSource.getRepository(Role),
      model: 'roles',
    })
  }
}
