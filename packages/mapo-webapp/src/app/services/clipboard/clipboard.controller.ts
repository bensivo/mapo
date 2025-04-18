import { Injectable } from "@angular/core";
import { CanvasService } from "../canvas/canvas.service";
import { ClipboardService } from "./clipboard.service";
import { ClipboardData, ClipboardDataSchema } from "./clipboard-data.model";
import { ToastService } from "../toast/toast.service";

/**
 * TODO
 * 
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
    private toastService: ToastService,
  ) {
    this.canvasService.canvasInitialized$.subscribe(() => {
      document.addEventListener('copy', this.onCopy);
      document.addEventListener('paste', this.onPaste);
    });

    this.canvasService.canvasDestroyed$.subscribe(() => {
      document.removeEventListener('copy', this.onCopy);
      document.removeEventListener('paste', this.onPaste);
    })
  }

  onCopy = () => {
    const canvas = this.canvasService.canvas;
    if (!canvas) return;

    const data = this.clipboardService.serializeActiveObjects(canvas);
    if (data.nodes.length === 0) {
      return;
    }

    // use clipboard api
    const dataTxt = JSON.stringify(data);
    navigator.clipboard.writeText(dataTxt);
    
    const message = `${data.nodes.length} ${data.nodes.length == 1 ? 'node' : 'nodes'} copied to clipboard`;
    this.toastService.showToastV2({
      title: '',
      message: message,
      durationMs: 2000,
      hideClose: true
    });
  }

  onPaste = async () => {
    const canvas = this.canvasService.canvas;
    if (!canvas) return;

    // pull data from clipboard api
    const dataTxt = await navigator.clipboard.readText();
    let dataJson: any;
    try {
      dataJson = JSON.parse(dataTxt);
    } catch (e) {
      console.log('Failed parsing clipboard data as JSON', e);
      this.toastService.showToastV2({
        title: 'Error',
        message:
          'Failed to paste clipboard data. Invalid clipboard contents.',
        durationMs: 3000,
      });
      return;
    }

    let clipboardData: ClipboardData;
    try {
      clipboardData = ClipboardDataSchema.parse(dataJson);
    } catch (e) {
      console.log('Clipboard data failed schema validation checks', e);
      this.toastService.showToastV2({
        title: 'Error',
        message:
          'Failed to paste clipboard data. Invalid clipboard contents.',
        durationMs: 3000,
      });
      return;
    }

    this.clipboardService.cloneObjects(clipboardData, canvas);
  }
}
