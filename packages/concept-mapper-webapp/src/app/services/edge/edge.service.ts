import { fabric } from 'fabric';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class EdgeService {
    canvas!: fabric.Canvas;

    isDrawingEnabled: boolean = false;
    isDrawingEdge: boolean = false;
    line: fabric.Line | null = null;
    startY: number = 0;
    startX: number = 0;


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
                if (this.line !== null ){
                    this.canvas.remove(this.line);
                    this.line = null;
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
    }


    startLine(object: fabric.Object) {
        console.log('Starting line at: ', object)

        const { x, y } = object.getCenterPoint();
        this.startX = x;
        this.startY = y;
        this.line = new fabric.Line(undefined, {
            x1: x,
            x2: x,
            y1: y,
            y2: y,
            stroke: 'black',
            selectable: false,
        });
        this.canvas.add(this.line);
        this.canvas.sendToBack(this.line);
        this.canvas.renderAll();
        this.isDrawingEdge = true;
    }

    updateLine(y: number, x: number) {
        if (!this.line) {
            console.warn('No line being drawn');
            return;
        }

        this.line.set({ x1: this.startX, y1: this.startY, x2: x, y2: y });
        this.canvas.renderAll();
    }

    endLine(object: fabric.Object) {
        if (!this.line) {
            console.warn('No line being drawn');
            return;
        }

        const { x, y } = object.getCenterPoint();
        this.line.set({ x1: this.startX, y1: this.startY, x2: x, y2: y });

        this.line = null;
        this.isDrawingEdge = false;
        this.isDrawingEnabled = false;
    }
}