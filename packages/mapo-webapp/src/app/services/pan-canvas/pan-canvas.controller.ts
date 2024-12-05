import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { PanCanvasService } from './pan-canvas.service';
import { isTouchScreen } from '../../utils/browser-utils';
@Injectable({
  providedIn: 'root',
})
export class PanCanvasController {
  constructor(
    private canvasService: CanvasService,
    private panCnavsService: PanCanvasService,
  ) {
    console.log("PanCanvasController initialized"); // delete later
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      if (isTouchScreen()) {
        canvas.on('mouse:down', this.onMouseDownTouch);
        canvas.on('mouse:move', this.onMouseMoveTouch);
        canvas.on('mouse:up', this.onMouseUpTouch);
      }
      else {
        canvas.on('mouse:down', this.onMouseDown);
        canvas.on('mouse:move', this.onMouseMove);
        canvas.on('mouse:up', this.onMouseUp);
      }
    });
  }

  onMouseDownTouch = (event: fabric.IEvent<MouseEvent>): void => {
    if (event.target) {
      return;
    }
    this.panCnavsService.startPan(event.e.layerX, event.e.layerY);
  }

  onMouseMoveTouch = (event: fabric.IEvent<MouseEvent>): void => {
    if (this.panCnavsService.isPanning()) {
      console.log("Touch Panning"); // delete later
      this.panCnavsService.updatePan(event.e.layerX, event.e.layerY);
    }
  }

  onMouseUpTouch = (event: fabric.IEvent<MouseEvent>): void => {
    this.panCnavsService.endPan();
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
