import {
  BaseEntity,
  BeforeInsert,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { v7 as uuidv7 } from 'uuid'

export type BaseSchema = {
  id: string
  created_at: Date
  updated_at: Date
}

@Entity()
export abstract class Base extends BaseEntity {
  @Index({ unique: true })
  @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
  id!: string

  @Index()
  @CreateDateColumn({ nullable: false })
  created_at!: Date

  @UpdateDateColumn({ nullable: false })
  updated_at!: Date

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7()
    }
  }
}
