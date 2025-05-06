import { Injectable } from "@angular/core";
import { EdgeStore } from "../store/edge.store";
import { TextNodeStore } from "../store/text-node.store";
import { TextNode } from "../models/textnode.model";
import { Edge } from "../models/edge.model";
import { FilesStore } from "../store/files.store";
import { TitleStore } from "../store/title.store";

/**
 * A controller that listens to the application starting. 
 * 
 * Mostly handles persistence logic
 */
@Injectable({
    providedIn: 'root',
})
export class BootstrapController {
    constructor(
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
        private fileStore: FilesStore,
        private titleStore: TitleStore,
    ) {
        this.onBootstrap();
    }

    async onBootstrap() {
       

        // this.textNodeStore.textNodes$.subscribe((textNodes) => {
        //     // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
        //     localStorage.setItem('mapo-state-text-nodes', JSON.stringify(textNodes));
        // });

        // this.edgeStore.edges$.subscribe((edges) => {
        //     // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
        //     localStorage.setItem('mapo-state-edges', JSON.stringify(edges));
        // });

        // this.fileStore.currentFileId$.subscribe((currentFileId) => {
        //     // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
        //     localStorage.setItem('mapo-state-file-id', ''+currentFileId);
        // });

        // this.fileStore.currentFolderId$.subscribe((currentFolderId) => {
        //     // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
        //     localStorage.setItem('mapo-state-folder-id', ''+currentFolderId);
        // });

        // this.titleStore.title$.subscribe((title) => {
        //   // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
        //   localStorage.setItem('mapo-state-title', title);
        // });
    }
}
