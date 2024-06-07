import { Injectable } from "@angular/core";
import { fabric } from 'fabric';
import { EdgeStore } from '../../store/edge.store';
import { Edge } from "../../models/edge.interface";
import { TextNodeStore } from "../../store/text-node.store";

@Injectable({
    providedIn: 'root'
})
export class EdgeService {
    canvas!: fabric.Canvas;

    constructor(
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
    ) { }

    register(canvas: fabric.Canvas) {
        this.canvas = canvas;
        canvas.on('object:moving', (e) => {
            if (e.target?.type === 'activeSelection') {
                // TODO: if the active selection includes nodes that aren't also in the selection, update just those nodes
                this.render(this.edgeStore.edges.value);
                return;
            }
            this.render(this.edgeStore.edges.value);
        });

        this.edgeStore.edges$.subscribe((edges) => {
            this.render(edges);
        });
        this.textNodeStore.textNodes$.subscribe(() => {
            this.render(this.edgeStore.edges.value);
        });
    }

    render(edges: Edge[]) {
        const objects: Record<string, fabric.Object> = {};

        // NOTE: Eventually, we should optimize this code to not completely remove and re-add all lines on each render.
        for (const object of this.canvas.getObjects()) {
            if (object instanceof fabric.Polyline) {
                this.canvas.remove(object);
                continue;
            }

            if (object.data?.id !== undefined) {
                objects[object.data.id] = object;
            }
        }

        for (const edge of edges) {
            const startObject = objects[edge.startNodeId];
            const endObject = objects[edge.endNodeId];
            
            const arrow = this.drawArrow(edge.id, startObject, endObject);
            this.canvas.add(arrow);
            this.canvas.sendToBack(arrow);
           
        }
    }

    // Make the arrow N units shorter, but still pointing in the same direction
    private subtractArrowLength(srcX: number, srcY: number, destX: number, destY: number, n: number): { x: number, y: number } {
        const lineAngle = Math.atan2(destY - srcY, destX - srcX);

        return {
            x: destX - n * Math.cos(lineAngle),
            y: destY - n * Math.sin(lineAngle),
        }
    }

    private drawArrow(id: string, src: fabric.Object, dest: fabric.Object) {
        const srcX = this.getCenterPoint(src).x;
        const srcY = this.getCenterPoint(src).y;
        let destX = this.getCenterPoint(dest).x;
        let destY = this.getCenterPoint(dest).y;

        do {
            const point = this.subtractArrowLength(srcX, srcY, destX, destY, 5);
            destX = point.x;
            destY = point.y;
        } while(dest.containsPoint(new fabric.Point(destX, destY), null, true))

        // // Subtract 3 more from the end, just for aesthetics
        // const point = this.subtractArrowLength(srcX, srcY, destX, destY, 3);
        // destX = point.x;
        // destY = point.y;

        const lineAngle = Math.atan2(destY - srcY, destX - srcX);

        const headLen = 10;
        const headAngle = Math.PI / 8;

        // calculate the points.
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
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            perPixelTargetFind: true,
            padding: 10, // Needed for 'per-pixel-target-find' to work when the line is perfectly horizontal or vertical
            data: {
                type: 'edge',
                id: id,
            }
        });

        return poly;
    }

    private getCenterPoint(object: fabric.Object): fabric.Point {
        if (!object.group) {
            return object.getCenterPoint();
        }
        else {
            // When objects are in a group, their coordinates are relative to the group coordinates. 
            // This line is activated when the user drags a group of nodes, to calculate the position of each node
            const groupCenter = object.group.getCenterPoint()
            const objectCenter = object.getCenterPoint();

            return new fabric.Point(groupCenter.x + objectCenter.x, groupCenter.y + objectCenter.y);
        }
    }
}