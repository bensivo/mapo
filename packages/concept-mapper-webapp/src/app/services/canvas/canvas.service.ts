import { Injectable } from '@angular/core';
import { TextNodeService } from '../text-node/text-node.service';
import {fabric} from 'fabric';
import { PanCanvasService } from '../pan-canvas/pan-canvas.service';
import { EdgeService } from '../edge/edge.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor(
    private panCanvasService: PanCanvasService,
    private textNodeService: TextNodeService,
    private edgeService: EdgeService,
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

    return canvas;


    // Override the onKeyDown method to have custom behavior for the enter key
    //
    // https://stackoverflow.com/a/51781086
    // fabric.IText.prototype.onKeyDown = ((onKeyDown) => {
    //   return function(this: fabric.IText, e: any)  {
    //     if (e.keyCode == 13) { // Enter
    //       canvas.discardActiveObject()
    //       canvas.renderAll();
    //       return;
    //     }
    //     onKeyDown.call(this, e);
    //   }
    // })(fabric.IText.prototype.onKeyDown)
  };

}


