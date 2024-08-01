import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { CanvasService } from '../services/canvas/canvas.service';
import { EdgeService } from '../services/edge/edge.service';
import { EdgeStore } from '../store/edge.store';
import { TextNodeStore } from '../store/text-node.store';
import { debounceTime, sampleTime, throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EdgeController {
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

      this.registerCanvasEventListers(canvas);
    });

    // Call 'render' on any object:moving event, or if the edge or textnode stores change
    combineLatest([
      this.canvasService.canvas$,
      this.objectMoving$,
      this.edgeStore.edges$.pipe(sampleTime(20)), // Prevent too many renders at once if many edges are updated in quick succession
      this.textNodeStore.textNodes$.pipe(sampleTime(20)),
    ])
      .subscribe(([canvas, e, edges, textnodes]) => {
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
      console.log('onObjectMoving')
      this.objectMoving$.next(e);
    });
    canvas.on('mouse:dblclick', (e) => {
      console.log('onMouseDblClick')
      this.doubleClick$.next(e);
    });
  }
}
