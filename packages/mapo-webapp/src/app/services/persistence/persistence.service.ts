import { Injectable } from "@angular/core";
import base64 from 'base-64';

import { Edge } from "../../models/edge.model";
import { FileContent } from '../../models/file.model';
import { TextNode } from "../../models/textnode.model";
import { AuthStore } from "../../store/auth.store";
import { EdgeStore } from "../../store/edge.store";
import { FilesStore } from "../../store/files.store";
import { TextNodeStore } from "../../store/text-node.store";
import { TitleStore } from "../../store/title.store";
import { FilesService } from "../files/files.service";

/**
 * Controls the persistence of the application state
 */
@Injectable({
  providedIn: 'root',
})
export class PersistenceService {

  constructor(
    private textNodeStore: TextNodeStore,
    private filesStore: FilesStore,
    private authStore: AuthStore,
    private filesService: FilesService,
    private edgeStore: EdgeStore,
    private fileStore: FilesStore,
    private titleStore: TitleStore,
  ) {
    const persistedFileId = localStorage.getItem('mapo-state-file-id');
    if (persistedFileId) {
        try {
            const fileId: number | null = persistedFileId === 'null' ? null : parseInt(persistedFileId, 10);
            this.fileStore.setCurrentFileId(fileId);
        } catch (e) {
            console.error('Failed to load text-nodes from local storage', e);
        }
    }

    const persistedFolderId = localStorage.getItem('mapo-state-folder-id');
    if (persistedFolderId) {
        try {
            const folderId: number | null = persistedFolderId === 'null' ? null : parseInt(persistedFolderId, 10);
            this.fileStore.setCurrentFolderId(folderId ?? 0);
        } catch (e) {
            console.error('Failed to load text-nodes from local storage', e);
        }
    }

    const persistedNodes = localStorage.getItem('mapo-state-text-nodes');
    if (persistedNodes) {
        try {
            const textNodes: TextNode[] = JSON.parse(persistedNodes);
            this.textNodeStore.set(textNodes);
        } catch (e) {
            console.error('Failed to load text-nodes from local storage', e);
        }
    }

    const persistedEdges = localStorage.getItem('mapo-state-edges');
    if (persistedEdges) {
        try {
            const edges: Edge[] = JSON.parse(persistedEdges);
            this.edgeStore.set(edges);
        } catch (e) {
            console.error('Failed to load edges from local storage', e);
        }
    }

    const persistedTitle = localStorage.getItem('mapo-state-title');
    if (persistedTitle) {
      this.titleStore.set(persistedTitle);
    }

    // Logic to keep localstorage key-values up-to-date with changes in application state

    this.textNodeStore.textNodes$.subscribe((textNodes) => {
      // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
      localStorage.setItem('mapo-state-text-nodes', JSON.stringify(textNodes));
    });

    this.edgeStore.edges$.subscribe((edges) => {
      // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
      localStorage.setItem('mapo-state-edges', JSON.stringify(edges));
    });

    this.fileStore.currentFileId$.subscribe((currentFileId) => {
      // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
      localStorage.setItem('mapo-state-file-id', '' + currentFileId);
    });

    this.fileStore.currentFolderId$.subscribe((currentFolderId) => {
      // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
      localStorage.setItem('mapo-state-folder-id', '' + currentFolderId);
    });

    this.titleStore.title$.subscribe((title) => {
      // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
      localStorage.setItem('mapo-state-title', title);
    });
  }

  serializeCanvasState(): FileContent {
    const edges = this.edgeStore.edges.value;
    const textNodes = this.textNodeStore.textNodes.value;
    const title = this.titleStore.title.value;
    const id = this.filesStore.currentFileId.value;

    const content: FileContent = {
      id: id,
      name: title,
      edges: edges,
      textNodes: textNodes,
    };
    return content;
  }


  loadCanvasState(data: string) {
    const content: FileContent = JSON.parse(data);

    // TODO: Add a 'version' attribute to data, so that we can add more features in the future
    // without breaking old saves
    const edges = content.edges;
    const textNodes = content.textNodes;
    const title = content.name ?? content.title;
    const id = content.id ?? null;

    // Set all stores to empty
    this.edgeStore.set([]);
    this.textNodeStore.set([]);
    this.titleStore.set('');
    this.filesStore.setCurrentFileId(null);

    // Set new values
    this.textNodeStore.set(textNodes);
    this.edgeStore.set(edges);
    this.titleStore.set(title);
    this.filesStore.setCurrentFileId(id);
  }

  async saveCanvasState(): Promise<any> {
    const user = this.authStore.user.value;
    if (!user) {
      console.warn('Cannot save canvas state, user not logged in');
      return;
    }

    const title = this.titleStore.title.value;
    const id = this.filesStore.currentFileId.value;

    const content: string = JSON.stringify(this.serializeCanvasState());
    const contentBase64 = base64.encode(content);
    const folderId = this.filesStore.currentFolderId.value;

    if (id) {
      await this.filesService.updateFile({
        id: id,
        name: title,
        contentBase64: contentBase64,
        folderId: folderId,
      });
    } else {
      await this.filesService.createFile({
        name: title,
        contentBase64: contentBase64,
        folderId: folderId,
      });
    }
  }
}
