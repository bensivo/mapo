import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutoSaveStore {
  public autoSaveStatus = new BehaviorSubject<string>('');
  public autoSaveStatus$ = this.autoSaveStatus.asObservable();

  setStatus(status: string) {
    this.autoSaveStatus.next(status);
  }
}
