import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less',
})
export class HomeComponent {
  constructor(
    private router: Router,
    private authStore: AuthStore,
  ) { }

  home() {
    const user = this.authStore.user.value;
    if (user) {
      this.router.navigate(['files']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
