import { join } from 'node:path'
import { readdirSync, statSync, unlinkSync } from 'node:fs'
import nodemon from 'nodemon'
import { log } from './src/logger.ts'
import { parsedEnv } from './src/utils.ts'

const { watch, verbose } = parsedEnv

nodemon({
	legacyWatch: true,
	ext: 'ts,json',
	watch: ['src'],
	exec: 'tsx --no-warnings=ExperimentalWarning --enable-source-maps --trace-warnings',
	script: 'src/main.ts',
	ignore: watch ? ['**/settings.json', '**/tmp_*.ts', 'src/plugins/**', 'src/assets/**'] : ['**/**'],
	env: {
		NODE_ENV: watch ? 'development' : 'production',
		NODE_NO_WARNINGS: verbose ? '0' : '1',
	},
})

nodemon.once('start', () => {
	log.info('Starting the Cat...')
}).on('restart', () => {
	log.info('Restarting the Cat...')
}).on('quit', () => {
	log.info('Stopping the Cat...')
	deleteTempFiles('./src', f => f.startsWith('tmp_') && f.endsWith('.ts'))
	process.exit()
}).on('error', (err) => {
	log.error(err)
})

process.on('SIGINT', () => {
	nodemon.emit('quit')
})

function deleteTempFiles(path: string, check: (str: string) => boolean) {
	readdirSync(path).forEach((file) => {
		const filePath = join(path, file)
		const isDirectory = statSync(filePath).isDirectory()
		if (isDirectory) { deleteTempFiles(filePath, check) }
		else if (check(file)) { unlinkSync(filePath) }
	})
}
