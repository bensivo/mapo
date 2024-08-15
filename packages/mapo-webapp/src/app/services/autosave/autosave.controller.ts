import { Injectable } from "@angular/core";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { TitleStore } from "../../store/title.store";
import { AuthStore } from "../../store/auth.store";
import { CanvasService } from "../canvas/canvas.service";
import { Subscription, combineLatest, debounce, filter, interval, tap } from "rxjs";
import { FilesStore } from "../../store/files.store";
import { PersistenceService } from "../persistence/persistence.service";
import { AutoSaveStore } from "./autosave.store";
import { ToastService } from "../toast/toast.service";

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
    private autoSaveStore: AutoSaveStore,
    private toastService: ToastService,
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
        filter(([user, currentFileId, edges, textNodes, title]) => {
          return user !== null; // Don't autosave if you're not logged in
        }),
        tap(() => {
          this.autoSaveStore.setStatus('Saving...');
        }),
        debounce(() => interval(2000)),
      )
      .subscribe(([user, currentFileId, edges, textNodes, title]) => {
        this.persistenceService.saveCanvasState()
        .then(() => {
          this.autoSaveStore.setStatus('Saved');
          setTimeout(() => {
            this.autoSaveStore.setStatus('');
          }, 1000);
        })
        .catch((error) => {
          this.toastService.showToast('Error', `Failed to save file: ${(error as any).message}`);
        });
      });
  }

  deregisterAutoSave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
