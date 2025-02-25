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
| <a id="forms"></a> `forms` | `public` | [`Form`](Form.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, \{\}\>[] | `[]` |
| <a id="path"></a> `path` | `public` | `string` | `undefined` |
| <a id="tools"></a> `tools` | `public` | [`Tool`](Tool.md)[] | `[]` |

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

### hooks

#### Get Signature

> **get** **hooks**(): [`Hook`](../type-aliases/Hook.md)[]

##### Returns

[`Hook`](../type-aliases/Hook.md)[]

***

### id

#### Get Signature

> **get** **id**(): `string`

##### Returns

`string`

***

### info

#### Get Signature

> **get** **info**(): `object`

##### Returns

`object`

| Name | Type | Default value |
| ------ | ------ | ------ |
| <a id="active-4"></a> `active` | `boolean` | - |
| <a id="forms-1"></a> `forms` | `object`[] | - |
| <a id="hooks-2"></a> `hooks` | `object`[] | - |
| <a id="id-2"></a> `id` | `string` | - |
| <a id="manifest"></a> `manifest` | `object` | - |
| `manifest.authorName` | `string` | - |
| `manifest.authorUrl`? | `string` | - |
| `manifest.description` | `string` | - |
| `manifest.name` | `string` | - |
| `manifest.pluginUrl`? | `string` | - |
| `manifest.tags` | `string`[] | - |
| `manifest.thumb`? | `string` | - |
| `manifest.version` | `string` | - |
| <a id="tools-1"></a> `tools` | `object`[] | - |
| <a id="upgradable"></a> `upgradable` | `boolean` | false |

***

### manifest

#### Get Signature

> **get** **manifest**(): `object`

##### Returns

`object`

| Name | Type |
| ------ | ------ |
| <a id="authorname"></a> `authorName` | `string` |
| <a id="authorurl"></a> `authorUrl`? | `string` |
| <a id="description"></a> `description` | `string` |
| <a id="name"></a> `name` | `string` |
| <a id="pluginurl"></a> `pluginUrl`? | `string` |
| <a id="tags"></a> `tags` | `string`[] |
| <a id="thumb"></a> `thumb`? | `string` |
| <a id="version"></a> `version` | `string` |

***

### reloading

#### Get Signature

> **get** **reloading**(): `boolean`

##### Returns

`boolean`

***

### schema

#### Get Signature

> **get** **schema**(): `ZodObject`\<`T`, `UnknownKeysParam`, `ZodTypeAny`, \{ \[k in string \| number \| symbol\]: addQuestionMarks\<baseObjectOutputType\<T\>, any\>\[k\] \}, \{ \[k in string \| number \| symbol\]: baseObjectInputType\<T\>\[k\] \}\>

##### Returns

`ZodObject`\<`T`, `UnknownKeysParam`, `ZodTypeAny`, \{ \[k in string \| number \| symbol\]: addQuestionMarks\<baseObjectOutputType\<T\>, any\>\[k\] \}, \{ \[k in string \| number \| symbol\]: baseObjectInputType\<T\>\[k\] \}\>

***

### settings

#### Get Signature

> **get** **settings**(): `S`

##### Returns

`S`

#### Set Signature

> **set** **settings**(`settings`): `void`

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `settings` | `S` |

##### Returns

`void`

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

> `static` **new**(`path`): `Promise`\<[`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, \{\}\>\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

#### Returns

`Promise`\<[`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, \{\}\>\>
