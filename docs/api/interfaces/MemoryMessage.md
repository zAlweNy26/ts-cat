[Overview](../index.md) / MemoryMessage

# MemoryMessage

The content of a memory message.

## Properties

| Property | Type |
| ------ | ------ |
| `role` | `"AI"` \| `"User"` |
| `what` | `string` |
| `when` | `number` |
| `who` | `string` |
| `why?` | `object` |
| `why.input` | `string` |
| `why.interactions?` | [`ModelInteraction`](../type-aliases/ModelInteraction.md)[] |
| `why.intermediateSteps` | [`IntermediateStep`](IntermediateStep.md)[] |
| `why.memory?` | [`WorkingMemory`](WorkingMemory.md) |
