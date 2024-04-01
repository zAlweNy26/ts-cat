import { z } from 'zod'
import { snakeCase } from 'scule'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { Callbacks } from '@langchain/core/callbacks/manager'
import type { StrayCat } from '@lg'

interface ToolOptions {
	direct?: boolean
	examples?: string[]
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
	private _active = true
	private _examples: string[]

	constructor(name: string, description: string, fn: ToolFun, options?: ToolOptions) {
		const { direct = false, examples = [] } = { ...options }

		super({
			name: snakeCase(name),
			description,
			func: ({ text }) => {
				if (!this.cat) { throw new Error('Cat not assigned to tool') }
				return fn(text, this.cat)
			},
			schema: z.object({
				text: z.string().nullable(),
			}),
			returnDirect: direct,
		})

		this._examples = examples
	}

	call(arg: any, configArg?: RunnableConfig | Callbacks | undefined, tags?: string[] | undefined): Promise<string> {
		const formatArg = {
			text: arg,
		}
		return super.call(formatArg, configArg, tags)
	}

	get examples() {
		return this._examples
	}

	get active() {
		return this._active
	}

	toString() {
		return `Tool(name=${this.name}, direct=${this.returnDirect}, description=${this.description})`
	}

	assignCat(cat: StrayCat) {
		this.cat = cat
		return this
	}

	toggle() {
		this._active = !this._active
	}
}
