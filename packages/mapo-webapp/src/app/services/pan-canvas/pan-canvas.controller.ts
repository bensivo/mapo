import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { PanCanvasService } from './pan-canvas.service';
import Hammer from 'hammerjs';
@Injectable({
  providedIn: 'root',
})
export class PanCanvasController {
  constructor(
    private canvasService: CanvasService,
    private panCnavsService: PanCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      canvas.on('mouse:down', this.onMouseDown);
      canvas.on('mouse:move', this.onMouseMove);
      canvas.on('mouse:up', this.onMouseUp);
      
       //initialize hammer.js
       const hammer = new Hammer(canvas.getElement());
       hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

       //we do not need a separate function for pan, we can directly use the event
       hammer.on('pan', (event) => {
         //console.log p tag
         console.log('Pan detected!', event.deltaX, event.deltaY);
         //p tag on the canvas
         //could make this a onPan function
         this.displayPanDetected(event.center.x, event.center.y, canvas);
       });
    });
  }

  onMouseDown = (event: fabric.IEvent<MouseEvent>): void => {
    if (event.e.button == 2) {
      // right click
      this.panCnavsService.startPan(event.e.clientX, event.e.clientY);
    }
  };

  onMouseMove = (event: fabric.IEvent<MouseEvent>): void => {
    if (this.panCnavsService.isPanning()) {
      this.panCnavsService.updatePan(event.e.clientX, event.e.clientY);
    }
  };

  onMouseUp = (event: fabric.IEvent<MouseEvent>): void => {
    this.panCnavsService.endPan();
  };

  displayPanDetected(x: number, y: number, canvas: fabric.Canvas): void {
    //create a p tag
    const ptag = document.createElement('p');
    //styling for p tag
    ptag.textContent = 'Pan detected!';
    ptag.style.backgroundColor = 'red';
    ptag.style.position = 'absolute';
    ptag.style.padding = '10px';
    ptag.style.left = `${x}px`;
    ptag.style.top = `${y}px`;

    //append p tag to canvas
    const canvasContainer = canvas.getElement().parentElement;
    if (canvasContainer) {
      canvasContainer.appendChild(ptag);

      //remove the p tag after a short delay
      setTimeout(() => {
        canvasContainer.removeChild(ptag);
      }, 2000);
    }
  }
}
