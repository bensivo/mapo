import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../canvas/canvas.service';

@Injectable({
  providedIn: 'root',
})
export class PanCanvasService {
  canvas: fabric.Canvas | null = null;

  _isPanning = false;
  lastPosX = 0;
  lastPosY = 0;

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

  isPanning(): boolean {
    return this._isPanning;
  }

  startPan(x: number, y: number): void {
    if (!this.canvas) {
      return;
    }

    this._isPanning = true;
    this.lastPosX = x;
    this.lastPosY = y;
  }

  updatePan(x: number, y: number): void {
    if (!this.canvas) {
      return;
    }

    if (!this._isPanning) {
      return;
    }

    const vpt = this.canvas.viewportTransform;
    if (!vpt) {
      console.warn('No viewport transform');
      return;
    }

    vpt[4] += x - this.lastPosX;
    vpt[5] += y - this.lastPosY;

    this.canvas.requestRenderAll();
    this.lastPosX = x;
    this.lastPosY = y;
  }

  endPan() {
    if (!this.canvas) {
      return;
    }

    const vpt = this.canvas.viewportTransform;
    if (!vpt) {
      console.warn('No viewport transform');
      return;
    }

    this.canvas.setViewportTransform(vpt);
    this._isPanning = false;
  }

}
