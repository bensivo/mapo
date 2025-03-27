import { fabric } from 'fabric';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CanvasService } from '../../services/canvas/canvas.service';
import { TextNodeOptionsStore } from '../../store/textnode-options.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';
import { combineLatest, map } from 'rxjs';
import { SelectionService } from '../../services/selection/selection.service';

@Component({
  selector: 'app-textnode-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textnode-options.component.html',
  styleUrl: './textnode-options.component.less',
})
export class TextNodeOptionsComponent {

  canvas: fabric.Canvas | null = null;

  isVisible$ = combineLatest([
    this.toolbarStore.tool$,
    this.selectionService.selection$,
  ]).pipe(
    map(([tool, selection]) => {
      if (tool === Tool.EDIT_TEXT_NODE) {
        return false
      };

      // Return true (make the options visible) only if there is at least 1
      // text node in the selection
      const hasTextNode = selection?.some((object) => {
        return object.data?.type === 'text-node' && object.data?.isComment !== true;
      })

      if (hasTextNode) {
        return true;
      }

      return false;
    })
  );

  color$ = this.textNodeOptionsStore.color$;

  constructor(
    private canvasService: CanvasService,
    private textNodeOptionsStore: TextNodeOptionsStore,
    private toolbarStore: ToolbarStore,
    private selectionService: SelectionService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
  }

  colors: string[] = [
    '#FFFFFF', // white
    '#E9E9E9', // grey
    '#FFD6D6', // red
    '#FFE8CD', // orange
    '#FFF8D6', // yellow
    '#E8FFD6', // green
    '#D6FDFF', // blue
    '#EFD6FF', // purple
  ];

  onClickColor(color: string) {
    if(!this.canvas) {
      return;
    }

    this.textNodeOptionsStore.setColor(color);
  }
}

