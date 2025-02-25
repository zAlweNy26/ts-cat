[Overview](../index.md) / memoryMessage

# memoryMessage

> `const` **memoryMessage**: `TObject`\<\{ `role`: `TUnion`\<\[`TLiteral`\<`"AI"`\>, `TLiteral`\<`"User"`\>\]\>; `what`: `TString`; `when`: `TNumber`; `who`: `TString`; `why`: `TOptional`\<`TObject`\<\{ `input`: `TString`; `interactions`: `TArray`\<`TRecord`\<`TString`, `TAny`\>\>; `intermediateSteps`: `TArray`\<`TObject`\<\{ `input`: `TUnion`\<\[`TString`, `TNull`\]\>; `observation`: `TString`; `procedure`: `TString`; \}\>\>; `memory`: `TIntersect`\<\[`TObject`\<\{ `declarative`: `TArray`\<`TRecord`\<..., ...\>\>; `episodic`: `TArray`\<`TRecord`\<..., ...\>\>; `procedural`: `TArray`\<`TRecord`\<..., ...\>\>; \}\>, `TRecord`\<`TString`, `TArray`\<`TRecord`\<`TString`, `TAny`\>\>\>\]\>; \}\>\>; \}\>
