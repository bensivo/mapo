import { z } from 'zod';

export const ContainerSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

export type Container = z.infer<typeof ContainerSchema>;