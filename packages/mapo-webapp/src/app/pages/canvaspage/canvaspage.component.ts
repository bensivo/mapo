import { Component } from '@angular/core';
import { CanvasComponent } from '../../components/canvas/canvas.component';
import { HelpComponent } from '../../components/help/help.component';
import { IconbarComponent } from '../../components/iconbar/iconbar.component';
import { TitleComponent } from '../../components/title/title.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';

@Component({
  selector: 'app-canvaspage',
  standalone: true,
  imports: [
    CanvasComponent,
    ToolbarComponent,
    HelpComponent,
    TitleComponent,
    IconbarComponent,
  ],
  templateUrl: './canvaspage.component.html',
  styleUrl: './canvaspage.component.less',
})
export class CanvaspageComponent { }
