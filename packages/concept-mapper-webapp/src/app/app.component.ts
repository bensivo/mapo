import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CanvasComponent, ToolbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'concept-mapper-webapp';
}
