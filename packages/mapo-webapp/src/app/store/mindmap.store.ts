import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Mindmap } from "../models/mindmap.interface";

@Injectable({
    providedIn: 'root'
})
export class MindmapStore {
    mindmaps = new BehaviorSubject<Mindmap[]>([
        
    ]);
    mindmaps$ = this.mindmaps.asObservable();

    set(mindmaps: Mindmap[]) {
        this.mindmaps.next(mindmaps);
    }
}