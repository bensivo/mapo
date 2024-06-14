import { Injectable } from "@angular/core";
import { fabric } from 'fabric';
import { Edge } from "../../models/edge.interface";
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from "../../store/text-node.store";
import { Tool, ToolbarStore } from "../../store/toolbar.store";

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
                // TODO: if the active selection includes nodes that aren't also in the selection, update just those nodes
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
        const textNodes: Record<string, fabric.Object> = {};

        // NOTE: Eventually, we should optimize this code to not completely remove and re-add all lines on each render.
        for (const object of this.canvas.getObjects()) {
            if (object instanceof fabric.Polyline) {
                this.canvas.remove(object);
                continue;
            }

            if (object instanceof fabric.Text && object.data?.type === 'edge-text') {
                this.canvas.remove(object);
                continue;
            }

            if (object.data?.id !== undefined) {
                textNodes[object.data.id] = object;
            }
        }

        for (const edge of edges) {
            const startObject = textNodes[edge.startNodeId];
            const endObject = textNodes[edge.endNodeId];
            
            const arrow = this.drawArrow(edge.id, startObject, endObject);
            this.canvas.add(arrow);
            this.canvas.sendToBack(arrow);

            if (edge.text) {
                const text = this.drawText(edge.id, edge.text || '', arrow);
                if (!text) {
                    return;
                }

                this.canvas.add(text);
            }
        }
    }

    // Make the arrow N units shorter, but still pointing in the same direction
    private subtractArrowLength(srcX: number, srcY: number, destX: number, destY: number, n: number): { x: number, y: number } {
        const lineAngle = Math.atan2(destY - srcY, destX - srcX);

        return {
            x: destX - n * Math.cos(lineAngle),
            y: destY - n * Math.sin(lineAngle),
        }
    }

    private editText(id: string) {
            console.log('Double click on edge', id)


            let text: string = '';
            let arrow: fabric.Polyline | undefined;

            for (const object of this.canvas.getObjects()) {
                // Remove existing text object, saving the text itself
                if (object.data?.id === id && object instanceof fabric.Text) {
                    text = object.text ?? '';
                    this.canvas.remove(object);
                    continue;
                }

                if (object.data?.id === id && object instanceof fabric.Polyline) {
                    arrow = object;
                }
            }

            if (!arrow) {
                console.warn('Could not locate itext coordinats. No existing text or arrow', id);
                return;
            }

            const itext = new fabric.IText(text, {
                fontFamily: 'Roboto',
                fontSize: 12,
                backgroundColor: 'white',
            });
    
            const boundingRect = itext.getBoundingRect();
            itext.set({
                left: arrow.getCenterPoint().x - boundingRect.width / 2,
                top: arrow.getCenterPoint().y - boundingRect.height / 2,
            })
            this.canvas.add(itext);
            this.canvas.setActiveObject(itext);
            
            itext.enterEditing();
            this.toolbarStore.setTool(Tool.EDIT_TEXT_NODE);

            const len = itext.text?.length || 0;
            itext.setSelectionStart(len);
            itext.setSelectionEnd(len);

            itext.on('editing:exited', (e) => {
                this.edgeStore.update(id, {
                    text: itext.text ?? '',
                })
                this.canvas.remove(itext);
                this.toolbarStore.setTool(Tool.POINTER);
            });
    }

    private drawText(id: string, text: string, arrow: fabric.Object): fabric.Text | undefined{
        const textObj = new fabric.Text(text, {
            fontFamily: 'Roboto',
            fontSize: 12,
            backgroundColor: 'white',
            selectable: false,
            data: {
                id: id,
                type: 'edge-text'
            }
        });

        const boundingRect = textObj.getBoundingRect();
        textObj.set({
            left: arrow.getCenterPoint().x - boundingRect.width / 2,
            top: arrow.getCenterPoint().y - boundingRect.height / 2,
        })
        return textObj;
    }

    private drawArrow(id: string, src: fabric.Object, dest: fabric.Object) {
        const srcX = this.getCenterPoint(src).x;
        const srcY = this.getCenterPoint(src).y;
        let destX = this.getCenterPoint(dest).x;
        let destY = this.getCenterPoint(dest).y;

        do {
            const point = this.subtractArrowLength(srcX, srcY, destX, destY, 5);
            destX = point.x;
            destY = point.y;
        } while(dest.containsPoint(new fabric.Point(destX, destY), null, true))

        // Subtract 3 more from the end, just for aesthetics
        const point = this.subtractArrowLength(srcX, srcY, destX, destY, 3);
        destX = point.x;
        destY = point.y;

        const lineAngle = Math.atan2(destY - srcY, destX - srcX);

        const headLen = 10;
        const headAngle = Math.PI / 8;

        // calculate the points.
        var points = [
            {
                x: srcX, // start point
                y: srcY
            }, 
            {
                x: destX, // end point
                y: destY
            }, 
            {
                x: destX - headLen * Math.cos(lineAngle - headAngle), // "left" corner of the head, if the arrow was pointing up
                y: destY - headLen * Math.sin(lineAngle - headAngle),
            },
            {
                x: destX - headLen * Math.cos(lineAngle + headAngle), // "right" corner of th head, if the arrow was pointing up
                y: destY - headLen * Math.sin(lineAngle + headAngle),
            },
            {
                x: destX, // end point
                y: destY
            }, 
            {
                x: srcX, // start point
                y: srcY
            }, 
        ];

        const poly = new fabric.Polyline(points, {
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1,
            selectable: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            perPixelTargetFind: true,
            padding: 10, // Needed for 'per-pixel-target-find' to work when the line is perfectly horizontal or vertical
            data: {
                type: 'edge',
                id: id,
            }
        });

        return poly;
    }

    private getCenterPoint(object: fabric.Object): fabric.Point {
        if (!object.group) {
            return object.getCenterPoint();
        }
        else {
            // When objects are in a group, their coordinates are relative to the group coordinates. 
            // This line is activated when the user drags a group of nodes, to calculate the position of each node
            const groupCenter = object.group.getCenterPoint()
            const objectCenter = object.getCenterPoint();

            return new fabric.Point(groupCenter.x + objectCenter.x, groupCenter.y + objectCenter.y);
        }
    }
}