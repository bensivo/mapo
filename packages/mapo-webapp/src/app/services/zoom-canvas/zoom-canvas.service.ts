import { Injectable } from '@angular/core';
import { fabric } from 'fabric';

export type OnDestroyCallback = () => void;

@Injectable({
  providedIn: 'root',
})
export class ZoomCanvasService {
  register(canvas: fabric.Canvas): OnDestroyCallback {

    const onMouseWheel = (opt: fabric.IEvent<WheelEvent>) => {
      var delta = opt.e.deltaY;
      var zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };
    canvas.on('mouse:wheel', onMouseWheel);

    return () => {
      canvas.off('mouse:wheel', onMouseWheel as any);
    };
  }
}
