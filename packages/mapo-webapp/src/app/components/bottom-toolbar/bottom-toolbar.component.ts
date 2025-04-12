import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { isTouchScreen } from '../../utils/browser-utils';
import { CanvasService } from '../../services/canvas/canvas.service';
import { SelectionService } from '../../services/selection/selection.service';
import { ToolbarStore } from '../../store/toolbar.store';
import { BottomToolbarStore } from '../../store/bottom-toolbar.store';
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

  colorEnabled: boolean = false;
  deleteEnabled: boolean = false;
  copyEnabled: boolean = false;
  isComment: boolean = false;

  isVisible$ = combineLatest([
    this.toolbarStore.tool$,
    this.selectionService.selection$,
  ]).pipe(
    map(([tool, selection]) => {
      // If the currently-selected node is a comment, we disable the color button
      this.isComment = selection?.some((object) => object.data?.isComment === true) || false;
      
      // Return true (make the options visible) only if there is at least 1
      // text node in the selection
      const hasTextNode = selection?.some((object) => {
        return (
          object.data?.type === 'text-node'
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
    private bottomToolbarStore: BottomToolbarStore,
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


  onClickColor() {
    if (!this.isComment) {
      this.colorEnabled = !this.colorEnabled;
      const currentValue = this.bottomToolbarStore.getShowPallet();
      this.bottomToolbarStore.setShowPallet(!currentValue);
      this.colorEnabled = false;
    }
  }

  onClickDelete() {
    this.deleteEnabled = !this.deleteEnabled;

    this.canvas?.getActiveObjects().forEach((object) => {
      if (object.data?.type === 'text-node') {
        this.textNodeStore.remove(object.data.id);
      }
      if (object.data?.type === 'edge') {
        this.edgeStore.remove(object.data.id);
      }
      this.deleteEnabled = false;
    });
  }

  onClickCopy() {
    this.copyEnabled = !this.copyEnabled;
    this.clipboardController.onCopy();
    this.clipboardController.onPaste();
    this.copyEnabled = false;
  }
}
