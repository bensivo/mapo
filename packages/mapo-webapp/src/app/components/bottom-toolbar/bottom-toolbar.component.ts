import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { isTouchScreen } from '../../utils/browser-utils';
import { CanvasService } from '../../services/canvas/canvas.service';
import { SelectionService } from '../../services/selection/selection.service';
import { ToolbarStore } from '../../store/toolbar.store';
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
  ]).pipe(
    map(([tool, selection]) => {
      // Return true (make the options visible) only if there is at least 1
      // text node in the selection
      const hasTextNode = selection?.some((object) => {
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
    this.DeleteEnabled = false;
    this.CopyEnabled = false;
    console.log('COLOR BUTTON CLICKED');

    this.selectionService.selection$.subscribe((selection) => {
      const hasTextNode = selection?.find((object) => {
        return (
          object.data?.type === 'text-node' && object.data?.isComment !== true
        );
      });
      console.log('COLOR, node:', hasTextNode);
    });
  }

  toggleDelete() {
    this.DeleteEnabled = !this.DeleteEnabled;
    this.ColorEnabled = false;
    this.CopyEnabled = false;
    console.log('DELETE BUTTON CLICKED');

    this.selectionService.selection$.subscribe((selection) => {
      const hasTextNode = selection?.find((object) => {
        return (
          object.data?.type === 'text-node' && object.data?.isComment !== true
        );
      });
      console.log('DELETE, node:', hasTextNode);
    });
  }

  toggleCopy() {
    this.CopyEnabled = !this.CopyEnabled;
    this.ColorEnabled = false;
    this.DeleteEnabled = false;

    console.log('COPY BUTTON CLICKED');

    this.selectionService.selection$.subscribe((selection) => {
      const hasTextNode = selection?.find((object) => {
        return (
          object.data?.type === 'text-node' && object.data?.isComment !== true
        );
      });
      console.log('COPY, node:', hasTextNode);
    });
  }
}
