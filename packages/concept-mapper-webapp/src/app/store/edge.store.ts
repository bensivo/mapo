import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Edge } from "../models/edge.interface";

@Injectable({
    providedIn: 'root'
})
export class EdgeStore {
    edges = new BehaviorSubject<Edge[]>([
        
    ]);
    edges$ = this.edges.asObservable();

    constructor() {
        // for (let i=0; i<9; i++) {
        //     this.insert({
        //         id: i.toString(),
        //         startNodeId: ''+i,
        //         endNodeId: ''+(i + 1),
        //     });
        // }
    }

    insert(edge: Edge) {
        this.edges.next([...this.edges.value, edge]);
    }
}