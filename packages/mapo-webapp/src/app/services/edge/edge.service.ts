import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { Edge } from '../../models/edge.model';
import { EdgeStore } from '../../store/edge.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';
import { FabricUtils } from '../../utils/fabric-utils';
import { CanvasService } from '../canvas/canvas.service';
import { combineLatest, sampleTime } from 'rxjs';
import { TextNodeStore } from '../../store/text-node.store';
import { BehaviorSubject } from 'rxjs';

/**
 * Service used for rendering edges on the canvas
 */
@Injectable({
  providedIn: 'root',
})
export class EdgeService {
  canvas: fabric.Canvas | null = null;
  isEditing = new BehaviorSubject<boolean>(false);
  isEditing$ = this.isEditing.asObservable();
  constructor(
    private edgeStore: EdgeStore,
    private toolbarStore: ToolbarStore,
    private canvasService: CanvasService,
    private textNodeStore: TextNodeStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });

    // Call 'render' if the edge or textnode stores change
    combineLatest([
      this.canvasService.canvasInitialized$,
      this.edgeStore.edges$.pipe(sampleTime(20)),
      this.textNodeStore.textNodes$.pipe(sampleTime(20)),
    ]).subscribe(([canvas, edges, textnodes]) => {
      this.render(edges);
    });

    // On initial render, sometimes edges are loaded before the text-nodes have been rendered.
    // This causes the edges to not render correctly.
    // 
    // Adding this setTimeout on every canvas initialization is a hacky workaround, we need to replace
    // this with a true fix.
    combineLatest([
      this.canvasService.canvasInitialized$,
      this.edgeStore.edges$,
    ])
      .subscribe(([canvas, edges]) => {
        setTimeout(() => {
          this.render(edges);
        }, 200);
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

      if (edge.text && polyline) {
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

    this.isEditing.next(true);

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
      this.isEditing.next(false);
    });
  }
}
