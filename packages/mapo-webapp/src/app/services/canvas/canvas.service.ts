import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
import { BehaviorSubject, Subject } from 'rxjs';

export type DestroyCanvasCallback = () => void;

@Injectable({
  providedIn: 'root',
})
export class CanvasService {

  /**
   * Observable for the current canvas instance. Emits null when there is no canvas on the page, and the canvas instance when it is available.
   */
  canvas$: BehaviorSubject<fabric.Canvas | null> = new BehaviorSubject<fabric.Canvas | null>(null);

  canvasInitialized$ = new Subject<fabric.Canvas>();
  canvasDestroyed$ = new Subject<fabric.Canvas>();

  constructor(
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
    this.canvasInitialized$.next(canvas);

    return () => {
      this.canvasDestroyed$.next(canvas);
      this.canvas$.next(null);
    };
  }

  resizeCanvas(): void {
    const canvas = this.canvas$.value;
    if (!canvas) {
      return;
    }

    const htmlCanvas = document.getElementById('canvas-container') as HTMLDivElement; // TODO: remove this hardcoding
    canvas.setWidth(htmlCanvas.offsetWidth);
    canvas.setHeight(htmlCanvas.offsetHeight);
    canvas.requestRenderAll();
  }
}
