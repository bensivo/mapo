import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HelpComponent } from './components/help/help.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { DrawEdgeController } from './services/edge/draw-edge.controller';
import { EdgeController } from './services/edge/edge.controller';
import { PanCanvasController } from './services/pan-canvas/pan-canvas.controller';
import { TextNodeController } from './services/text-node/text-node.controller';
import { AuthService } from './services/auth/auth.service';
import { FilesService } from './services/files/files.service';
import { ToolbarController } from './services/toolbar/toolbar.controller';
import { ZoomCanvasController } from './services/zoom-canvas/zoom-canvas.controller';
import { CanvasResizeController } from './services/canvas/canvas-resize.controller';
import { PersistenceController } from './services/persistence/persistence.controller';
import { TrackpadPanController } from './services/pan-canvas/trackpad-pan.controller';

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
    private authService: AuthService,
    private canvasController: CanvasResizeController,
    private drawEdgeController: DrawEdgeController,
    private edgeController: EdgeController,
    private fileService: FilesService,
    private panCanvasController: PanCanvasController,
    private trackpadPanController: TrackpadPanController,
    private persistenceController: PersistenceController,
    private textNodeController: TextNodeController,
    private toolbarController: ToolbarController,
    // private zoomCanvasController: ZoomCanvasController,
  ) {
    // debugController.run();
  }
}
