import { fabric } from 'fabric';
import { Injectable } from "@angular/core";

export interface PendingEdge {
    line: fabric.Line;
    start: fabric.Object;
    endX: number;
    endY: number;
}

export interface Edge {
    line: fabric.Line;
    start: fabric.Object;
    end: fabric.Object;
}

@Injectable({
    providedIn: 'root'
})
export class EdgeService {
    canvas!: fabric.Canvas;

    isDrawingEnabled: boolean = false;
    isDrawingEdge: boolean = false;

    pendingEdge: PendingEdge | null = null;
    edges: Edge[] = [];

    register(canvas: fabric.Canvas) {
        this.canvas = canvas;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'e') {
                this.isDrawingEnabled = true;
                console.log('Edge drawing enabled', this.isDrawingEnabled);
            }

            if (e.key === 'Escape') {
                this.isDrawingEnabled = false;
                this.isDrawingEdge = false;
                if (this.pendingEdge !== null ){
                    this.canvas.remove(this.pendingEdge.line)
                    this.pendingEdge = null;
                }
            }
        });

        canvas.on('mouse:up', (e) => {
            if (!this.isDrawingEnabled) {
                return;
            }

            if (!e.absolutePointer) {
                console.warn('No absolute pointer on event', e)
                return;
            }

            if (!e.target) {
                return;
            }

            if (!this.isDrawingEdge) {
                this.startLine(e.target);
            } else {
                this.endLine(e.target);
            }
        });

        canvas.on('mouse:move', (e) => {
            if (!this.isDrawingEnabled) {
                return;
            }

            if (!this.isDrawingEdge) {
                return;
            }
            if (!e.absolutePointer) {
                console.warn('No absolute pointer on event', e)
                return;
            }

            this.updateLine(e.absolutePointer.y, e.absolutePointer.x);
        });

        canvas.on('object:moving', (e) => {
            this.updateEdges();
        });
    }


    startLine(object: fabric.Object) {
        console.log('Starting line at: ', object)

        this.isDrawingEdge = true;

        const { x, y } = object.getCenterPoint();
        const line = new fabric.Line(undefined, {
            x1: x,
            x2: x,
            y1: y,
            y2: y,
            stroke: 'black',
            selectable: false,
        });

        this.pendingEdge = {
            line: line,
            start: object,
            endX: x,
            endY: y,
        };

        this.canvas.add(line);
        this.canvas.sendToBack(line);

        this.canvas.renderAll();
    }

    updateLine(y: number, x: number) {
        if (!this.pendingEdge) {
            console.warn('No line being drawn');
            return;
        }

        const { x: startX, y: startY } = this.pendingEdge.start.getCenterPoint();
        this.pendingEdge.line.set({ 
            x1: startX, 
            y1: startY, 
            x2: x, 
            y2: y 
        });
        this.canvas.renderAll();
    }

    endLine(object: fabric.Object) {
        if (!this.pendingEdge) {
            console.warn('No line being drawn');
            return;
        }

        const { x: endX, y: endY } = object.getCenterPoint();
        const { x: startX, y: startY } = this.pendingEdge.start.getCenterPoint();
        this.pendingEdge.line.set({
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
        });

        this.edges.push({
            line: this.pendingEdge.line,
            start: this.pendingEdge.start,
            end: object,
        });

        this.isDrawingEdge = false;
        this.isDrawingEnabled = false;
        this.pendingEdge = null;
    }

    updateEdges() {
        this.edges.forEach(edge => {
            const { x: startX, y: startY } = edge.start.getCenterPoint();
            const { x: endX, y: endY } = edge.end.getCenterPoint();
            edge.line.set({ x1: startX, y1: startY, x2: endX, y2: endY });
        });

        this.canvas.renderAll();
    }
}