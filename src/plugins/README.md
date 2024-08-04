# How to create a plugin

To create a plugin, you need to create a new directory in the `plugins` directory (this one).
The name of the directory will be the identifier of the plugin.
To let the Cheshire Cat detect your plugin, you need to create at least one `.ts` file in the directory.

## How to import the methods

To import `tool`, `hook`, `form` or `plugin` methods, you need to:

```ts
import { CatHook } from '@hook'
import { CatTool } from '@tool'
import { CatForm } from '@form'
import { CatPlugin } from '@plugin'
```

And then you can use them like this:

```ts
CatHook.add('hookName', /* ... the other parameters */)

CatTool.add('toolName', /* ... the other parameters */)

CatForm.add('formName', /* ... the other parameters */)

CatPlugin.on('eventName', /* ... the other parameters */)
```

From inside any hook, tool or form, you can access the current plugin informations like this:

```ts
// For example, in a hook
CatHook.add('agentPromptPrefix', (prefix, cat) => {
	const info = cat.getPluginInfo()
	if (!info) return prefix
	return info.settings.prefix
})

// For example, in a tool
CatTool.add('myToolName', 'myToolDescription', async (input, cat) => {
	const info = cat.getPluginInfo()
	console.log(info)
	// ...
}, {
	direct: true,
	startExamples: ['startExample1', 'startExample2'],
})

// For example, in a form
CatForm.add('myFormName', {
	myKey1: z.string().describe('myKey1Description'),
	myKey2: z.number().describe('myKey2Description'),
}, {
	description: 'myFormDescription',
	startExamples: ['myFormExample1', 'myFormExample2'],
	async onSubmit({ myKey1, myKey2 }, cat) {
		console.log(myKey1, myKey2)
		const info = cat.getPluginInfo()
		console.log(info)
		// ...
	}
})
```

For the plugin settings, you must use `zod`. Here is an example:

```ts
import { z } from 'zod'

CatPlugin.settings({
	mySetting: z.string().default('default value')
})
```

If you need to use the internal logger, you can do:

```ts
import { log } from '@logger'

log.info('Hello, world!')
log.error('An error occurred!')
```

## Install other packages

To install other packages, you need to add a `requirements.txt` file in the main directory of your plugin.
The content of the file should be the list of the packages you want to install.
Here is an example:

```text
package1@version
package2
```

If the version is not specified, the latest version will be installed.
