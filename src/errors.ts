import { Elysia, t } from 'elysia'

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
			description: 'The model for an HTTP error response',
		}),
	})
	.onError(({ code, error, set }) => {
		if (code === 'HTTP_ERROR') {
			set.status = error.status
			set.headers['content-type'] = 'application/json+problem'
			return {
				code: error.message,
				status: error.status,
				message: error.cause,
				data: error.data,
			}
		}
	})
