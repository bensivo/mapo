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
    this.textNodeOptionsStore.isComment$
  ]).pipe(
    map(([tool, selection, isComment]) => {
      if (tool === Tool.EDIT_TEXT_NODE) {
        return false
      };
      if (isComment) {
        return false;
      }

      if (selection && selection.length !== 0) {
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

