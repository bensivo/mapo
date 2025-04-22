import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { FabricUtils } from '../../utils/fabric-utils';
import { fabric } from 'fabric';
import { TextNodeOptionsController } from '../textnode-options/textnode-options.controller';

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

  removeSelectionBox(canvas: fabric.Canvas, rect: fabric.Rect) {
    FabricUtils.removeSelectionBox(canvas, rect);
  }

  updateSelectionBox(
    canvas: fabric.Canvas,
    rect: fabric.Rect,
    currentX: number,
    currentY: number,
  ) : fabric.Object[] {
    let startX = rect.left ?? 0;
    let startY = rect.top ?? 0;
    let height = 1;
    let width = 1;
    let top = startY;
    let left = startX;
    let direction = 'none';

    // TODO: add multidirectional boxes
    if (currentX > startX) {
      if (currentY > startY) {
        direction = 'br';
        top = startY;
        left = startX;
        height = currentY - startY;
        width = currentX - startX;
      } else if (currentY < startY) {
        direction = 'tr';
      }
    } else if (currentX < startX) {
      if (currentY > startY) {
        direction = 'bl';
      } else if (currentY < startY) {
        direction = 'tl';
      }
    }

    FabricUtils.updateSelectionBox(canvas, rect, top, left, height, width);
    const objects = FabricUtils.getObjectsInsideSelectionBox(canvas, rect);
    return objects;
  }
}
