import * as uuid from 'uuid';
import { fabric } from 'fabric';
import { Injectable } from "@angular/core";
import { EdgeStore } from '../../store/edge.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

/**
 * Manages events and state for drawing edges between nodes
 */
@Injectable({
    providedIn: 'root'
})
export class DrawEdgeService {
    canvas!: fabric.Canvas;
    enabled: boolean = false;
    arrow: fabric.Polyline | null = null;
    start: fabric.Object | null = null;

    constructor(
        private edgeStore: EdgeStore,
        private toolbarStore: ToolbarStore,
    ) { }

    register(canvas: fabric.Canvas) {
        this.canvas = canvas;

        this.toolbarStore.tool$.subscribe((tool) => {
            if (tool !== Tool.CREATE_EDGE && this.arrow !== null) {
                this.removePendingEdge();
            }
        });

        canvas.on('mouse:up', (e) => {
            if (this.toolbarStore.tool.value !== Tool.CREATE_EDGE) {
                return;
            }

            if (!e.target) {
                return;
            }

            if (e.target instanceof fabric.Polyline) {
                return;
            }

            if (!e.absolutePointer) {
                console.warn('No absolute pointer on event', e)
                return;
            }

            if (this.arrow === null) {
                this.startEdge(e.target);
            } else {
                this.endEdge(e.target);
            }
        });

        canvas.on('mouse:move', (e) => {
            if (this.toolbarStore.tool.value !== Tool.CREATE_EDGE) {
                return;
            }

            if (!e.absolutePointer) {
                console.warn('No absolute pointer on event', e)
                return;
            }

            if (this.arrow !== null) {
                this.updateEdge(e.absolutePointer);
            }
        });
    }

    startEdge(object: fabric.Object) {
        this.start = object;

        this.arrow = this.drawArrow(
            object.getCenterPoint().x,
            object.getCenterPoint().y,
            object.getCenterPoint().x,
            object.getCenterPoint().y,
        );

        this.canvas.add(this.arrow);
        this.canvas.sendToBack(this.arrow);
    }
    updateEdge(point: fabric.Point) {
        if (this.arrow === null || this.start === null) {
            return;
        } 
            this.canvas.remove(this.arrow);

        const srcX = this.start.getCenterPoint().x;
        const srcY = this.start.getCenterPoint().y;
        this.arrow = this.drawArrow(
            srcX, 
            srcY,
            point.x,
            point.y
        );
        this.canvas.add(this.arrow);
        this.canvas.sendToBack(this.arrow);
    }
    endEdge(object: fabric.Object) {
        if (this.arrow === null || this.start === null) {
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

        this.toolbarStore.setTool(Tool.POINTER);
        this.removePendingEdge();
    }

    removePendingEdge() {
        if (this.arrow === null || this.start === null) {
            return;
        }

        this.canvas.remove(this.arrow);
        this.start = null;
        this.arrow = null;
        this.enabled = false;
    }

    drawArrow(srcX: number, srcY: number, destX: number, destY: number) {
        const lineAngle = Math.atan2(destY - srcY, destX - srcX);
        const headLen = 10;
        const headAngle = Math.PI / 8;

        var points = [
            {
                x: srcX, // start point
                y: srcY
            }, 
            {
                x: destX, // end point
                y: destY
            }, 
            {
                x: destX - headLen * Math.cos(lineAngle - headAngle), // "left" corner of the head, if the arrow was pointing up
                y: destY - headLen * Math.sin(lineAngle - headAngle),
            },
            {
                x: destX - headLen * Math.cos(lineAngle + headAngle), // "right" corner of th head, if the arrow was pointing up
                y: destY - headLen * Math.sin(lineAngle + headAngle),
            },
            {
                x: destX, // end point
                y: destY
            }, 
            {
                x: srcX, // start point
                y: srcY
            }, 
        ];

        const poly = new fabric.Polyline(points, {
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1,
            selectable: true,
        });

        return poly;
    }
}