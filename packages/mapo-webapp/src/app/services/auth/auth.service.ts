import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  OAuthResponse,
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import { AuthStore } from '../../store/auth.store';

const SUPABASE_URL = 'https://dauzhiqsfamfeihvfzdg.supabase.co';
const SUPABASE_PUBLIC_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdXpoaXFzZmFtZmVpaHZmemRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5ODg1MDUsImV4cCI6MjAzMzU2NDUwNX0.Gasq6nqP5JLxtH8GyNtirWtQ5K86ZJ90VH_zDKQ7QCQ';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  supabase: SupabaseClient;

  constructor(
    private authStore: AuthStore,
    private router: Router,
  ) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY);

    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('event', event, session);

      if (event === 'INITIAL_SESSION') {
        // handle initial session
      } else if (event === 'SIGNED_IN' && session != null) {
        this.authStore.setUser({
          id: session.user.id,
          email: session.user.email ?? '',
        });
        this.authStore.setAccessToken(session.access_token);
        this.authStore.setState('signed-in');
        console.log(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        this.authStore.setUser(null);
        this.authStore.setAccessToken(null);
        this.authStore.setState('signed-out');
      } else if (event === 'PASSWORD_RECOVERY') {
        // handle password recovery event
      } else if (event === 'TOKEN_REFRESHED') {
        // handle token refreshed event
      } else if (event === 'USER_UPDATED') {
        // handle user updated event
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
    });
    console.log('Google OAuth response', res);
    return res;
  }

  async verifyOTP(email: string, otp: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      token: otp,
      email: email,
      type: 'email',
    });

    console.log('data', data);
    console.log('error', error);

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
    }
    console.log('error', error);
  }
}
