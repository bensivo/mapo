import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TitleStore } from '../../store/title.store';

@Component({
  selector: 'app-load',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './load.component.html',
  styleUrl: './load.component.less'
})
export class LoadComponent {
  show: boolean = false;

  constructor(
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private titleStore: TitleStore,
  ){}

  toggleLoad() {
      this.show = !this.show;
  }

  load() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.mapo';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files){
        return;
      }

      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target) {
          return;
        }

        // TODO: Add a 'version' attribute to data, so that we can add more features in the future
        // without breaking old saves
        const data = JSON.parse(e.target.result as string);
        const edges = data.edges;
        const textNodes = data.textNodes;
        const title = data.title;

        // Set all stores to empty
        this.edgeStore.set([]);
        this.textNodeStore.set([]);
        this.titleStore.set('');

        // Set new values
        this.textNodeStore.set(textNodes);
        this.edgeStore.set(edges);
        this.titleStore.set(title);
      };
      reader.readAsText(file);
    };
    fileInput.click();
    fileInput.remove();
  }
}
