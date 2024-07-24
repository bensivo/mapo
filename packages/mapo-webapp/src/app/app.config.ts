import { InjectionToken } from '@angular/core';

export interface Config {
    ENV: string;
    MAPO_API_BASE_URL: string;
}

export const CONFIG = new InjectionToken<Config>('config');

export function provideConfig(config: Config) {
    return {  
        provide: CONFIG,
        useValue: config
    }
}
