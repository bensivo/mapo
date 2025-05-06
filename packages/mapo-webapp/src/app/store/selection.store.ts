import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectionStore {

    private selection = new BehaviorSubject<fabric.Object[] | null>(null);
    selection$ = this.selection.asObservable();

    set(selection: fabric.Object[] | null) {
        this.selection.next(selection);
    }
}
