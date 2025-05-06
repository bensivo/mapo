import { Injectable } from "@angular/core";
import { CanvasService } from "../services/canvas/canvas.service";
import { ClipboardService } from "../services/clipboard/clipboard.service";
import { ClipboardData, ClipboardDataSchema } from "../models/clipboard-data.model";
import { ToastService } from "../services/toast/toast.service";

/**
 * Listens for copy/paste events from the keyboard, and controls the clipboard service.
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
