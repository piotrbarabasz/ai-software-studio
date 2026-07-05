import type { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { environment } from '../environments/environment';
import { API_CONFIG } from './core/api-config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideHttpClient(),
    {
      provide: API_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl,
      },
    },
  ],
};
