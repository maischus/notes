import * as v from "valibot";

export const NoteSchema = v.object({
  id: v.string(),
  title: v.string(),
  content: v.string(),
  tags: v.array(v.string()),
  lastMod: v.number(),
  fileLastMod: v.nullish(v.number(), null),
});

export type Note = v.InferInput<typeof NoteSchema>;
