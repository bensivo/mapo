import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum Tool {
  POINTER = 'pointer',
  PAN = 'pan',
  CREATE_TEXT_NODE = 'create-text-node',
  CREATE_EDGE = 'create-edge',
  EDIT_TEXT_NODE = 'edit-text-node', // Not a real tool, but a valid state the user can be in
}

@Injectable({
  providedIn: 'root',
})
export class ToolbarStore {
  tool = new BehaviorSubject<Tool>(Tool.POINTER);
  tool$ = this.tool.asObservable();

  setTool(tool: Tool) {
    console.log('Setting tool to', tool);
    this.tool.next(tool);
  }
}
