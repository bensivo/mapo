import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  OAuthResponse,
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import { AuthStore } from '../../store/auth.store';
import { CONFIG, Config } from '../../app.config';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  supabase: SupabaseClient;

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private toastService: ToastService,
    @Inject(CONFIG) private config: Config,
  ) {
    this.supabase = createClient(
      this.config.SUPABASE_PROJECT_URL,
      this.config.SUPABASE_PUBLIC_API_KEY,
    );

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session != null) {
        this.authStore.setUser({
          id: session.user.id,
          email: session.user.email ?? '',
        });
        this.authStore.setAccessToken(session.access_token);
        this.authStore.setState('signed-in');
      } else if (event === 'SIGNED_OUT') {
        this.authStore.setUser(null);
        this.authStore.setAccessToken(null);
        this.authStore.setState('signed-out');
      } else if (event === 'TOKEN_REFRESHED' && session != null) {
        this.authStore.setUser({
          id: session.user.id,
          email: session.user.email ?? '',
        });
        this.authStore.setAccessToken(session.access_token);
        this.authStore.setState('signed-in');
      }
    });


    // Refresh the session every 5 minutes
    setInterval(() => {
      const token = this.authStore.accessToken.value;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;

        const expDate = new Date(exp * 1000);
        if (Date.now() > expDate.getTime()) {
          this.toastService.showToast('Login Expired', 'Your login session has expired. Please log in again, or your changes may not be saved.');
        }
      }

      if (this.authStore.state.value === 'signed-in') {
        this.supabase.auth.refreshSession();
      }
    }, 1000 * 60 * 5);
  }

  async signInWithGoogle(): Promise<OAuthResponse> {
    const res = await this.supabase.auth.signInWithOAuth({
      // Configuring google oauth from supabase: https://supabase.com/docs/guides/auth/social-login/auth-google
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // NOTE: the redirect URLs are configured in the Supabase dashboard. Under "Authentication" -> "URL Configuration" -> "Site URL"
      },
    });
    return res;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();

    if (!error) {
      this.authStore.setState('signed-out');
      this.router.navigate(['/']);
      return;
    }

    console.error('error', error);
  }
}
