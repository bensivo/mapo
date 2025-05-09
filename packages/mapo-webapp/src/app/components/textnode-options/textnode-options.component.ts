import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { fabric } from 'fabric';
import { combineLatest, map } from 'rxjs';
import { CanvasService } from '../../services/canvas/canvas.service';
import { BottomToolbarStore } from '../../store/bottom-toolbar.store';
import { SelectionStore } from '../../store/selection.store';
import { TextNodeOptionsStore } from '../../store/textnode-options.store';
import { ToolbarStore } from '../../store/toolbar.store';
import { isTouchScreen } from '../../utils/browser-utils';
@Component({
  selector: 'app-textnode-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textnode-options.component.html',
  styleUrl: './textnode-options.component.less',
})
export class TextNodeOptionsComponent {
  isTouch: boolean = isTouchScreen();
  canvas: fabric.Canvas | null = null;

  isVisible$ = combineLatest([
    this.toolbarStore.tool$,
    this.selectionStore.selection$,
    this.bottomToolbarStore.showPallet$,
  ]).pipe(
    map(([tool, selection, showTextNodeOption]) => {
      return selection && showTextNodeOption
    }),
  );

  color$ = this.textNodeOptionsStore.color$;

  constructor(
    private canvasService: CanvasService,
    private textNodeOptionsStore: TextNodeOptionsStore,
    private toolbarStore: ToolbarStore,
    private bottomToolbarStore: BottomToolbarStore,
    private selectionStore: SelectionStore,
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