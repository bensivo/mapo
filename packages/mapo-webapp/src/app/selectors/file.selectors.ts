import { Injectable } from '@angular/core';
import { FilesStore } from '../store/files.store';
import { combineLatest, map } from 'rxjs';
import { Folder } from '../models/folder.model';

/**
  * Selectors for the files store
  */
@Injectable({
  providedIn: 'root'
})
export class FilesSelectors {

  constructor(
    private filesStore: FilesStore,
  ){}

  files$ = this.filesStore.files$;
  folders$ = this.filesStore.folders$;
  currentFolderId$ = this.filesStore.currentFolderId$;

  /**
    * The subset of files that are currently visible in the UI.
    *
    * The entire files list, filtered by the current folder and search text.
    * Also sorts files alphabetically, because our backend doesn't guarantee any particular order.
    */
  visibleFiles$ = combineLatest([this.files$, this.filesStore.searchText$, this.currentFolderId$])
  .pipe(
    map(([files, searchText, currentFolderId]) => {
        let visible = files;
        visible.sort((a, b) => a.name.localeCompare(b.name));

        // Files in folder
        visible = visible.filter((file) => file.folderId === currentFolderId);

        // Files matching search
        if (searchText !== '') {
          // TODO: fuzzy search
          visible = visible.filter((file) => file.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        return visible;
    })
  )

  /**
    * The subset of folders that are currently visible in the UI.
    *
    * The entire folders list, filtered by the current folder and search text.
    * Also sorts folders alphabetically, because our backend doesn't guarantee any particular order.
    */
  visibleFolders$ = combineLatest([this.folders$, this.filesStore.searchText$, this.currentFolderId$])
  .pipe(
    map(([folders, searchText, currentFolderId]) => {
        let visible = folders;
        visible.sort((a, b) => a.name.localeCompare(b.name));

        // Folders in folder
        visible = visible.filter((file) => file.parentId === currentFolderId);

        // Folders matching search
        if (searchText !== '') {
          // TODO: fuzzy search
          visible = visible.filter((file) => file.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        return visible;
    })
  )

  /**
    * Returns true if there are no visible files or folders
    */
  isEmpty$ = combineLatest([this.visibleFolders$, this.visibleFiles$])
  .pipe(
    map(([folders, files]) => {
      return folders.length === 0 && files.length === 0;
    })
  );

  /**
    * Breadcrumbs for the current folder.
    *
    * e.g. if the current folder is /a/b/c, the breadcrumbs will be [a, b, c]
    */
  breadcrumbs$ = combineLatest([this.folders$, this.filesStore.currentFolderId$])
    .pipe(
      map(([folders, currentFolderId]) => {
        const breadcrumbs: Folder[] = [];
        const foldersMap = Object.fromEntries(folders.map((folder) => [folder.id, folder]));

        let folder: Folder | undefined = foldersMap[currentFolderId];
        while (folder) {
          breadcrumbs.push(folder);

          if (folder.parentId === 0) {
            break;
          }

          folder = foldersMap[folder.parentId];
        }

        // In the database, there is no true "Root" folder, we just use a 0/null parentid to represent
        // a folder that is at the root.
        //
        // However, in the UI, we want to show something as the root folder
        // so we add a fake "My Files" folder here.
        breadcrumbs.push({
          id: 0,
          userId: '',
          name: 'My Files',
          parentId: -1,
        })

        // Folders are added to the array from child to parent,
        // but we want to show them parent-first
        breadcrumbs.reverse();
        return breadcrumbs;
      })
    )
}

