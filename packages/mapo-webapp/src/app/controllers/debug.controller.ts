import { Injectable } from "@angular/core";
import { PanCanvasService } from "../services/pan-canvas/pan-canvas.service";
import { EdgeStore } from "../store/edge.store";
import { TextNodeStore } from "../store/text-node.store";

/**
 * Test controller that simulates a bunch of actiosn to test the app
 */
@Injectable({
    providedIn: 'root',
})
export class DebugController {
    constructor(
        private textNodeStore: TextNodeStore,
        private edgeStore: EdgeStore,
        private panCanvasService: PanCanvasService,
    ) { }

    async run() {
        await wait(500);
        for (const node of this.textNodeStore.textNodes.value) {
            this.textNodeStore.remove(node.id);
        }
        await wait(500);

        this.textNodeStore.insert({
            id: '1',
            x: 500,
            y: 500,
            text: 'Hello, World!',
        });
        await wait(500);

        this.textNodeStore.insert({
            id: '2',
            x: 500,
            y: 1000,
            text: 'Hello, World',
        });
        await wait(500);

        this.edgeStore.insert({
            id: '1',
            startNodeId: '1',
            endNodeId: '2',
        });
        await wait(500);


        this.panCanvasService.startPan(0, 0);
        for (let i = 0; i < 100; i++) {
            this.panCanvasService.updatePan(i, i);
            await wait(10);
        }
        this.panCanvasService.endPan();
    }
}

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}