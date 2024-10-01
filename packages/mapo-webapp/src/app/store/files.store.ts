import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { File } from '../models/file.interface';
import { Folder } from '../models/folder.interface';

@Injectable({
  providedIn: 'root',
})
export class FilesStore {
  // All files that belong to the current user
  public files = new BehaviorSubject<File[]>([]);
  public files$ = this.files.asObservable();

  // All folders that belong to the current user
  public folders = new BehaviorSubject<Folder[]>([]);
  public folders$ = this.folders.asObservable();

  // The currently-selected file, if on the canvas
  public currentFileId = new BehaviorSubject<number | null>(null);
  public currentFileId$ = this.currentFileId.asObservable();

  // The currently-selected folder, used when navigating around in the my-files page
  public currentFolderId = new BehaviorSubject<number>(0);
  public currentFolderId$ = this.currentFolderId.asObservable();

  // The contents of the files searchbar, used for filtering files and filders
  public searchText = new BehaviorSubject<string>('');
  public searchText$ = this.searchText.asObservable();

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

  setSearchText(text: string) {
    this.searchText.next(text);
  }
}
