[Overview](../index.md) / Plugin

# Plugin\<T, S\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `z.ZodType`\> | `Record`\<`string`, `z.ZodType`\> |
| `S` *extends* `z.infer`\<`z.ZodObject`\<`T`\>\> | `z.infer`\<`z.ZodObject`\<`T`\>\> |

## Properties

| Property | Modifier | Type | Default value |
| ------ | ------ | ------ | ------ |
| `forms` | `public` | [`Form`](Form.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>[] | `[]` |
| `path` | `public` | `string` | `undefined` |
| `tools` | `public` | [`Tool`](Tool.md)[] | `[]` |

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

### hooks

> `get` **hooks**(): [`Hook`](../type-aliases/Hook.md)[]

#### Returns

[`Hook`](../type-aliases/Hook.md)[]

***

### id

> `get` **id**(): `string`

#### Returns

`string`

***

### info

> `get` **info**(): `object`

#### Returns

`object`

| Name | Type | Default value |
| ------ | ------ | ------ |
| `active` | `boolean` | - |
| `forms` | `object`[] | - |
| `hooks` | `object`[] | - |
| `id` | `string` | - |
| `manifest` | `object` | - |
| `manifest.authorName` | `string` | - |
| `manifest.authorUrl`? | `string` | - |
| `manifest.description` | `string` | - |
| `manifest.name` | `string` | - |
| `manifest.pluginUrl`? | `string` | - |
| `manifest.tags` | `string`[] | - |
| `manifest.thumb`? | `string` | - |
| `manifest.version` | `string` | - |
| `tools` | `object`[] | - |
| `upgradable` | `boolean` | false |

***

### manifest

> `get` **manifest**(): `object`

#### Returns

`object`

| Name | Type |
| ------ | ------ |
| `authorName` | `string` |
| `authorUrl`? | `string` |
| `description` | `string` |
| `name` | `string` |
| `pluginUrl`? | `string` |
| `tags` | `string`[] |
| `thumb`? | `string` |
| `version` | `string` |

***

### reloading

> `get` **reloading**(): `boolean`

#### Returns

`boolean`

***

### schema

> `get` **schema**(): `ZodObject`\<`T`, `UnknownKeysParam`, `ZodTypeAny`, \{ \[k in string \| number \| symbol\]: addQuestionMarks\<baseObjectOutputType\<T\>, any\>\[k\] \}, \{ \[k in string \| number \| symbol\]: baseObjectInputType\<T\>\[k\] \}\>

#### Returns

`ZodObject`\<`T`, `UnknownKeysParam`, `ZodTypeAny`, \{ \[k in string \| number \| symbol\]: addQuestionMarks\<baseObjectOutputType\<T\>, any\>\[k\] \}, \{ \[k in string \| number \| symbol\]: baseObjectInputType\<T\>\[k\] \}\>

***

### settings

> `get` **settings**(): `S`

> `set` **settings**(`settings`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `settings` | `S` |

#### Returns

`S`

## Methods

### reload()

> **reload**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### remove()

> **remove**(): `Promise`\<`void`\>

Asynchronously removes the current plugin.
This method performs the following actions:
1. Triggers the 'removed' event.
2. Revokes all object URLs stored.
3. If any dependencies are found in the plugin's package.json file, they are uninstalled.
4. Deletes the plugin's directory and its contents.

#### Returns

`Promise`\<`void`\>

***

### triggerEvent()

> **triggerEvent**(`event`): `void`

Triggers the specified event.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | keyof `PluginEvents` | The name of the event to trigger. |

#### Returns

`void`

***

### new()

> `static` **new**(`path`): `Promise`\<[`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

#### Returns

`Promise`\<[`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>\>
