import { Injectable } from '@angular/core';
import { fabric } from 'fabric';

@Injectable({
  providedIn: 'root'
})
export class TextNodeService {
  canvas!: fabric.Canvas;
  debug: boolean = false;

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

        // Exit edit mode for any active IText objects
        const objects = canvas.getObjects();
        for(const obj of objects) {
          if (obj instanceof fabric.IText && obj.isEditing) {
            obj.exitEditing();
          }
        }
      }
    });
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
      this.debugLog('itext editing:exited')
      if (itext.text === '') {
        this.debugLog('Removing empty itext')
        this.canvas.remove(itext);
        return;
      }

      this.finalizeTextNode(itext);
    });

    this.canvas.add(itext);
    itext.enterEditing();
  }


  private finalizeTextNode(itext: fabric.IText) {
    const boundingRect = itext.getBoundingRect(); // NOTE: This is relative to the current viewport, not the canvas's absolute coordinates

    // Apply the inverse viewport transform to the bounding rect, to get the absolute coordinates
    const vpt = this.canvas.viewportTransform;
    if (!vpt) {
      console.error('vpt is not defined', vpt)
      return;
    }
    const inverseVpt = fabric.util.invertTransform(vpt);

    const padding = 5;
    const topLeft = fabric.util.transformPoint(
      new fabric.Point(boundingRect.left - padding, boundingRect.top - padding),
      inverseVpt
    );
    const bottomRight = fabric.util.transformPoint(
      new fabric.Point(boundingRect.left + boundingRect.width + padding, boundingRect.top + boundingRect.height + padding),
      inverseVpt,
    )

    // Draw a rectangle around the text object.
    this.debugLog('Adding rect at', topLeft.y, bottomRight.x)
    const rect = new fabric.Rect({
      top: topLeft.y,
      left: topLeft.x,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
      fill: 'white',
      rx: 5,
      ry: 5,
      stroke: 'black',
      hasControls: false,
    });
    this.canvas.sendToBack(rect);
    this.canvas.bringToFront(itext);


    // Create a group from the itext and the rectangle
    const group = new fabric.Group([rect, itext], {
      hasControls: false,
      data: {
        type: 'text-node',
      },
    });

    this.canvas.add(group);
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
    this.debugLog('enterEditTextNode', group);
    const objects = group.getObjects();
    const itext = objects[1] as fabric.IText;
    const rect = objects[0] as fabric.Rect;

    group.ungroupOnCanvas();

    // Remove the rect, because it will not group or shrink as the user is editing the text.
    // When the editing is done, a new rect will be drawn around the itext
    this.canvas.remove(rect); 

    this.canvas.setActiveObject(itext);
    itext.enterEditing();
  }


  private debugLog(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }
}
