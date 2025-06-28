import * as uuid from 'uuid';
import { fabric } from 'fabric';
import { Injectable } from '@angular/core';
import { CanvasService } from '../canvas/canvas.service';
import { EdgeStore } from '../../store/edge.store';
import { Tool, ToolbarStore } from '../../store/toolbar.store';
import { ContainerStore } from '../../store/container.store';
import { Container } from '../../models/container.model';
import { FabricUtils } from '../../utils/fabric-utils';

/**
 * Service used for the draw-edge tool, rendering pending edges
 * while users are drawing them.
 */
@Injectable({
  providedIn: 'root',
})
export class ContainerService {
  canvas: fabric.Canvas | null = null;

  rect: fabric.Rect | null= null;
  startX: number | null = null;
  startY: number | null = null;

  constructor(
    private canvasService: CanvasService,
    private toolbarStore: ToolbarStore,
    private containerStore: ContainerStore
  ) {
    this.canvasService.canvasInitialized$.subscribe((canvas) => {
      this.canvas = canvas;
    });
    this.canvasService.canvasDestroyed$.subscribe((canvas) => {
      this.canvas = null;
    });
  }

  renderContainers(containers: Container[]) {
    if (!this.canvas) {
      throw new Error('No canvas on TextNodeService');
    }

    // Remove all existing containers
    for (const obj of FabricUtils.getObjectsOfType(this.canvas, 'container')){
        this.canvas.remove(obj);
    }

    // Render all the containers from state
    for (const container of containers) {
      FabricUtils.createContainer(this.canvas, container);
    }

    this.canvas.requestRenderAll();
  }

  /**
   * Usually called after a container object on the canvas has been moved or scaled
   * 
   * Read the new properties from teh canvas object, and apply them back to the store
   * 
   * @param rect
   */
  updateContainer(rect: fabric.Rect) {
    if (!this.canvas) {
      throw new Error('No canvas on TextNodeService');
    }

    if (!rect.data.id) {
      return;
    }

    if (!rect.width || !rect.height) {
      return;
    }

    // Only populated if the update was from a scale event
    // If you scale the rectangle, the original w/h are kept, but a "scaleX" or "scaleY" 
    // property is added too.
    const scaleX = rect.scaleX ?? 1;
    const scaleY = rect.scaleY ?? 1;

    const id = rect.data.id;
    this.containerStore.update(id, {
      x: rect.left,
      y: rect.top,
      w: rect.width * scaleX,
      h: rect.height * scaleY
    })
  }
}
