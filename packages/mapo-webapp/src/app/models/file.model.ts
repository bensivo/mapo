import { z } from 'zod';
import { EdgeSchema } from './edge.model';
import { TextNodeSchema } from './textnode.model';

/**
 * A Mapo file, storing a single drawing for a user
 */
export const FileSchema = z.object({
  id: z.number(),
  userId: z.string(),
  name: z.string(),
  contentBase64: z.string(),
  folderId: z.number().describe('ID of the parent folder, where 0 is the root folder.')
});

export type File = z.infer<typeof FileSchema>;

/**
 * The content of a file that needs to be loaded when we render a file on the canvas
 * Also what get saved in local storage
 */
export const FileContentSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  edges: z.array(EdgeSchema),
  textNodes: z.array(TextNodeSchema),
  title: z.string().optional().describe('Legacy version of \'name\', kept for backwards compatibility')
});

export type FileContent = z.infer<typeof FileContentSchema>;
