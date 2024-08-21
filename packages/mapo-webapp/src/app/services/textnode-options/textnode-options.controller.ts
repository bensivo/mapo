import { fabric } from "fabric";
import { Injectable } from "@angular/core";
import { TextNodeOptionsStore } from "../../store/textnode-options.store";
import { CanvasService } from "../canvas/canvas.service";
import { TextNodeStore } from "../../store/text-node.store";

@Injectable({
  providedIn: 'root',
})
export class TextNodeOptionsController {

  canvas: fabric.Canvas | null = null;

  constructor(
    private textNodeOptionsStore: TextNodeOptionsStore,
    private canvasService: CanvasService,
    private textNodeStore: TextNodeStore,
  ){
    this.onBootstrap();
  }

  onBootstrap() {
      this.canvasService.canvasInitialized$.subscribe((canvas) => {
        this.canvas = canvas;
      });
      this.canvasService.canvasDestroyed$.subscribe((canvas) => {
        this.canvas = null;
      });

      this.textNodeOptionsStore.color$.subscribe((color) => {
        this.onColorChanged(color);
      });
  }

  /**
   * If the user selects a new color, update all currently-selected nodes to be that color
   */
  onColorChanged(color: string) {
    if(!this.canvas) {
      return;
    }

    const objects = this.canvas.getActiveObjects();
    if (!objects) {
      return;
    }

    for(const object of objects) {
      if(object instanceof fabric.Group && object?.data?.type === 'text-node') {

        const nodeId = object?.data?.id;
        if (!nodeId) {
          console.warn('No node id found', object);
          continue;
        }

        console.log('Updating node', nodeId, 'with color', color);
        this.textNodeStore.update(nodeId, { color });
      }
    }
  }
}
