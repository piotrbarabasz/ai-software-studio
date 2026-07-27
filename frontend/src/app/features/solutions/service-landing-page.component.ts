import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { siteContent } from '../../core/content/site.pl';
import type { ServiceLandingPageContent } from '../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-service-landing-page',
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './service-landing-page.component.html',
  styleUrl: './service-landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ServiceLandingPageComponent {
  content: ServiceLandingPageContent = siteContent.serviceLandingPages[0];

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.updateContent();
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateContent());
  }

  private updateContent(): void {
    const canonicalPath = this.route.snapshot.data['canonicalPath'];
    const nextContent = siteContent.serviceLandingPages.find((page) => page.path === canonicalPath);
    this.content = nextContent ?? siteContent.serviceLandingPages[0];
  }
}
