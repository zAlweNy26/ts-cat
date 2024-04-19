import { z } from 'zod'
import { kebabCase } from 'scule'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { Callbacks } from '@langchain/core/callbacks/manager'
import type { StrayCat } from '@lg'

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
		})

		this.startExamples = startExamples
	}

	call(arg: any, configArg?: RunnableConfig | Callbacks | undefined, tags?: string[] | undefined): Promise<string> {
		const formatArg = {
			text: arg,
		}
		return super.call(formatArg, configArg, tags)
	}

	toString() {
		return `Tool(name=${this.name}, direct=${this.returnDirect}, description=${this.description})`
	}

	assignCat(cat: StrayCat) {
		this.cat = cat
		return this
	}
}
