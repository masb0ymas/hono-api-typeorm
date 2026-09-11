import { AppDataSource } from '~/config/database'
import { Session } from '~/database/entities/sessions'

import BaseRepository from './base'

export default class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super({
      repository: AppDataSource.getRepository(Session),
      model: 'sessions',
    })
  }

  /**
   * Find the session belonging to a user for the presented access token
   */
  async findByToken(userId: string, token: string): Promise<Session | null> {
    return await this.repository.findOne({ where: { user_id: userId, token } })
  }

  /**
   * Revoke every session belonging to a user
   */
  async deleteByUserId(userId: string) {
    await this.repository.delete({ user_id: userId })
  }
}
