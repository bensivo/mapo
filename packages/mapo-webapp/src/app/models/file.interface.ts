import { Edge } from './edge.interface';
import { TextNode } from './textnode.interface';

/**
 * A Mapo file, storing a single drawing for a user
 */
export interface File {
  id: number;
  userId: string;
  name: string;
  contentBase64: string;
  folderId: number; // ID of the parent folder, where 0 is the root folder.
}

/**
 * The content of a file that needs to be loaded when we render a file on the canvas
 * Also what get saved in local storage
 */
export interface FileContent {
  id: number | null;
  name: string;
  edges: Edge[];
  textNodes: TextNode[];

  title?: string; // Legacy version of 'name', kepy for backwards compatibility
}
