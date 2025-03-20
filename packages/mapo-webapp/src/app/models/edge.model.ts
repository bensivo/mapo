import { z } from 'zod';

export const EdgeSchema = z.object({
  id: z.string(),
  text: z.string().optional().describe('Text for the edge itself, rendered in the middle of the edge'),
  startNodeId: z.string().describe('ID of the textnode where the line starts'),
  endNodeId: z.string().describe('ID of the textnode where the line ends')
});

export type Edge = z.infer<typeof EdgeSchema>;