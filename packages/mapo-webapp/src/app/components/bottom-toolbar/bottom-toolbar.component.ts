import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { CanvasService } from '../../services/canvas/canvas.service';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { BottomToolbarStore } from '../../store/bottom-toolbar.store';
import { EdgeStore } from '../../store/edge.store';
import { SelectionStore } from '../../store/selection.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TextNodeService } from '../../services/text-node/text-node.service';
import { EdgeService } from '../../services/edge/edge.service';
@Component({
  selector: 'bottom-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-toolbar.component.html',
  styleUrl: './bottom-toolbar.component.less',
})
export class BottomToolbarComponent {
  canvas: fabric.Canvas | null = null;
  isEditing: boolean = false;

  isVisible$ = this.selectionStore.selection$.pipe(
    map((selection) => {
      return (selection && selection.length > 0)
    }),
  );

  colorEnabled$ = this.selectionStore.selection$.pipe(
    map((selection) => {
      // Return true only if there is at least 1 text node in the selection
      const hasTextNode = selection?.some((object) => {
        return (
          object.data?.type === 'text-node' && object.data?.isComment !== true
        );
      });
      return hasTextNode;
    }),
  );

  copyEnabled$ = this.selectionStore.selection$.pipe(
    map((selection) => {
      // Return true only if there is at least 1 text node or comment in the selection
      const hasTextNode = selection?.some((object) => {
        return (
          object.data?.type === 'text-node' && (object.data?.type !== 'edge' || object.data?.type !=='edge-text')
        );
      });
      return hasTextNode;
    }),
  );

  constructor(
    private canvasService: CanvasService,
    private selectionStore: SelectionStore,
    private bottomToolbarStore: BottomToolbarStore,
    private clipboardService: ClipboardService,
    private textNodeService: TextNodeService,
    private edgeService: EdgeService,
    private textNodeStore: TextNodeStore,
    private edgeStore: EdgeStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
    this.textNodeService.isEditing$.subscribe((editing) => {
      this.isEditing = editing;
    });
    this.edgeService.isEditing$.subscribe((editing) => {
      this.isEditing = editing;
    });
  }

  onClickColor() {
    const currentValue = this.bottomToolbarStore.getShowPallet();
    this.bottomToolbarStore.setShowPallet(!currentValue);
  }

  onClickDelete() {
    this.canvas?.getActiveObjects().forEach((object) => {
      if (object.data?.type === 'text-node') {
        this.textNodeStore.remove(object.data.id);
      }
      if (object.data?.type === 'edge') {
        this.edgeStore.remove(object.data.id);
      }
    });
  }

  onClickCopy() {
    if(!this.canvas) {
      return;
    }

    const objects = this.clipboardService.serializeActiveObjects(this.canvas);
    this.clipboardService.cloneObjects(objects, this.canvas);
  }
}
