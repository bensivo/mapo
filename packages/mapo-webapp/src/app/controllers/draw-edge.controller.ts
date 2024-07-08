import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../services/canvas/canvas.service';
import { DrawEdgeService } from '../services/edge/draw-edge.service';
import { Tool, ToolbarStore } from '../store/toolbar.store';

@Injectable({
  providedIn: 'root',
})
export class DrawEdgeController {
  canvas: fabric.Canvas | null = null;

  constructor(
    private canvasService: CanvasService,
    private drawEdgeService: DrawEdgeService,
    private toolbarStore: ToolbarStore,
  ) {
    this.canvasService.canvas$.subscribe((canvas) => {
      if (!canvas) {
        return;
      }

      this.canvas = canvas;
      this.registerCanvasEventListers(canvas);
    });

    this.toolbarStore.tool$.subscribe((tool) => {
      if (tool !== Tool.CREATE_EDGE && this.drawEdgeService.isDrawingEdge()) {
        this.drawEdgeService.removePendingEdge();
      }
    });
  }

  onMouseUp(e: fabric.IEvent) {
    if (!this.canvas) {
      console.warn('MouseUp ignored. No canvas');
      return;
    }

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
  }

  onMouseMove(e: fabric.IEvent) {
    if (!e.absolutePointer) {
      return;
    }

    if (this.drawEdgeService.isDrawingEdge()) {
      this.drawEdgeService.updateEdge(e.absolutePointer);
    }
  }

  private registerCanvasEventListers(canvas: fabric.Canvas) {
    canvas.on('mouse:up', (e) => {
      this.onMouseUp(e);
    });

    canvas.on('mouse:move', (e) => {
      this.onMouseMove(e);
    });
  }
}
