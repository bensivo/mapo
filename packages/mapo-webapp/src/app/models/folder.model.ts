import { z } from 'zod';

/**
 * A Mapo folder, containing files or other folders
 */
export const FolderSchema = z.object({
  id: z.number(),
  userId: z.string(),
  name: z.string(),
  parentId: z.number()
});

export type Folder = z.infer<typeof FolderSchema>;
