import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import * as uuid from 'uuid';
import { ContainerStore } from '../../store/container.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';
import { CanvasService } from '../canvas/canvas.service';

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
    private containerStore: ContainerStore
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
      return;
    }

    if (this.rect === null || this.startX === null || this.startY === null) {
      return;
    }

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

    if (!this.rect || !this.rect.left || !this.rect.top || !this.rect.width || !this.rect.height) {
        return;
    }

    this.containerStore.insert({
      id: uuid.v4(),
      x: this.rect.left,
      y: this.rect.top,
      w: this.rect.width,
      h: this.rect.height,
    })


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
