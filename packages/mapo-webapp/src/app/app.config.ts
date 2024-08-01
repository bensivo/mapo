import { InjectionToken } from '@angular/core';

export interface Config {
  ENV: string;
  APP_VERSION: string;
  MAPO_API_BASE_URL: string;
  SUPABASE_PROJECT_URL: string;
  SUPABASE_PUBLIC_API_KEY: string;
}

export const CONFIG = new InjectionToken<Config>('config');

export function provideConfig(config: Config) {
  return {
    provide: CONFIG,
    useValue: config,
  };
}
