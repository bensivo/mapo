import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import * as uuid from 'uuid';
import { FabricUtils } from '../../utils/fabric-utils';
import { TextNodeStore } from '../../store/text-node.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

@Injectable({
  providedIn: 'root'
})
export class TextNodeService {
  canvas!: fabric.Canvas;
  debug: boolean = false;

  constructor(
    private textNodeStore: TextNodeStore,
    private toolbarStore: ToolbarStore,
  ) { }

  register(canvas: fabric.Canvas) {
    this.canvas = canvas;

    canvas.on('mouse:dblclick', (e) => {
      if (e.target) {
        if (e.target.data?.type === 'text-node') {
          this.editTextNode(e.target as fabric.Group);
        }
        return;
      }

      if (!e.absolutePointer) {
        console.warn('No absolute pointer on event', e)
        return;
      }

      this.addPendingTextNode(e.absolutePointer.y, e.absolutePointer.x);
    });

    canvas.on('mouse:down', (e) => {
      if (e.target) {
        return;
      }
      if (this.toolbarStore.tool.value === Tool.CREATE_TEXT_NODE) {
        if (!e.absolutePointer) {
          console.warn('No absolute pointer on event', e)
          return;
        }

        this.addPendingTextNode(e.absolutePointer.y, e.absolutePointer.x);
        return;
      }

      // Exit edit mode for any active IText objects
      const objects = canvas.getObjects();
      for (const obj of objects) {
        if (obj instanceof fabric.IText && obj.isEditing) {
          obj.exitEditing();
        }
      }
    });

    this.canvas.on('object:modified', (e) => {
      const target = e.target;
      if (!target) {
        console.warn('No target on object:modified event', e);
        return;
      }

      // Group selection was dragged. Iterate through the selection and find all the text nodes
      if (target.type === 'activeSelection') {
        this.handleDragEventGroup(e);
        return;
      }

      // Single text node was dragged
      if (target.data?.type === 'text-node') {
        this.handleDragEventSingle(e);
        return;
      }
    });

    this.textNodeStore.textNodes$.subscribe((textNodes) => {
      // Remove all existing text nodes
      for (const obj of FabricUtils.getTextNodes(this.canvas)) {
        FabricUtils.removeTextNode(this.canvas, obj);
      }

      // Render all the text nodes
      for (const textNode of textNodes) {
        FabricUtils.createTextNode(this.canvas, textNode)
      }

      this.canvas.renderAll();
    });
  }

  /**
    * Add an editable IText object to the canvas, and select it for user input
    * After the user has finished editing, the IText will be converted to a TextNode
    */
  private addPendingTextNode(top: number, left: number) {
    const itext = FabricUtils.createIText(this.canvas, '', top, left);
    FabricUtils.selectIText(this.canvas, itext);
    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);

    itext.on('editing:exited', (e) => {
      this.toolbarStore.setTool(Tool.POINTER);
      if (itext.text === '') {
        this.canvas.remove(itext);
        this.toolbarStore.setTool(Tool.POINTER);
        return;
      }

      this.finalizeTextNode(itext);
    });
  }


  private finalizeTextNode(itext: fabric.IText) {
    const x = itext.left;
    const y = itext.top;
    const text = itext.text;

    if (x == undefined || y == undefined || !text) {
      console.warn('Cannot create text node. Invalid data for itext: ', itext);
      return;
    }

    this.textNodeStore.insert({
      id: uuid.v4(),
      text: text,
      x: x,
      y: y,
    });

    // Remove the pending itext object. THe render loop will create a new one from the TextNode data
    this.canvas.remove(itext);
  }

  /**
   * Edit the given text node
   * 
   * Becuase fabric.js doesn't allow editing IText objects that are grouped, we have to ungroup everything,
   * then set the IText to editable.
   * 
   * @param group
   */
  private editTextNode(group: fabric.Group) {
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
      console.warn('Cannot edit text node. No top or left on text object', text);
      return;
    }

    const itext = FabricUtils.createIText(this.canvas, text.text ?? '', text.top, text.left);
    FabricUtils.selectIText(this.canvas, itext);
    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);

    itext.on('editing:exited', (e) => {
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
   * Handle a fabric object:modified event, when a single text node is dragged
   * Fetches the new position of the node, and updates the store appropriately
   * 
   * @param e
   * @returns 
   */
  private handleDragEventSingle(e: fabric.IEvent) {
    const object = e.target;
    if (!object) {
      console.warn('No target on object:modified event', e)
      return;
    }

    const id: string = object?.data?.id;
    if (!id) {
      console.warn('Object has no data.id attribute', object);
      return;
    }

    if (!object.left || !object.top) {
      console.warn('Cannot update textnode in store. No coords on object:modified event', object);
      return;
    }

    const x = object.left + 10; // Add 10 to account for the padding between the group and the itext itself
    const y = object.top + 10; // Add 10 to account for the padding between the group and the itext itself

    this.textNodeStore.update(id, {
      x,
      y,
    })
  }

  /**
   * Handle a fabric object:modified event, when a group selection of text nodes is dragged
   * Calculate the offset of the drag event, then apply that to each object in the group, updating the store appropriateljj
   * 
   * @param e 
   * @returns 
   */
  private handleDragEventGroup(e: fabric.IEvent) {
    const selection = e.target as fabric.ActiveSelection;

    for (const object of selection.getObjects()) {
      const id: string = object?.data?.id;
      if (!id) {
        console.warn('Object has no data.id attribute', object);
        continue;
      }

      const coords = this.calculateGroupObjectCoordinates(object, selection);
      if (coords == null) {
        console.warn('Failed calculating coordinates of group object', object, selection);
        return;
      }

      // Add 5 to account for the padding between the itext and the rect
      const x = coords.left + 5;
      const y = coords.top + 5;

      this.textNodeStore.update(id, {
        x,
        y,
      });
    }
    return;
  }

  /**
   * When an object is in a group, it's "top" and "left" values are relative to the group's center
   * This function calculates the object's "top" and "left" relative to the canvas origin
   * 
   * https://stackoverflow.om/a/71360370 
   * @param object
   * @param group 
   */
  private calculateGroupObjectCoordinates(object: fabric.Object, group: fabric.Object): { left: number, top: number } | null {
    const groupLeft = group.left;
    const groupTop = group.top;
    const groupWidth = group.width;
    const groupHeight = group.height;

    const objectLeft = object.left;
    const objectTop = object.top

    if (
      groupLeft === undefined ||
      groupTop === undefined ||
      groupWidth === undefined ||
      groupHeight === undefined ||
      objectLeft === undefined ||
      objectTop === undefined
    ) {
      console.warn('Cannot calculate group object coordinates. Missing attributes');
      return null;
    }

    return {
      left: objectLeft + groupLeft + (groupWidth / 2),
      top: objectTop + groupTop + (groupHeight / 2)
    }
  }
}
