import { Injectable } from "@angular/core";
import base64 from 'base-64';

import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { FilesStore } from "../../store/files.store";
import { TitleStore } from "../../store/title.store";
import { FileContent } from '../../models/file.interface';
import { AuthStore } from "../../store/auth.store";
import { FilesService } from "../files/files.service";

/**
 * Controls the persistence of the application state
 */
@Injectable({
    providedIn: 'root',
})
export class PersistenceService {

  constructor(
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private filesStore: FilesStore,
    private titleStore: TitleStore,
    private authStore: AuthStore,
    private filesService: FilesService,
  ) {
  }

  serializeCanvasState(): string {
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
    return JSON.stringify(content);
  }


  loadCanvasState(data: string) {
    const content: FileContent = JSON.parse(data);
    console.log('Loading canvas state', content);

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

    const content: string = this.serializeCanvasState();
    const contentBase64 = base64.encode(content);

    if (id) {
      await this.filesService.updateFile({
        id: id,
        name: title,
        contentBase64: contentBase64,
      });
    } else {
      await this.filesService.saveFile({
        name: title,
        contentBase64: contentBase64,
      });
    }
  }
}
