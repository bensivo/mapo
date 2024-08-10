import { Injectable } from "@angular/core";
import { TextNodeStore } from "../../store/text-node.store";

export interface SearchResults {
  nodes: any[];
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(
    private textNodeStore: TextNodeStore,
  ){}

  search(query: string): SearchResults {
    const nodes = this.textNodeStore.textNodes.value.filter((node) => {
      return node.text.toLowerCase().includes(query.toLowerCase());
    });

    return {
      nodes,
    };
  }
}
