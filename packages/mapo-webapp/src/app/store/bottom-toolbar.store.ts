import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BottomToolbarStore {
  showPallet = new BehaviorSubject<boolean>(false);
  showPallet$ = this.showPallet.asObservable();

  setShowPallet(isVisible: boolean) {
    this.showPallet.next(isVisible);
  }

  getShowPallet(): boolean {
    return this.showPallet.value;
  }
}
