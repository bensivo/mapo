import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasService } from '../canvas/canvas.service';
import { ZoomCanvasService } from './zoom-canvas.service';
import Hammer from 'hammerjs';

/**
 * When the canvas is active, listens for mouse-scroll events, and zooms the canvas in or out.
 */
@Injectable({
  providedIn: 'root',
})
export class ZoomCanvasController {
  constructor(
    private canvasService: CanvasService,
    private zoomCanvasService: ZoomCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      canvas.on('mouse:wheel', this.onMouseWheel);

      //initialize hammer.js
      const hammer = new Hammer(canvas.getElement());
      hammer.get('pinch').set({ enable: true });

      hammer.on('pinch', (event) => {
        //console.log p tag
        console.log('Pinch detected!', event.scale);
        //p tag on the canvas
        this.onPinch(event, canvas);
      });

    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      canvas.off('mouse:wheel', this.onMouseWheel as any);
    });
  }

  onMouseWheel = (event: fabric.IEvent<WheelEvent>) => {
    const delta = event.e.deltaY;
    const x = event.e.offsetX;
    const y = event.e.offsetY;

    this.zoomCanvasService.zoomCanvas(delta, x, y);

    event.e.preventDefault();
    event.e.stopPropagation();
  };

  onPinch = (event: HammerInput, canvas: fabric.Canvas) => {
    //extracts the coordinates
    const scale = event.scale;
    const x = event.center.x;
    const y = event.center.y;

    //calls the zoomCanvas function to zoom the canvas
    this.zoomCanvasService.zoomCanvas(scale, x, y);
    //display the p tags
    this.displayPinchDetected(event, canvas);
  };

  displayPinchDetected(event: HammerInput, canvas: fabric.Canvas) {
    // Display a p tag
    const ptag = document.createElement('p');
    // Styling for p tag
    ptag.textContent = 'Pinch detected!';
    ptag.style.backgroundColor = 'red';
    ptag.style.position = 'absolute';
    ptag.style.padding = '10px';
    ptag.style.left = `${event.center.x}px`;
    ptag.style.top = `${event.center.y}px`;

    // Append p tag to canvas
    const canvasContainer = canvas.getElement().parentElement;
    if (canvasContainer) {
      canvasContainer.appendChild(ptag);

      // Remove the p tag after a short delay
      setTimeout(() => {
        canvasContainer.removeChild(ptag);
      }, 2000);
    }
  }
}
