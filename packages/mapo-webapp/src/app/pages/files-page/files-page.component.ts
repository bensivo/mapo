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
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { NewFolderModalComponent, NewFolderModalSubmit } from '../../components/new-folder-modal/new-folder-modal.component';
import { Folder } from '../../models/folder.interface';
import { FilesSelectors } from '../../selectors/file.selectors';
import { NewFileModalComponent, NewFileModalSubmit } from '../../components/new-file-modal/new-file-modal.component';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [CommonModule, NewFolderModalComponent, NewFileModalComponent],
  templateUrl: './files-page.component.html',
  styleUrl: './files-page.component.less',
})
export class FilesPageComponent {
  constructor(
    private router: Router,
    private filesService: FilesService,
    private filesSelectors: FilesSelectors,
    private filesStore: FilesStore,
    private persistenceService: PersistenceService,
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private titleStore: TitleStore,
    private toastService: ToastService,
  ) {
    this.filesService.fetch();
  }

  isNewFileModalVisible = false;
  isNewFolderModalVisible = false;

  searchText = new BehaviorSubject<string>('');
  searchText$ = this.searchText.asObservable();

  files$ = this.filesSelectors.files$

  breadcrumbs$ = this.filesSelectors.breadcrumbs$;
  visibleFolders$ = this.filesSelectors.visibleFolders$;
  visibleFiles$ = this.filesSelectors.visibleFiles$;
  isEmpty$ = this.filesSelectors.isEmpty$;


  onClickBackArrow() {
    this.router.navigate(['/']);
  }

  onSearchKeyUp(event: KeyboardEvent) {
    this.searchText.next((event.target as HTMLInputElement).value);
    this.filesStore.setSearchText((event.target as HTMLInputElement).value);
  }

  onClickNewFolder() {
    this.isNewFolderModalVisible = true;
  }

  onClickNewMindMap() {
    this.isNewFileModalVisible = true;
    // this.edgeStore.set([]);
    // this.textNodeStore.set([]);
    // this.titleStore.set('Untitled');
    // this.filesStore.setCurrentFileId(null);

    // this.router.navigate(['canvas']);
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
    this.filesStore.setCurrentFolderId(file.folderId);

    this.router.navigate(['canvas']);
  }


  onCloseNewFolderModal() {
    this.isNewFolderModalVisible = false;
  }

  onCloseNewFileModal() {
    this.isNewFileModalVisible = false;
  }

  onSubmitNewFolderModal(data: NewFolderModalSubmit) {
    this.filesService.createFolder(data.name, this.filesStore.currentFolderId.getValue())
      .then(() => {
        this.toastService.showToast('Folder Created',  `Folder "${data.name}" created successfully`);
      })
      .catch((error) => {
        console.error(error);
        this.toastService.showToast('Error', `Failed to create folder: ${(error as any).message}`);
      })
      .finally(() => {
        this.isNewFolderModalVisible = false;
      });
  }

  onSubmitNewFileModal(data: NewFileModalSubmit) {
    //not really sure what to do here.
    //do i need to create a createFile service?
    this.isNewFileModalVisible = false;
  }

  onClickFolder(folder: Folder) {
    this.filesStore.setCurrentFolderId(folder.id);
  }

  onClickFile(file: File) {
    this.filesStore.setCurrentFileId(file.id);
  }

  onClickDeleteFolder(folder: Folder, e: MouseEvent) {
    e.stopPropagation();
    this.filesService.deleteFolder(folder.id)
      .then(() => {
        this.toastService.showToast('Folder Deleted',  `Folder "${folder.name}" deleted successfully`);
      })
      .catch((error) => {
        console.error(error);
        this.toastService.showToast('Error', `Failed to delete folder: ${(error as any).message}`);
      })
  }

  onClickBreadcrumb(folder: Folder) {
    this.filesStore.setCurrentFolderId(folder.id);
  }
}