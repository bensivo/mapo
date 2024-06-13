import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Edge } from "../models/edge.interface";

@Injectable({
    providedIn: 'root'
})
export class EdgeStore {
    edges = new BehaviorSubject<Edge[]>([]);
    edges$ = this.edges.asObservable();

    constructor() {
        const persisted = localStorage.getItem('mapo-state-edges');
        if (persisted) {
            try {
                const edges: Edge[] = JSON.parse(persisted);
                console.log('Hydrating edges from local storage', edges)
                this.edges.next(edges);
            } catch (e) {
                console.error('Failed to load edges from local storage', e);
            }
        }

        this.edges$.subscribe((edges) => {
            console.log('Persisting edges', edges)
            // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
            localStorage.setItem('mapo-state-edges', JSON.stringify(edges));
        });
    }

    insert(edge: Edge) {
        this.edges.next([...this.edges.value, edge]);
    }

    remove(id: string) {
        this.edges.next([...this.edges.value.filter((edge) => edge.id !== id)]);
    }
}