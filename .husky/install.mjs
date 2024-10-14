/* import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path' */

// Skip Husky install in production and CI
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') process.exit(0)

/* const homeDir = os.homedir()
const huskyDir = path.join(homeDir, '.config', 'husky')
const initFilePath = path.join(huskyDir, 'init.sh')

await fs.mkdir(huskyDir, { recursive: true })
await fs.writeFile(initFilePath, '', { flag: 'a' })

const bunPath = path.join(homeDir, '.bun', 'bin')
const exportPathLine = `export PATH=$PATH:${bunPath}\n`
await fs.appendFile(initFilePath, exportPathLine) */

const husky = (await import('husky')).default

console.log(husky())
