import { execFileSync } from 'node:child_process'

const name = process.argv[2]

if (!name) {
  console.error('Error: migration name is required.\n')
  console.info('Usage: pnpm run db:migrate:create <migration-name>\n')
  process.exit(1)
}

console.log(`Creating migration: ${name}`)

// execFileSync (not execSync) so the name is passed as an argument and cannot
// be interpreted by a shell.
execFileSync('typeorm', ['migration:create', `src/database/migrations/${name}`], {
  stdio: 'inherit',
})
