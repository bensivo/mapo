import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TextNode } from '../models/textnode.model';
import { EdgeStore } from './edge.store';

@Injectable({
  providedIn: 'root',
})
export class TextNodeStore {
  textNodes = new BehaviorSubject<TextNode[]>([]);
  textNodes$ = this.textNodes.asObservable();

  constructor(private edgeStore: EdgeStore) { }

  get(id: string): TextNode | undefined {
    return this.textNodes.value.find((node) => node.id === id);
  }

  set(textNodes: TextNode[]) {
    this.textNodes.next(textNodes);
  }

  insert(textNode: TextNode) {
    this.textNodes.next([...this.textNodes.value, textNode]);
  }

  remove(id: string) {
    const connectedEdges = this.edgeStore.edges.value.filter(
      (edge) => edge.startNodeId === id || edge.endNodeId === id,
    );
    connectedEdges.forEach((edge) => {
      this.edgeStore.remove(edge.id);
    });

    this.textNodes.next(this.textNodes.value.filter((node) => node.id !== id));
  }

  update(id: string, textNode: Partial<TextNode>) {
    this.textNodes.next(
      this.textNodes.value.map((node) => {
        if (node.id !== id) {
          return node;
        }

        return {
          ...node,
          ...textNode,
        };
      }),
    );
  }
}
