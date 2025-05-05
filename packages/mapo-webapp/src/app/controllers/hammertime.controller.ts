import { Injectable } from "@angular/core";
import { CanvasService } from "../services/canvas/canvas.service";
import { HammertimePinchService } from "../services/hammertime/hammertime-pinch.service";

@Injectable({
    providedIn: 'root'
})
export class HammertimeController {

    constructor(
        private canvasService: CanvasService,
        private hammertimePinchService: HammertimePinchService,
    ) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            const canvasContainer = document.getElementById('canvas-container');
            if (!canvasContainer) {
                return;
            }

            const hammertime = new Hammer(canvasContainer, {});
            hammertime.get('pinch').set({
                enable: true
            });

            hammertime.on('pinchstart', this.onPinchStart)
            hammertime.on('pinch', this.onPinch)
            hammertime.on('pinchend', this.onPinchEnd)
        });

        // TODO: do we need to destroy our hammertime object on canvasDestroyed$?
    }

    onPinchStart = (e: HammerInput) => {
        this.hammertimePinchService.startPinch(); 
    }

    onPinch = (e: HammerInput) => {
        this.hammertimePinchService.updatePinch(e.center.x, e.center.y, e.scale);

    }

    onPinchEnd = (e: HammerInput) => {
        this.hammertimePinchService.endPinch();
    }
}
