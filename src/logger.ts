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

/**
 * The logger module provides various logging functions.
 */
export const log = Object.freeze({
	/**
	 * Logs a message in a box format.
	 * @param message The message to be logged.
	 */
	box: logger.box,
	/**
	 * Logs an array of objects in a table format.
	 * @param rows The array of objects to be logged as a table.
	 */
	table: <T extends Record<string, any>>(rows: T[]) => {
		if (rows.length === 0) return
		const firstRow = rows[0]
		if (!firstRow) return
		const table = new Table({
			columns: Object.keys(firstRow).map(key => ({ name: key, alignment: 'left', color: 'green' })),
			rows,
		})
		table.printTable()
	},
	dir: (content: any) => console.dir(content, {
		colors: true,
		depth: null,
		breakLength: 120,
	}),
	/**
	 * Logs an error message.
	 * @param message The error message to be logged.
	 */
	error: logger.error,
	/**
	 * Logs a fatal error message.
	 * @param message The fatal error message to be logged.
	 */
	fatal: logger.fatal,
	/**
	 * Logs a silent message.
	 * @param message The silent message to be logged.
	 */
	silent: logger.silent,
	/**
	 * Logs a warning message.
	 * @param message The warning message to be logged.
	 */
	warn: logger.warn,
	/**
	 * Logs a normal message.
	 * @param message The message to be logged.
	 */
	normal: logger.log,
	/**
	 * Logs a message with a specified tag and color.
	 * @param color The color of the tag.
	 * @param tag The tag to be displayed.
	 * @param message The message to be logged.
	 * @param args Additional arguments to be logged.
	 */
	tag: (color: ColorName, tag: string, message: string, ...args: unknown[]) => {
		const tagColor = getColor(color)(` ${tag} `)
		logger.log(getColor('bold')(`${tagColor} ${message}`), ...args)
	},
	/**
	 * Logs an info message.
	 * @param message The info message to be logged.
	 */
	info: logger.info,
	/**
	 * Logs a success message.
	 * @param message The success message to be logged.
	 */
	success: logger.success,
	/**
	 * Logs a failure message.
	 * @param message The failure message to be logged.
	 */
	fail: logger.fail,
	/**
	 * Logs a debug message.
	 * @param message The debug message to be logged.
	 */
	debug: logger.debug,
})
