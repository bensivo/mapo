/**
 * A Mapo folder, contaning files or other folders
 */
export interface Folder {
  id: number;
  userId: string;
  name: string;
  parentId: number; 
}