import { z } from 'zod'
import { kebabCase } from 'scule'
import _IsEmpty from 'lodash/isEmpty.js'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { StrayCat } from '@lg'
import { parsedEnv } from '@utils'

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

export class Tool extends DynamicStructuredTool {
	private cat: StrayCat | undefined
	public startExamples: string[]
	active = true

	constructor(name: string, description: string, fn: ToolFun, options?: ToolOptions) {
		const { direct = false, startExamples = [] } = { ...options }

		super({
			name: kebabCase(name),
			description,
			func: ({ text }) => {
				if (!this.cat) throw new Error('Cat not assigned to tool')
				return fn(text, this.cat)
			},
			schema: z.object({
				text: z.string().nullable(),
			}),
			returnDirect: direct,
			verbose: parsedEnv.verbose,
		})

		this.startExamples = startExamples
	}

	invoke(input: string | { [x: string]: any }, config?: RunnableConfig | undefined): Promise<string> {
		const arg = {
			text: typeof input === 'object' ? (_IsEmpty(input) ? null : JSON.stringify(input)) : `${input}`,
		}
		return super.invoke(arg, config)
	}

	assignCat(cat: StrayCat) {
		this.cat = cat
		return this
	}
}
