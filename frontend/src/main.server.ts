import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import type { BootstrapContext } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { serverConfig } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(
    AppComponent,
    { ...serverConfig, providers: [provideZoneChangeDetection(), ...serverConfig.providers] },
    context,
  );

export default bootstrap;
