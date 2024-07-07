import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';

@Injectable({
  providedIn: 'root',
})
export class PanCanvasService {
  canvas: fabric.Canvas | null = null;

  _isPanning = false;
  lastPosX = 0;
  lastPosY = 0;

  constructor(private canvasService: CanvasService) {
    this.canvasService.canvas$.subscribe((canvas) => {
      this.canvas = canvas;
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
      console.log('No viewport transform');
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
      console.log('No viewport transform');
      return;
    }

    this.canvas.setViewportTransform(vpt);
    this._isPanning = false;
  }
}
