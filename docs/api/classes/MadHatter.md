[Overview](../index.md) / MadHatter

# MadHatter

## Properties

| Property | Type | Default value |
| ------ | ------ | ------ |
| `forms` | [`Form`](Form.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>[] | `[]` |
| `hooks` | `Partial`\<[`Hooks`](../type-aliases/Hooks.md)\> | `{}` |
| `onPluginsSyncCallback?` | () => `Promise`\<`void`\> | `undefined` |
| `tools` | [`Tool`](Tool.md)[] | `[]` |

## Accessors

### installedPlugins

> `get` **installedPlugins**(): `object`[]

Gets a copy of the installed plugins.

#### Returns

`object`[]

## Methods

### executeHook()

> **executeHook**\<`T`\>(`name`, ...`args`): `ReturnType`\<[`HookTypes`](../interfaces/HookTypes.md)\[`T`\]\>

Executes a hook method by name with the provided arguments.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* keyof [`HookTypes`](../interfaces/HookTypes.md) | keyof [`HookTypes`](../interfaces/HookTypes.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `T` | The name of the hook to execute. |
| ...`args` | `Parameters`\<[`HookTypes`](../interfaces/HookTypes.md)\[`T`\]\> | The arguments to pass to the hook function. |

#### Returns

`ReturnType`\<[`HookTypes`](../interfaces/HookTypes.md)\[`T`\]\>

The result of executing the hook methods sequentially.

***

### findPlugins()

> **findPlugins**(): `Promise`\<`void`\>

Finds and installs plugins present in the plugins path.

#### Returns

`Promise`\<`void`\>

***

### getPlugin()

> **getPlugin**(`id`): `undefined` \| [`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>

Gets a plugin by its ID.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The ID of the plugin to get. |

#### Returns

`undefined` \| [`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>

***

### installPlugin()

> **installPlugin**(`path`): `Promise`\<[`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>\>

Installs a plugin from the specified path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | The path to the plugin. |

#### Returns

`Promise`\<[`Plugin`](Plugin.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>\>

The installed plugin.

***

### reloadPlugin()

> **reloadPlugin**(`id`): `Promise`\<`void`\>

Reloads a plugin by its ID.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The ID of the plugin to reload. |

#### Returns

`Promise`\<`void`\>

***

### removePlugin()

> **removePlugin**(`id`): `Promise`\<`void`\>

Removes a plugin by its ID.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The ID of the plugin to remove. |

#### Returns

`Promise`\<`void`\>

***

### syncHooksAndProcedures()

> **syncHooksAndProcedures**(): `Promise`\<`void`\>

Synchronizes hooks, tools and forms.
It also sorts the hooks by priority.

#### Returns

`Promise`\<`void`\>

***

### togglePlugin()

> **togglePlugin**(`id`, `state`?, `sync`?): `Promise`\<`boolean`\>

Toggles a plugin's state and executes corresponding hooks.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `undefined` | The ID of the plugin to toggle. |
| `state`? | `boolean` | `undefined` | The state to set the plugin to. Default is undefined. |
| `sync`? | `boolean` | `true` | Whether to synchronize hooks and tools immediately. Default is true. |

#### Returns

`Promise`\<`boolean`\>

***

### getInstance()

> `static` **getInstance**(): `Promise`\<[`MadHatter`](MadHatter.md)\>

Get the Mad Hatter instance

#### Returns

`Promise`\<[`MadHatter`](MadHatter.md)\>

The Mad Hatter class as a singleton
