import { Component } from '@angular/core';
import {fabric} from 'fabric';
import { OnInit } from '@angular/core';

import { CanvasService } from '../../services/canvas/canvas.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.less'
})
export class CanvasComponent implements OnInit {


  constructor(private canvasService: CanvasService) {
  }

  ngOnInit(): void {
    const canvas = this.canvasService.initializeCanvas('fabric-canvas');


    // for (let i=0; i<10; i++) {
    //   canvas.add(new fabric.Rect({
    //     top: 50 * i,
    //     left: 50 * i,
    //     width: 50,
    //     height: 50,
    //     fill: 'red',
    //   }));
    // }
  }
}
