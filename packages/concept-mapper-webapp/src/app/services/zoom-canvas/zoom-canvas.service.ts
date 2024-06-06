import { Injectable } from "@angular/core";
import {fabric} from 'fabric';

@Injectable({
    providedIn: 'root'
})
export class ZoomCanvasService {
    register(canvas: fabric.Canvas) {
        canvas.on('mouse:wheel', (opt) => {
            var delta = opt.e.deltaY;
            var zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
          });
    }
}