import { env } from '~/config/env'

const INTERNAL_ORIGINS = ['https://example.com']

export default {
  origin:
    env.app.nodeEnv === 'production'
      ? INTERNAL_ORIGINS
      : [...INTERNAL_ORIGINS, 'http://localhost:3000'],
}
