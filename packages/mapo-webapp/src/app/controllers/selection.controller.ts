import { Injectable } from "@angular/core";
import { CanvasService } from "../services/canvas/canvas.service";
import { BehaviorSubject } from "rxjs";

/**
 * A Service that listens to the active selection events on the canvas, and emits
 * an observable for current selection.
 * 
 * 
 * NOTE: unlike other controllers, this one just exposes an observable. We should probably
 * refactor this so it acts more like other controllers (just sends events down to a service).
 */
@Injectable({
    providedIn: 'root'
})
export class SelectionController {

    private selection = new BehaviorSubject<fabric.Object[] | null>(null);
    selection$ = this.selection.asObservable();

    constructor(private canvasService: CanvasService) { 

        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            canvas.on('selection:created', (e: fabric.IEvent) => {
                if (e.selected && e.selected.length > 0) {
                    this.selection.next(e.selected);
                }
            });

            canvas.on('selection:updated', (e) => {
                if (e.selected && e.selected.length > 0) {
                    this.selection.next(e.selected);
                }
            });

            canvas.on('selection:cleared', (e) => {
                this.selection.next(null);
            });
        });

        this.canvasService.canvasDestroyed$.subscribe(() => {
            this.selection.next(null);
        });
    }
}