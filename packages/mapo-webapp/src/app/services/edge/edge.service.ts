import { Injectable } from "@angular/core";
import { fabric } from 'fabric';
import { Edge } from "../../models/edge.interface";
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from "../../store/text-node.store";
import { Tool, ToolbarStore } from "../../store/toolbar.store";
import { FabricUtils } from "../../shared/fabric-utils";

@Injectable({
    providedIn: 'root'
})
export class EdgeService {
    canvas!: fabric.Canvas;

    constructor(
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
        private toolbarStore: ToolbarStore,
    ) { }

    register(canvas: fabric.Canvas) {
        this.canvas = canvas;
        canvas.on('object:moving', (e) => {
            if (e.target?.type === 'activeSelection') {
                this.render(this.edgeStore.edges.value);
                return;
            }
            this.render(this.edgeStore.edges.value);
        });

        canvas.on('mouse:dblclick', (e) => {
            if (!e.target) {
                return;
            }

            if (e.target.data?.type !== 'edge' && e.target.data?.type !== 'edge-text') {
                return;
            }

            this.editText(e.target.data.id);
        })

        this.edgeStore.edges$.subscribe((edges) => {
            this.render(edges);
        });
        this.textNodeStore.textNodes$.subscribe(() => {
            this.render(this.edgeStore.edges.value);
        });
    }

    render(edges: Edge[]) {

        // NOTE: Eventually, we should optimize this code to not completely remove and re-add all lines on each render.
        for(const arrow of FabricUtils.getArrows(this.canvas)) {
            this.canvas.remove(arrow);
        }
        for(const text of FabricUtils.getArrowTexts(this.canvas)) {
            this.canvas.remove(text);
        }

        // Build a lookup map of all text-nodes, used when drawing edges
        const textNodes: Record<string, fabric.Object> = {};
        for (const node of FabricUtils.getTextNodes(this.canvas)) {
            textNodes[node.data.id] = node;
        }

        for (const edge of edges) {
            const startObject = textNodes[edge.startNodeId];
            const endObject = textNodes[edge.endNodeId];

            FabricUtils.createArrow(this.canvas, edge.id, startObject, endObject);

            if (edge.text) {
                FabricUtils.createArrowText(this.canvas, edge.id, edge.text, startObject, endObject);
            }
        }
    }

    private editText(id: string) {
        const edge = this.edgeStore.edges.value.find((edge) => edge.id === id);
        if (!edge) {
            console.warn('Could not locate edge', id);
            return;
        }

        const textObj = FabricUtils.getArrowText(this.canvas, id);
        const startObj = FabricUtils.findById<fabric.Object>(this.canvas, edge.startNodeId);
        const endObj = FabricUtils.findById<fabric.Object>(this.canvas, edge.endNodeId);

        if (!startObj || !endObj) {
            console.warn('Could not find one or more objects for editing edge', edge);
            return;
        }

        const centerpointLeft = startObj.getCenterPoint().x + (endObj.getCenterPoint().x - startObj.getCenterPoint().x) / 2;
        const centerpointTop = startObj.getCenterPoint().y + (endObj.getCenterPoint().y - startObj.getCenterPoint().y) / 2;

        const itext = FabricUtils.createIText(this.canvas, textObj?.text ?? '', centerpointTop, centerpointLeft);
        FabricUtils.selectIText(this.canvas, itext);
        this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);

        itext.on('editing:exited', (e) => {
            this.edgeStore.update(id, {
                text: itext.text ?? '',
            })
            this.canvas.remove(itext);
            this.toolbarStore.setTool(Tool.POINTER);
        });
    }
}