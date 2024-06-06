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

    insert(edge: Edge) {
        this.edges.next([...this.edges.value, edge]);
    }

    remove(id: string) {
        this.edges.next([...this.edges.value.filter((edge) => edge.id !== id)]);
    }
}