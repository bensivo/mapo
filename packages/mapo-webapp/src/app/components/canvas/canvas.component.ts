import { AfterViewInit, Component, OnDestroy } from '@angular/core';

import { CanvasService, DestroyCanvasCallback } from '../../services/canvas/canvas.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.less',
})
export class CanvasComponent implements AfterViewInit, OnDestroy {

  private destroyCanvasCallback: DestroyCanvasCallback | null = null;

  constructor(private canvasService: CanvasService) {}

  async ngAfterViewInit(): Promise<void> {
    this.destroyCanvasCallback = await this.canvasService.initializeCanvas('fabric-canvas');
  }

  ngOnDestroy(): void {
    if (this.destroyCanvasCallback) {
      this.destroyCanvasCallback();
    }
  }
}
