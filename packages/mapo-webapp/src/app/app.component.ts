import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HelpComponent } from './components/help/help.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { DrawEdgeController } from './services/edge/draw-edge.controller';
import { EdgeController } from './services/edge/edge.controller';
import { PanCanvasController } from './services/pan-canvas/pan-canvas.controller';
import { TextNodeController } from './services/text-node/text-node.controller';
import { TouchSelectionController } from './services/touch-selection/touch-selection.controller';
import { AuthService } from './services/auth/auth.service';
import { FilesService } from './services/files/files.service';
import { ToolbarController } from './services/toolbar/toolbar.controller';
import { CanvasResizeController } from './services/canvas/canvas-resize.controller';
import { PersistenceController } from './services/persistence/persistence.controller';
import { TrackpadPanController } from './services/pan-canvas/trackpad-pan.controller';
import { ToastComponent } from './components/toast/toast.component';
import { DebugController } from './services/debug/debug.controller';
import { AutoSaveController } from './services/autosave/autosave.controller';
import { TextNodeOptionsController } from './services/textnode-options/textnode-options.controller';
import { ZoomCanvasController } from './services/zoom-canvas/zoom-canvas.controller';
import { ClipboardController } from './services/clipboard/clipboard.controller';
import { BottomToolbarComponent } from './components/bottom-toolbar/bottom-toolbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CanvasComponent,
    ToolbarComponent,
    HelpComponent,
    ToastComponent,
    BottomToolbarComponent,
  ],
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
    private zoomCanvasController: ZoomCanvasController,
    private trackpadPanController: TrackpadPanController,
    private persistenceController: PersistenceController,
    private textNodeController: TextNodeController,
    private touchSelectionController: TouchSelectionController,
    private toolbarController: ToolbarController,
    private debugController: DebugController,
    private autosaveController: AutoSaveController,
    private textNodeOptionsController: TextNodeOptionsController,
    private clipboardController: ClipboardController,
  ) {
  }
}
