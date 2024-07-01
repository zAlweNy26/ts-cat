import { join } from 'node:path'
import { readdirSync, statSync, unlinkSync } from 'node:fs'
import nodemon from 'nodemon'
import { log } from './src/logger.ts'
import { parsedEnv } from './src/utils.ts'

const { watch, verbose } = parsedEnv

nodemon({
	ext: 'ts,json',
	watch: ['src/**', '.env'],
	exec: 'bun',
	script: 'src/main.ts',
	ignoreRoot: watch ? ['**/settings.json', '**/tmp_*.ts', 'src/plugins/**', 'src/assets/**'] : ['**/**'],
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
	deleteTempFiles('./src')
	process.exit()
})

process.on('SIGINT', () => {
	nodemon.emit('quit')
})

function deleteTempFiles(path: string) {
	readdirSync(path).forEach((file) => {
		const filePath = join(path, file)
		const isDirectory = statSync(filePath).isDirectory()
		if (isDirectory) deleteTempFiles(filePath)
		else if (file.startsWith('tmp_') && file.endsWith('.ts')) unlinkSync(filePath)
	})
}
