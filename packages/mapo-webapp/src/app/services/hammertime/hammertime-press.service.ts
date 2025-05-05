import { Injectable } from "@angular/core";
import { fabric } from 'fabric';
import { CanvasService } from "../canvas/canvas.service";
import { TouchselectionStore } from "../touch-selection/touch-selection.service";

/**
 * A service to handle the logic related to hammertime press-and-drag,
 * which draws a selectionbox in the area, then selects all objects in that box when
 * the finger is released.
 * 
 * NOTE: we only had to implmement this manually for touch-screens. On desktops, 
 * click-and-drag to select was just a built-in feature of fabric.js
 */
@Injectable({
    providedIn: 'root'
})
export class HammertimePressService {
    canvas: fabric.Canvas | null = null;
    isPressing = false;
    selectedObjects: fabric.Object[] | null = null;

    constructor(
        private canvasService: CanvasService,
        private touchselectionStore: TouchselectionStore,
    ) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            this.canvas = canvas;
        });

        this.canvasService.canvasDestroyed$.subscribe((canvas) => {
            this.canvas = null;
        })
    }

    startPress(x: number, y: number) {
        if (!this.canvas) {
            return;
        }

        this.isPressing = true;
        this.touchselectionStore.createSelectionBox(this.canvas, x, y);
    }

    updatePress(x: number, y: number) {
        if (!this.canvas) {
            return;
        }

        const selectedObjects = this.touchselectionStore.updateSelectionBox(
            this.canvas,
            x,
            y,
        );

        this.selectedObjects = selectedObjects;
    }

    endPress() {
        if (!this.canvas) {
            return;
        }

        if (this.selectedObjects && this.selectedObjects?.length > 0) {
            const selection = new fabric.ActiveSelection(this.selectedObjects, {
                canvas: this.canvas,
            });
            this.canvas.setActiveObject(selection);
        }

        this.touchselectionStore.removeSelectionBox(this.canvas);
        this.isPressing = false;
    }
}