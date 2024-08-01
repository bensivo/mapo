import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  OAuthResponse,
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import { AuthStore } from '../../store/auth.store';
import { CONFIG, Config } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  supabase: SupabaseClient;

  constructor(
    private authStore: AuthStore,
    private router: Router,
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
      }
    });
  }

  async signInWithOTP(email: string) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email: email,
    });

    if (!error) {
      this.authStore.setState('otp-sent');
    }
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

  async verifyOTP(email: string, otp: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      token: otp,
      email: email,
      type: 'email',
    });

    if (!error) {
      this.authStore.setState('signed-in');
      this.router.navigate(['/files']);
      return;
    }
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
