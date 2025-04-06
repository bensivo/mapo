import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { PanCanvasService } from './pan-canvas.service';
import { isTouchScreen } from '../../utils/browser-utils';
import { ZoomCanvasController } from '../zoom-canvas/zoom-canvas.controller';
import { ToolbarStore } from '../../store/toolbar.store';
import { BottomToolbarStore } from '../../store/bottom-toolbar.store';
@Injectable({
  providedIn: 'root',
})
export class PanCanvasController {
  private isPinching = false;
  private isTwoFingerPanning = false;

  constructor(
    private canvasService: CanvasService,
    private panCnavsService: PanCanvasService,
    private mouseWheelController: ZoomCanvasController,
    private bottomToolbarStore: BottomToolbarStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      if (isTouchScreen()) {
        canvas.on('mouse:down', this.onMouseDownTouch);
        canvas.on('mouse:move', this.onMouseMoveTouch);
        canvas.on('mouse:up', this.onMouseUpTouch);

        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
          var hammertime = new Hammer(canvasContainer, {});
          hammertime.get('pan').set({ pointers: 2 });

          hammertime.on('panstart', () => {
            this.isTwoFingerPanning = true;
          });
          hammertime.on('panend', () => {
            setTimeout(() => {
              this.isTwoFingerPanning = false;
            }, 100);
          });
        }
      } else {
        canvas.on('mouse:down', this.onMouseDown);
        canvas.on('mouse:move', this.onMouseMove);
        canvas.on('mouse:up', this.onMouseUp);
      }
    });
    this.mouseWheelController.pinchStateChange.subscribe((isPinching) => {
      this.isPinching = isPinching;
    });
  }

  onMouseDownTouch = (event: fabric.IEvent<MouseEvent>): void => {
    if (event.target) {
      return;
    }

    // close the color pallet if it's open when clicking on an empty area of the canvas
    const showPalletValue = this.bottomToolbarStore.getShowPallet();
    if(showPalletValue) {
      this.bottomToolbarStore.setShowPallet(!showPalletValue);
    }
    
    this.panCnavsService.startPan(event.e.layerX, event.e.layerY);
  };

  onMouseMoveTouch = (event: fabric.IEvent<MouseEvent>): void => {
    if (
      this.panCnavsService.isPanning() &&
      !this.isPinching &&
      !this.isTwoFingerPanning
    ) {
      this.panCnavsService.updatePan(event.e.layerX, event.e.layerY);
    }
  };

  onMouseUpTouch = (event: fabric.IEvent<MouseEvent>): void => {
    this.panCnavsService.endPan();
  };

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
}
