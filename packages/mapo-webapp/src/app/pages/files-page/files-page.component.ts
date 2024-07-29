import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FilesService } from '../../services/files/files.service';
import { AuthStore } from '../../store/auth.store';
import { FilesStore } from '../../store/files.store';
import { File, FileContent } from '../../models/file.interface';
import base64 from 'base-64';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './files-page.component.html',
  styleUrl: './files-page.component.less',
})
export class FilesPageComponent {
  constructor(
    private router: Router,
    private filesService: FilesService,
    private filesStore: FilesStore,
  ) { 
    this.filesService.fetchFiles();
  }

  files$ = this.filesStore.files$;

  data = [
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date() },
    { title: 'Lecture 1.2.3 - Overview alskdj falskdj flaksjd flkasj dflkajsd flkasd', updatedAt: new Date() },
  
  ];

  onClickBackArrow() {
    this.router.navigate(['/']);
  }

  onClickNewMindMap() {
    this.filesService.loadFile({
      id: null,
      name: 'Untitled',
      textNodes: [],
      edges: [],
    })
    this.router.navigate(['canvas']);
  }

  onClickDeleteFile(file: File) {
    this.filesService.deleteFile(file.id);
  }

  onClickOpenFile(file: File) {
    const contentJSON = base64.decode(file.contentBase64);
    const content = JSON.parse(contentJSON);

    const fileContent: FileContent = {
      id: file.id,
      name: file.name,
      textNodes: content.textNodes,
      edges: content.edges,
    }

    this.filesService.loadFile(fileContent);
    this.router.navigate(['canvas']);
  }
}
