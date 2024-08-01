import { Injectable } from '@angular/core';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

export type OnDestroyCallback = () => void;

/**
 * Functions for selecting tools in the toolbar
 */
@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  constructor(private toolbarStore: ToolbarStore) {}

  /**
   * Set the currently active tool
   * @param tool
   */
  select(tool: Tool) {
    this.toolbarStore.setTool(tool);
  }

  /**
   * If the given tool is not selected, select it.
   * It it is selected, select the pointer tool.
   *
   * @param tool
   */
  selectOrCancel(tool: Tool) {
    if (this.toolbarStore.tool.value === tool) {
      this.toolbarStore.setTool(Tool.POINTER);
      return;
    }

    this.toolbarStore.setTool(tool);
  }
}
