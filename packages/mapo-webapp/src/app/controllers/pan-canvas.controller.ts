import { Injectable } from '@angular/core';
import { CanvasService } from '../services/canvas/canvas.service';
import { PanCanvasService } from '../services/pan-canvas/pan-canvas.service';

@Injectable({
  providedIn: 'root',
})
export class PanCanvasController {
  constructor(
    private canvasService: CanvasService,
    private panCnavsService: PanCanvasService,
  ) {
    this.canvasService.canvas$.subscribe((canvas) => {
      if (!canvas) {
        return;
      }

      this.registerCanvasEventListers(canvas);
    });
  }

  registerCanvasEventListers(canvas: fabric.Canvas): void {
    canvas.on('mouse:down', (e) => {
      this.onMouseDown(e);
    });
    canvas.on('mouse:move', (e) => {
      this.onMouseMove(e);
    });
    canvas.on('mouse:up', (e) => {
      this.onMouseUp(e);
    });
  }

  onMouseDown(e: fabric.IEvent<MouseEvent>): void {
    if (e.e.button == 2) {
      // right click
      this.panCnavsService.startPan(e.e.clientX, e.e.clientY);
    }
  }

  onMouseMove(e: fabric.IEvent<MouseEvent>): void {
    if (this.panCnavsService.isPanning()) {
      this.panCnavsService.updatePan(e.e.clientX, e.e.clientY);
    }
  }

  onMouseUp(e: fabric.IEvent<MouseEvent>): void {
    this.panCnavsService.endPan();
  }
}
