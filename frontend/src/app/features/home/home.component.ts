import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { UseCaseVisualComponent } from '../../shared/use-case-visual/use-case-visual.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, UseCaseVisualComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly home = siteContent.home;
  readonly trust = siteContent.trust;
}
