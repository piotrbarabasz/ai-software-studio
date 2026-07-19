import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import type { TrustContent } from '../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-studio-page',
  imports: [RevealOnScrollDirective, RouterLink],
  templateUrl: './studio-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './studio-page.component.scss',
})
export class StudioPageComponent {
  readonly content = siteContent.studio;
  readonly trust: TrustContent = siteContent.trust;
}
