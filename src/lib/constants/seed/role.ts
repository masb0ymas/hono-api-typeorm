const ID_ADMIN = '019f755a-c568-7703-9f43-c666a9742f6d'
const ID_USER = '019f755a-c568-7bff-9d90-ad5ff6bcfaf9'

export const ROLE_SEED = {
  ADMIN: ID_ADMIN,
  USER: ID_USER,
} as const

export const ROLE_DATA = [
  {
    id: ROLE_SEED.ADMIN,
    name: 'Admin',
  },
  {
    id: ROLE_SEED.USER,
    name: 'User',
  },
]
