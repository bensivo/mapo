import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FilesService } from '../../services/files/files.service';
import { FilesStore } from '../../store/files.store';
import { File } from '../../models/file.interface';
import base64 from 'base-64';
import { PersistenceService } from '../../services/persistence/persistence.service';
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TitleStore } from '../../store/title.store';
import { ToastService } from '../../services/toast/toast.service';

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
    private persistenceService: PersistenceService,
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private titleStore: TitleStore,
    private toastService: ToastService,
  ) {
    this.filesService.fetchFiles();
  }

  files$ = this.filesStore.files$;

  onClickBackArrow() {
    this.router.navigate(['/']);
  }

  onClickNewMindMap() {
    this.edgeStore.set([]);
    this.textNodeStore.set([]);
    this.titleStore.set('Untitled');
    this.filesStore.setCurrentFileId(null);

    this.router.navigate(['canvas']);
  }

  onClickDeleteFile(file: File) {
    this.filesService.deleteFile(file.id)
      .then(() => {
        this.toastService.showToast('File Deleted', 'File deleted successfully');
      })
      .catch((error) => {
        console.error(error);
        this.toastService.showToast('Error', `Failed to delete file: ${(error as any).message}`);
      });
  }

  onClickOpenFile(file: File) {
    const contentJSON = base64.decode(file.contentBase64);
    this.persistenceService.loadCanvasState(contentJSON);

    // If a user exports a drawing to a file, then imports it again and hits save, the persisted contentJSON
    // will not include a fileId. This means the fileId is missing if we load it directly from the database, so here we just
    // ignore it and use the id on the file object, not the serialized JSON.
    //
    // TODO: Don't even save the id field in the JSON (when saving to the db)
    this.filesStore.setCurrentFileId(file.id);

    this.router.navigate(['canvas']);
  }
}
