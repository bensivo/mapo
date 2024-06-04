import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PanCanvasService {
  isPanning = false;
  lastPosX = 0;
  lastPosY = 0;

  register(canvas: fabric.Canvas): void {
    canvas.on('mouse:down', (opt) => {
      const e = opt.e;
      if (e.button === 2) { // right click
        this.isPanning = true;
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (this.isPanning) {
        const e = opt.e;

        const vpt = canvas.viewportTransform;
        if (!vpt) {
          console.log('No viewport transform')
          return;
        }

        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;

        canvas.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    canvas.on('mouse:up', (opt) => {
      // on mouse up we want to recalculate new interaction for all objects, so we call setViewportTransform
      const vpt = canvas.viewportTransform;
      if (!vpt) {
        console.log('No viewport transform')
        return;
      }

      canvas.setViewportTransform(vpt);
      this.isPanning = false;
    });
  }
}
