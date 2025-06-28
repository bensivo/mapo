import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EdgeStore } from './edge.store';
import { Container } from '../models/container.model';

@Injectable({
  providedIn: 'root',
})
export class ContainerStore {
  containers = new BehaviorSubject<Container[]>([]);
  containers$ = this.containers.asObservable();

  constructor(private edgeStore: EdgeStore) { }

  get(id: string): Container | undefined {
    return this.containers.value.find((container) => container.id === id);
  }

  set(containers: Container[]) {
    this.containers.next(containers);
  }

  insert(container: Container) {
    this.containers.next([...this.containers.value, container]);
  }

  remove(id: string) {
    this.containers.next(this.containers.value.filter((node) => node.id !== id));
  }

  update(id: string, partialContainer: Partial<Container>) {
    this.containers.next(
      this.containers.value.map((container) => {
        if (container.id !== id) {
          return container;
        }

        return {
          ...container,
          ...partialContainer,
        };
      }),
    );
  }
}
