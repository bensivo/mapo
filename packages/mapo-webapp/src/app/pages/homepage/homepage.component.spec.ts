import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageComponent } from './homepage.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { AuthStore } from '../../store/auth.store';
import { CONFIG, Config } from '../../app.config';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;


  let config: Config = {
    APP_VERSION: '1.1.1',
    ENV: '',
    MAPO_API_BASE_URL: '',
    SUPABASE_PROJECT_URL:'',
    SUPABASE_PUBLIC_API_KEY: '',
  };

  let authStore = {
    state$: new BehaviorSubject<string>('signed-out'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageComponent],
      providers: [
        {
          provide: Router,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: AuthStore,
          useValue: authStore,
        },
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the current app version', () => {
    const element = fixture.debugElement.query(By.css('.app-version'));
    expect(element).toBeTruthy();

    expect(element.nativeElement.textContent).toContain('1.1.1');
  });

  it('should show sign-in if not signed in', () => {
    authStore.state$.next('signed-out');
    fixture.detectChanges();

    const element = fixture.debugElement;
    expect(element.nativeElement.textContent).toContain('Sign in');
  });


  it('should show sign-in-with-google if signing-in', () => {
    authStore.state$.next('signing-in');
    fixture.detectChanges();

    const element = fixture.debugElement;
    expect(element.nativeElement.textContent).toContain('Sign in with Google');
  });

  it('should show sign-out if signed in', () => {
    authStore.state$.next('signed-in');
    fixture.detectChanges();

    const element = fixture.debugElement;
    expect(element.nativeElement.textContent).toContain('Sign out');
  });

  it('should show my-files if signed in', () => {
    authStore.state$.next('signed-in');
    fixture.detectChanges();

    const element = fixture.debugElement;
    expect(element.nativeElement.textContent).toContain('Go to My Files');
  });
});
