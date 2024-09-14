import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewFolderModalSubmit {
  name: string;
}

@Component({
  selector: 'app-new-folder-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-folder-modal.component.html',
  styleUrl: './new-folder-modal.component.less'
})
export class NewFolderModalComponent {

  name: string = '';

  @Output() close = new EventEmitter();
  @Output() submit = new EventEmitter<NewFolderModalSubmit>();

  onClickBackground(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onClickCancel() {
    this.close.emit();
  }

  onClickCreateFolder() {
    this.submit.emit({ 
      name: this.name 
    });
  }
}
