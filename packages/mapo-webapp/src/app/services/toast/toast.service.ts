import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as uuid from 'uuid';

export interface ToastData {
  id: string;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts = new BehaviorSubject<ToastData[]>([]);

  toasts$ = this.toasts.asObservable();

  showToast(title: string, message: string, durationMs?: number): ToastData {
    const id = uuid.v4();
    const toastData = {
      id,
      title,
      message,
    };

    this.toasts.next([...this.toasts.value, toastData]);

    if (durationMs !== undefined) {
      setTimeout(() => {
        this.removeToast(id);
      }, durationMs);
    }
    return toastData;;
  }

  removeToast(id: string) {
    const toasts = this.toasts.value.filter(toast => toast.id !== id);
    this.toasts.next(toasts);
  }
}
