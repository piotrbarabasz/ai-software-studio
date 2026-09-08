import type { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { API_CONFIG } from './core/api-config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Event replay emits executable inline bootstrap scripts. Keep hydration
    // without replay to preserve the production CSP's JSON-only invariant.
    provideClientHydration(withNoIncrementalHydration()),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideHttpClient(withFetch()),
    {
      provide: API_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl,
      },
    },
  ],
};
