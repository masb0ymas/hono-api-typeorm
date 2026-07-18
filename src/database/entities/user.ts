import argon2 from 'argon2'
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  type Relation,
  Unique,
} from 'typeorm'

import { Base } from './base'
import { Role } from './role'
import { Session } from './session'

@Entity({ name: 'users' })
@Unique(['email'])
export class User extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Index()
  @Column()
  fullname: string

  @Index()
  @Column()
  email: string

  @Column({ select: false, nullable: true })
  password!: string

  @Index()
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string

  @Column({ type: 'text', nullable: true })
  token_verify!: string

  @Column({ type: 'text', nullable: true })
  address!: string

  @Index()
  @Column({ type: 'boolean', default: false })
  is_active: boolean

  @Index()
  @Column({ type: 'boolean', default: false })
  is_blocked: boolean

  @ManyToOne(() => Role, (role) => role)
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>

  @Index()
  @Column({ type: 'uuid' })
  role_id: string

  @OneToMany(() => Session, (session) => session.user)
  @JoinTable()
  sessions: Relation<Session>[]

  async comparePassword(current_password: string): Promise<boolean> {
    return await argon2.verify(this.password, current_password)
  }
}
