import { Component } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.less'
})
export class ToastComponent {

  toasts$ = this.toastService.toasts$
  .pipe(
    map(toasts => toasts.slice().reverse())
  )

  constructor(private toastService: ToastService) { }

  onClickCloseToast(id: string) {
    this.toastService.removeToast(id);
  }
}

