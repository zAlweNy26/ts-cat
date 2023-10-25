import { createConsola } from 'consola'
import { Table } from 'console-table-printer'
import type { ColorName } from 'consola/utils'
import { getColor } from 'consola/utils'
import { LogLevel, parsedEnv } from './utils.ts'

const logger = createConsola({
	level: LogLevel.indexOf(parsedEnv.logLevel),
	formatOptions: {
		colors: true,
		compact: true,
		date: true,
	},
	fancy: true,
})

export const log = Object.freeze({
	box: logger.box,
	table: <T extends Record<string, any>>(rows: T[]) => {
		if (rows.length === 0) { return }
		const firstRow = rows[0]
		if (!firstRow) { return }
		const table = new Table({
			columns: Object.keys(firstRow).map(key => ({ name: key, alignment: 'left', color: 'green' })),
			rows,
		})
		table.printTable()
	},
	// 0
	error: logger.error,
	fatal: logger.fatal,
	silent: logger.silent,
	// 1
	warn: logger.warn,
	// 2
	normal: logger.log,
	tag: (color: ColorName, tag: string, message: string, ...args: unknown[]) => {
		const tagColor = getColor(color)(` ${tag} `)
		return logger.log(getColor('bold')(`${tagColor} ${message}`), ...args)
	},
	// 3
	info: logger.info,
	success: logger.success,
	fail: logger.fail,
	// 4
	debug: logger.debug,
})
