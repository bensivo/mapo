import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { PanCanvasService } from './pan-canvas.service';

@Injectable({
  providedIn: 'root',
})
export class PanCanvasController {
  constructor(
    private canvasService: CanvasService,
    private panCnavsService: PanCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      canvas.on('mouse:down', this.onMouseDown);
      canvas.on('mouse:move', this.onMouseMove);
      canvas.on('mouse:up', this.onMouseUp);
    });
  }

  onMouseDown = (event: fabric.IEvent<MouseEvent>): void => {
    if (event.e.button == 2) {
      // right click
      this.panCnavsService.startPan(event.e.clientX, event.e.clientY);
    }
  };

  onMouseMove = (event: fabric.IEvent<MouseEvent>): void => {
    if (this.panCnavsService.isPanning()) {
      this.panCnavsService.updatePan(event.e.clientX, event.e.clientY);
    }
  };

  onMouseUp = (event: fabric.IEvent<MouseEvent>): void => {
    this.panCnavsService.endPan();
  };
}
