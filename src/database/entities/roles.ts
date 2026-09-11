import { Column, DeleteDateColumn, Entity, Index, OneToMany, type Relation } from 'typeorm'

import { Base } from './base'
import { User } from './users'

@Entity({ name: 'roles' })
export class Role extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Index()
  @Column()
  name: string

  @OneToMany(() => User, (user) => user.role)
  users: Relation<User>[]
}
