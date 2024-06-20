import { Component } from '@angular/core';
import { TitleStore } from '../../store/title.store';
import { CommonModule } from '@angular/common';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './title.component.html',
  styleUrl: './title.component.less'
})
export class TitleComponent {

  title$ = this.titleStore.title$;

  constructor(
    private titleStore: TitleStore,
    private toolbarStore: ToolbarStore,
  ){}

  onFocus() {
    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);
  }
  onBlur() {
    this.toolbarStore.setTool(Tool.POINTER);
  }

  onChange(e: any) {
    this.titleStore.set(e.target.value);
  }
}
