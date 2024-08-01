import { AfterViewInit, Component, OnDestroy } from '@angular/core';

import { CanvasService } from '../../services/canvas/canvas.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.less',
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  constructor(private canvasService: CanvasService) {}

  async ngAfterViewInit(): Promise<void> {
    await this.canvasService.initializeCanvas();
  }

  ngOnDestroy(): void {
    this.canvasService.destroyCanvas();
  }
}
