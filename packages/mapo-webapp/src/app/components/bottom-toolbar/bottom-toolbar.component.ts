import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bottom-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-toolbar.component.html',
  styleUrl: './bottom-toolbar.component.less',
})
export class BottomToolbarComponent {
  ColorEnabled: boolean = false;

  toggleColor() {
    this.ColorEnabled = !this.ColorEnabled;
    this.DeleteEnabled = false;
    this.CopyEnabled = false;
  }

  DeleteEnabled: boolean = false;

  toggleDelete() {
    this.DeleteEnabled = !this.DeleteEnabled;
    this.ColorEnabled = false;
    this.CopyEnabled = false;
  }
  CopyEnabled: boolean = false;

  toggleCopy() {
    this.CopyEnabled = !this.CopyEnabled;
    this.ColorEnabled = false;
    this.DeleteEnabled = false;
  }

  constructor() {}
}
