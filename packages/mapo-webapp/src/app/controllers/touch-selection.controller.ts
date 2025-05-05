import Hammer from 'hammerjs';
import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { CanvasService } from '../services/canvas/canvas.service';
import { isTouchScreen } from '../utils/browser-utils';
import { TouchselectionStore } from '../services/touch-selection/touch-selection.service';

/**
 * A controller specificiallty for the hammertime 'press' event, 
 * which is used for selection boxes in mobile phones.
 * 
 * TODO: refactor this controller into the touch-screen controller, and split most of the 
 * logic into a service.
 */
@Injectable({
  providedIn: 'root',
})
export class TouchSelectionController {
  canvas: fabric.Canvas | null = null;
  public pressingStateChange: EventEmitter<boolean> = new EventEmitter();
  private isPressing = false;

  constructor(
    private canvasService: CanvasService,
    private touchselectionStore: TouchselectionStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      if (isTouchScreen()) {
        this.canvas = canvas;

        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
          var hammertime = new Hammer(canvasContainer, {});

          // 'press' gets triggered after you tap and hold for 2 seconds
          hammertime.get('press');
          hammertime.on('press', (e) => {
            if (!this.canvas) return;

            // fake a fabric event in order to get the correct coordinates
            const fakeMouseEvent = {
              clientX: e.center.x,
              clientY: e.center.y,
            } as MouseEvent;

            const absolutePointer = this.canvas.getPointer(fakeMouseEvent);

            const fabricEvent = {
              e: fakeMouseEvent,
              absolutePointer,
            };

            this.touchselectionStore.createSelectionBox(
              canvas,
              fabricEvent.absolutePointer?.x,
              fabricEvent.absolutePointer?.y,
            );
            this.isPressing = true;
            this.pressingStateChange.emit(this.isPressing);
          });
        }
      }
    });
  }
}
