import { Injectable } from "@angular/core";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { TitleStore } from "../../store/title.store";
import { AuthStore } from "../../store/auth.store";
import { CanvasService } from "../canvas/canvas.service";
import { Subscription, combineLatest, debounce, interval } from "rxjs";
import { FilesStore } from "../../store/files.store";
import { PersistenceService } from "../persistence/persistence.service";

@Injectable({
  providedIn: 'root',
})
export class AutoSaveController {

  subscription: Subscription | null = null;

  constructor(
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private titleStore: TitleStore,
    private authStore: AuthStore,
    private filesStore: FilesStore,
    private canvasService: CanvasService,
    private persistenceService: PersistenceService,
  ) {

    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.registerAutoSave();
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.deregisterAutoSave();
    });
  }

  registerAutoSave() {
    this.subscription = combineLatest([
      this.authStore.user$,
      this.filesStore.currentFileId$,
      this.edgeStore.edges$,
      this.textNodeStore.textNodes$,
      this.titleStore.title$,
    ])
      .pipe(
        debounce(() => interval(15000)),
      )
      .subscribe(([user, currentFileId, edges, textNodes, title]) => {
        if (!user) {
          return;
        }

        if (!currentFileId) {
          return;
        }

        this.persistenceService.saveCanvasState();
      });
  }

  deregisterAutoSave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
