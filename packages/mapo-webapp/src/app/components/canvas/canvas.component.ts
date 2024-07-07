import { AfterViewInit, Component } from '@angular/core';

import { CanvasService } from '../../services/canvas/canvas.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.less',
})
export class CanvasComponent implements AfterViewInit {
  constructor(private canvasService: CanvasService) {}

  ngAfterViewInit(): void {
    this.canvasService.initializeCanvas('fabric-canvas');
  }
}
