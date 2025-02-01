import { Injectable } from "@angular/core";
import { CanvasService } from "../canvas/canvas.service";
import { ClipboardService } from "./clipboard.service";
import { ClipboardData } from "./clipboard-data.interface";
/**
 * TODO
 * 
 * Copy the edges between the nodes too
 * Add buttons in the popup toolbar for copy-paste
 * a FUCK ton of testing. I don't trust myself with this code.
 * Find a better way to wait for the nodes to be rendered.
 */

@Injectable({
  providedIn: 'root',
})
export class ClipboardController {
  constructor(
    private canvasService: CanvasService,
    private clipboardService: ClipboardService,
  ) {
    this.canvasService.canvasInitialized$.subscribe(() => {
      document.addEventListener('copy', this.onCopy.bind(this));
      document.addEventListener('paste', this.onPaste.bind(this));
    });
  }

  onCopy() {
    const canvas = this.canvasService.canvas;
    if (!canvas) return;

    const data = this.clipboardService.serializeActiveObjects(canvas);
    const dataTxt = JSON.stringify(data);
    navigator.clipboard.writeText(dataTxt);
  }

  async onPaste() {
    const canvas = this.canvasService.canvas;
    if (!canvas) return;

    const dataTxt = await navigator.clipboard.readText();
    try {
      const data: ClipboardData = JSON.parse(dataTxt);
      this.clipboardService.cloneObjects(data, canvas);
    } catch (e) {
      console.log(e);
    }
  }
}
