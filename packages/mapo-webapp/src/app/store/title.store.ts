import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleStore {

  title = new BehaviorSubject<string>('Untitled');
  title$ = this.title.asObservable();

  constructor() {
    const persisted = localStorage.getItem('mapo-state-title');
    if (persisted) {
      this.set(persisted);
    }

    this.title$.subscribe((title) => {
        console.log('Persisting title', title)
        // TODO: add an app version to the persisted data, so that we don't fail on breaking changes
        localStorage.setItem('mapo-state-title', title);
    });
  }

  set(title: string) {
    if (title) {
      this.title.next(title);
    } else {
      this.title.next('Untitled');
    }
  }
}
