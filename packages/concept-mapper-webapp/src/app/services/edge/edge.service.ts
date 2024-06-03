import { fabric } from 'fabric';
import { Injectable } from "@angular/core";

export interface Edge {
    start: fabric.Object;
    end: fabric.Object;
}

@Injectable({
    providedIn: 'root'
})
export class EdgeService {
    canvas!: fabric.Canvas;

    edges: Edge[] = [];

    register(canvas: fabric.Canvas) {
        this.canvas = canvas;
        canvas.on('object:moving', (e) => {
            this.render();
        });
    }

    addEdge(start: fabric.Object, end: fabric.Object) {
        this.edges.push({ start, end });
        this.render();
    }

    render() {
        // NOTE: Eventually, we should optimize this code to not completely remove and re-add all lines on each render.
        for (const object of this.canvas.getObjects()) {
            if (object instanceof fabric.Line) {
                this.canvas.remove(object);
            }
        }

        for (const edge of this.edges) {
            const { x: startX, y: startY } = edge.start.getCenterPoint();
            const { x: endX, y: endY } = edge.end.getCenterPoint();
            const line = new fabric.Line([
                startX,
                startY,
                endX,
                endY
            ], {
                stroke: 'black',
                selectable: false,
            });

            this.canvas.add(line);
            this.canvas.sendToBack(line);
        }

        this.canvas.renderAll();
    }
}