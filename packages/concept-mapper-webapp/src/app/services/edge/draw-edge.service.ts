import * as uuid from 'uuid';
import { fabric } from 'fabric';
import { Injectable } from "@angular/core";
import { EdgeService } from './edge.service';
import { EdgeStore } from '../../store/edge.store';

/**
 * Manages events and state for drawing edges between nodes
 */
@Injectable({
    providedIn: 'root'
})
export class DrawEdgeService {
    canvas!: fabric.Canvas;
    enabled: boolean = false;
    line: fabric.Line | null = null;
    start: fabric.Object | null = null;

    constructor(
        private edgeStore: EdgeStore,
    ) { }

    register(canvas: fabric.Canvas) {
        this.canvas = canvas;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'e') {
                this.enabled = !this.enabled;
            }

            if (e.key === 'Escape') {
                this.enabled = false;
            }

            if (this.enabled == false) {
                this.removePendingEdge();
            }

            console.log('DrawEdge enabled', this.enabled);
        });

        canvas.on('mouse:up', (e) => {
            if (!this.enabled) {
                return;
            }

            if (!e.target) {
                return;
            }

            if (e.target instanceof fabric.Line) {
                return;
            }

            if (!e.absolutePointer) {
                console.warn('No absolute pointer on event', e)
                return;
            }

            if (this.line === null) {
                this.startEdge(e.target);
            } else {
                this.endEdge(e.target);
            }
        });

        canvas.on('mouse:move', (e) => {
            if (!this.enabled) {
                return;
            }

            if (!e.absolutePointer) {
                console.warn('No absolute pointer on event', e)
                return;
            }

            if (this.line !== null) {
                this.updateEdge(e.absolutePointer);
            }
        });
    }

    startEdge(object: fabric.Object) {
        this.start = object;
        this.line = new fabric.Line([
            object.getCenterPoint().x,
            object.getCenterPoint().y,
            object.getCenterPoint().x,
            object.getCenterPoint().y,
        ], {
            stroke: 'black',
            selectable: false,
        });
        this.canvas.add(this.line);
        this.canvas.sendToBack(this.line);
    }
    updateEdge(point: fabric.Point) {
        if (this.line === null) {
            return;
        }

        this.line.set({
            x2: point.x,
            y2: point.y,
        });
        this.canvas.renderAll();
    }
    endEdge(object: fabric.Object) {
        if (this.line === null || this.start === null) {
            return;
        }

        const startNodeId = this.start.data.id;
        const endNodeId = object.data.id;

        if (!startNodeId || !endNodeId) {
            console.warn('Could not add edge. Cannot find node IDs for objects', this.start, object);
        } else {
            this.edgeStore.insert({
                id: uuid.v4(),
                startNodeId,
                endNodeId,
            });
        }

        this.removePendingEdge();
    }

    removePendingEdge() {
        if (this.line === null || this.start === null) {
            return;
        }

        this.canvas.remove(this.line);
        this.start = null;
        this.line = null;
        this.enabled = false;
    }
}