import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import type {
  ExternalLink,
  InternalLink,
  TrustContent,
  WorkEvidence,
  WorkEvidenceLink,
} from '../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { AutomationBentoComponent } from './automation-bento/automation-bento.component';
import { BusinessFlowSectionComponent } from './business-flow-section.component';
import { HomeHeroVisualComponent } from './hero/home-hero-visual.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    AutomationBentoComponent,
    BusinessFlowSectionComponent,
    HomeHeroVisualComponent,
    RevealOnScrollDirective,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly home = siteContent.home;
  readonly trust: TrustContent = siteContent.trust;
  readonly evidenceItems: readonly WorkEvidence[] = siteContent.trust.evidence.items.slice(0, 2);

  protected isInternalWorkEvidenceLink(link: WorkEvidenceLink | undefined): link is InternalLink {
    return link?.kind === 'internal';
  }

  protected isExternalWorkEvidenceLink(link: WorkEvidenceLink | undefined): link is ExternalLink {
    return link?.kind === 'external';
  }
}
