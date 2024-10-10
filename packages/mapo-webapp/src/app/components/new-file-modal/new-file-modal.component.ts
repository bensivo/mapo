import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewFileModalSubmit {
  name: string;
}

@Component({
  selector: 'app-new-file-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-file-modal.component.html',
  styleUrl: './new-file-modal.component.less'
})
export class NewFileModalComponent {

  name: string = '';

  @Output() close = new EventEmitter();
  @Output() submit = new EventEmitter<NewFileModalSubmit>();

  onClickBackground(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onClickCancel() {
    this.close.emit();
  }

  onClickCreateFile() {
    this.submit.emit({ 
      name: this.name 
    });
  }
}
