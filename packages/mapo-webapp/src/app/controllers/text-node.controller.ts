import { fabric } from 'fabric';
import { Tool } from '../store/toolbar.store';
import { Injectable } from "@angular/core";
import { TextNodeService } from "../services/text-node/text-node.service";
import { CanvasService } from "../services/canvas/canvas.service";
import { ToolbarStore } from "../store/toolbar.store";
import { TextNodeStore } from '../store/text-node.store';
import { combineLatest } from 'rxjs';

/**
 * Listens to different canvas and keyboard events, and invokes the TextNodeService where appropriate.
 */
@Injectable({
    providedIn: 'root'
})
export class TextNodeController {
    canvas: fabric.Canvas | null = null;

    constructor(
        private textNodeService: TextNodeService,
        private textNodeStore: TextNodeStore,
        private canvasService: CanvasService,
        private toolbarStore: ToolbarStore,
    ) {
        this.canvasService.canvas$.subscribe((canvas) => {
            this.canvas = canvas;

            if (canvas !== null) {
                this.registerCanvasEventListers(canvas);
            }
        });

        combineLatest([
            this.canvasService.canvas$,
            this.textNodeStore.textNodes$,
        ])
        .subscribe(([canvas, textNodes]) => {
            if (!canvas) {
                return;
            }

            this.textNodeService.renderTextNodes(textNodes);
        });
    }

    onDoubleClick(e: fabric.IEvent) {
        if (!this.canvas) {
            console.warn('DoubleClick ignored. No canvas');
            return;
        }

        if (!e.target && e.absolutePointer) { // double-click on empty space on the canvas
            // Add pending text node, itext
            const itext = this.textNodeService.addPendingTextNode(e.absolutePointer.y, e.absolutePointer.x);
            itext.on('editing:exited', () => {
                this.onITextExited(itext);
            });
        }

        if (e.target && e.target.data?.type === 'text-node') { // double-click on a text node
            this.textNodeService.editTextNode(e.target as fabric.Group);
        }
    }

    onMouseDown(e: fabric.IEvent) {
        if (!this.canvas) {
            console.warn('MouseDown ignored. No canvas');
            return;
        }

        if (this.toolbarStore.tool.value === Tool.CREATE_TEXT_NODE) {
            if (!e.absolutePointer) {
                console.warn('No absolute pointer on event', e);
                return;
            }

            // Add pending text node, itext
            const itext = this.textNodeService.addPendingTextNode(e.absolutePointer.y, e.absolutePointer.x);
            this.canvas.renderAll();
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
    }

    onObjectModified(e: fabric.IEvent) {
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
            this.textNodeService.updateTextNodesFromSelection(e.target as fabric.ActiveSelection);
        }

        // A single node was dragged
        if (e.target.data?.type === 'text-node') {
            this.textNodeService.updateTextNode(e.target as fabric.Group);
        }
    }

    onITextExited(itext: fabric.IText) {
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
    }

    /**
     * Registers the event listeners for the TextNodeService.
     */
    private registerCanvasEventListers(canvas: fabric.Canvas) {
        canvas.on('mouse:dblclick', (e) => {
            this.onDoubleClick(e);
        });
        canvas.on('mouse:down', (e) => {
            this.onMouseDown(e);
        });
        canvas.on('object:modified', (e) => {
            this.onObjectModified(e);
        });
    }
}