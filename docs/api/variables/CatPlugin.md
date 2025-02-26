[Overview](../index.md) / CatPlugin

# CatPlugin

> `const` **CatPlugin**: `Readonly`\<\{ `on`: \<`T`\>(`event`, `fn`) => `PluginEvent`\<`T`\>; `settings`: \<`T`\>(`schema`) => `ZodObject`\<`T`, `"strip"`, `ZodTypeAny`, \{ \[k in string \| number \| symbol\]: addQuestionMarks\<baseObjectOutputType\<T\>, any\>\[k\] \}, \{ \[k in string \| number \| symbol\]: baseObjectInputType\<T\>\[k\] \}\>; \}\>
