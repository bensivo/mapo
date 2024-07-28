import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
import { BehaviorSubject } from 'rxjs';
import { ToolbarService } from '../toolbar/toolbar.service';
import { ZoomCanvasService } from '../zoom-canvas/zoom-canvas.service';

export type DestroyCanvasCallback = () => void;

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  canvas$: BehaviorSubject<fabric.Canvas | null> =
    new BehaviorSubject<fabric.Canvas | null>(null);
  

  constructor(
    private zoomCanvasService: ZoomCanvasService,
    private toolbarService: ToolbarService,
  ) {}

  async initializeCanvas(id: string): Promise<DestroyCanvasCallback> {
    // Make sure the Roboto font is loaded before we initialize the canvas.
    // http://fabricjs.com/loadfonts
    await new FontFaceObserver('Roboto').load();

    const htmlCanvas = document.getElementById(id);
    if (htmlCanvas == null) {
      throw new Error('Canvas not found');
    }

    const canvas = new fabric.Canvas('fabric-canvas', {
      width: htmlCanvas.offsetWidth,
      height: htmlCanvas.offsetHeight,
      fireRightClick: true,
      stopContextMenu: true,
      targetFindTolerance: 10, // Makes it easier to select objects with "per-pixel-target-find" enabled, adding a padding
    });

    this.canvas$.next(canvas);

    // TODO: create an observable for resize events
    const resizeListener = () => {
      canvas.setWidth(htmlCanvas.offsetWidth);
      canvas.setHeight(htmlCanvas.offsetHeight);
    };
    window.addEventListener('resize', resizeListener);

    // TODO: make the zoom and toolbar sevices subscribe to canvas, so the canvas service doesn't have to call them directly.
    const zoomOnDestroy = this.zoomCanvasService.register(canvas);
    const toolbarServiceOnDestroy = this.toolbarService.register(canvas);

    return () => {
      this.canvas$.next(null);

      toolbarServiceOnDestroy(); // Cleanup toolbar listeners, preventing duplicate keypress events
      zoomOnDestroy(); // Cleanup scroll listeners, preventing duplicate scroll events

      window.removeEventListener('resize', resizeListener);
    };
  }
}
