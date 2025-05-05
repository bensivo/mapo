import { Injectable } from "@angular/core";
import { CanvasService } from "../services/canvas/canvas.service";
import { SelectionStore } from "../store/selection.store";

/**
 * Listens for selection events from the canvas, and maps them to the selectionstore
 */
@Injectable({
    providedIn: 'root'
})
export class SelectionController {

    constructor(
        private canvasService: CanvasService,
        private selectionStore: SelectionStore,
    ) {

        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            canvas.on('selection:created', (e: fabric.IEvent) => {
                if (e.selected && e.selected.length > 0) {
                    this.selectionStore.set(e.selected);
                }
            });

            canvas.on('selection:updated', (e) => {
                if (e.selected && e.selected.length > 0) {
                    this.selectionStore.set(e.selected);
                }
            });

            canvas.on('selection:cleared', (e) => {
                this.selectionStore.set(null);
            });
        });

        this.canvasService.canvasDestroyed$.subscribe(() => {
            this.selectionStore.set(null);
        });
    }
}
