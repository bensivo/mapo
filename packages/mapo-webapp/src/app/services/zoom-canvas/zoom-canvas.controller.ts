import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../canvas/canvas.service';
import { ZoomCanvasService } from './zoom-canvas.service';
import Hammer from 'hammerjs';
import { last } from 'rxjs';

/**
 * When the canvas is active, listens for mouse-scroll events, and zooms the canvas in or out.
 */
@Injectable({
  providedIn: 'root',
})
export class ZoomCanvasController {
  public pinchStateChange: EventEmitter<boolean> = new EventEmitter();
  lastScale = 1;

  constructor(
    private canvasService: CanvasService,
    private zoomCanvasService: ZoomCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      const myElement = document.getElementById('canvas-container');
      let isPinching = false;

      if (myElement) {
        var hammertime = new Hammer(myElement, {});
        hammertime.get('pinch').set({ enable: true });

        hammertime.on('pinchstart', (e) => {
          isPinching = true;
          this.lastScale = 1;
          this.pinchStateChange.emit(isPinching);
        });

        hammertime.on('pinchend', () => {
          isPinching = false;
          this.pinchStateChange.emit(isPinching);
          console.log('----Pinch END----');
        });

        hammertime.on('pinch', (event) => {
          console.log('Pinch detected', event.scale);
          this.onPinch(event, canvas);
        });
      }
      canvas.on('mouse:wheel', this.onMouseWheel);
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      canvas.off('mouse:wheel', this.onMouseWheel as any);
    });
  }

  onMouseWheel = (event: fabric.IEvent<WheelEvent>) => {
    const delta = event.e.deltaY;
    const x = event.e.offsetX;
    const y = event.e.offsetY;

    this.zoomCanvasService.zoomCanvas(delta, x, y);

    event.e.preventDefault();
    event.e.stopPropagation();
  };

  // Hammertime pinch
  //
  // TODO: figure out how to get this to not fire, whwen the user
  // drags with 2 fingers. It's firing pinch events even though they're
  // not pinching
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

    // console.log('delta', delta);
    // console.log('scale:', scale);
    // console.log('last scale:', this.lastScale);
    //console.log('event details:', event);

    this.zoomCanvasService.zoomCanvas(delta, x, y);

    this.lastScale = scale;
  };
}
