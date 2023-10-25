import type { BaseCallbackHandlerInput } from '@langchain/core/callbacks/base'
import { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import type { StrayCat } from './stray-cat.ts'

export class NewTokenHandler extends BaseCallbackHandler {
	name = 'NewToken'

	constructor(public stray: StrayCat, input?: BaseCallbackHandlerInput) {
		super(input)
	}

	handleLLMNewToken(token: string, ..._args: any[]) {
		this.stray.send({
			type: 'token',
			content: token,
		})
	}
}
