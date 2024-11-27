import { Injectable } from '@angular/core';
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
  constructor(
    private canvasService: CanvasService,
    private zoomCanvasService: ZoomCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      canvas.on('mouse:wheel', this.onMouseWheel);
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      canvas.off('mouse:wheel', this.onMouseWheel as any);
    });

    //initialize hammer.js
    const hammer = new Hammer(canvasService.canvas?.getElement());

  }

  onMouseWheel = (event: fabric.IEvent<WheelEvent>) => {
    const delta = event.e.deltaY;
    const x = event.e.offsetX;
    const y = event.e.offsetY;

    this.zoomCanvasService.zoomCanvas(delta, x, y);

    event.e.preventDefault();
    event.e.stopPropagation();
  };
}
