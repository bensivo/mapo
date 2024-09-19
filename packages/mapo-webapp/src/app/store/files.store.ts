import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { File } from '../models/file.interface';
import { Folder } from '../models/folder.interface';

@Injectable({
  providedIn: 'root',
})
export class FilesStore {
  public files = new BehaviorSubject<File[]>([]);
  public files$ = this.files.asObservable();

  public folders = new BehaviorSubject<Folder[]>([]);
  public folders$ = this.folders.asObservable();

  public currentFileId = new BehaviorSubject<number | null>(null);
  public currentFileId$ = this.currentFileId.asObservable();

  setFiles(files: File[]) {
    this.files.next(files);
  }
  
  setFolders(folders: Folder[]) {
    this.folders.next(folders);
  }

  setCurrentFileId(id: number | null) {
    this.currentFileId.next(id);
  }
}
