import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum Tool {
  POINTER = 'pointer',
  PAN = 'pan',
  CREATE_TEXT_NODE = 'create-text-node',
  CREATE_COMMENT_NODE = 'create-comment-node', //create a new comment tool
  CREATE_EDGE = 'create-edge',
  EDIT_TEXT_NODE = 'edit-text-node', // Not a real tool, but a valid state the user can be in
}

@Injectable({
  providedIn: 'root',
})
export class ToolbarStore {
  tool = new BehaviorSubject<Tool>(Tool.POINTER);
  tool$ = this.tool.asObservable();
  
  showPallet = new BehaviorSubject<boolean>(false);
  showPallet$ = this.showPallet.asObservable();
  
  setTool(tool: Tool) {
    this.tool.next(tool);
  }

  setShowPallet(isVisible: boolean) {
    this.showPallet.next(isVisible);
  }

  getShowPallet(): boolean {
    return this.showPallet.value;
  }
}
