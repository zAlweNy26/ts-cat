[Overview](../index.md) / log

# log

> `const` **log**: `Readonly`\<`object`\>

The logger module provides various logging functions.

## Type declaration

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `box` | `LogFn` | logger.box | Logs a message in a box format. **Param** The message to be logged. |
| `debug` | `LogFn` | logger.debug | Logs a debug message. **Param** The debug message to be logged. |
| `dir` | (`content`) => `void` | - | - |
| `error` | `LogFn` | logger.error | Logs an error message. **Param** The error message to be logged. |
| `fail` | `LogFn` | logger.fail | Logs a failure message. **Param** The failure message to be logged. |
| `fatal` | `LogFn` | logger.fatal | Logs a fatal error message. **Param** The fatal error message to be logged. |
| `info` | `LogFn` | logger.info | Logs an info message. **Param** The info message to be logged. |
| `normal` | `LogFn` | logger.log | Logs a normal message. **Param** The message to be logged. |
| `silent` | `LogFn` | logger.silent | Logs a silent message. **Param** The silent message to be logged. |
| `success` | `LogFn` | logger.success | Logs a success message. **Param** The success message to be logged. |
| `table` | \<`T`\>(`rows`) => `void` | - | Logs an array of objects in a table format. |
| `tag` | (`color`, `tag`, `message`, ...`args`) => `void` | - | Logs a message with a specified tag and color. |
| `warn` | `LogFn` | logger.warn | Logs a warning message. **Param** The warning message to be logged. |
