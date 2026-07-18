import argon2 from 'argon2'
import _ from 'lodash'
import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  type UpdateEvent,
} from 'typeorm'

import { User } from '../entities/user'

@EventSubscriber()
export class UserEvent implements EntitySubscriberInterface {
  listenTo(): typeof User {
    return User
  }

  async hashPassword(entity: User): Promise<void> {
    entity.password = await argon2.hash(entity.password)
  }

  beforeInsert(event: InsertEvent<User>): Promise<void> | undefined {
    if (!_.isEmpty(event.entity.password)) {
      return this.hashPassword(event.entity)
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    if (!_.isEmpty(event.entity?.password)) {
      if (event.entity?.password !== event.databaseEntity?.password) {
        await this.hashPassword(event.entity as User)
      }
    }
  }
}
