import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SearchResults, SearchService } from '../../services/search/search.service';
import { CanvasService } from '../../services/canvas/canvas.service';
import { FabricUtils } from '../../utils/fabric-utils';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
import { Tool } from '../../store/toolbar.store';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.less',
})
export class SearchComponent {

  searchCounterTotal = 0;
  searchCounterIndex = 0;

  canvas: fabric.Canvas | null = null;

  searchResults: SearchResults | null = null;

  constructor(
    private searchService: SearchService,
    private canvasService: CanvasService,
    private toolbarService: ToolbarService
  ){
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
  }

  onClickDown() {
    if (this.searchCounterTotal === 0) {
      return;
    }

    this.searchCounterIndex += 1;
    if (this.searchCounterIndex > this.searchCounterTotal) {
      this.searchCounterIndex -= this.searchCounterTotal;
    }

    if (this.searchResults === null) {
      return;
    }
    this.goToSearchElement(this.searchResults, this.searchCounterIndex - 1);
  }

  onClickUp() {
    if (this.searchCounterTotal === 0) {
      return;
    }

    this.searchCounterIndex -= 1;
    if (this.searchCounterIndex < 1) {
      this.searchCounterIndex = this.searchCounterTotal;
    }

    if (this.searchResults === null) {
      return;
    }
    this.goToSearchElement(this.searchResults, this.searchCounterIndex - 1);
  }

  onInputFocus() {
    // Set the toolbar to EDIT_TEXT_NODE, to keep keyboard events from firing
    this.toolbarService.select(Tool.EDIT_TEXT_NODE);
  }

  onInputKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onClickDown();
      return;
    }

    const query = (event.target as HTMLInputElement).value;
    if (!query) {
      this.searchCounterIndex = 0;
      this.searchCounterTotal = 0;
      return;
    }
    this.searchResults = this.searchService.search(query);

    const totalItems = this.searchResults.nodes.length
    this.searchCounterTotal = totalItems;
    this.searchCounterIndex = totalItems === 0 ? 0 : 1;

    this.goToSearchElement(this.searchResults, this.searchCounterIndex - 1);
  }

  goToSearchElement(searchResults: SearchResults, index: number) {
    if (searchResults.nodes.length === 0 || this.canvas === null) {
      return;
    }

    if (index < 0 || index >= searchResults.nodes.length) {
      return;
    }

    const id = searchResults.nodes[index].id;
    const object = this.canvas.getObjects().find(obj => obj.data?.id === id);
    if (object) {
      FabricUtils.panToObject(this.canvas, object);
    }
  }
}

