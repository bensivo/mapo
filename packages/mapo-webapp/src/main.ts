import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import axios from 'axios';

import { AppComponent } from './app/app.component';
import { Config, provideConfig } from './app/app.config';
import { routes } from './app/app.routes';

const configPath = window.location.href.includes('localhost') ? '/config.json' : '/app/config.json';

axios.get(configPath).then((res) => {
  const config = res.data as Config;

  bootstrapApplication(AppComponent, {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideConfig(config),
    ]
  }).catch((err) =>
    console.error(err),
  );
})
