[Overview](../index.md) / CatPlugin

# CatPlugin

> `const` **CatPlugin**: `Readonly`\<`object`\>

## Type declaration

| Name | Type | Description |
| ------ | ------ | ------ |
| `on` | \<`T`\>(`event`, `fn`) => `PluginEvent`\<`T`\> | Add an event to the plugin |
| `settings` | \<`T`\>(`schema`) => `ZodObject`\<`T`, `"strip"`, `ZodTypeAny`, \{ \[k in string \| number \| symbol\]: addQuestionMarks\<baseObjectOutputType\<T\>, any\>\[k\] \}, \{ \[k\_1 in string \| number \| symbol\]: baseObjectInputType\<T\>\[k\_1\] \}\> | Add some settings to the plugin |
