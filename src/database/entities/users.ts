import argon2 from 'argon2'
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  type Relation,
  Unique,
} from 'typeorm'

import { Base } from './base'
import { RefreshToken } from './refresh_tokens'
import { Role } from './roles'
import { Session } from './sessions'

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

  @Index()
  @Column({ type: 'uuid' })
  role_id: string

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>

  @OneToMany(() => Session, (session) => session.user)
  sessions: Relation<Session>[]

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refresh_tokens: Relation<RefreshToken>[]

  async comparePassword(current_password: string): Promise<boolean> {
    return await argon2.verify(this.password, current_password)
  }
}
