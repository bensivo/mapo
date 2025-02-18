import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { ZoomCanvasService } from '../mouse-wheel/zoom-canvas.service';
import Hammer from 'hammerjs';

@Injectable({
  providedIn: 'root',
})
export class PinchController {
  public pinchStateChange: EventEmitter<boolean> = new EventEmitter();
  lastScale = 1;
  constructor(
    private canvasService: CanvasService,
    private zoomCanvasService: ZoomCanvasService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      const myElement = document.getElementById('canvas-container');
      const myOptions = {};
      let isPinching = false;

      if (myElement) {
        var hammertime = new Hammer(myElement, myOptions);
        hammertime.get('pinch').set({ enable: true });

        hammertime.on('pinchstart', () => {
          isPinching = true;
          this.lastScale = canvas.getZoom();
          this.pinchStateChange.emit(isPinching);
        });

        hammertime.on('pinchend', () => {
          isPinching = false;
          this.lastScale = canvas.getZoom();
          this.pinchStateChange.emit(isPinching);
        });

        hammertime.on('pinchcancel', () => {
          console.log('PINCH CANCEL')
          isPinching = false;
          this.lastScale = canvas.getZoom();
          this.pinchStateChange.emit(isPinching); 
        })

        hammertime.on('pinch', (event) => {
          console.log('Pinch detected!', event.scale);
          this.onPinch(event, canvas);
        });

         // Handle touchend event to reset isPinching flag
         myElement.addEventListener('touchend', (event) => {
          console.log('TOUCHED');
          if (event.touches.length < 2) {
            isPinching = false;
            this.pinchStateChange.emit(isPinching);
          }
        });
      }
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {});
  }

  onPinch = (event: HammerInput, canvas: fabric.Canvas) => {
    const x = event.center.x;
    const y = event.center.y;

    const dampingFactor = 0.05;
    let zoom = canvas.getZoom();
    const newZoom = zoom * (1 + (event.scale - 1) * dampingFactor);
    canvas.zoomToPoint({ x, y }, newZoom);

    this.zoomCanvasService.zoomCanvas(event.scale, x, y);
  };
}
