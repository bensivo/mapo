import { fabric } from "fabric";
import { Injectable } from "@angular/core";
import { TextNodeOptionsStore } from "../../store/textnode-options.store";
import { CanvasService } from "../canvas/canvas.service";
import { TextNodeStore } from "../../store/text-node.store";
import { SelectionService } from "../selection/selection.service";
import { ToolbarStore } from "../../store/toolbar.store";
import { BottomToolbarStore } from "../../store/bottom-toolbar.store";

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
    private bottomToolbarStore: BottomToolbarStore,
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

  /**
   * When a node (or group of nodes) is selected, set the selected color to the color
   * of the node (or the color of the first node in the group).
   * 
   * @param objects 
   * @returns 
   */
  onSelection(objects: fabric.Object[] | null) {
    if (!objects) {
      return;
    }

    // close the color pallet after you select a new color
    const showPalletValue = this.bottomToolbarStore.getShowPallet();
    if (showPalletValue) {
      this.bottomToolbarStore.setShowPallet(!showPalletValue);
    }

    const textNodes = objects.filter(
      (object) =>
        object instanceof fabric.Group && object?.data?.type === 'text-node',
    );
    const colors = textNodes.map((textNode) => {
      return (textNode as fabric.Group).item(0).fill;
    });

    // Only set the color if all the selected objects are the same, otherwise,
    // setting a new color would switch all objects to that color.
    const colorsUnique = [...new Set(colors)];
    if (colorsUnique.length === 1) {
      this.textNodeOptionsStore.setColor(colorsUnique[0] as string);
    }
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
