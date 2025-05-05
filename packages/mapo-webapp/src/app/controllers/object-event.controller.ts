import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { BehaviorSubject, combineLatest, sampleTime } from 'rxjs';
import { CanvasService } from '../services/canvas/canvas.service';
import { EdgeService } from '../services/edge/edge.service';
import { TextNodeService } from '../services/text-node/text-node.service';
import { EdgeStore } from '../store/edge.store';

/**
 * Listens to canvas events with the "object" prefix, like "object:modified" and "object:moving"
 */
@Injectable({
    providedIn: 'root',
})
export class ObjectEventController {
    canvas: fabric.Canvas | null = null;

    objectMoving$ = new BehaviorSubject<fabric.IEvent | null>(null);

    constructor(
        private textNodeService: TextNodeService,
        private canvasService: CanvasService,
        private edgeStore: EdgeStore,
        private edgeService: EdgeService,
    ) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            this.canvas = canvas;
            canvas.on('object:modified', this.onObjectModified);
            canvas.on('object:moving', this.onObjectMoving);
        });

        this.canvasService.canvasDestroyed$.subscribe((canvas) => {
            this.canvas = null;
            canvas.off('object:modified', this.onObjectModified);
            canvas.off('object:moving', this.onObjectMoving);
        });

        combineLatest([
            this.edgeStore.edges$,
            this.objectMoving$.pipe(sampleTime(20))
        ])
        .subscribe(([edges, e]) => {
            this.edgeService.render(edges);
        });
    }

    onObjectMoving = (e: fabric.IEvent) => {
        // Instead of directly calling render on moving events, we send the events through
        // an observable. This lets us use the sampleTime() function to throttle updates.
        this.objectMoving$.next(e); 
    };

    /**
     * In mapo, objectModified is usually the triggered after moving a text node.
     * During the node's movement, we get many onObjectMoving events, but after 
     * the movement is done, we get "onObjectModified". 
     * @param e 
     * @returns 
     */
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
