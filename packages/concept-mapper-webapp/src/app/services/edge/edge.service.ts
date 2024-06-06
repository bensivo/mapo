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
            if (object instanceof fabric.Line) {
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
            
            // TODO: what do we do if the start or end object is not found?

            const { x: startX, y: startY } = startObject.getCenterPoint();
            const { x: endX, y: endY } = endObject.getCenterPoint();
            const line = new fabric.Line([
                startX,
                startY,
                endX,
                endY,
            ], {
                stroke: 'black',
                selectable: true,
                lockScalingX: true,
                lockScalingY: true,
                hasControls: false,
                perPixelTargetFind: true,
                padding: 10, // Needed for 'per-pixel-target-find' to work when the line is perfectly horizontal or vertical
                data: {
                    type: 'edge',
                    id: edge.id,
                }
            });

            this.canvas.add(line);
            this.canvas.sendToBack(line);
        }
    }
}