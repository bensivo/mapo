import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Tool, ToolbarStore } from '../../store/toolbar.store';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.less'
})
export class ToolbarComponent {
    tool$ = this.toolbarStore.tool$;

    constructor(private toolbarStore: ToolbarStore) {
        console.log('ToolbarComponent initialized');
    }

    selectTool(tool: string) {
        this.toolbarStore.setTool(tool as Tool);
    }
}
