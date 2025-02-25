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
| <a id="askconfirm"></a> `askConfirm` | `boolean` | `undefined` |
| <a id="description"></a> `description` | `string` | `undefined` |
| <a id="invalidfields"></a> `invalidFields` | `string`[] | `[]` |
| <a id="model"></a> `model` | `S` | `undefined` |
| <a id="name-1"></a> `name` | `string` | `undefined` |
| <a id="schema-1"></a> `schema` | `ZodObject`\<`T`\> | `undefined` |
| <a id="startexamples"></a> `startExamples` | `string`[] | `undefined` |
| <a id="stopexamples"></a> `stopExamples` | `string`[] | `undefined` |
| <a id="submit"></a> `submit` | `FormSubmit`\<`S`\> | `undefined` |

## Accessors

### active

#### Get Signature

> **get** **active**(): `boolean`

##### Returns

`boolean`

#### Set Signature

> **set** **active**(`active`): `void`

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `active` | `boolean` |

##### Returns

`void`

***

### state

#### Get Signature

> **get** **state**(): [`FormState`](../enumerations/FormState.md)

##### Returns

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
