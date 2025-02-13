import { z } from 'zod';
import { TextNodeSchema } from '../../models/textnode.model';
import { EdgeSchema } from '../../models/edge.model';

export const ClipboardDataSchema = z.object({
  nodes: z.array(TextNodeSchema),
  edges: z.array(EdgeSchema)
});

export type ClipboardData = z.infer<typeof ClipboardDataSchema>;