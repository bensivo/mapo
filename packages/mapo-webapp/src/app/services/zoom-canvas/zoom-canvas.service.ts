import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../canvas/canvas.service';

/**
 * Implements zooming the canvas in or out, centered around a given point.
 */
@Injectable({
  providedIn: 'root',
})
export class ZoomCanvasService {
  private canvas: fabric.Canvas | null = null;

  constructor(
    private canvasService: CanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
  }

  /**
   * Zoom the canvas in or out, centered around the x,y point given
   * 
   * Negative delta value zooms in, positive delta value zooms out. Larger magnitude deltas zoom faster.
   * Using a normal scroll wheel, the smallest delta value is 16, going up in increments of 16.
   *
   * @param delta
   */
  zoomCanvas(delta: number, x: number, y: number): void {
    if (!this.canvas) {
      return;
    }

    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) {
      zoom = 20;
    }
    if (zoom < 0.01) {
      zoom = 0.01;
    }
    this.canvas.zoomToPoint({ x, y, }, zoom);
  }
}
