import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { CanvasService } from '../services/canvas/canvas.service';
import { EdgeService } from '../services/edge/edge.service';
import { EdgeStore } from '../store/edge.store';
import { TextNodeStore } from '../store/text-node.store';

@Injectable({
  providedIn: 'root',
})
export class EdgeController {
  canvas: fabric.Canvas | null = null;

  objectMoving$ = new BehaviorSubject<fabric.IEvent | null>(null);
  doubleClick$ = new BehaviorSubject<fabric.IEvent | null>(null);

  constructor(
    private edgeStore: EdgeStore,
    private textNodeStore: TextNodeStore,
    private canvasService: CanvasService,
    private edgeService: EdgeService,
  ) {
    this.canvasService.canvas$.subscribe((canvas) => {
      if (!canvas) {
        return;
      }

      this.canvas = canvas;
      this.registerCanvasEventListers(canvas);
    });

    // Call 'render' on any object:moving event, or if the edge or textnode stores change
    combineLatest([
      this.canvasService.canvas$,
      this.objectMoving$,
      this.edgeStore.edges$,
      this.textNodeStore.textNodes$,
    ]).subscribe(([canvas, e, edges, textnodes]) => {
      this.edgeService.render(edges);
    });

    // Add or edit text if the user double-clicks on an edge
    this.doubleClick$.subscribe((e) => {
      if (!e) {
        return;
      }

      if (!e.target) {
        return;
      }

      if (
        e.target.data?.type !== 'edge' &&
        e.target.data?.type !== 'edge-text'
      ) {
        return;
      }

      const edgeId = e.target.data.id;
      this.edgeService.editText(edgeId);
    });
  }

  private registerCanvasEventListers(canvas: fabric.Canvas) {
    canvas.on('object:moving', (e) => {
      this.objectMoving$.next(e);
    });
    canvas.on('mouse:dblclick', (e) => {
      this.doubleClick$.next(e);
    });
  }
}
