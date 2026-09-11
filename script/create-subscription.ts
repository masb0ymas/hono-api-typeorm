import { execFileSync } from 'node:child_process'

const name = process.argv[2]

if (!name) {
  console.error('Error: subscribers name is required.\n')
  console.info('Usage: pnpm run db:subscribe:create <subscribers-name>\n')
  process.exit(1)
}

console.log(`Creating subscriber: ${name}`)

// execFileSync (not execSync) so the name is passed as an argument and cannot
// be interpreted by a shell.
execFileSync('typeorm', ['subscriber:create', `src/database/subscribers/${name}`], {
  stdio: 'inherit',
})
