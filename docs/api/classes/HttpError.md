[Overview](../index.md) / HttpError

# HttpError

## Extends

- `Error`

## Constructors

### new HttpError()

> **new HttpError**(`message`, `status`, `cause`, `data`): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `message` | `string` | `undefined` |
| `status` | `number` | `undefined` |
| `cause` | `string` | `undefined` |
| `data` | `any` | `undefined` |

#### Returns

[`HttpError`](HttpError.md)

#### Overrides

`Error.constructor`

## Properties

| Property | Modifier | Type | Default value | Inherited from |
| ------ | ------ | ------ | ------ | ------ |
| `cause` | `public` | `string` | `undefined` | `Error.cause` |
| `data` | `public` | `any` | `undefined` | - |
| `message` | `public` | `string` | `undefined` | `Error.message` |
| `status` | `public` | `number` | `undefined` | - |

## Methods

### BadGateway()

> `static` **BadGateway**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### BadRequest()

> `static` **BadRequest**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### Conflict()

> `static` **Conflict**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### Forbidden()

> `static` **Forbidden**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### GatewayTimeout()

> `static` **GatewayTimeout**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### IAmATeapot()

> `static` **IAmATeapot**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### InternalServer()

> `static` **InternalServer**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### MethodNotAllowed()

> `static` **MethodNotAllowed**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### NotFound()

> `static` **NotFound**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### NotImplemented()

> `static` **NotImplemented**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### PaymentRequired()

> `static` **PaymentRequired**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### ServiceUnavailable()

> `static` **ServiceUnavailable**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### TooManyRequests()

> `static` **TooManyRequests**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### Unauthorized()

> `static` **Unauthorized**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)

***

### UnsupportedMediaType()

> `static` **UnsupportedMediaType**(`message`, `data`?): [`HttpError`](HttpError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data`? | `any` |

#### Returns

[`HttpError`](HttpError.md)
