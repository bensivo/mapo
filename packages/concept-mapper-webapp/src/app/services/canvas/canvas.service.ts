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

    canvas.on('mouse:dblclick', (e) => {
      if (!e.pointer) {
        return;
      }
      if (e.target) {
        return;
      }

      const text = new fabric.IText('', {
        top: e.absolutePointer?.y,
        left: e.absolutePointer?.x,
        fontSize: 16,
        fontFamily: 'Roboto; sans-serif',
      })

      text.on('editing:exited', (e) => {
        // This is relative to the current viewport, not the canvas's absolute coordinates
        const boundingRect = text.getBoundingRect(); 

        const vpt = canvas.viewportTransform;
        if (!vpt) {
          console.error('vpt is not defined', vpt)
          return;
        }
        const inverseVpt = fabric.util.invertTransform(vpt);

        // Apply the inverse viewport transform to the bounding rect, to get the absolute coordinates
        const padding = 5;
        const topLeft = fabric.util.transformPoint(
          new fabric.Point(boundingRect.left - padding, boundingRect.top - padding),
          inverseVpt
        );
        const bottomRight = fabric.util.transformPoint(
          new fabric.Point(boundingRect.left + boundingRect.width + padding, boundingRect.top + boundingRect.height + padding),
          inverseVpt,
        )

        // Draw a rectangle around the text object.
        const rect = new fabric.Rect({
          top: topLeft.y,
          left: topLeft.x,
          width: bottomRight.x - topLeft.x,
          height: bottomRight.y - topLeft.y,
          fill: 'transparent',
          rx: 5,
          ry: 5,
          stroke: 'black',
          hasControls: false,
          selectable: false,
          
        });
        canvas.add(rect);
        canvas.sendToBack(rect);
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
    });
  
    return canvas;
  }
}


