import { fabric } from 'fabric';
import { TextNode } from '../models/textnode.model';


/**
 * A custom function added to the IText prototype for handling TAB keys.
 * The default behavior for TAB in fabric is to exit editing mode, but we want
 * it to push lines forward and backward, like a text editor.
 *
 * See the function comment for itext.keysMap.
 */
(fabric.IText.prototype as any).onTabKeyDown = function(e: any) {
  const selectionStart = this.selectionStart;
  const selectionEnd = this.selectionEnd;
  const lines = this.text.split('\n');

  const getLineStartIndex = (lineNum: number) => {
    let index = 0;
    for(let i=0; i<lineNum; i++) {
      index += lines[i].length + 1; // plus 1 for the newline
    }
    return index;
  }

  // Returns the line number for a given index
  const getLineNumber = (index: number) => {
    let lineNum = 0;
    for(let i=0; i<index; i++) {
      if (this.text[i] === '\n') {
        lineNum++;
      }
    }

    return lineNum;
  }

  const lineStart = getLineNumber(selectionStart);
  const lineEnd = getLineNumber(selectionEnd);

  for (let i=lineStart; i<=lineEnd; i++) {
    if (e.shiftKey) {
      const numToRemove = lines[i].match(/^ {0,4}/g)?.[0].length || 0;
      lines[i] = lines[i].slice(numToRemove);
      this.selectionEnd -= numToRemove;

      // Decrement the selection start, if the selection didn't include the start of the line
      // or if the selection was a single position
      if (getLineStartIndex(i) < this.selectionStart || this.selectionEnd - this.selectionStart === 0) {
        this.selectionStart -= numToRemove;
      }
    } else {
      lines[i] = '    ' + lines[i];

      // Increment the selection start, if the selection didn't include the start of the line
      // or if the selection was a single position
      if (getLineStartIndex(i) < this.selectionStart || this.selectionEnd - this.selectionStart === 0) {
        this.selectionStart += 4;
      }
      this.selectionEnd += 4;
    }
  }

  this.text = lines.join('\n');

  // Instead of just updating the text on this JS object, we also need to update the html textarea element
  // that is backing this IText object. This makes sure any further updates are on the new state.
  //
  // Inspired by the code from: http://fabricjs.com/docs/fabric.js.html#line29585
  // Search for 'hiddenTextArea'
  if (e.target) {
    e.target.value = this.text;
    e.target.selectionStart = this.selectionStart;
    e.target.selectionEnd = this.selectionEnd;
  }
}

/**
 * Functions for drawing different shapes on the fabric canvas.
 *
 * By putting this in a different class, we can test all our service functions without mocking all of fabric.js
 */
export class FabricUtils {
  /**
   * Create an itext node centered on the point given
   *
   * @param canvas
   * @param text
   * @param top
   * @param left
   * @returns
   */
  static createIText(
    canvas: fabric.Canvas,
    text: string,
    top: number,
    left: number,
  ): fabric.IText {
    const itext = new fabric.IText(text, {
      fontSize: 16,
      fontFamily: 'Roboto',
      backgroundColor: 'white',
      data: {
        type: 'edit-text',
      },
      keysMap: {
        // The default keysMap, from: http://fabricjs.com/docs/fabric.js.html#line29585
        27: 'exitEditing',
        33: 'moveCursorUp',
        34: 'moveCursorDown',
        35: 'moveCursorRight',
        36: 'moveCursorLeft',
        37: 'moveCursorLeft',
        38: 'moveCursorUp',
        39: 'moveCursorRight',
        40: 'moveCursorDown',

        // Custom keymap for tab key
        9: 'onTabKeyDown',
      }
    });

    const boundingRect = itext.getBoundingRect();
    itext.set({
      left: left - boundingRect.width / 2,
      top: top - boundingRect.height / 2,
    });

    canvas.add(itext);
    return itext;
  }

  static selectIText(canvas: fabric.Canvas, itext: fabric.IText) {
    canvas.setActiveObject(itext);
    itext.enterEditing();
    itext.selectAll();

    const len = itext.text?.length || 0;
    itext.setSelectionStart(len);
    itext.setSelectionEnd(len);
  }

  static createTextNode(
    canvas: fabric.Canvas,
    textnode: TextNode,
  ): fabric.Object {
    const textObj = new fabric.Text(textnode.text, {
      top: textnode.y,
      left: textnode.x,
      fontSize: 16,
      fontFamily: 'Roboto',
    });

    const boundingRect = textObj.getBoundingRect(true);

    const padding = 10;
    const rectTop = boundingRect.top - padding;
    const rectLeft = boundingRect.left - padding;
    const width = boundingRect.width + padding * 2;
    const height = boundingRect.height + padding * 2;

    const rect = new fabric.Rect({
      top: rectTop,
      left: rectLeft,
      width,
      height,
      fill: textnode.color ?? '#FFFFFF',
      rx: 10,
      ry: 10,
      stroke: 'black',
      strokeWidth: 1,
      hasControls: false,
    });

    // Create a group and add it to the canvas
    const group = new fabric.Group([rect, textObj], {
      hasControls: false,
      data: {
        id: textnode.id,
        type: 'text-node',
      },
    });

    canvas.add(group);
    return group;
  }

  static getTextNodes(canvas: fabric.Canvas): fabric.Object[] {
    const res = [];
    for (const object of canvas.getObjects()) {
      if (object.data?.type === 'text-node') {
        res.push(object);
      }
    }

    return res;
  }

  static removeTextNode(canvas: fabric.Canvas, obj: fabric.Object) {
    canvas.remove(obj);
    for (const child of (obj as fabric.Group).getObjects()) {
      canvas.remove(child);
    }
  }

  static createArrow(
    canvas: fabric.Canvas,
    id: string,
    src: fabric.Object,
    dest: fabric.Object,
  ): fabric.Polyline | null {
    let srcX = this.getCenterPoint(src).x;
    let srcY = this.getCenterPoint(src).y;
    let destX = this.getCenterPoint(dest).x;
    let destY = this.getCenterPoint(dest).y;

    // Skip drawing the arrow if the objects are intersecting
    // The arrows will have 0 length, which causes fabric.js to get stuck in an infinite loop, freezing the app
    //
    // See: https://github.com/bensivo/mapo/issues/49
    if (src.intersectsWithObject(dest, true, true)) {
      return null;
    }

    // Iteratively push the start-point of the arrow towards the end, until it is no longer inside the src node
    // Then do 1 more push just for aesthetics
    while (
      src.containsPoint(new fabric.Point(srcX, srcY), null, true) 
      && FabricUtils.dist(srcX, srcY, destX, destY) > 10 // Prevents infinite loop if the arrow start and endpoints are very close
    ) {
      const point = this.translateTowards(srcX, srcY, destX, destY, 5);
      srcX = point.x;
      srcY = point.y;
    }
    const newSrc = this.translateTowards(srcX, srcY, destX, destY, 5);
    srcX = newSrc.x;
    srcY = newSrc.y;

    // Iteratively push the end-point of the arrow towards the start, until it is no longer inside the dest node
    // Then do 1 more push just for aesthetics
    while (
      dest.containsPoint(new fabric.Point(destX, destY), null, true)
      && FabricUtils.dist(srcX, srcY, destX, destY) > 10 // Prevents infinite loop if the arrow start and endpoints are very close
    ) {
      const point = this.translateTowards(destX, destY, srcX, srcY, 5);
      destX = point.x;
      destY = point.y;
    }
    const newDest = this.translateTowards(destX, destY, srcX, srcY, 5);
    destX = newDest.x;
    destY = newDest.y;

    // Calculate the points of the final arrow polygon and draw it
    const lineAngle = Math.atan2(destY - srcY, destX - srcX);
    const headLen = 10;
    const headAngle = Math.PI / 8;
    var points = [
      {
        x: srcX, // start point
        y: srcY,
      },
      {
        x: destX, // end point
        y: destY,
      },
      {
        x: destX - headLen * Math.cos(lineAngle - headAngle), // "left" corner of the head, if the arrow was pointing up
        y: destY - headLen * Math.sin(lineAngle - headAngle),
      },
      {
        x: destX - headLen * Math.cos(lineAngle + headAngle), // "right" corner of th head, if the arrow was pointing up
        y: destY - headLen * Math.sin(lineAngle + headAngle),
      },
      {
        x: destX, // end point
        y: destY,
      },
      {
        x: srcX, // start point
        y: srcY,
      },
    ];

    const poly = new fabric.Polyline(points, {
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1,
      selectable: true,
      lockScalingX: true,
      lockScalingY: true,
      hasControls: false,
      perPixelTargetFind: true,
      padding: 10, // Needed for 'per-pixel-target-find' to work when the line is perfectly horizontal or vertical
      data: {
        type: 'edge',
        id: id,
        srcX: srcX,
        srcY: srcY,
        destX: destX,
        destY: destY,
      },
    });

    canvas.add(poly);
    canvas.sendToBack(poly);
    return poly;
  }

  public static dist(srcX: number, srcY: number, destX: number, destY: number) {
    const distX = (srcX - destX)*1.0;
    const distY = (srcY - destY)*1.0;
    const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
    return dist;
  }

  public static getCenterPoint(object: fabric.Object): fabric.Point {
    if (!object.group) {
      return object.getCenterPoint();
    } else {
      // When objects are in a group, their coordinates are relative to the group coordinates.
      // This line is activated when the user drags a group of nodes, to calculate the position of each node
      const groupCenter = object.group.getCenterPoint();
      const objectCenter = object.getCenterPoint();

      return new fabric.Point(
        groupCenter.x + objectCenter.x,
        groupCenter.y + objectCenter.y,
      );
    }
  }

  // Make the arrow N units shorter, but still pointing in the same direction
  private static translateTowards(
    srcX: number,
    srcY: number,
    destX: number,
    destY: number,
    n: number,
  ): { x: number; y: number } {
    const lineAngle = Math.atan2(destY - srcY, destX - srcX);
    const x = srcX + n * Math.cos(lineAngle);
    const y = srcY + n * Math.sin(lineAngle);

    return {
      x,
      y,
    };
  }

  static getArrows(canvas: fabric.Canvas): fabric.Object[] {
    return canvas.getObjects().filter((object) => object.data?.type === 'edge');
  }

  static createArrowText(
    canvas: fabric.Canvas,
    id: string,
    text: string,
    arrow: fabric.Polyline,
  ): fabric.Text | null {
    const srcX = arrow.data.srcX;
    const srcY = arrow.data.srcY;
    const destX = arrow.data.destX;
    const destY = arrow.data.destY;

    if (!srcX || !srcY || !destX || !destY) {
      console.warn('Arrow does not have srcX, srcY, destX, destY', arrow);
      return null;
    }

    const centerpointX = srcX + (destX - srcX) / 2;
    const centerpointY = srcY + (destY - srcY) / 2;

    const textObj = new fabric.Text(text, {
      fontFamily: 'Roboto',
      fontSize: 12,
      backgroundColor: 'white',
      selectable: false,
      data: {
        id: id,
        type: 'edge-text',
      },
    });

    const boundingRect = textObj.getBoundingRect();
    textObj.set({
      left: centerpointX - boundingRect.width / 2,
      top: centerpointY - boundingRect.height / 2,
    });

    canvas.add(textObj);
    canvas.bringToFront(textObj);
    return textObj;
  }

  static getArrow(
    canvas: fabric.Canvas,
    id: string,
  ): fabric.Object | undefined {
    for (const object of canvas.getObjects()) {
      if (object.data?.type === 'edge' && object.data?.id === id) {
        return object as fabric.Polyline;
      }
    }
    return undefined;
  }

  static getArrowTexts(canvas: fabric.Canvas): fabric.Object[] {
    return canvas
      .getObjects()
      .filter((object) => object.data?.type === 'edge-text');
  }

  static getArrowText(
    canvas: fabric.Canvas,
    id: string,
  ): fabric.Text | undefined {
    for (const object of canvas.getObjects()) {
      if (object.data?.type === 'edge-text' && object.data?.id === id) {
        return object as fabric.Text;
      }
    }
    return undefined;
  }

  static findById<T = fabric.Object>(
    canvas: fabric.Canvas,
    id: string,
  ): T | undefined {
    return canvas.getObjects().find((object) => object.data?.id === id) as
      | T
      | undefined;
  }

  static panToObject(canvas: fabric.Canvas, object: fabric.Object) {

    if (!canvas.width || !canvas.height || !object.left || !object.top || !object.width || !object.height) {
      return;
    }

    const zoom = canvas.getZoom();

    const objLeft = object.left + object.width / 2;
    const objTop = object.top + object.height / 2;
    const left = (-objLeft * zoom) + (canvas.width  / 2);
    const top = (-objTop * zoom) + (canvas.height / 2);

    canvas.setViewportTransform([zoom, 0, 0, zoom, left, top]);
  }


  static createSelection(canvas: fabric.Canvas, nodeIds: string[], edgeIds: string[]) {
    const allObjects = canvas.getObjects();
    const newObjects = allObjects.filter(obj => {
      if (obj instanceof fabric.Group && obj.data?.type === 'text-node' && nodeIds.includes(obj.data.id)) {
        return true;
      }

      if (obj instanceof fabric.Polyline && edgeIds.includes(obj.data.id)) {
        return true;
      }
      return false;
    });

    if (newObjects.length > 0) {
      const selection = new fabric.ActiveSelection(newObjects, { canvas: canvas });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    }
  }
}
