import { Inject, Injectable } from "@angular/core";
import { Tool, ToolbarStore } from "../../store/toolbar.store";

@Injectable({
    providedIn: 'root'
})
export class ToolbarService {
    constructor(
        private toolbarStore: ToolbarStore,
    ) { }

    register() {
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
        });
    }
}