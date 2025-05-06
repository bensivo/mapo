import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { EdgeStore } from '../store/edge.store';
import { TextNodeStore } from '../store/text-node.store';
import { Tool, ToolbarStore } from '../store/toolbar.store';
import { CanvasService } from '../services/canvas/canvas.service';
import { ToolbarService } from '../services/toolbar/toolbar.service';
import { DrawEdgeService } from '../services/edge/draw-edge.service';

/**
 * When the canvas is active, listens for keyboard events, and controls the toolbar based on the actions pressed
 */
@Injectable({
  providedIn: 'root',
})
export class KeyPressController {
  canvas: fabric.Canvas | null = null;

  constructor(
    private toolbarStore: ToolbarStore,
    private textNodeStore: TextNodeStore,
    private edgeStore: EdgeStore,
    private canvasService: CanvasService,
    private toolbarService: ToolbarService,
    private drawEdgeService: DrawEdgeService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
      document.addEventListener('keydown', this.onKeyPress);
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
      document.removeEventListener('keydown', this.onKeyPress);
    });
  }

  onKeyPress = (e: KeyboardEvent) => {
    if (!this.canvas) {
      return;
    }

    if (e.key === 'Escape') {
      this.toolbarService.select(Tool.POINTER);

      if (this.drawEdgeService.isDrawingEdge()) {
        this.drawEdgeService.removePendingEdge();
      }
    }

    if (this.toolbarStore.tool.value === Tool.EDIT_TEXT_NODE) {
      return;
    }

    if (e.key === 't') {
      this.toolbarService.selectOrCancel(Tool.CREATE_TEXT_NODE);
      return;
    }

    if (e.key === 'c' && !e.metaKey) { // metaKey is cmd/ctrl. We don't want this to trigger during copy-paste
      this.toolbarService.selectOrCancel(Tool.CREATE_COMMENT_NODE);
      return;
    }

    if (e.key === 'e') {
      this.toolbarService.selectOrCancel(Tool.CREATE_EDGE);
      return;
    }

    if (e.key === 'b') {
      this.toolbarService.selectOrCancel(Tool.CREATE_CONTAINER);
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'd') {
      if (this.toolbarStore.tool.value !== Tool.POINTER) {
        return;
      }

      this.canvas.getActiveObjects().forEach((object) => {
        if (object.data?.type === 'text-node') {
          this.textNodeStore.remove(object.data.id);
        }
        if (object.data?.type === 'edge') {
          this.edgeStore.remove(object.data.id);
        }
      });

      // If there was a group-selection, it will sometimes remain after deleting the nodes under it.
      // This makes sure to remove the group-selection as well.
      this.canvas.discardActiveObject().renderAll();
    }
  };
}
