import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../canvas/canvas.service';
import { ZoomCanvasService } from './zoom-canvas.service';
import Hammer from 'hammerjs';

/**
 * When the canvas is active, listens for mouse-scroll events, and zooms the canvas in or out.
 */
@Injectable({
  providedIn: 'root',
})
export class ZoomCanvasController {
  public pinchStateChange: EventEmitter<boolean> = new EventEmitter();
  private isPinching = false;
  lastScale = 1;

  constructor(
    private canvasService: CanvasService,
    private zoomCanvasService: ZoomCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      const canvasContainer = document.getElementById('canvas-container');
      if (canvasContainer) {
        var hammertime = new Hammer(canvasContainer, {});
        hammertime.get('pinch').set({ enable: true });

        hammertime.on('pinchstart', (e) => {
          this.lastScale = 1;
          this.isPinching = true;
          this.pinchStateChange.emit(this.isPinching);
        });

        hammertime.on('pinch', (event) => {
          this.pinchStateChange.emit(this.isPinching);
          this.onPinch(event, canvas);
        });

        hammertime.on('pinchend', () => {
          setTimeout(() => {
            this.isPinching = false;
            this.pinchStateChange.emit(this.isPinching);
          }, 100);
        });
      }
    });
  }

  onPinch = (event: HammerInput, canvas: fabric.Canvas) => {
    const x = event.center.x;
    const y = event.center.y;

    // Scale magnitude is related to how fast the user pinched
    // Pinching outwwards (zooming in) gives you values of scale > 1, the magnitude
    // Pinching inwards (zooming out) gives you values of scale between 0 and 1, 1/magnitude
    //
    // For example: scale = 5 is a relative fast zoom in, scale = 0.2 is zooming out with the same speed
    const scale = event.scale;
    let delta = scale - this.lastScale;
    delta = -delta; // zoomCanvas uses negative values for zooming in, and positive for zooming out. So we just flip the sign.
    delta = delta * 1000; // Scaling factor to make the zoom less slow


    this.zoomCanvasService.zoomCanvas(delta, x, y);

    this.lastScale = scale;
  };
}
