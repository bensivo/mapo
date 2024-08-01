import { Injectable } from "@angular/core";
import { CanvasService } from "./canvas.service";

/**
 * Listens to window resize events, and resizes the canvas accordingly.
 */
@Injectable({
    providedIn: 'root',
})
export class CanvasResizeController {

    canvas: fabric.Canvas | null = null;

    constructor(private canvasService: CanvasService) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            this.canvas = canvas;
            window.addEventListener('resize', this.onWindowResize);
        });
        this.canvasService.canvasDestroyed$.subscribe((canvas) => {
            this.canvas = null;
            window.removeEventListener('resize', this.onWindowResize);
        });
    }

    onWindowResize = () => {
        if (!this.canvas) {
            return;
        }

        // TODO: should we debounce or sample this event? So we don't rerender so many times
        this.canvasService.resizeCanvas();
    }
}