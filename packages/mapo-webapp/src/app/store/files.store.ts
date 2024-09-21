import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
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

  // When navigating around the "my-files" page, we need to keep track of the current folder path.
  public currentFolderId = new BehaviorSubject<number>(0);
  public currentFolderId$ = this.currentFolderId.asObservable();

  setFiles(files: File[]) {
    this.files.next(files);
  }

  setFolders(folders: Folder[]) {
    this.folders.next(folders);
  }

  setCurrentFileId(id: number | null) {
    this.currentFileId.next(id);
  }

  setCurrentFolderId(id: number) {
    this.currentFolderId.next(id);
  }
}
