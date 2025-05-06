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
import { PanCanvasService } from '../services/pan-canvas/pan-canvas.service';
import { HammertimePinchService } from '../services/hammertime/hammertime-pinch.service';
import { HammertimePressService } from '../services/hammertime/hammertime-press.service';
import { ZoomCanvasService } from '../services/zoom-canvas/zoom-canvas.service';

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
        private panCanvasService: PanCanvasService,
        private hammertimePinchService: HammertimePinchService,
        private hammertimePressService: HammertimePressService,
        private zoomCanvasService: ZoomCanvasService,
    ) {

        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            this.canvas = canvas;
            canvas.on('mouse:down', this.onMouseDown);
            canvas.on('mouse:move', this.onMouseMove);
            canvas.on('mouse:up', this.onMouseUp);
            canvas.on('mouse:dblclick', this.onDoubleClick);
            canvas.on('mouse:wheel', this.onMouseWheel);


            // Prevent mouse wheel events on teh canvas-container, which would cause the screen to zoom
            // when pinching on trackpads.
            const container = document.getElementById('canvas-container');
            if (container != null) {
                container.addEventListener('wheel', (e) => {
                    e.preventDefault();
                }, {
                    passive: false,
                });
            }
        });

        this.canvasService.canvasDestroyed$.subscribe((canvas) => {
            this.canvas = null;
            canvas.off('mouse:down', this.onMouseDown as any);
            canvas.off('mouse:move', this.onMouseMove as any);
            canvas.off('mouse:dblclick', this.onDoubleClick);
            canvas.off('mouse:wheel', this.onMouseWheel as any);
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

    onMouseDown = (e: fabric.IEvent<MouseEvent>) => {
        if (!this.canvas) {
            console.warn('MouseDown ignored. No canvas');
            return;
        }

        // Right click
        if (e.e.button == 2) {
            this.panCanvasService.startPan(e.e.clientX, e.e.clientY);
        }

        if (isTouchScreen() && !e.target) {
            // When using a touchscreen, clientX and clientY are not availabel for some reason.
            // but layerX and layerY are.
            this.panCanvasService.startPan(e.e.layerX, e.e.layerY); 
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

    onMouseMove = (e: fabric.IEvent<MouseEvent>) => {
        if (!e.absolutePointer) {
            return;
        }

        // Often, pinch events also trigger mouse-move-touch events. This causes
        // both zoom an pan logic to fire. To prevent this, we stop the 
        // pan logic if the "isPiching" flag is active.
        if (this.hammertimePinchService.isPinching) {
            return;
        }

        // If the user is pressing (creating a selection box),
        // based on the current pointer position it updates the selection box
        if (this.hammertimePressService.isPressing) {
            this.hammertimePressService.updatePress(
                e.absolutePointer.x,
                e.absolutePointer.y,
            );
            return;
        }

        if (this.drawEdgeService.isDrawingEdge()) {
            this.drawEdgeService.updateEdge(e.absolutePointer);
        }

        if (this.panCanvasService.isPanning()) {

            if (isTouchScreen()) {
                this.panCanvasService.updatePan(e.e.layerX, e.e.layerY);
            } else {
                this.panCanvasService.updatePan(e.e.clientX, e.e.clientY);
            }
        }
    };

    onMouseUp = (event: fabric.IEvent<MouseEvent>): void => {
        if (this.hammertimePressService.isPressing) {
            this.hammertimePressService.endPress();
        }

        this.panCanvasService.endPan();
    };

    onMouseWheel = (event: fabric.IEvent<WheelEvent>): void => {
        const e = event.e; // the underlying window.WheelEvent object

        if (e.ctrlKey || e.metaKey) { // When the user is holding control, alt, or command. Also triggers on a trackpad, when pinching to zoom.
            const delta = e.deltaY *6;
            this.zoomCanvasService.zoomCanvas(delta, event.e.offsetX, event.e.offsetY);
        } else { // Triggers when scrolling normally, or when panning with two fingers on a trackpad.
            this.panCanvasService.startPan(0, 0);
            this.panCanvasService.updatePan(-e.deltaX, -e.deltaY);
            this.panCanvasService.endPan();
        }
    }
}
