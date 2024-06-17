import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HelpComponent } from './components/help/help.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TextNodeController } from './controllers/text-node.controller';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CanvasComponent, ToolbarComponent, HelpComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'mapo-webapp';

  constructor(private textNodeController: TextNodeController) { }
}
