import type { Routes } from '@angular/router';

import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'AISoftware Studio - aplikacje webowe i automatyzacje AI',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
