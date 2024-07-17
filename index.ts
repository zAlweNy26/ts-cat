import nodemon from 'nodemon'
import { log } from './src/logger.ts'
import { parsedEnv } from './src/utils.ts'

const { watch, verbose } = parsedEnv

nodemon({
	ext: 'ts,json',
	watch: ['src/**', '.env'],
	exec: 'bun',
	script: 'src/main.ts',
	ignoreRoot: watch ? ['**/settings.json', 'src/plugins/**', 'src/assets/**'] : ['**/**'],
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
	process.exit()
})

process.on('SIGINT', () => {
	nodemon.emit('quit')
})
