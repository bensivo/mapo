import { fabric } from 'fabric';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CanvasService } from '../../services/canvas/canvas.service';
import { TextNodeOptionsStore } from '../../store/textnode-options.store';

@Component({
  selector: 'app-textnode-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textnode-options.component.html',
  styleUrl: './textnode-options.component.less',
})
export class TextNodeOptionsComponent {

  canvas: fabric.Canvas | null = null;

  color$ = this.textNodeOptionsStore.color$;

  constructor(
    private canvasService: CanvasService,
    private textNodeOptionsStore: TextNodeOptionsStore,
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

