import { Injectable } from "@angular/core";
import { TextNode } from "../../models/textnode.interface";
import { TextNodeStore } from "../../store/text-node.store";
import { CanvasService } from "../canvas/canvas.service";
import { fabric } from "fabric";
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  private canvas: fabric.Canvas | null = null;

  constructor(
    private canvasService: CanvasService,
    private textNodeStore: TextNodeStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
  }

  copySelectedNodes(): void {
    if (!this.canvas) return;

    const objects = this.canvas.getActiveObjects();
    console.log('Copying', objects);

    const copiedNodes: TextNode[] = [];

    for (const object of objects) {
      if (object instanceof fabric.Group && object?.data?.type === 'text-node') {
        const id = object?.data?.id;
        if (!id) {
          console.warn('Object has no data.id attribute', object);
          continue;
        }

        const node = this.textNodeStore.get(id);
        if (!node) {
          console.warn('Text node not found in store', id);
          continue;
        }

        copiedNodes.push(node);
      }
    }

    if (copiedNodes.length > 0) {
      navigator.clipboard.writeText(JSON.stringify(copiedNodes));
    }
  }

  async pasteNodes(): Promise<void> {
    if (!this.canvas) return;

    try {
      const clipText = await navigator.clipboard.readText();
      const nodes = JSON.parse(clipText);
      console.log('Cloning nodes', nodes);

      const newNodeIds: string[] = [];

      // Add new nodes to the canvas, by inserting them into the store
      for (const node of nodes) {
        const newId = uuid.v4();
        newNodeIds.push(newId);

        this.textNodeStore.insert({
          ...node,
          id: newId,
          x: node.x + 20,
          y: node.y + 20,
        })
      }
      this.canvas.renderAll();

      // TODO: how to wait for the new nodes to be rendered?
      setTimeout(() => {
        if (!this.canvas) return;

        // Go find all the newly added nodes, and select them all
        const allObjects = this.canvas.getObjects();
        console.log('All objects', allObjects);
        const newNodes = allObjects.filter(obj => {
          return obj instanceof fabric.Group &&
            obj.data?.type === 'text-node' &&
            newNodeIds.includes(obj.data.id);
        });
        console.log('New Nodes', newNodes);

        if (newNodes.length > 0) {
          const selection = new fabric.ActiveSelection(newNodes, { canvas: this.canvas });
          this.canvas.setActiveObject(selection);
          this.canvas.requestRenderAll();
        }
      }, 100);

    } catch (e) {
      console.log('Failed to paste. Maybe this content isnt from mapo?', e);
    }
  }
}
