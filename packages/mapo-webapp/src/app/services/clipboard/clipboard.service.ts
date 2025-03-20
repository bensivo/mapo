import { Injectable } from "@angular/core";
import { fabric } from "fabric";
import * as uuid from 'uuid';
import { Edge } from "../../models/edge.model";
import { TextNode } from "../../models/textnode.model";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { ClipboardData} from "./clipboard-data.model";
import { FabricUtils } from "../../utils/fabric-utils";

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor(
    private textNodeStore: TextNodeStore,
    private edgeStore: EdgeStore,
  ) { }

  /**
   * Serialize the active objects into a ClipboardData object
   */
  serializeActiveObjects(canvas: fabric.Canvas): ClipboardData {
    const objects = canvas.getActiveObjects();

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

        nodes[id] = node;
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

        edges[id] = edge;
      }
    }

    return {
      nodes: Object.values(nodes),
      edges: Object.values(edges),
    };
  }

  async cloneObjects(clipboardData: ClipboardData, canvas: fabric.Canvas): Promise<void> {
    const newNodeIds: string[] = [];
    const newEdgeIds: string[] = [];
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

      const newEdgeId = uuid.v4();
      newEdgeIds.push(newEdgeId);
      this.edgeStore.insert({
        ...edge,
        id: newEdgeId,
        startNodeId: newStartNodeId,
        endNodeId: newEndNodeId,
      })
    }
    canvas.renderAll();

    // TODO: Find a better way to wait for the new nodes to be rendered. A wait of 200ms could be too short
    // especially if there are lots of objects, or a slow computer
    setTimeout(() => {
      FabricUtils.createSelection(canvas, newNodeIds, newEdgeIds);
    }, 100);
  }
}
