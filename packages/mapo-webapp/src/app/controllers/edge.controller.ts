import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { first, sampleTime } from 'rxjs/operators';
import { CanvasService } from '../services/canvas/canvas.service';
import { EdgeService } from '../services/edge/edge.service';
import { EdgeStore } from '../store/edge.store';
import { TextNodeStore } from '../store/text-node.store';

@Injectable({
  providedIn: 'root',
})
export class EdgeController {
  objectMoving$ = new BehaviorSubject<fabric.IEvent | null>(null);

  constructor(
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private canvasService: CanvasService,
    private edgeService: EdgeService,
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      canvas.on('object:moving', this.onObjectMoving);
      canvas.on('mouse:dblclick', this.onDoubleClick);
    });

    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      canvas.off('object:moving', this.onObjectMoving);
      canvas.off('mouse:dblclick', this.onDoubleClick);
    });

    // Call 'render' on any object:moving event, or if the edge or textnode stores change
    combineLatest([
      this.canvasService.canvasInitialized$,
      this.objectMoving$.pipe(sampleTime(20)), // Prevent too many renders at once if many edges are updated in quick succession
      this.edgeStore.edges$.pipe(sampleTime(20)),
      this.textNodeStore.textNodes$.pipe(sampleTime(20)),
    ]).subscribe(([canvas, e, edges, textnodes]) => {
      this.edgeService.render(edges);
    });


    // On initial render, sometimes edges are loaded before the text-nodes have been rendered.
    // This causes the edges to not render correctly.
    // 
    // Adding this setTimeout on every canvas initialization is a hacky workaround, we need to replace
    // this with a true fix.
    combineLatest([
      this.canvasService.canvasInitialized$,
      this.edgeStore.edges$,
    ])
      .subscribe(([canvas, edges]) => {
        setTimeout(() => {
          this.edgeService.render(edges);
        }, 200);
      });
  }

  onObjectMoving = (e: fabric.IEvent) => {
    this.objectMoving$.next(e);
  };

  // Edit an edge if the user double-clicks on an edge
  onDoubleClick = (e: fabric.IEvent) => {
    if (!e) {
      return;
    }

    if (!e.target) {
      return;
    }

    if (e.target.data?.type !== 'edge' && e.target.data?.type !== 'edge-text') {
      return;
    }

    const edgeId = e.target.data.id;
    this.edgeService.editText(edgeId);
  };
}
