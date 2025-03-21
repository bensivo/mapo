import { z } from 'zod';

export const TextNodeSchema = z.object({
  id: z.string(),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  color: z.string().optional(),
  isComment: z.boolean().default(false)
});

export type TextNode = z.infer<typeof TextNodeSchema>;