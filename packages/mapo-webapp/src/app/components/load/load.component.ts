import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TitleStore } from '../../store/title.store';
import { FileContent } from '../../models/file.interface';
import { FilesService } from '../../services/files/files.service';

@Component({
  selector: 'app-load',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './load.component.html',
  styleUrl: './load.component.less',
})
export class LoadComponent {
  show: boolean = false;

  constructor(
    private filesService: FilesService,
  ) {}

  toggleLoad() {
    this.show = !this.show;
  }

  load() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.mapo';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files) {
        return;
      }

      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target) {
          return;
        }

        const content: FileContent = JSON.parse(e.target.result as string);
        this.filesService.loadFile(content);
      };
      reader.readAsText(file);
    };
    fileInput.click();
    fileInput.remove();
  }
}
