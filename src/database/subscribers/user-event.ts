import argon2 from 'argon2'
import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  type UpdateEvent,
} from 'typeorm'

import { User } from '../entities/users'

@EventSubscriber()
export class UserEvent implements EntitySubscriberInterface {
  listenTo(): typeof User {
    return User
  }

  async hashPassword(entity: User): Promise<void> {
    if (typeof entity.password !== 'string' || entity.password === '') return

    entity.password = await argon2.hash(entity.password)
  }

  beforeInsert(event: InsertEvent<User>): Promise<void> | undefined {
    if (event.entity.password) {
      return this.hashPassword(event.entity)
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    const password = event.entity?.password
    if (typeof password !== 'string' || password === '') return

    // Only re-hash when the value actually changed; otherwise an update of any
    // other field would hash the already-hashed password again.
    if (password !== event.databaseEntity?.password) {
      await this.hashPassword(event.entity as User)
    }
  }
}
