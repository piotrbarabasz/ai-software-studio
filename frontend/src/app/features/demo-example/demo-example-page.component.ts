import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-demo-example-page',
  imports: [RevealOnScrollDirective, RouterLink],
  templateUrl: './demo-example-page.component.html',
  styleUrl: './demo-example-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class DemoExamplePageComponent {
  readonly content = siteContent.demoExample;
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  printReport(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.defaultView?.print();
  }
}
