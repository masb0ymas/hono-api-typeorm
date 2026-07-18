import { env } from '~/config/env'

const LOCAL_ORIGINS = ['http://localhost:3000']
const INTERNAL_ORIGINS = ['https://example.com']

let ALLOWED_ORIGINS = [...INTERNAL_ORIGINS]

if (env.app.nodeEnv !== 'production') {
  ALLOWED_ORIGINS = [...ALLOWED_ORIGINS, ...LOCAL_ORIGINS]
}

const corsOptions = {
  origin: ALLOWED_ORIGINS,
}

export default corsOptions
