import { Injectable } from "@angular/core";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { TextNode } from "../../models/textnode.interface";
import { Edge } from "../../models/edge.interface";

/**
 * Controlls the persistence of the application state
 */
@Injectable({
    providedIn: 'root',
})
export class PersistenceController {


    constructor(
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
    ) {
        this.onBootstrap();
    }

    async onBootstrap() {
        const persistedNodes = localStorage.getItem('mapo-state-text-nodes');
        if (persistedNodes) {
            try {
                const textNodes: TextNode[] = JSON.parse(persistedNodes);
                console.log('Hydrating text nodes from local storage', textNodes);
                this.textNodeStore.set(textNodes);
            } catch (e) {
                console.error('Failed to load text-nodes from local storage', e);
            }
        }

        const persistedEdges = localStorage.getItem('mapo-state-edges');
        if (persistedEdges) {
            try {
                const edges: Edge[] = JSON.parse(persistedEdges);
                console.log('Hydrating edges from local storage', edges);
                this.edgeStore.set(edges);
            } catch (e) {
                console.error('Failed to load edges from local storage', e);
            }
        }

        this.textNodeStore.textNodes$.subscribe((textNodes) => {
            // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
            localStorage.setItem('mapo-state-text-nodes', JSON.stringify(textNodes));
        });

        this.edgeStore.edges$.subscribe((edges) => {
            // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
            localStorage.setItem('mapo-state-edges', JSON.stringify(edges));
        });
    }
}