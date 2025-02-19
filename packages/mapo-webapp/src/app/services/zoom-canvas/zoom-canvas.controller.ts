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
export class MouseWheelController {
  public pinchStateChange: EventEmitter<boolean> = new EventEmitter();
  lastScale = 1;
  constructor(
    private canvasService: CanvasService,
    private zoomCanvasService: ZoomCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      const myElement = document.getElementById('canvas-container');
      const myOptions = {};
      let isPinching = false;

      if (myElement) {
        var hammertime = new Hammer(myElement, myOptions);
        hammertime.get('pinch').set({ enable: true });

        hammertime.on('pinchstart', () => {
          isPinching = true;
          this.lastScale = canvas.getZoom();
          this.pinchStateChange.emit(isPinching);
        });

        hammertime.on('pinchend', () => {
          isPinching = false;
          this.lastScale = canvas.getZoom();
          this.pinchStateChange.emit(isPinching);
        });

        hammertime.on('pinch', (event) => {
          console.log('Pinch detected!', event.scale);
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

  onPinch = (event: HammerInput, canvas: fabric.Canvas) => {
    const x = event.center.x;
    const y = event.center.y;

    const dampingFactor = 0.05;
    let zoom = canvas.getZoom();
    const newZoom = zoom * (1 + (event.scale - 1) * dampingFactor);
    canvas.zoomToPoint({ x, y }, newZoom);

    this.zoomCanvasService.zoomCanvas(event.scale, x, y);
  };
}
