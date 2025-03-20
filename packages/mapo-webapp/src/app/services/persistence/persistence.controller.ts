import { Injectable } from "@angular/core";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { TextNode } from "../../models/textnode.model";
import { Edge } from "../../models/edge.model";
import { FilesStore } from "../../store/files.store";
import { TitleStore } from "../../store/title.store";

/**
 * Controls the persistence of the application state
 */
@Injectable({
    providedIn: 'root',
})
export class PersistenceController {
    constructor(
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
        private fileStore: FilesStore,
        private titleStore: TitleStore,
    ) {
        this.onBootstrap();
    }

    async onBootstrap() {
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
            localStorage.setItem('mapo-state-file-id', ''+currentFileId);
        });

        this.fileStore.currentFolderId$.subscribe((currentFolderId) => {
            // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
            localStorage.setItem('mapo-state-folder-id', ''+currentFolderId);
        });

        this.titleStore.title$.subscribe((title) => {
          // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
          localStorage.setItem('mapo-state-title', title);
        });
    }
}
