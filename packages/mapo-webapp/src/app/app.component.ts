import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomToolbarComponent } from './components/bottom-toolbar/bottom-toolbar.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { HelpComponent } from './components/help/help.component';
import { ToastComponent } from './components/toast/toast.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { AutoSaveController } from './controllers/autosave.controller';
import { ObjectEventController } from './controllers/object-event.controller';
import { KeyPressController } from './controllers/key-press.controller';
import { MouseController } from './controllers/mouse.controller';
import { WindowResizeController } from './controllers/window-resize.controller';
import { AuthService } from './services/auth/auth.service';
import { ClipboardController } from './controllers/clipboard.controller';
import { DebugController } from './controllers/debug.controller';
import { FilesService } from './services/files/files.service';
import { TextNodeOptionsController } from './controllers/textnode-options.controller';
import { HammertimeController } from './controllers/hammertime.controller';
import { SelectionController } from './controllers/selection.controller';

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
    private clipboardController: ClipboardController,
    private debugController: DebugController,
    private fileService: FilesService,
    private keyPressController: KeyPressController,
    private mouseClickController: MouseController,
    private objectModifiedController: ObjectEventController,
    private textNodeOptionsController: TextNodeOptionsController,
    private windowResizeController: WindowResizeController,
    private hammertimeController: HammertimeController,
    private selectionController: SelectionController,
  ) {
  }
}
