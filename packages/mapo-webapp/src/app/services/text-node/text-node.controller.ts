import { fabric } from 'fabric';
import { Tool } from '../../store/toolbar.store';
import { Injectable } from '@angular/core';
import { TextNodeService } from './text-node.service';
import { CanvasService } from '../canvas/canvas.service';
import { ToolbarStore } from '../../store/toolbar.store';
import { TextNodeStore } from '../../store/text-node.store';
import { combineLatest } from 'rxjs';
import { debounceTime, throttleTime, sampleTime } from 'rxjs/operators';

/**
 * Listens to different canvas and keyboard events, and invokes the TextNodeService where appropriate.
 */
@Injectable({
  providedIn: 'root',
})
export class TextNodeController {
  canvas: fabric.Canvas | null = null;

  constructor(
    private textNodeService: TextNodeService,
    private textNodeStore: TextNodeStore,
    private canvasService: CanvasService,
    private toolbarStore: ToolbarStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
      canvas.on('mouse:dblclick', this.onDoubleClick);
      canvas.on('mouse:down', this.onMouseDown);
      canvas.on('object:modified', this.onObjectModified);
    });

    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
      canvas.off('mouse:dblclick', this.onDoubleClick);
      canvas.off('mouse:down', this.onMouseDown);
      canvas.off('object:modified', this.onObjectModified);
    });

    // Rerender edges on any new canvas or text-node
    //
    // When the app is first loading, the order of these observables is not guaranteed.
    // Combining them together makes sure we don't render until all are ready
    combineLatest([
      this.canvasService.canvasInitialized$,
      this.textNodeStore.textNodes$.pipe(sampleTime(20)), // Prevent too many renders at once if many text nodes are updated in quick succession
    ]).subscribe(([canvas, textNodes]) => {
      this.textNodeService.renderTextNodes(textNodes);
    });
  }

  // When double-clicking on the canvas, add a new text node
  onDoubleClick = (e: fabric.IEvent) => {
    if (!this.canvas) {
      console.warn('DoubleClick ignored. No canvas');
      return;
    }

    const isComment = this.toolbarStore.tool.value === Tool.CREATE_COMMENT_NODE;

    if (!e.target && e.absolutePointer) {
      // double-click on empty space on the canvas
      // Add pending text node, itext
      const itext = this.textNodeService.addPendingTextNode(
        e.absolutePointer.y,
        e.absolutePointer.x,
        isComment,
      );
      itext.on('editing:exited', () => {
        this.onITextExited(itext);
      });
    }

    if (e.target && e.target.data?.type === 'text-node') {
      // double-click on a text node
      this.textNodeService.editTextNode(e.target as fabric.Group);
    }
  };

  // When clicking with the 'create-text-node' tool selected, add a new text node
  onMouseDown = (e: fabric.IEvent) => {
    if (!this.canvas) {
      console.warn('MouseDown ignored. No canvas');
      return;
    }

    if (e.target && e.target.data?.type === 'edit-text') {
      return;
    }

    //this determines if isComment = true or false
    const isComment = this.toolbarStore.tool.value === Tool.CREATE_COMMENT_NODE;

    if (this.toolbarStore.tool.value === Tool.CREATE_TEXT_NODE || isComment) {
      if (!e.absolutePointer) {
        console.warn('No absolute pointer on event', e);
        return;
      }

      const itext = this.textNodeService.addPendingTextNode(
        e.absolutePointer.y,
        e.absolutePointer.x,
        isComment,
      );
      this.canvas.requestRenderAll();
      itext.on('editing:exited', () => {
        this.onITextExited(itext);
      });
      return;
    }

    // Exit edit mode for any active IText objects
    for (const obj of this.canvas.getActiveObjects()) {
      if (obj instanceof fabric.IText && obj.isEditing) {
        obj.exitEditing();
      }
    }
  };

  // When an object is modified, update the text node
  onObjectModified = (e: fabric.IEvent) => {
    if (!this.canvas) {
      console.warn('OnObjectModified ignored. No canvas');
      return;
    }

    if (!e.target) {
      console.warn('No target on object:modified event', e);
      return;
    }

    // Many nodes were dragged
    if (e.target.type === 'activeSelection') {
      this.textNodeService.updateTextNodesFromSelection(
        e.target as fabric.ActiveSelection,
      );
    }

    // A single node was dragged
    if (e.target.data?.type === 'text-node') {
      this.textNodeService.updateTextNode(e.target as fabric.Group);
    }
  };

  // When an IText object is exited, finalize the text node (save its new value to the store)
  onITextExited = (itext: fabric.IText) => {
    if (!this.canvas) {
      console.warn('onITextExited ignored. No canvas');
      return;
    }

    // TODO: this logic should be in the service
    if (itext.text === '') {
      this.canvas.remove(itext);
      return;
    }

    this.textNodeService.finalizeTextNode(itext);
  };
}
