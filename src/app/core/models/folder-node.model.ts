import { Song } from './song.model';

export interface FolderNode {
  name: string;
  path: string;
  songs: Song[];
  children: FolderNode[];
}