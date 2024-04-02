# How to create a plugin

To create a plugin, you need to create a new directory in the `plugins` directory (this one).
The name of the directory will be the name of the plugin.
To let the Cheshire Cat detect your plugin, you need to create at least one `.ts` file in the directory.

## How to import the methods

To import `tool`, `hook`, `form` and `plugin` methods, you need to:

```typescript
import { CatHook } from '@hook'
import { CatTool } from '@tool'
import { CatForm } from '@form'
import { CatPlugin } from '@plugin'
```

And then you can use them like this:

```typescript
CatHook.add('hookName', /* ... the other parameters */)

CatTool.add('toolName', /* ... the other parameters */)

CatForm.add('formName', /* ... the other parameters */)

CatPlugin.on('eventName', () => {
  // your code here
})
```

For the plugin settings, you must use `zod`. Here is an example:

```typescript
import { z } from 'zod'

CatPlugin.settings({
  mySetting: z.string().default('default value')
})
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
