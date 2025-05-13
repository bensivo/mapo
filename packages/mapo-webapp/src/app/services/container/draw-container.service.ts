import * as uuid from 'uuid';
import { fabric } from 'fabric';
import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { EdgeStore } from '../../store/edge.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

/**
 * Service used for the draw-edge tool, rendering pending edges
 * while users are drawing them.
 */
@Injectable({
  providedIn: 'root',
})
export class DrawContainerService {
  canvas: fabric.Canvas | null = null;

  rect: fabric.Rect | null= null;
  startX: number | null = null;
  startY: number | null = null;

  constructor(
    private canvasService: CanvasService,
    private toolbarStore: ToolbarStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
  }

  isDrawingContainer() {
    return this.rect !== null;
  }

  startContainer(x: number, y: number) {
    if (!this.canvas) {
      return;
    }

    if (this.isDrawingContainer()) {
        return;
    }


    const rect = new fabric.Rect({
        top: y,
        left: x,
        width: 1,
        height: 1,
        fill: '#ddddddaa',
        stroke: 'black',
        strokeDashArray: [5, 5],
        rx: 10,
        ry: 10,
        strokeWidth: 1,
        selectable: false,
        evented: false,
    })
    this.rect = rect;
    this.startX = x;
    this.startY = y;

    this.canvas.add(rect);
    this.canvas.sendToBack(rect);
    this.canvas.renderAll();
  }

  updateContainer(x: number, y: number) {
    if (!this.canvas) {
      console.warn('asdflajsldg');
      return;
    }

    if (this.rect === null || this.startX === null || this.startY === null) {
      console.warn('failsdfjas');
      return;
    }

    // this.canvas.remove(this.arrow);
    const minX = Math.min(this.startX, x);
    const minY = Math.min(this.startY, y);
    const diffX = Math.abs(this.startX - x);
    const diffY = Math.abs(this.startY - y);

    this.rect.set({
        top: minY,
        left: minX,
        width: diffX,
        height: diffY,
    })
    this.canvas.renderAll();
  }

  finalizeContainer(x: number, y: number) {
    if (!this.canvas) {
        return;
    }

    if (!this.rect) {
        return;
    }

    console.log("Finalizing container from", this.startX, this.startY, 'to', x, y)
    this.canvas.remove(this.rect);
    this.rect = null;
    this.startX = null;
    this.startY = null;
    this.toolbarStore.setTool(Tool.POINTER);
  }

  cancelContainer() {
    if (this.canvas && this.rect) {
        this.canvas.remove(this.rect);
    }

    this.rect = null;
    this.startX = null;
    this.startY = null;
  }
}
