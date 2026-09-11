import { BeforeInsert, CreateDateColumn, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { v7 as uuidv7 } from 'uuid'

// No @Entity() here: the class is only a column mixin for the concrete
// entities. Decorating it would make TypeORM create a stray `base` table.
export abstract class Base {
  // Assigned in @BeforeInsert below. Deliberately not a `uuidv7()` column
  // default: that function only exists in Postgres 18+.
  @PrimaryColumn({ type: 'uuid' })
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
