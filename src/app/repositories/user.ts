import type { EntityManager } from 'typeorm'

import { AppDataSource } from '~/config/database'
import { User } from '~/database/entities/users'
import type { DtoFindAll, FindParams } from '~/types/repository'

import BaseRepository from './base'

export default class UserRepository extends BaseRepository<User> {
  constructor(manager?: EntityManager) {
    super({
      repository: (manager ?? AppDataSource).getRepository(User),
      model: 'users',
      entity: User,
    })
  }

  /**
   * Find a user by email, password hash included (it is `select: false`).
   */
  async findByEmailWithPassword(email: string, manager?: EntityManager): Promise<User | null> {
    return await this.scoped(manager).findOne({
      select: {
        id: true,
        fullname: true,
        email: true,
        password: true,
        is_active: true,
        role_id: true,
      },
      where: { email },
    })
  }

  /**
   * Find a user by id with the password hash included.
   */
  async findByIdWithPassword(id: string, manager?: EntityManager): Promise<User | null> {
    return await this.scoped(manager).findOne({
      select: { id: true, password: true },
      where: { id },
    })
  }

  /**
   * Whether an email is already taken, including soft-deleted users whose row
   * still occupies the unique index.
   */
  async existsByEmail(email: string, manager?: EntityManager): Promise<boolean> {
    return (
      (await this.scoped(manager).findOne({
        select: { id: true },
        where: { email },
        withDeleted: true,
      })) !== null
    )
  }

  /**
   * Update a user's password. The UserEvent subscriber hashes it.
   */
  async updatePassword(id: string, password: string, manager?: EntityManager): Promise<void> {
    await this.scoped(manager).update({ id }, { password })
  }

  /**
   * Find users with their role
   * @param params Find parameters
   * @returns Users with the role relation loaded
   */
  async findWithRelations(params: FindParams, manager?: EntityManager): Promise<DtoFindAll<User>> {
    return this.find(
      params,
      (query) => query.leftJoinAndSelect(`${this._model}.role`, 'role'),
      manager
    )
  }
}
