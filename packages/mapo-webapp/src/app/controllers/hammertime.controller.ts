import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import Hammer from 'hammerjs';
import { CanvasService } from "../services/canvas/canvas.service";
import { HammertimePinchService } from "../services/hammertime/hammertime-pinch.service";
import { HammertimePressService } from "../services/hammertime/hammertime-press.service";
import { TextNodeService } from "../services/text-node/text-node.service";
import { isTouchScreen } from "../utils/browser-utils";
import { EdgeService } from "../services/edge/edge.service";

@Injectable({
    providedIn: 'root'
})
export class HammertimeController {
    canvas: fabric.Canvas | null = null;
    isTwoFingerPanning = new BehaviorSubject<boolean>(false);
    isTwoFingerPanning$ = this.isTwoFingerPanning.asObservable();

    constructor(
        private canvasService: CanvasService,
        private hammertimePinchService: HammertimePinchService,
        private hammertimePressService: HammertimePressService,
        private textnodeService: TextNodeService,
        private edgeService: EdgeService,
    ) {
        this.canvasService.canvasInitialized$.subscribe((canvas) => {
            this.canvas = canvas;
            const canvasContainer = document.getElementById('canvas-container');
            if (!canvasContainer) {
                return;
            }

            if (!isTouchScreen()) {
                return;
            }

            const hammertime = new Hammer(canvasContainer, {});
            hammertime.get('pan').set({pointers: 2});
            hammertime.get('pinch').set({ enable: true });
            hammertime.get('tap').set({ taps: 2 });
            hammertime.get('press');

            hammertime.on('pan', this.onTwoFingerPan)
            hammertime.on('panend', this.onTwoFingerPanEnd)
            hammertime.on('pinchstart', this.onPinchStart)
            hammertime.on('pinch', this.onPinch)
            hammertime.on('pinchend', this.onPinchEnd)
            hammertime.on('tap', this.onDoubleTap);
            hammertime.on('press', this.onPress);
        });

        this.canvasService.canvasDestroyed$.subscribe((canvas) => {
            this.canvas = null;
        })
        // TODO: do we need to destroy our hammertime object on canvasDestroyed$?
    }

    onTwoFingerPan = (e: HammerInput) => {
        this.isTwoFingerPanning.next(true);
    }

    onTwoFingerPanEnd = (e: HammerInput) => {
        this.isTwoFingerPanning.next(false);
    }

    onPinchStart = (e: HammerInput) => {
        this.hammertimePinchService.startPinch();
    }

    onPinch = (e: HammerInput) => {
        this.hammertimePinchService.updatePinch(e.center.x, e.center.y, e.scale);
    }

    onPinchEnd = (e: HammerInput) => {
        this.hammertimePinchService.endPinch();
    }

    onDoubleTap = (e: HammerInput) => {
        if (!this.canvas) {
            return;
        }

        // HammerJS x,y coordinates are based on the screen's window, but fabric's Canvas,
        // has its own virtual coordiates. The findTarget() function is a helper to help find whichever
        // fabric object is at the given screen coordinates.
        const target = this.canvas.findTarget(
            {
                clientX: e.center.x,
                clientY: e.center.y,
            } as MouseEvent,
            true,
        );

        // Double-tap on a text node
        if (target && target.data?.type === 'text-node') {
            this.textnodeService.editTextNode(target as fabric.Group);
        }

        // Double-tap on an edge, or edge-text
        if (target && (target.data?.type === 'edge' || target.data?.type === 'edge-text')) {
            const edgeId = target.data.id;
            this.edgeService.editText(edgeId);
        }
    }

    onPress = (e: HammerInput) => {
        if (!this.canvas) {
            return;
        }

        // getPointer() passing a fake MouseEvent is a nice utility to convert between
        // the screen's x,y and the fabric x,y
        const pointer = this.canvas.getPointer({
            clientX: e.center.x,
            clientY: e.center.y,
        } as MouseEvent)
        this.hammertimePressService.startPress(
            pointer.x,
            pointer.y,
        );


        // NOTE: hammertime's press event triggers the mobile-screen press-and-drag to select feature. 
        // 
        // But the hammertime 'press' event is beginning of this sequence. Next, you'll have to go to "mouse:move" and "mouse:up", 
        // both in the mouse.controller
    }
}
