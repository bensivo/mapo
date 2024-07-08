import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { Edge } from '../../models/edge.interface';
import { EdgeStore } from '../../store/edge.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';
import { FabricUtils } from '../../utils/fabric-utils';
import { CanvasService } from '../canvas/canvas.service';

@Injectable({
  providedIn: 'root',
})
export class EdgeService {
  canvas: fabric.Canvas | null = null;

  constructor(
    private edgeStore: EdgeStore,
    private toolbarStore: ToolbarStore,
    private canvasService: CanvasService,
  ) {
    this.canvasService.canvas$.subscribe((canvas) => {
      this.canvas = canvas;
    });
  }

  render(edges: Edge[]) {
    if (!this.canvas) {
      console.warn('Canvas not initialized');
      return;
    }

    // NOTE: Eventually, we should optimize this code to not completely remove and re-add all lines on each render.
    for (const arrow of FabricUtils.getArrows(this.canvas)) {
      this.canvas.remove(arrow);
    }
    for (const text of FabricUtils.getArrowTexts(this.canvas)) {
      this.canvas.remove(text);
    }

    // Build a lookup map of all text-nodes, used when drawing edges
    const textNodes: Record<string, fabric.Object> = {};
    for (const node of FabricUtils.getTextNodes(this.canvas)) {
      textNodes[node.data.id] = node;
    }

    for (const edge of edges) {
      const startObject = textNodes[edge.startNodeId];
      const endObject = textNodes[edge.endNodeId];

      const polyline = FabricUtils.createArrow(
        this.canvas,
        edge.id,
        startObject,
        endObject,
      );

      if (edge.text) {
        FabricUtils.createArrowText(this.canvas, edge.id, edge.text, polyline);
      }
    }
  }

  editText(id: string) {
    if (!this.canvas) {
      console.warn('Canvas not initialized');
      return;
    }

    const edge = this.edgeStore.edges.value.find((edge) => edge.id === id);
    if (!edge) {
      console.warn('Could not locate edge', id);
      return;
    }

    const arrowObj = FabricUtils.getArrow(this.canvas, id);
    const textObj = FabricUtils.getArrowText(this.canvas, id);
    const text = textObj?.text ?? '';

    if (!arrowObj) {
      console.warn('Could not find one or more objects for editing edge', edge);
      return;
    }

    if (textObj !== undefined) {
      this.canvas.remove(textObj);
    }

    const srcX = arrowObj.data.srcX;
    const srcY = arrowObj.data.srcY;
    const destX = arrowObj.data.destX;
    const destY = arrowObj.data.destY;

    if (!srcX || !srcY || !destX || !destY) {
      console.warn('arrowObj does not have srcX, srcY, destX, destY', arrowObj);
      return;
    }

    const centerpointX = srcX + (destX - srcX) / 2;
    const centerpointY = srcY + (destY - srcY) / 2;

    const itext = FabricUtils.createIText(
      this.canvas,
      text,
      centerpointY,
      centerpointX,
    );
    FabricUtils.selectIText(this.canvas, itext);
    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);

    itext.on('editing:exited', (e) => {
      if (!this.canvas) {
        console.warn('Canvas not initialized');
        return;
      }

      this.edgeStore.update(id, {
        text: itext.text ?? '',
      });
      this.canvas.remove(itext);
      this.toolbarStore.setTool(Tool.POINTER);
    });
  }
}
