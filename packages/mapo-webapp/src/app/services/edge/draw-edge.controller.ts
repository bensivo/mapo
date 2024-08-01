import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../canvas/canvas.service';
import { DrawEdgeService } from './draw-edge.service';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

/**
 * Listens to canvas edges to control the draw-edge service, for drawing pending edges between nodes
 */
@Injectable({
  providedIn: 'root',
})
export class DrawEdgeController {
  constructor(
    private canvasService: CanvasService,
    private drawEdgeService: DrawEdgeService,
    private toolbarStore: ToolbarStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      canvas.on('mouse:up', this.onMouseUp);
      canvas.on('mouse:move', this.onMouseMove);
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      canvas.off('mouse:up', this.onMouseUp);
      canvas.off('mouse:move', this.onMouseMove);
    });

    this.toolbarStore.tool$.subscribe((tool) => {
      if (tool !== Tool.CREATE_EDGE && this.drawEdgeService.isDrawingEdge()) {
        this.drawEdgeService.removePendingEdge();
      }
    });
  }

  onMouseUp = (e: fabric.IEvent) => {
    if (this.toolbarStore.tool.value !== Tool.CREATE_EDGE) {
      return;
    }

    if (!e.target) {
      return;
    }

    if (e.target?.data?.type !== 'text-node') {
      if (this.drawEdgeService.isDrawingEdge()) {
        this.drawEdgeService.removePendingEdge();
        this.toolbarStore.setTool(Tool.POINTER);
      }
      return;
    }

    if (!this.drawEdgeService.isDrawingEdge()) {
      this.drawEdgeService.startEdge(e.target);
    } else {
      this.drawEdgeService.endEdge(e.target);
    }
  };

  onMouseMove = (e: fabric.IEvent) => {
    if (!e.absolutePointer) {
      return;
    }

    if (this.drawEdgeService.isDrawingEdge()) {
      this.drawEdgeService.updateEdge(e.absolutePointer);
    }
  };
}
