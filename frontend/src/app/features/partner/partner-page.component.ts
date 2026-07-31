import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-partner-page',
  imports: [RevealOnScrollDirective, RouterLink],
  templateUrl: './partner-page.component.html',
  styleUrl: './partner-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class PartnerPageComponent {
  readonly content = siteContent.partner;
}
