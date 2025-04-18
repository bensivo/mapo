import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Edge } from '../models/edge.model';

@Injectable({
  providedIn: 'root',
})
export class EdgeStore {
  edges = new BehaviorSubject<Edge[]>([]);
  edges$ = this.edges.asObservable();

  get(id: string): Edge | undefined {
    return this.edges.value.find((edge) => edge.id === id);
  }

  set(edges: Edge[]) {
    this.edges.next(edges);
  }

  insert(edge: Edge) {
    this.edges.next([...this.edges.value, edge]);
  }

  update(id: string, dto: Partial<Edge>) {
    this.edges.next(
      this.edges.value.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            ...dto,
          };
        }
        return e;
      }),
    );
  }

  remove(id: string) {
    this.edges.next([...this.edges.value.filter((edge) => edge.id !== id)]);
  }
}
