[Overview](../index.md) / MemoryMessage

# MemoryMessage

> **MemoryMessage**: `object` & \{ `role`: `"AI"`; `why`: \{ `input`: `string`; `interactions`: [`ModelInteraction`](ModelInteraction.md)[]; `intermediateSteps`: [`IntermediateStep`](../interfaces/IntermediateStep.md)[]; `memory`: [`WorkingMemory`](../interfaces/WorkingMemory.md); \}; \} \| \{ `role`: `"User"`; \}

The content of a memory message.

## Type declaration

| Name | Type |
| ------ | ------ |
| `role` | `"AI"` \| `"User"` |
| `what` | `string` |
| `when` | `number` |
| `who` | `string` |
