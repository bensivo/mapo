import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class TextNodeOptionsStore {
  color = new BehaviorSubject<string>('#FFFFFF');
  color$ = this.color.asObservable();

  setColor(color: string) {
    if (color) {
      this.color.next(color);
    }
  }

  getColor(): string {
    return this.color.value;
  }
}
