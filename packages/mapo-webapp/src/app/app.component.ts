import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomToolbarComponent } from './components/bottom-toolbar/bottom-toolbar.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HelpComponent } from './components/help/help.component';
import { ToastComponent } from './components/toast/toast.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { AutoSaveController } from './controllers/autosave.controller';
import { ObjectModified } from './controllers/object-modified.controller';
import { KeyPressController } from './controllers/key-press.controller';
import { MouseController } from './controllers/mouse.controller';
import { WindowResizeController } from './controllers/window-resize.controller';
import { AuthService } from './services/auth/auth.service';
import { ClipboardController } from './controllers/clipboard.controller';
import { DebugController } from './controllers/debug.controller';
import { EdgeController } from './controllers/edge.controller';
import { FilesService } from './services/files/files.service';
import { TouchScreenController } from './controllers/touch-screen.controller';
import { TrackpadPanController } from './controllers/trackpad-pan.controller';
import { TextNodeOptionsController } from './controllers/textnode-options.controller';
import { TouchSelectionController } from './controllers/touch-selection.controller';
import { PinchController } from './controllers/pinch.controller';

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
    private autosaveController: AutoSaveController,
    private canvasEventController: ObjectModified,
    private clipboardController: ClipboardController,
    private debugController: DebugController,
    private edgeController: EdgeController,
    private fileService: FilesService,
    private keyPressController: KeyPressController,
    private mouseClickController: MouseController,
    private panCanvasController: TouchScreenController,
    private textNodeOptionsController: TextNodeOptionsController,
    private touchSelectionController: TouchSelectionController,
    private trackpadPanController: TrackpadPanController,
    private windowResizeController: WindowResizeController,
    private zoomCanvasController: PinchController,
  ) {
  }
}
