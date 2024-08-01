import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { File } from '../models/file.interface';

@Injectable({
  providedIn: 'root',
})
export class FilesStore {
  public files = new BehaviorSubject<File[]>([]);
  public files$ = this.files.asObservable();

  public currentFileId = new BehaviorSubject<number | null>(null);
  public currentFileId$ = this.currentFileId.asObservable();

  setFiles(files: File[]) {
    this.files.next(files);
  }

  setCurrentFileId(id: number | null) {
    this.currentFileId.next(id);
  }
}
