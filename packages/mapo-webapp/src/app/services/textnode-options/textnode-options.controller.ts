import { fabric } from "fabric";
import { Injectable } from "@angular/core";
import { TextNodeOptionsStore } from "../../store/textnode-options.store";
import { CanvasService } from "../canvas/canvas.service";
import { TextNodeStore } from "../../store/text-node.store";
import { SelectionService } from "../selection/selection.service";

@Injectable({
  providedIn: 'root',
})
export class TextNodeOptionsController {

  canvas: fabric.Canvas | null = null;

  constructor(
    private textNodeOptionsStore: TextNodeOptionsStore,
    private canvasService: CanvasService,
    private textNodeStore: TextNodeStore,
    private selectionService: SelectionService,
  ) {
    this.onBootstrap();
  }

  onBootstrap() {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });

    this.textNodeOptionsStore.color$.subscribe((color) => {
      this.onColorChanged(color);
    });

    this.selectionService.selection$.subscribe((objects) => {
      this.onSelection(objects);
    });
  }

  onSelection(objects: fabric.Object[] | null) {
    if (!objects) {
      return;
    }
    const textNodes = objects.filter((object) => object instanceof fabric.Group && object?.data?.type === 'text-node',);
    const colors = textNodes.map((textNode) => {
      return (textNode as fabric.Group).item(0).fill;
    })

    // Only set the color if all the selected objects are the same, otherwise,
    // setting a new color would switch all objects to that color.
    const colorsUnique = [...new Set(colors)];
    if (colorsUnique.length === 1) {
        this.textNodeOptionsStore.setColor(colorsUnique[0] as string);
    }

    const isComments = textNodes.map((textNode) => {
      const nodeId = textNode?.data?.id;

      if (!nodeId) {
        console.log('No node id found');
        return null;
      }

      const node = this.textNodeStore.get(nodeId);

      if (!node) {
        console.log('No node found in store');
        return null;
      }

      this.textNodeOptionsStore.setIsComment(node.isComment);
      return node.isComment;
    });
  }

  /**
   * If the user selects a new color, update all currently-selected nodes to be that color
   */
  onColorChanged(color: string) {
    if (!this.canvas) {
      return;
    }

    const objects = this.canvas.getActiveObjects();
    if (!objects) {
      return;
    }

    let updated = false;
    for (const object of objects) {
      if (object instanceof fabric.Group && object?.data?.type === 'text-node') {
        
        const nodeId = object?.data?.id;
        if (!nodeId) {
          console.warn('No node id found', object);
          continue;
        }

        const node = this.textNodeStore.get(nodeId);
        if (!node) {
          console.warn('No node found in store', nodeId);
          continue;
        }

        if (node.color !== color) {
          this.textNodeStore.update(nodeId, { color });
          updated = true;
        }
      }
    }

    if (updated) {
      // Deselect all objects. 
      this.canvas.discardActiveObject().renderAll();
    }
  }
}
