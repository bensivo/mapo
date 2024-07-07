import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HelpComponent } from './components/help/help.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { DebugController } from './controllers/debug.controller';
import { DrawEdgeController } from './controllers/draw-edge.controller';
import { EdgeController } from './controllers/edge.controller';
import { PanCanvasController } from './controllers/pan-canvas.controller';
import { TextNodeController } from './controllers/text-node.controller';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CanvasComponent, ToolbarComponent, HelpComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent {
  title = 'mapo-webapp';

  // These controllers injected here just so that they initialize themselves
  constructor(
    private textNodeController: TextNodeController,
    private drawEdgeController: DrawEdgeController,
    private edgeController: EdgeController,
    private panCanvasController: PanCanvasController,
    private debugController: DebugController,
  ) {
    // debugController.run();
  }
}
