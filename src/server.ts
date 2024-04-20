import isDocker from 'is-docker'
import { checkPort } from 'get-port-please'
import { logWelcome, parsedEnv } from './utils.ts'
import app from './app.ts'

const inDocker = isDocker()

try {
	const port = inDocker ? 80 : parsedEnv.port
	const host = inDocker ? '0.0.0.0' : parsedEnv.host
	await checkPort(port, host)
	await app.listen({ host, port })
	await app.ready()
	app.swagger()
	logWelcome()
}
catch (err) {
	app.log.error(err)
	await app.close()
	process.exit(1)
}
