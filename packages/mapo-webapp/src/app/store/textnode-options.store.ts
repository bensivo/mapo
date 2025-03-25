import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class TextNodeOptionsStore {
  color = new BehaviorSubject<string>('#FFFFFF');
  color$ = this.color.asObservable();

  isComment = new BehaviorSubject<boolean>(false);
  isComment$ = this.isComment.asObservable();

  setColor(color: string) {
    if (color) {
      this.color.next(color);
    }
  }

  getColor(): string {
    return this.color.value;
  }

  setIsComment(isComment: boolean) {
    this.isComment.next(isComment);
  }

  getIsComment(): boolean {
    return this.isComment.value;
  }
}
