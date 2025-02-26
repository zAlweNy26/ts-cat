[Overview](../index.md) / WhiteRabbit

# WhiteRabbit

I'm late, I'm late, for a very important date!

## Methods

### getJobs()

> **getJobs**(): `Record`\<`string`, `CronJob`\>

Retrieve the current scheduled jobs

#### Returns

`Record`\<`string`, `CronJob`\>

An array of jobs

***

### pauseJob()

> **pauseJob**(`name`): `undefined` \| `boolean`

Pause a scheduled job

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name assigned to the job |

#### Returns

`undefined` \| `boolean`

A boolean indicating if the job was successfully paused

***

### removeJob()

> **removeJob**(`name`): `boolean`

Removes a scheduled job

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name assigned to the job |

#### Returns

`boolean`

A boolean indicating if the job was successfully removed

***

### resumeJob()

> **resumeJob**(`name`): `undefined` \| `boolean`

Resume a paused job

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name assigned to the job |

#### Returns

`undefined` \| `boolean`

A boolean indicating if the job was successfully resumed

***

### scheduleJob()

> **scheduleJob**(`name`, `pattern`, `job`, `options`?): `void`

Schedule a new job

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name to assign to the job |
| `pattern` | `Date` \| `CronPattern` | The cron pattern to use |
| `job` | () => `void` \| `Promise`\<`void`\> | The function to run |
| `options`? | `CronOptions` | Additional options |

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `Promise`\<[`WhiteRabbit`](WhiteRabbit.md)\>

Get the White Rabbit instance

#### Returns

`Promise`\<[`WhiteRabbit`](WhiteRabbit.md)\>

The White Rabbit class as a singleton
