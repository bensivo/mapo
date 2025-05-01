import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { FabricUtils } from '../../utils/fabric-utils';

@Injectable({
  providedIn: 'root',
})
export class TouchSelectionService {
  canvas: fabric.Canvas | null = null;
  startX: number | null = null;
  startY: number | null = null;
  rect: fabric.Rect | null = null;

  constructor(private canvasService: CanvasService) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
  }

  createSelectionBox(
    canvas: fabric.Canvas,
    startX: number,
    startY: number,
  ): fabric.Rect {
    const rect = FabricUtils.createSelectionBox(canvas, startX, startY);
    this.startX = startX;
    this.startY = startY;
    this.rect = rect;
    return rect;
  }

  updateSelectionBox(
    canvas: fabric.Canvas,
    currentX: number,
    currentY: number,
  ) : fabric.Object[] {

    if(this.rect == null) {
      return [];
    }

    if(this.startX == null || this.startY == null) {
      return [];
    }

    const minX = Math.min(this.startX, currentX);
    const minY = Math.min(this.startY, currentY);
    const diffX = Math.abs(this.startX - currentX);
    const diffY = Math.abs(this.startY - currentY);

    FabricUtils.updateSelectionBox(canvas, this.rect, minY, minX, diffY, diffX);
    const objects = FabricUtils.getObjectsInsideSelectionBox(canvas, this.rect);
    return objects;
  }
  
  removeSelectionBox(canvas: fabric.Canvas) {
    if (this.rect) {
      FabricUtils.removeSelectionBox(canvas, this.rect);
    }
  }
}
