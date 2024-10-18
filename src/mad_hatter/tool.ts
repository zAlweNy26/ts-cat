import type { RunnableConfig } from '@langchain/core/runnables'
import type { StrayCat } from '@lg'
import { db } from '@db'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { parsedEnv } from '@utils'
import _IsEmpty from 'lodash/isEmpty.js'
import { kebabCase } from 'scule'
import { z } from 'zod'

interface ToolOptions {
	direct?: boolean
	startExamples?: string[]
}

type ToolFun = (input: string | null, cat: StrayCat) => Promise<string>

export const isTool = (tool: any): tool is Tool => tool instanceof Tool

export const CatTool = Object.freeze({
	/**
	 * Add a tool to the plugin
	 * @param name the name of the tool
	 * @param description the description of the tool
	 * @param fn the function to execute when the tool is called
	 * @param options the options of the tool
	 * @returns the tool instance
	 */
	add(name: string, description: string, fn: ToolFun, options?: ToolOptions) {
		return new Tool(
			name,
			description,
			fn,
			options,
		)
	},
})

const toolSchema = z.object({
	text: z.string().nullable(),
})

type ToolSchema = z.infer<typeof toolSchema>

export class Tool extends DynamicStructuredTool<typeof toolSchema> {
	#cat!: StrayCat
	#active = true
	startExamples: string[]

	constructor(name: string, description: string, fn: ToolFun, options?: ToolOptions) {
		const { direct = false, startExamples = [] } = options ?? {}

		super({
			name: kebabCase(name),
			description,
			func: ({ text }) => {
				if (!this.#cat) throw new Error('Cat not assigned to tool')
				return fn(text, this.#cat)
			},
			schema: toolSchema,
			returnDirect: direct,
			verbose: parsedEnv.verbose,
		})

		this.startExamples = startExamples
	}

	get active() {
		return this.#active
	}

	set active(active: boolean) {
		this.#active = active
		db.update((db) => {
			if (this.#active) db.activeTools.push(this.name)
			else db.activeTools = db.activeTools.filter(f => f !== this.name)
		})
	}

	invoke(input: string | { [x: string]: any }, config?: RunnableConfig | undefined): Promise<string> {
		const arg: ToolSchema = {
			text: typeof input === 'object' ? (_IsEmpty(input) ? null : JSON.stringify(input)) : `${input}`,
		}
		return super.invoke(arg, config)
	}

	assignCat(cat: StrayCat) {
		this.#cat = cat
		return this
	}
}
