import { Injectable } from "@angular/core";
import { ZoomCanvasService } from "../zoom-canvas/zoom-canvas.service";

/**
 * A service to translate Hammertime Pinch events to zoomCanvas functions
 */
@Injectable({
    providedIn: 'root'
})
export class HammertimePinchService {

    // Pinch event data is relative to the start of the pinch
    // but handling pinch events is done via deltas since the last update.
    lastScale = 1;

    isPinching = false;

    constructor(
        private zoomCanvasService: ZoomCanvasService,
    ){}

    startPinch() {
        this.lastScale = 1;
        this.isPinching = true;
    }

    updatePinch(x: number, y: number, scale: number) {
        let delta = scale - this.lastScale;
        delta = -delta; // zoomCanvas uses negative values for zooming in, and positive for zooming out. So we just flip the sign.
        delta = delta * 700; // Scaling factor to make the zoom less slow

        this.zoomCanvasService.zoomCanvas(delta, x, y);

        this.lastScale = scale;
    }

    endPinch() {
        // TODO; do we need a setTimeout of 100ms here? What was it for again?
        this.isPinching = false;
    }

}