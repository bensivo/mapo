import { Component } from '@angular/core';
import { CanvasComponent } from '../../components/canvas/canvas.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { HelpComponent } from '../../components/help/help.component';

@Component({
  selector: 'app-canvaspage',
  standalone: true,
  imports: [CanvasComponent, ToolbarComponent, HelpComponent],
  templateUrl: './canvaspage.component.html',
  styleUrl: './canvaspage.component.less'
})
export class CanvaspageComponent {

}
