[Overview](../index.md) / Form

# Form\<T, S\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `z.ZodType`\> | `Record`\<`string`, `z.ZodType`\> |
| `S` *extends* `z.infer`\<`z.ZodObject`\<`T`\>\> | `z.infer`\<`z.ZodObject`\<`T`\>\> |

## Constructors

### new Form()

> **new Form**\<`T`, `S`\>(`name`, `schema`, `options`): [`Form`](Form.md)\<`T`, `S`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `schema` | `T` |
| `options` | `FormOptions`\<`S`\> |

#### Returns

[`Form`](Form.md)\<`T`, `S`\>

## Properties

| Property | Type | Default value |
| ------ | ------ | ------ |
| `askConfirm` | `boolean` | `undefined` |
| `description` | `string` | `undefined` |
| `invalidFields` | `string`[] | `[]` |
| `model` | `S` | `undefined` |
| `name` | `string` | `undefined` |
| `schema` | `ZodObject`\<`T`, `UnknownKeysParam`, `ZodTypeAny`, \{ \[k in string \| number \| symbol\]: addQuestionMarks\<baseObjectOutputType\<T\>, any\>\[k\] \}, \{ \[k in string \| number \| symbol\]: baseObjectInputType\<T\>\[k\] \}\> | `undefined` |
| `startExamples` | `string`[] | `undefined` |
| `stopExamples` | `string`[] | `undefined` |
| `submit` | `FormSubmit`\<`S`\> | `undefined` |

## Accessors

### active

> `get` **active**(): `boolean`

> `set` **active**(`active`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `active` | `boolean` |

#### Returns

`boolean`

***

### state

> `get` **state**(): [`FormState`](../enumerations/FormState.md)

#### Returns

[`FormState`](../enumerations/FormState.md)

## Methods

### assignCat()

> **assignCat**(`cat`): [`Form`](Form.md)\<`T`, `S`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cat` | [`StrayCat`](StrayCat.md) |

#### Returns

[`Form`](Form.md)\<`T`, `S`\>

***

### next()

> **next**(): `Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

#### Returns

`Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

***

### reset()

> **reset**(): `void`

#### Returns

`void`
