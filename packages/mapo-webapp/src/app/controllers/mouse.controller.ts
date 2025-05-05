import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { combineLatest } from 'rxjs';
import { sampleTime } from 'rxjs/operators';
import { CanvasService } from '../services/canvas/canvas.service';
import { TextNodeService } from '../services/text-node/text-node.service';
import { TextNodeStore } from '../store/text-node.store';
import { Tool, ToolbarStore } from '../store/toolbar.store';
import { isTouchScreen } from '../utils/browser-utils';
import { DrawEdgeService } from '../services/edge/draw-edge.service';
import { EdgeService } from '../services/edge/edge.service';

/**
 * Listens to mouse events on the fabric canvas.
 */
@Injectable({
    providedIn: 'root',
})
export class MouseController {
    canvas: fabric.Canvas | null = null;

    constructor(
        private textNodeService: TextNodeService,
        private textNodeStore: TextNodeStore,
        private canvasService: CanvasService,
        private toolbarStore: ToolbarStore,
        private drawEdgeService: DrawEdgeService,
        private edgeService: EdgeService,
    ) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            this.canvas = canvas;
            canvas.on('mouse:down', this.onMouseDown);
            canvas.on('mouse:move', this.onMouseMove);

            // For double-click, we listen for either mouse:dblclick (desktops), 
            // or use the Hammertime library to listen for doubletaps
            if (isTouchScreen()) {
                const canvasContainer = document.getElementById('canvas-container');
                if (!canvasContainer) {
                    return;
                }

                // TODO: This might result in duplicate hammer events if we leave the canvas page, then come back to it
                const hammer = new Hammer(canvasContainer, {});
                hammer.get('tap').set({ taps: 2 });
                hammer.on('tap', (e) => {
                    this.onDoubleTap(e, canvas);
                });
            } else {
                canvas.on('mouse:dblclick', this.onDoubleClick);
            }
        });

        this.canvasService.canvasDestroyed$.subscribe((canvas) => {
            this.canvas = null;
            canvas.off('mouse:down', this.onMouseDown);
            canvas.off('mouse:move', this.onMouseMove);
            canvas.off('mouse:dblclick', this.onDoubleClick);
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

        // Double click on empty space in the fabric canvas
        if (!e.target && e.absolutePointer) {

            const isComment = this.toolbarStore.tool.value === Tool.CREATE_COMMENT_NODE;
            this.textNodeService.addPendingTextNode(
                e.absolutePointer.y,
                e.absolutePointer.x,
                isComment,
            );
        }

        // Double-click on a text node
        if (e.target && e.target.data?.type === 'text-node') {
            this.textNodeService.editTextNode(e.target as fabric.Group);
        }

        // Double-click on an edge, or edge-text
        if (e.target && (e.target.data?.type === 'edge' || e.target.data?.type === 'edge-text')) {
            const edgeId = e.target.data.id;
            this.edgeService.editText(edgeId);
        }
    };

    onMouseDown = (e: fabric.IEvent) => {
        if (!this.canvas) {
            console.warn('MouseDown ignored. No canvas');
            return;
        }

        // Ignore clicks inside an active IText element,
        // because the user is just selecting a new cursor position
        if (e.target && e.target.data?.type === 'edit-text') {
            return;
        }

        const tool = this.toolbarStore.tool.value;

        // If the user was in create-comment mode, clicks create new comment nodes
        if (tool === Tool.CREATE_COMMENT_NODE && e.absolutePointer) {
            this.textNodeService.addPendingComment(
                e.absolutePointer.y,
                e.absolutePointer.x,
            );
            return;
        }

        // If the user was in create-text-node mode, clicks create new text nodes
        if (tool === Tool.CREATE_TEXT_NODE && e.absolutePointer) {
            this.textNodeService.addPendingTextNode(
                e.absolutePointer.y,
                e.absolutePointer.x,
            );
            return;
        }

        // If the user was in create-edge, and clicked on an actual node, start or finish an edge
        if (tool === Tool.CREATE_EDGE && e.target) {
            
            // Double check that the object clicked on was actally a text-node
            if (e.target?.data?.type !== 'text-node') {
                this.drawEdgeService.removePendingEdge();
                this.toolbarStore.setTool(Tool.POINTER);
                return;
            }

            // See if this is the start of a new pending edge, or the end of an existing pending edge
            if (this.drawEdgeService.isDrawingEdge()) {
                this.drawEdgeService.endEdge(e.target);
            } else {
                this.drawEdgeService.startEdge(e.target);
            }
        }

        // Clicks on empty space in the canvas, usually used to exit editing text.
        if (!e.target) {
            for (const obj of this.canvas.getActiveObjects()) {
                if (obj instanceof fabric.IText && obj.isEditing) {
                    obj.exitEditing();
                }
            }
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

    onDoubleTap = (e: HammerInput, canvas: fabric.Canvas) => {
        if (!this.canvas) return;

        // hammerJS doesn't see the fabric.js event, so we use the 'findTarget' function
        const target = canvas.findTarget(
            {
                clientX: e.center.x,
                clientY: e.center.y,
            } as MouseEvent,
            true,
        );

        if (target && target.data?.type === 'text-node') {
            this.textNodeService.editTextNode(target as fabric.Group);
        } else {
            return;
        }
    };
}
