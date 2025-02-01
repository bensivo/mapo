import { Injectable } from "@angular/core";
import { fabric } from "fabric";
import * as uuid from 'uuid';
import { Edge } from "../../models/edge.interface";
import { TextNode } from "../../models/textnode.interface";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { CanvasService } from "../canvas/canvas.service";
import { ClipboardData } from "./clipboard-data.interface";

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  private canvas: fabric.Canvas | null = null;

  constructor(
    private canvasService: CanvasService,
    private textNodeStore: TextNodeStore,
    private edgeStore: EdgeStore,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
  }

  copySelectedNodes(): void {
    if (!this.canvas) return;

    const objects = this.canvas.getActiveObjects();
    console.log('Copying', objects);


    const nodes: Record<string, TextNode> = {};
    const edges: Record<string, Edge> = {};

    for (const object of objects) {
      if (object?.data?.type === 'text-node') {
        const id = object?.data?.id;
        if (!id) {
          console.warn('Text Node object has no data.id attribute', object);
          continue;
        }

        const node = this.textNodeStore.get(id);
        if (!node) {
          console.warn('Text node not found in store', id);
          continue;
        }

        nodes[id]=node;
      }

      if (object?.data?.type === 'edge') {
        const id = object?.data?.id;
        if (!id) {
          console.warn('Edge object has no data.id attribute', object);
          continue;
        }

        const edge = this.edgeStore.get(id);
        if (!edge) {
          console.warn('Edge not found in store', id);
          continue;
        }

        edges[id]=edge;
      }
    }

    navigator.clipboard.writeText(JSON.stringify({
      nodes: Object.values(nodes),
      edges: Object.values(edges),
    }));
  }

  async pasteNodes(): Promise<void> {
    if (!this.canvas) return;

    try {
      const clipText = await navigator.clipboard.readText();
      const clipboardData: ClipboardData = JSON.parse(clipText);

      const newNodeIds: string[] = [];
      const oldToNewNodeId: Record<string, string> = {};

      // Add new nodes to the canvas, by inserting them into the store
      for (const node of clipboardData.nodes) {
        const oldId = node.id;
        const newId = uuid.v4();
        newNodeIds.push(newId);

        oldToNewNodeId[oldId] = newId;

        this.textNodeStore.insert({
          ...node,
          id: newId,
          x: node.x + 20,
          y: node.y + 20,
        })
      }

      for (const edge of clipboardData.edges) {
        const startNodeId = edge.startNodeId;
        const endNodeId = edge.endNodeId;

        const newStartNodeId = oldToNewNodeId[startNodeId] ?? startNodeId;
        const newEndNodeId = oldToNewNodeId[endNodeId] ?? endNodeId;

        this.edgeStore.insert({
          ...edge,
          id: uuid.v4(),
          startNodeId: newStartNodeId,
          endNodeId: newEndNodeId,
        })
      }
      this.canvas.renderAll();

      // TODO: how to wait for the new nodes to be rendered?
      setTimeout(() => {
        if (!this.canvas) return;

        // Go find all the newly added nodes, and select them all
        const allObjects = this.canvas.getObjects();
        const newNodes = allObjects.filter(obj => {
          return obj instanceof fabric.Group &&
            obj.data?.type === 'text-node' &&
            newNodeIds.includes(obj.data.id);
        });

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
