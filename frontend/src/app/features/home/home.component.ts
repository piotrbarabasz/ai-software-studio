import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import type { HomePageContent, TrustContent } from '../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { serviceCatalog } from '../../core/content/service-catalog.pl';
import { BusinessFlowSectionComponent } from './business-flow-section.component';
import { HomeHeroVisualComponent } from './hero/home-hero-visual.component';
import { EvidenceLabelComponent } from '../../shared/evidence-label.component';
import { SevenDayDemoComponent } from './seven-day-demo/seven-day-demo.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    BusinessFlowSectionComponent,
    HomeHeroVisualComponent,
    EvidenceLabelComponent,
    RevealOnScrollDirective,
    SevenDayDemoComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly services = serviceCatalog;
  readonly home: HomePageContent = siteContent.home;
  readonly trust: TrustContent = siteContent.trust;
}
