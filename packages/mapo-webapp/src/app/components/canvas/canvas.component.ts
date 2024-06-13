import { Component, OnInit } from '@angular/core';

import { CanvasService } from '../../services/canvas/canvas.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.less'
})
export class CanvasComponent implements OnInit {

  constructor(private canvasService: CanvasService) { }

  ngOnInit(): void {
    console.log('initializing canvas');
    this.canvasService.initializeCanvas('fabric-canvas');
  }
}
