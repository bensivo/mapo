import base64 from 'base-64';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TitleStore } from '../../store/title.store';
import { FilesService } from '../../services/files/files.service';
import { AuthService } from '../../services/auth/auth.service';
import { AuthStore } from '../../store/auth.store';
import { FileContent } from '../../models/file.interface';
import { FilesStore } from '../../store/files.store';
import { File } from '../../models/file.interface';

@Component({
  selector: 'app-save',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save.component.html',
  styleUrl: './save.component.less',
})
export class SaveComponent {
  show: boolean = false;

  constructor(
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private titleStore: TitleStore,
    private filesStore: FilesStore,
    private filesService: FilesService,
    private authStore: AuthStore
  ) { }

  toggleSave() {
    this.show = !this.show;
  }

  save() {
    if (this.authStore.user.value !== null) {
      this.saveToProfile();
    } else {
      this.saveToDownload();
    }
  }

  /**
   * Save a file to the logged-in user's profile
   */
  saveToProfile() {
    const edges = this.edgeStore.edges.value;
    const textNodes = this.textNodeStore.textNodes.value;
    const title = this.titleStore.title.value;
    const id = this.filesStore.currentFileId.value;

    const content: FileContent = {
      id: id,
      name: title,
      edges: edges,
      textNodes: textNodes,
    }
    const data = JSON.stringify(content);

    if (id) {
      this.filesService.updateFile({
        id: id,
        name: title,
        contentBase64: base64.encode(data),
      });
    } else {
      this.filesService.saveFile({
        name: title,
        contentBase64: base64.encode(data),
      });
    }
  }

  /**
   * Save a file as a download folder in the user's browser
   */
  saveToDownload() {
    const edges = this.edgeStore.edges.value;
    const textNodes = this.textNodeStore.textNodes.value;
    const title = this.titleStore.title.value;
    const id = this.filesStore.currentFileId.value;

    const content: FileContent = {
      id: id,
      name: title,
      edges: edges,
      textNodes: textNodes,
    }
    const data = JSON.stringify(content);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(data);

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `${title}.mapo`);
    link.click();
    link.remove();
  }
}
