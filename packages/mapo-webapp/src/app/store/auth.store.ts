import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  accessToken = new BehaviorSubject<string | null>(null);
  accessToken$ = this.accessToken.asObservable();

  state = new BehaviorSubject<string>('signed-out');
  state$ = this.state.asObservable();

  setState(state: string) {
    this.state.next(state);
  }

  setUser(user: User | null) {
    this.user.next(user);
  }

  setAccessToken(token: string | null) {
    this.accessToken.next(token);
  }
}
