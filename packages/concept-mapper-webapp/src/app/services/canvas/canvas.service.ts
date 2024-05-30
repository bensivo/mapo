import { Injectable } from '@angular/core';
import {fabric} from 'fabric';
import { PanCanvasService } from '../pan-canvas/pan-canvas.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor(
    private panCanvasService: PanCanvasService
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
  
    return canvas;
  }
}
