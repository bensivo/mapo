import { Component } from '@angular/core';
import { CanvasComponent } from '../../components/canvas/canvas.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { HelpComponent } from '../../components/help/help.component';
import { SaveComponent } from '../../components/save/save.component';
import { LoadComponent } from '../../components/load/load.component';
import { TitleComponent } from '../../components/title/title.component';

@Component({
  selector: 'app-canvaspage',
  standalone: true,
  imports: [
    CanvasComponent,
    ToolbarComponent,
    HelpComponent,
    SaveComponent,
    LoadComponent,
    TitleComponent,
  ],
  templateUrl: './canvaspage.component.html',
  styleUrl: './canvaspage.component.less',
})
export class CanvaspageComponent {}
