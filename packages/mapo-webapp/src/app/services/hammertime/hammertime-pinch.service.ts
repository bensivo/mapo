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
        // This 100ms delay in endPinch slightly extends the time that panning is disabled.
        //
        // In reality, users often remove one finger slightly before the other, which means 1 finger is dragging across the screen
        // for a split second, which triggers 1-finger pan, and can be jarring for the end user. By adding this 100ms delay for endPinch, we avoid
        // 90% of these cases, without causing significant degregation in ux. 
        setTimeout(() => {
            this.isPinching = false;
        }, 100);
    }
}
