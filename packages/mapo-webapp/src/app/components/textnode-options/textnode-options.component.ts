import { fabric } from 'fabric';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CanvasService } from '../../services/canvas/canvas.service';

@Component({
  selector: 'app-textnode-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textnode-options.component.html',
  styleUrl: './textnode-options.component.less',
})
export class TextNodeOptionsComponent {

  canvas: fabric.Canvas | null = null;

  constructor(
    private canvasService: CanvasService,
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
    '#D9D9D9', // grey
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

    const objects = this.canvas.getActiveObjects();
    if (!objects) {
      return;
    }

    for(const object of objects) {
      console.log(object);
      if(object instanceof fabric.Group && object?.data?.type === 'text-node') {
        const rect = object.getObjects()[0] as fabric.Rect;
        rect.set('fill', color);
      }
    }

    this.canvas.requestRenderAll();
    console.log(color);

  }
}
