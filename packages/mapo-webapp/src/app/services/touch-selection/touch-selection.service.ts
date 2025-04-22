import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { FabricUtils } from '../../utils/fabric-utils';

@Injectable({
  providedIn: 'root',
})
export class TouchSelectionService {
  canvas: fabric.Canvas | null = null;

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
    return rect;
  }
}
