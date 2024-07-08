import * as uuid from 'uuid';
import { fabric } from 'fabric';
import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { EdgeStore } from '../../store/edge.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

@Injectable({
  providedIn: 'root',
})
export class DrawEdgeService {
  canvas: fabric.Canvas | null = null;
  arrow: fabric.Polyline | null = null;
  startObj: fabric.Object | null = null;

  constructor(
    private canvasService: CanvasService,
    private edgeStore: EdgeStore,
    private toolbarStore: ToolbarStore,
  ) {
    this.canvasService.canvas$.subscribe((canvas) => {
      this.canvas = canvas;
    });
  }

  startEdge(object: fabric.Object) {
    if (!this.canvas) {
      return;
    }

    if (this.isDrawingEdge()) {
      console.warn('startEdge ignored. Already drawing edge');
      return;
    }

    this.startObj = object;

    this.arrow = this.drawArrow(
      object.getCenterPoint().x,
      object.getCenterPoint().y,
      object.getCenterPoint().x,
      object.getCenterPoint().y,
    );

    this.canvas.add(this.arrow);
    this.canvas.sendToBack(this.arrow);
  }

  updateEdge(point: fabric.Point) {
    if (!this.canvas) {
      console.warn('updateEdge ignored. No arrow or start object');
      return;
    }

    if (this.arrow === null || this.startObj === null) {
      console.warn('updateEdge ignored. No arrow or start object');
      return;
    }

    this.canvas.remove(this.arrow);

    const srcX = this.startObj.getCenterPoint().x;
    const srcY = this.startObj.getCenterPoint().y;
    this.arrow = this.drawArrow(srcX, srcY, point.x, point.y);
    this.canvas.add(this.arrow);
    this.canvas.sendToBack(this.arrow);
  }

  endEdge(object: fabric.Object) {
    if (!this.canvas) {
      console.warn('endEdge ignored. No canvas');
      return;
    }

    if (this.arrow === null || this.startObj === null) {
      console.warn('endEdge ignored. No arrow or start object');
      return;
    }

    const startNodeId = this.startObj.data.id;
    const endNodeId = object.data.id;

    if (!startNodeId || !endNodeId) {
      console.warn(
        'Could not add edge. Cannot find node IDs for objects',
        this.startObj,
        object,
      );
    } else {
      this.edgeStore.insert({
        id: uuid.v4(),
        startNodeId,
        endNodeId,
      });
    }

    this.toolbarStore.setTool(Tool.POINTER);
    this.removePendingEdge();
  }

  removePendingEdge() {
    if (!this.canvas) {
      console.warn('removePendingEdge ignored. No canvas');
      return;
    }

    if (this.arrow === null || this.startObj === null) {
      return;
    }

    this.canvas.remove(this.arrow);
    this.arrow = null;
    this.startObj = null;
  }

  private drawArrow(srcX: number, srcY: number, destX: number, destY: number) {
    const lineAngle = Math.atan2(destY - srcY, destX - srcX);
    const headLen = 10;
    const headAngle = Math.PI / 8;

    var points = [
      {
        x: srcX, // start point
        y: srcY,
      },
      {
        x: destX, // end point
        y: destY,
      },
      {
        x: destX - headLen * Math.cos(lineAngle - headAngle), // "left" corner of the head, if the arrow was pointing up
        y: destY - headLen * Math.sin(lineAngle - headAngle),
      },
      {
        x: destX - headLen * Math.cos(lineAngle + headAngle), // "right" corner of th head, if the arrow was pointing up
        y: destY - headLen * Math.sin(lineAngle + headAngle),
      },
      {
        x: destX, // end point
        y: destY,
      },
      {
        x: srcX, // start point
        y: srcY,
      },
    ];

    const poly = new fabric.Polyline(points, {
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1,
      selectable: false,
    });

    return poly;
  }

  isDrawingEdge(): boolean {
    return this.arrow !== null;
  }
}
