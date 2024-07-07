import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TitleStore } from '../../store/title.store';

@Component({
  selector: 'app-save',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save.component.html',
  styleUrl: './save.component.less',
})
export class SaveComponent {
  show: boolean = false;

  constructor(
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private titleStore: TitleStore,
  ) {}

  toggleSave() {
    this.show = !this.show;
  }

  save() {
    const edges = this.edgeStore.edges.value;
    const textNodes = this.textNodeStore.textNodes.value;
    const title = this.titleStore.title.value;

    const data = JSON.stringify({
      edges: edges,
      textNodes: textNodes,
      title: title,
    });
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(data);

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `${title}.mapo`);
    link.click();
    link.remove();
  }
}
