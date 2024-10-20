import { Elysia, t } from 'elysia'
import { log } from './logger'

/**
 * Catches errors from a promise.
 * @param promise The promise to handle.
 * @param options Additional options for handling the promise.
 * @param options.errorsToCatch An optional array of error constructors to catch.
 * @param options.logMessage An optional message to log when an error occurs.
 * @returns A tuple with either the error or the result of the promise.
 * @throws Will rethrow the error if it is not in the `errorsToCatch` array.
 */
export async function catchError<T, E extends new (...args: any[]) => Error>(
	promise: Promise<T>,
	options?: { errorsToCatch?: E[], logMessage?: string },
): Promise<[undefined, T] | [InstanceType<E>]> {
	try {
		const res = await promise
		return [undefined, res]
	}
	catch (error: any) {
		const { errorsToCatch, logMessage } = options ?? {}
		if (errorsToCatch === undefined || errorsToCatch.some(e => error instanceof e)) {
			log.error(logMessage || 'An error occurred while executing a promise:')
			log.dir(error)
			return [error]
		}

		throw error
	}
}

export class HttpError extends Error {
	public constructor(
		public message: string,
		public status: number,
		public cause: string,
		public data: any = undefined,
	) {
		super(message, data)
	}

	public static BadRequest(message: string, data?: any) {
		return new HttpError('Bad Request', 400, message, data)
	}

	public static Unauthorized(message: string, data?: any) {
		return new HttpError('Unauthorized', 401, message, data)
	}

	public static PaymentRequired(message: string, data?: any) {
		return new HttpError('Payment Required', 402, message, data)
	}

	public static Forbidden(message: string, data?: any) {
		return new HttpError('Forbidden', 403, message, data)
	}

	public static NotFound(message: string, data?: any) {
		return new HttpError('Not Found', 404, message, data)
	}

	public static MethodNotAllowed(message: string, data?: any) {
		return new HttpError('Method Not Allowed', 405, message, data)
	}

	public static Conflict(message: string, data?: any) {
		return new HttpError('Conflict', 409, message, data)
	}

	public static UnsupportedMediaType(message: string, data?: any) {
		return new HttpError('Unsupported Media Type', 415, message, data)
	}

	public static IAmATeapot(message: string, data?: any) {
		return new HttpError('I Am A Teapot', 418, message, data)
	}

	public static TooManyRequests(message: string, data?: any) {
		return new HttpError('Too Many Requests', 429, message, data)
	}

	public static InternalServer(message: string, data?: any) {
		return new HttpError('Internal Server Error', 500, message, data)
	}

	public static NotImplemented(message: string, data?: any) {
		return new HttpError('Not Implemented', 501, message, data)
	}

	public static BadGateway(message: string, data?: any) {
		return new HttpError('Bad Gateway', 502, message, data)
	}

	public static ServiceUnavailable(message: string, data?: any) {
		return new HttpError('Service Unavailable', 503, message, data)
	}

	public static GatewayTimeout(message: string, data?: any) {
		return new HttpError('Gateway Timeout', 504, message, data)
	}
}

export const httpError = new Elysia({ name: 'http-error' })
	.decorate('HttpError', HttpError)
	.error({ HTTP_ERROR: HttpError })
	.model({
		error: t.Object({
			code: t.String(),
			status: t.Number(),
			message: t.String(),
			data: t.Optional(t.Any()),
		}, {
			examples: [{
				code: 'Bad Request',
				status: 400,
				message: 'The request was invalid',
			}],
			$id: 'GenericError',
			title: 'Generic Error',
			description: 'Generic HTTP error response',
		}),
	})
	.onError({ as: 'global' }, ({ code, error, set }) => {
		if (code === 'HTTP_ERROR') {
			set.status = error.status
			set.headers['content-type'] = 'application/json'
			return {
				code: error.message,
				status: error.status,
				message: error.cause,
				data: error.data,
			}
		}
	})
