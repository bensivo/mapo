import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../services/canvas/canvas.service';
import { TextNodeService } from '../services/text-node/text-node.service';

/**
 * Listens to object-modified event from the canvas.
 */
@Injectable({
    providedIn: 'root',
})
export class ObjectModified {
    canvas: fabric.Canvas | null = null;

    constructor(
        private textNodeService: TextNodeService,
        private canvasService: CanvasService,
    ) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            this.canvas = canvas;
            canvas.on('object:modified', this.onObjectModified); 
        });

        this.canvasService.canvasDestroyed$.subscribe((canvas) => {
            this.canvas = null;
            canvas.off('object:modified', this.onObjectModified);
        });
    }

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
}
