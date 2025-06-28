import { Injectable } from "@angular/core";
import { EdgeStore } from "../store/edge.store";
import { TextNodeStore } from "../store/text-node.store";
import { ContainerStore } from "../store/container.store";
import { CanvasService } from "../services/canvas/canvas.service";
import { combineLatest, sampleTime } from "rxjs";
import { TextNodeService } from "../services/text-node/text-node.service";
import { ContainerService } from "../services/container/container.service";
import { EdgeService } from "../services/edge/edge.service";

/**
 * Simple controller which controle when to render different objects on the canvas
 */
@Injectable({
    providedIn: 'root',
})
export class RenderController {
    constructor(
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
        private containerStore: ContainerStore,
        private canvasService: CanvasService,
        private textNodeService: TextNodeService,
        private containerService: ContainerService,
        private edgeService: EdgeService,
    ) {

        // When the app is first loading, the order of these observables is not guaranteed.
        // Combining them together makes sure we don't render until all are ready
        combineLatest([
            this.canvasService.canvasInitialized$,
            this.textNodeStore.textNodes$.pipe(sampleTime(20)), // Prevent too many renders at once if many text nodes are updated in quick succession
            this.containerStore.containers$.pipe(sampleTime(20)), 
            this.edgeStore.edges$.pipe(sampleTime(20)), 
        ]).subscribe(([canvas, textNodes, containers, edges]) => {
            this.textNodeService.renderTextNodes(textNodes);
            this.edgeService.renderEdges(edges);
            this.containerService.renderContainers(containers);
        });
    }

}
