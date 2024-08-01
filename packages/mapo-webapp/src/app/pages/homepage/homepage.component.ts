import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { AuthStore } from '../../store/auth.store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CONFIG, Config } from '../../app.config';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.less',
})
export class HomepageComponent {
  state$ = this.authStore.state$;
  appVersion: string = this.config.APP_VERSION ?? '0.0.0';

  constructor(
    private router: Router,
    private authService: AuthService,
    private authStore: AuthStore,
    @Inject(CONFIG)
    private config: Config,
  ) {
    // TODO: if signed in, redirect to files page
  }

  onClickStartMapping() {
    this.router.navigate(['/canvas']);
  }

  onClickSignUpSignIn() {
    this.authStore.setState('signing-in');
  }

  onClickSignInWithGoogle() {
    this.authService.signInWithGoogle();
  }

  onClickMyFiles() {
    this.router.navigate(['/files']);
  }

  onClickSignOut() {
    this.authService.signOut();
    this.authStore.setState('signed-out');
  }

  onClickCancel() {
    this.authStore.setState('signed-out');
  }
}
