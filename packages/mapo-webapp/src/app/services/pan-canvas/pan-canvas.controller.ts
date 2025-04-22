import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { PanCanvasService } from './pan-canvas.service';
import { isTouchScreen } from '../../utils/browser-utils';
import { ZoomCanvasController } from '../zoom-canvas/zoom-canvas.controller';
import { BottomToolbarStore } from '../../store/bottom-toolbar.store';
import { TouchSelectionController } from '../touch-selection/touch-selection.controller';
import { fabric } from 'fabric';
@Injectable({
  providedIn: 'root',
})
export class PanCanvasController {
  canvas: fabric.Canvas | null = null;
  private rect: fabric.Rect | null = null;
  private selectedObjects: fabric.Object[] | null = null;
  private isPressing = false;
  private isPinching = false;
  private isTwoFingerPanning = false;

  constructor(
    private canvasService: CanvasService,
    private panCanvasService: PanCanvasService,
    private mouseWheelController: ZoomCanvasController,
    private bottomToolbarStore: BottomToolbarStore,
    private touchSelectionController: TouchSelectionController,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      if (isTouchScreen()) {
        this.canvas = canvas;
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
        this.canvas = canvas;
        canvas.on('mouse:down', this.onMouseDown);
        canvas.on('mouse:move', this.onMouseMove);
        canvas.on('mouse:up', this.onMouseUp);
      }
    });
    this.mouseWheelController.pinchStateChange.subscribe((isPinching) => {
      this.isPinching = isPinching;
    });
    this.touchSelectionController.pressingStateChange.subscribe(
      (isPressing) => {
        this.isPressing = isPressing;
      },
    );
    this.touchSelectionController.rectObject.subscribe((rect) => {
      this.rect = rect;
    });
  }

  onMouseDownTouch = (event: fabric.IEvent<MouseEvent>): void => {
    if (event.target) {
      return;
    }

    // close the color pallet if it's open when clicking on an empty area of the canvas
    const showPalletValue = this.bottomToolbarStore.getShowPallet();
    if (showPalletValue) {
      this.bottomToolbarStore.setShowPallet(false);
    }

    this.panCanvasService.startPan(event.e.layerX, event.e.layerY);
  };

  onMouseMoveTouch = (event: fabric.IEvent<MouseEvent>): void => {
    if (!this.canvas) return;
    if (!event.absolutePointer) return;

    // if the user is pressing (creating a selection box),
    // based on the current pointer position it updates the selection box
    if (this.isPressing && this.rect) {
      const selectedObjects = this.panCanvasService.updateSelectionBox(
        this.canvas,
        this.rect,
        event.absolutePointer?.x,
        event.absolutePointer?.y,
      );
      this.selectedObjects = selectedObjects;
    }

    if (
      this.panCanvasService.isPanning() &&
      !this.isPinching &&
      !this.isTwoFingerPanning &&
      !this.isPressing
    ) {
      this.panCanvasService.updatePan(event.e.layerX, event.e.layerY);
    }
  };

  onMouseUpTouch = (event: fabric.IEvent<MouseEvent>): void => {
    if (!this.canvas) return;

    // if the user created a selection box (isPressing),
    // creates a group with the selected objects
    // removes the selection box from the canvas, resets the isPressing flag
    if (this.isPressing && this.rect) {
      if (this.selectedObjects && this.selectedObjects?.length > 0) {
        const selection = new fabric.ActiveSelection(this.selectedObjects, {
          canvas: this.canvas,
        });
        this.canvas.setActiveObject(selection);
      }
      this.panCanvasService.removeSelectionBox(this.canvas, this.rect);
      this.isPressing = false;
    }
    this.panCanvasService.endPan();
  };

  onMouseDown = (event: fabric.IEvent<MouseEvent>): void => {
    if (event.e.button == 2) {
      // right click
      this.panCanvasService.startPan(event.e.clientX, event.e.clientY);
    }
  };

  onMouseMove = (event: fabric.IEvent<MouseEvent>): void => {
    if (this.panCanvasService.isPanning()) {
      this.panCanvasService.updatePan(event.e.clientX, event.e.clientY);
    }
  };

  onMouseUp = (event: fabric.IEvent<MouseEvent>): void => {
    this.panCanvasService.endPan();
  };
}
