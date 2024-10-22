[Overview](../index.md) / BetterReadonly

# BetterReadonly\<T, Deep\>

> **BetterReadonly**\<`T`, `Deep`\>: `{ readonly [Key in keyof T]: Deep extends true ? T[Key] extends object ? BetterReadonly<T[Key]> : T[Key] : T[Key] }`

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | - |
| `Deep` *extends* `boolean` | `true` |
