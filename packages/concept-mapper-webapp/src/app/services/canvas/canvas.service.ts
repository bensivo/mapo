import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { DrawEdgeService } from '../edge/draw-edge.service';
import { EdgeService } from '../edge/edge.service';
import { PanCanvasService } from '../pan-canvas/pan-canvas.service';
import { TextNodeService } from '../text-node/text-node.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor(
    private panCanvasService: PanCanvasService,
    private textNodeService: TextNodeService,
    private edgeService: EdgeService,
    private drawEdgeService: DrawEdgeService,
  ) { }

  initializeCanvas(id: string) {
    const htmlCanvas = document.getElementById(id);
    if (htmlCanvas == null) {
      throw new Error('Canvas not found');
    }

    const canvas = new fabric.Canvas('fabric-canvas', {
      width: htmlCanvas.offsetWidth,
      height: htmlCanvas.offsetHeight,
      fireRightClick: true,
      stopContextMenu: true,
    });

    window.addEventListener('resize', () => {
      canvas.setWidth(htmlCanvas.offsetWidth);
      canvas.setHeight(htmlCanvas.offsetHeight);
    })

    this.panCanvasService.register(canvas);
    this.textNodeService.register(canvas);
    this.edgeService.register(canvas);
    this.drawEdgeService.register(canvas);

    return canvas;
  };

}


