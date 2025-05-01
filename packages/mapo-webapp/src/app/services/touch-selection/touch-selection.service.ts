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

    let startX = this.rect.left ?? 0;
    let startY = this.rect.top ?? 0;
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

    FabricUtils.updateSelectionBox(canvas, this.rect, top, left, height, width);
    const objects = FabricUtils.getObjectsInsideSelectionBox(canvas, this.rect);
    return objects;
  }
  
  removeSelectionBox(canvas: fabric.Canvas) {
    if (this.rect) {
      FabricUtils.removeSelectionBox(canvas, this.rect);
    }
  }
}
