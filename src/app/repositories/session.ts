import type { EntityManager } from 'typeorm'

import { AppDataSource } from '~/config/database'
import { Session } from '~/database/entities/sessions'

import BaseRepository from './base'

export default class SessionRepository extends BaseRepository<Session> {
  constructor(manager?: EntityManager) {
    super({
      repository: (manager ?? AppDataSource).getRepository(Session),
      model: 'sessions',
      entity: Session,
    })
  }

  /**
   * Find the session belonging to a user for the presented access token
   */
  async findByUserAndToken(
    userId: string,
    token: string,
    manager?: EntityManager
  ): Promise<Session | null> {
    return await this.scoped(manager).findOne({ where: { user_id: userId, token } })
  }

  /**
   * Find a session by its id (used via a refresh token's `id_token` link)
   */
  async findByIdForUser(
    id: string,
    userId: string,
    manager?: EntityManager
  ): Promise<Session | null> {
    return await this.scoped(manager).findOne({ where: { id, user_id: userId } })
  }

  /**
   * Revoke a session by its id
   */
  async deleteById(id: string, manager?: EntityManager) {
    await this.scoped(manager).delete({ id })
  }
}
