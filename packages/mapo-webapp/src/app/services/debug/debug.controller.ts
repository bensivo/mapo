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

      document.addEventListener('copy', this.onCopy.bind(this));
      document.addEventListener('paste', this.onPaste.bind(this));
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
    console.log('Adding text node', text, x, y);
    const pending = this.textNodeService.addPendingTextNode(x, y);
    pending.text = text;
    this.textNodeService.finalizeTextNode(pending);
  }

  onCopy() {
    if (!this.canvas) {
      return;
    }

    const objects = this.canvas.getActiveObjects();
    console.log('Copying', objects);
    navigator.clipboard.writeText(JSON.stringify([
      objects.map(o => ({
        x: o.left, 
        y: o.top, 
        w: o.width, 
        h: o.height, 
      }))
    ]))
  }

  onPaste(e: any) {
    navigator.clipboard
      .readText()
      .then(
        (clipText) => {
          console.log('Pasting', clipText)
        },
      );
  }
}
