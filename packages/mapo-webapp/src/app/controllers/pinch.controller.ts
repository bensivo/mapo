import { Injectable } from "@angular/core";
import Hammer from "hammerjs";
import { CanvasService } from "../services/canvas/canvas.service";
import { ZoomCanvasService } from "../services/mouse-wheel/zoom-canvas.service";

@Injectable({
  providedIn: 'root',
})
export class PinchController {

  lastScale = 1;

  // Handles all touch screen events,
  // most likely using hammer.js

  // Initialize Hammer.js
  // We use hammer.js to detect touch events for touch devices, 
  // note it only works if you add hammer to the div around the canvas, 
  // not the canvas itself.
  constructor(
    private canvasService: CanvasService,
    private zoomCanvasService: ZoomCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {

      const myElement = document.getElementById('canvas-container');
      const myOptions = {};

      if (myElement) {
        var hammertime = new Hammer(myElement, myOptions);
        hammertime.get('pinch').set({ enable: true });
        hammertime.on('pinch', (event) => {
          console.log('Pinch detected!', event.scale); // delete later
          this.onPinch(event, canvas);
        });
      }
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
    });
  }

  onPinch = (event: HammerInput, canvas: fabric.Canvas) => {
    console.log('Pinch detected!', event); // delete later
    const scale = event.scale - this.lastScale;
    const x = event.center.x;
    const y = event.center.y;

    // TODO: while zooming, we need it to not select the content (maybe it thinks im panning)
    // to change the harsh scale to a smoother one
    const dampingFactor = 0.5;
    let zoom = canvas.getZoom();
    const newZoom = zoom + (scale) * dampingFactor;
    canvas.zoomToPoint({ x, y }, newZoom);

    console.log(`Pinch detected! Scale: ${scale}, New Zoom: ${newZoom}`); // delete later

    this.zoomCanvasService.zoomCanvas(scale, x, y);

    this.lastScale = event.scale;
  };
}