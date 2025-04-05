import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { isTouchScreen } from '../../utils/browser-utils';
import { CanvasService } from '../../services/canvas/canvas.service';
import { SelectionService } from '../../services/selection/selection.service';
import { ToolbarStore } from '../../store/toolbar.store';
import { ClipboardController } from '../../services/clipboard/clipboard.controller';
import { TextNodeStore } from '../../store/text-node.store';
import { EdgeStore } from '../../store/edge.store';
@Component({
  selector: 'bottom-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-toolbar.component.html',
  styleUrl: './bottom-toolbar.component.less',
})
export class BottomToolbarComponent {
  canvas: fabric.Canvas | null = null;

  isVisible$ = combineLatest([
    this.toolbarStore.tool$,
    this.selectionService.selection$,
    this.toolbarStore.showPallet$,
  ]).pipe(
    map(([tool, selection]) => {
      // Return true (make the options visible) only if there is at least 1
      // text node in the selection
      const hasTextNode = selection?.some((object) => {
        console.log('selected a node');
        return (
          object.data?.type === 'text-node' && object.data?.isComment !== true
        );
      });

      if (isTouchScreen() && hasTextNode) {
        return true;
      }

      return false;
    }),
  );

  constructor(
    private canvasService: CanvasService,
    private selectionService: SelectionService,
    private toolbarStore: ToolbarStore,
    private clipboardController: ClipboardController,
    private textNodeStore: TextNodeStore,
    private edgeStore: EdgeStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
  }

  ColorEnabled: boolean = false;
  DeleteEnabled: boolean = false;
  CopyEnabled: boolean = false;

  toggleColor() {
    this.ColorEnabled = !this.ColorEnabled;
    const currentValue = this.toolbarStore.getShowPallet();
    this.toolbarStore.setShowPallet(!currentValue);
  }

  toggleDelete() {
    this.DeleteEnabled = true;
    this.ColorEnabled = false;
    this.CopyEnabled = false;

    //TODO: ERROR HANDLING!!
    this.canvas?.getActiveObjects().forEach((object) => {
      if (object.data?.type === 'text-node') {
        this.textNodeStore.remove(object.data.id);
      }
      if (object.data?.type === 'edge') {
        this.edgeStore.remove(object.data.id);
      }
      this.DeleteEnabled = false;
    });
  }

  toggleCopy() {
    this.CopyEnabled = true;
    this.ColorEnabled = false;
    this.DeleteEnabled = false;

    //TODO: ERROR HANDLING!!
    // call copy / paste
    this.clipboardController.onCopy();
    this.clipboardController.onPaste();
    this.CopyEnabled = false;
  }
}
