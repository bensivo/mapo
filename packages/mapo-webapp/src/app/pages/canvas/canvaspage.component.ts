import { Component, Inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CanvasComponent } from '../../components/canvas/canvas.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { HelpComponent } from '../../components/help/help.component';
import { MindmapService } from '../../services/mindmap/mindmap.service';
import { MindmapStore } from '../../store/mindmap.store';

@Component({
    selector: 'app-canvaspage',
    standalone: true,
    imports: [CommonModule, CanvasComponent, ToolbarComponent, HelpComponent],
    templateUrl: './canvaspage.component.html',
    styleUrl: './canvaspage.component.less'
})
export class CanvaspageComponent implements OnInit{

    mindmaps$ = this.mindmapStore.mindmaps$;

    constructor(
        private mindmapStore: MindmapStore,
        private mindmapService: MindmapService,
    ){}


    ngOnInit(): void {
        this.mindmapService.fetchMindmaps();
    }

}
