import { Injectable, Optional } from '@angular/core';
import { fabric } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
import { BehaviorSubject, Subject } from 'rxjs';

export type DestroyCanvasCallback = () => void;

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  canvas: fabric.Canvas | null = null;

  canvasInitialized$ = new Subject<fabric.Canvas>();
  canvasDestroyed$ = new Subject<fabric.Canvas>();

  constructor(
    @Optional() private document: Document,
    @Optional() private fontFaceObserver: FontFaceObserver,
  ) {
      if (!this.document) {
        this.document = window.document;
      }
      if (!this.fontFaceObserver) {
        this.fontFaceObserver = new FontFaceObserver('Roboto');
      }
  }

  async initializeCanvas(): Promise<DestroyCanvasCallback> {
    // Make sure the Roboto font is loaded before we initialize the canvas. http://fabricjs.com/loadfonts
    await this.fontFaceObserver.load();

    const htmlCanvas = this.document.getElementById('fabric-canvas');
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

    this.canvas = canvas;
    this.canvasInitialized$.next(canvas);

    return () => {
      this.canvasDestroyed$.next(canvas);
    };
  }

  destroyCanvas(): void {
    if (!this.canvas) {
      return;
    }

    this.canvasDestroyed$.next(this.canvas);
    this.canvas = null;
  }

  resizeCanvas(): void {
    if (!this.canvas) {
      return;
    }

    const htmlCanvas = document.getElementById(
      'canvas-container',
    ) as HTMLDivElement;
    this.canvas.setWidth(htmlCanvas.offsetWidth);
    this.canvas.setHeight(htmlCanvas.offsetHeight);
    this.canvas.requestRenderAll();
  }
}
