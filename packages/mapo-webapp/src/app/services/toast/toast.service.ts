import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as uuid from 'uuid';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  hideClose?: boolean;
}

export interface ToastOptions {
  title: string;
  message: string;
  durationMs?: number;
  hideClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts = new BehaviorSubject<ToastData[]>([]);

  toasts$ = this.toasts.asObservable();

  showToastV2(options: ToastOptions): ToastData {
    const { title, message, durationMs, hideClose } = options;
    return this.showToast(title, message, durationMs, hideClose);
  }

  showToast(title: string, message: string, durationMs: number = 5000, hideClose: boolean = false): ToastData {
    const id = uuid.v4();
    const toastData = {
      id,
      title,
      message,
      hideClose,
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
