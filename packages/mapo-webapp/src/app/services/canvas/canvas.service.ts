import FontFaceObserver from 'fontfaceobserver';
import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { DrawEdgeService } from '../edge/draw-edge.service';
import { EdgeService } from '../edge/edge.service';
import { PanCanvasService } from '../pan-canvas/pan-canvas.service';
import { TextNodeService } from '../text-node/text-node.service';
import { ToolbarService } from '../toolbar/toolbar.service';
import { ZoomCanvasService } from '../zoom-canvas/zoom-canvas.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor(
    private panCanvasService: PanCanvasService,
    private zoomCanvasService: ZoomCanvasService,
    private textNodeService: TextNodeService,
    private edgeService: EdgeService,
    private drawEdgeService: DrawEdgeService,
    private toolbarService: ToolbarService,
  ) { }

  async initializeCanvas(id: string): Promise<void> {
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

    window.addEventListener('resize', () => {
      canvas.setWidth(htmlCanvas.offsetWidth);
      canvas.setHeight(htmlCanvas.offsetHeight);
    })

    this.panCanvasService.register(canvas);
    this.zoomCanvasService.register(canvas);
    this.textNodeService.register(canvas);
    this.edgeService.register(canvas);
    this.drawEdgeService.register(canvas);
    this.toolbarService.register(canvas);
  };

}


