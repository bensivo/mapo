import * as uuid from 'uuid';
import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { TextNodeStore } from '../../store/text-node.store';
import { TextNode } from '../../models/textnode.interface';
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
      if (!e.target) {

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
      }
    });

    this.canvas.on('object:modified', (e) => {
      if (e.target?.data?.type === 'text-node') {
        const id: string = e.target.data.id;

        if (!e.target.aCoords) {
          console.warn('Cannot update textnode in store. No aCoords on object:modified event', e.target);
          return;
        }

        const x = e.target.aCoords.tl.x + 5; // Add 5 to account for the padding between the group and the itext itself
        const y = e.target.aCoords.tl.y + 5; // Add 5 to account for the padding between the group and the itext itself
        this.textNodeStore.update(id, {
          x,
          y,
        })
      }
    });

    this.textNodeStore.textNodes$.subscribe((textNodes) => {
      // Remove all existing text nodes
      for (const obj of this.canvas.getObjects()) {
        if (obj.data?.type === 'text-node') {
          this.canvas.remove(obj);
          for (const child of (obj as fabric.Group).getObjects()) {
            this.canvas.remove(child);
          }
        }
      }

      // Render all the text nodes
      for (const textNode of textNodes) {
        this.renderTextNode(textNode);
      }
    });
  }

  private renderTextNode(textNode: TextNode) {
    // Create itext object, containing text
    const itext = new fabric.IText(textNode.text, {
      top: textNode.y,
      left: textNode.x,
      fontSize: 16,
      fontFamily: 'Roboto; sans-serif',
    });
    itext.on('editing:exited', (e) => {
      if (itext.text === '') {
        this.textNodeStore.remove(textNode.id);
        this.toolbarStore.setTool(Tool.POINTER);
        return;
      }

      this.textNodeStore.update(textNode.id, {
        text: itext.text,
      });
      this.toolbarStore.setTool(Tool.POINTER);
    });

    // Create a bounding rect around the itext
    const boundingRect = itext.getBoundingRect(true);
    const padding = 5;
    const top = boundingRect.top - padding;
    const left = boundingRect.left - padding;
    const width = boundingRect.width + padding * 2;
    const height = boundingRect.height + padding * 2;
    const rect = new fabric.Rect({
      top,
      left,
      width,
      height,
      fill: 'white',
      rx: 5,
      ry: 5,
      stroke: 'black',
      hasControls: false,
    });

    // Order the new objects
    this.canvas.sendToBack(rect);
    this.canvas.bringToFront(itext);

    // Create a group and add it to the canvas
    const group = new fabric.Group([rect, itext], {
      hasControls: false,
      data: {
        type: 'text-node',
        id: textNode.id,
      },
    });
    this.canvas.add(group);
  }

  /**
    * Add an editable IText object to the canvas, and select it for user input
    * After the user has finished editing, the IText will be converted to a TextNode
    */
  private addPendingTextNode(top: number, left: number) {
    this.debugLog('addPendingTextNode', top, left)
    const itext = new fabric.IText('', {
      top: top,
      left: left,
      fontSize: 16,
      fontFamily: 'Roboto; sans-serif',
    })

    itext.on('editing:exited', (e) => {
      this.toolbarStore.setTool(Tool.POINTER);
      if (itext.text === '') {
        this.canvas.remove(itext);
        this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);
        return;
      }

      this.finalizeTextNode(itext);
    });

    this.canvas.add(itext);
    itext.enterEditing();
    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);
  }


  private finalizeTextNode(itext: fabric.IText) {
    const x = itext.aCoords?.tl?.x;
    const y = itext.aCoords?.tl?.y;
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
    const objects = group.getObjects();
    const itext = objects[1] as fabric.IText;
    const rect = objects[0] as fabric.Rect;

    group.ungroupOnCanvas();

    // Remove the rect, because it will not group or shrink as the user is editing the text.
    // When the editing is done, a new rect will be drawn around the itext
    this.canvas.remove(rect);

    this.canvas.setActiveObject(itext);

    itext.enterEditing();

    const len = itext.text?.length || 0;
    itext.setSelectionStart(len);
    itext.setSelectionEnd(len);

    this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);
  }


  private debugLog(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }
}
