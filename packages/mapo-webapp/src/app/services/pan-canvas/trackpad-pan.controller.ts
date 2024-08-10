import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { PanCanvasService } from './pan-canvas.service';
import { ZoomCanvasService } from '../zoom-canvas/zoom-canvas.service';

@Injectable({
    providedIn: 'root',
})
export class TrackpadPanController {
    constructor(
        private canvasService: CanvasService,
        private panCnavsService: PanCanvasService,
        private zoomCanvasService: ZoomCanvasService,
    ) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            canvas.on('mouse:wheel', this.onWheel);

            // Stop wheel events on the canvas-container, so that the page doesn't zoom when we pinch on the trackpad.
            // Instead, we'll bind a wheel event listener to the fabric canvas object, or the window.
            const container = document.getElementById('canvas-container');
            if (container != null) {
                container.addEventListener('wheel', (e) => {
                    e.preventDefault();
                }, {
                    passive: false,
                });
            }
        });
    }

    onWheel = (event: fabric.IEvent<WheelEvent>): void => {
        const e = event.e; // the underlying window.WheelEvent object

        if (e.ctrlKey || e.metaKey) { // When the user is holding control, alt, or command. Also triggers on a trackpad, when pinching to zoom.
            const delta = e.deltaY *6;
            this.zoomCanvasService.zoomCanvas(delta, event.e.offsetX, event.e.offsetY);
        } else { // Triggers when scrolling normally, or when panning with two fingers on a trackpad.
            this.panCnavsService.startPan(0, 0);
            this.panCnavsService.updatePan(-e.deltaX, -e.deltaY);
            this.panCnavsService.endPan();
        }
    }
}
