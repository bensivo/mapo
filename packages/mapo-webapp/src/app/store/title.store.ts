import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TitleStore {
  title = new BehaviorSubject<string>('Untitled');
  title$ = this.title.asObservable();

  set(title: string) {
    if (title) {
      this.title.next(title);
    } else {
      this.title.next('Untitled');
    }
  }
}
