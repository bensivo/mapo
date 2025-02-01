import { Injectable } from "@angular/core";
import { CanvasService } from "../canvas/canvas.service";
import { ClipboardService } from "./clipboard.service";

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
    this.clipboardService.copySelectedNodes();
  }

  onPaste() {
    this.clipboardService.pasteNodes();
  }
}
