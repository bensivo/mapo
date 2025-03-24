import { FabricUtils } from '../../utils/fabric-utils';
import { Injectable } from '@angular/core';
import { TextNode } from '../../models/textnode.model';
import { CanvasService } from '../canvas/canvas.service';
import { Tool, ToolbarStore } from '../../store/toolbar.store';
import { TextNodeStore } from '../../store/text-node.store';
import * as uuid from 'uuid';
import { TextNodeOptionsStore } from '../../store/textnode-options.store';

/**
 * Renders Text Nodes on the canvas, and manages their creation and editing
 */
@Injectable({
  providedIn: 'root',
})
export class TextNodeService {
  canvas: fabric.Canvas | null = null;

  constructor(
    private canvasService: CanvasService,
    private toolbarStore: ToolbarStore,
    private textNodeStore: TextNodeStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
  }

  renderTextNodes(textNodes: TextNode[]) {
    if (!this.canvas) {
      throw new Error('No canvas on TextNodeService');
    }

    // Remove all existing text nodes
    for (const obj of FabricUtils.getTextNodes(this.canvas)) {
      FabricUtils.removeTextNode(this.canvas, obj);
    }

    // Render all the text nodes
    for (const textNode of textNodes) {
      FabricUtils.createTextNode(this.canvas, textNode);
    }

    this.canvas.requestRenderAll();
  }

  addPendingTextNode(
    top: number,
    left: number,
    isComment: boolean,
  ): fabric.IText {
    if (!this.canvas) {
      throw new Error('No canvas on TextNodeService');
    }

    console.log("Pending IsComment:", isComment);

    const itext = FabricUtils.createIText(this.canvas, '', top, left);

    //set different style for the comment
    if(isComment) {
      // itext.set({
      //   fill: '#FF0000',
      // });
      itext.data = {
        type: 'comment-node',
        isComment: true,
      };
    }

    FabricUtils.selectIText(this.canvas, itext);
    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);

    this.canvas.requestRenderAll();
    return itext;
  }

  finalizeTextNode(itext: fabric.IText) {
    if (!this.canvas) {
      throw new Error('No canvas on TextNodeService');
    }

    const x = itext.left;
    const y = itext.top;
    const text = itext.text;

    if (x == undefined || y == undefined || !text) {
      console.warn('Cannot create text node. Invalid data for itext: ', itext);
      return;
    }

    //check for comment 
    const isComment = itext.data?.isComment || false;
    console.log('Finalized isComment:', isComment);
    
    this.canvas.remove(itext);
    this.textNodeStore.insert({
      id: uuid.v4(),
      text: text,
      x: x,
      y: y,
      color: '#FFFFFF',
      isComment: isComment,
    });

    this.toolbarStore.setTool(Tool.POINTER);
  }

  /**
   * Edit the given text node
   *
   * Becuase fabric.js doesn't allow editing IText objects that are grouped, we have to ungroup everything,
   * then set the IText to editable.
   *
   * @param group
   */
  editTextNode(group: fabric.Group) {
    if (!this.canvas) {
      throw new Error('No canvas on TextNodeService');
    }

    const textNodeId = group.data?.id;
    if (!textNodeId) {
      console.warn('Error editing text node. No data.id', group);
      return;
    }

    const objects = group.getObjects();
    const text = objects[1] as fabric.Text;
    const rect = objects[0] as fabric.Rect;

    // Remove the rect, because it will not group or shrink as the user is editing the text.
    // When the editing is done, a new rect will be drawn around the itext
    group.ungroupOnCanvas();
    this.canvas.remove(rect);
    this.canvas.remove(text);

    // Replace the text with an itext
    if (!text.top || !text.left) {
      console.warn(
        'Cannot edit text node. No top or left on text object',
        text,
      );
      return;
    }

    const centerX = text.getCenterPoint().x;
    const centerY = text.getCenterPoint().y;

    const itext = FabricUtils.createIText(
      this.canvas,
      text.text ?? '',
      centerY,
      centerX,
    );

    console.log('EDIT TEXT NODE'); //todo: delete later

    FabricUtils.selectIText(this.canvas, itext);
    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);

    itext.on('editing:exited', (e) => {
      if (!this.canvas) {
        return;
      }

      this.canvas.remove(itext);
      this.toolbarStore.setTool(Tool.POINTER);

      if (itext.text === '') {
        this.textNodeStore.remove(textNodeId);
      } else {
        this.textNodeStore.update(textNodeId, {
          text: itext.text,
        });
      }
    });
  }

  /**
   * Reflect changes in a text node's location to the text node store
   *
   * @param group
   * @returns
   */
  updateTextNode(group: fabric.Group) {
    const id: string = group?.data?.id;
    if (!id) {
      console.warn('Object has no data.id attribute', group);
      return;
    }

    if (!group.left || !group.top) {
      console.warn(
        'Cannot update textnode in store. No coords on object:modified event',
        group,
      );
      return;
    }

    console.log('UPDATE TEXT NODE'); //todo: delete later

    const x = group.left + 10; // Add 10 to account for the padding between the group and the itext itself
    const y = group.top + 10; // Add 10 to account for the padding between the group and the itext itself

    this.textNodeStore.update(id, {
      x,
      y,
    });
  }

  /**
   * For all the text nodes in a selection, reflet their position on the canvas to the text node store.
   * Called after the object:modified event to update the store.
   *
   * @param selection
   * @returns
   */
  updateTextNodesFromSelection(selection: fabric.ActiveSelection) {
    for (const object of selection.getObjects()) {
      const type: string = object?.data?.type;
      if (type !== 'text-node') {
        continue;
      }

      const id: string = object?.data?.id;
      if (!id) {
        console.warn('Object has no data.id attribute', object);
        continue;
      }

      const coords = this.calculateGroupObjectCoordinates(object, selection);
      if (coords == null) {
        console.warn(
          'Failed calculating coordinates of group object',
          object,
          selection,
        );
        return;
      }

      // Add 10 to account for the padding between the itext and the rect
      const x = coords.left + 10;
      const y = coords.top + 10;

      this.textNodeStore.update(id, {
        x,
        y,
      });
    }
  }

  /**
   * When an object is in a group, it's "top" and "left" values are relative to the group's center
   * This function calculates the object's "top" and "left" relative to the canvas origin
   *
   * https://stackoverflow.om/a/71360370
   * @param object
   * @param group
   */
  private calculateGroupObjectCoordinates(
    object: fabric.Object,
    group: fabric.Object,
  ): { left: number; top: number } | null {
    const groupLeft = group.left;
    const groupTop = group.top;
    const groupWidth = group.width;
    const groupHeight = group.height;

    const objectLeft = object.left;
    const objectTop = object.top;

    if (
      groupLeft === undefined ||
      groupTop === undefined ||
      groupWidth === undefined ||
      groupHeight === undefined ||
      objectLeft === undefined ||
      objectTop === undefined
    ) {
      console.warn(
        'Cannot calculate group object coordinates. Missing attributes',
      );
      return null;
    }

    return {
      left: objectLeft + groupLeft + groupWidth / 2,
      top: objectTop + groupTop + groupHeight / 2,
    };
  }
}
