import { fabric } from 'fabric';
import { TextNode } from '../models/textnode.interface';

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
      fill: 'white',
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
    while (src.containsPoint(new fabric.Point(srcX, srcY), null, true)) {
      const point = this.translateTowards(srcX, srcY, destX, destY, 5);
      srcX = point.x;
      srcY = point.y;
    }
    const newSrc = this.translateTowards(srcX, srcY, destX, destY, 5);
    srcX = newSrc.x;
    srcY = newSrc.y;

    // Iteratively push the end-point of the arrow towards the start, until it is no longer inside the dest node
    // Then do 1 more push just for aesthetics
    while (dest.containsPoint(new fabric.Point(destX, destY), null, true)) {
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
}
