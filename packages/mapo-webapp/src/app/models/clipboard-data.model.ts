import { z } from 'zod';
import { TextNodeSchema } from './textnode.model';
import { EdgeSchema } from './edge.model';

export const ClipboardDataSchema = z.object({
  nodes: z.array(TextNodeSchema),
  edges: z.array(EdgeSchema)
});

export type ClipboardData = z.infer<typeof ClipboardDataSchema>;