import { Injectable } from "@angular/core";
import { TextNodeService } from "../text-node/text-node.service";
import { CanvasService } from "../canvas/canvas.service";

@Injectable({
  providedIn: 'root',
})
export class DebugController {

  canvas: fabric.Canvas | null = null;

  constructor(
    private canvasService: CanvasService,
    private textNodeService: TextNodeService,
  ) {

    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });

    // Add functions to the window object, so they can be executed by an e2e test suite
    (window as any).mapo = {
      getCanvas: this.getCanvas,
      addTextNode: this.addTextNode,
    };
  }

  getCanvas = () => {
    return this.canvas;
  }

  addTextNode = (text: string, x: number, y: number) => {
    const pending = this.textNodeService.addPendingTextNode(x, y);
    pending.text = text;
    this.textNodeService.finalizeTextNode(pending);
  }
}
