import { Injectable } from "@angular/core";
import { fabric } from "fabric";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { Tool, ToolbarStore } from "../../store/toolbar.store";

@Injectable({
    providedIn: 'root'
})
export class ToolbarService {

    private canvas!: fabric.Canvas;

    constructor(
        private toolbarStore: ToolbarStore,
        private textNodeStore: TextNodeStore,
        private edgeStore: EdgeStore,
    ) { }

    register(canvas: fabric.Canvas) {
        this.canvas = canvas;

        // document.addEventListener('paste', (e: any) => {
        //     console.log(e.clipboardData);
        //     var items = e.clipboardData.items;
        //     if (items.length > 0) {

        //     const item = items[0];
        //     const blob = item.getAsFile();
        //     const URLObj = window.URL || window.webkitURL;
        //     const source = URLObj.createObjectURL(blob);
        //     console.log(source);

        //     // TODO: add teh image to the mouse's current location
        //     // TODO: check that this works on other browsers, on other operating systems
        //     fabric.Image.fromURL(source, (img: fabric.Image)=> {
        //         this.canvas.add(img);
        //     }, {

        //     });
		// 		e.preventDefault();
		// 	}
        // })

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toolbarStore.setTool(Tool.POINTER);
            }

            if (this.toolbarStore.tool.value === Tool.EDIT_TEXT_NODE) {
                return;
            }

            if (e.key === 't') {
                if (this.toolbarStore.tool.value === Tool.CREATE_TEXT_NODE) {
                    this.toolbarStore.setTool(Tool.POINTER);
                } else {
                    this.toolbarStore.setTool(Tool.CREATE_TEXT_NODE);
                }

                return;
            }

            if (e.key === 'e') {
                if (this.toolbarStore.tool.value === Tool.CREATE_EDGE) {
                    this.toolbarStore.setTool(Tool.POINTER);
                } else {
                    this.toolbarStore.setTool(Tool.CREATE_EDGE);
                }
                return;
            }

            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'd') {
                if (this.toolbarStore.tool.value !== Tool.POINTER) {
                    return;
                }

                this.canvas.getActiveObjects().forEach((object) => {
                    if (object.data?.type === 'text-node') {
                        this.textNodeStore.remove(object.data.id);
                    }
                    if (object.data?.type === 'edge') {
                        this.edgeStore.remove(object.data.id);
                    }
                });
            }
        });
    }
}