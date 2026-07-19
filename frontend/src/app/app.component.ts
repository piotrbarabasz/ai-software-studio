import { Component, ChangeDetectionStrategy } from '@angular/core';

import { SiteShellComponent } from './features/shell/site-shell.component';

@Component({
  selector: 'app-root',
  imports: [SiteShellComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<app-site-shell />',
})
export class AppComponent {}
