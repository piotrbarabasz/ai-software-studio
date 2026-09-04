import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { siteContent } from '../../core/content/site.pl';
import type { HomePageContent, TrustContent } from '../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { AutomationBentoComponent } from './automation-bento/automation-bento.component';
import { BusinessFlowSectionComponent } from './business-flow-section.component';
import { HomeHeroVisualComponent } from './hero/home-hero-visual.component';
import { HomeProofVisualComponent } from './home-proof-visual/home-proof-visual.component';
import { SevenDayDemoComponent } from './seven-day-demo/seven-day-demo.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    AutomationBentoComponent,
    BusinessFlowSectionComponent,
    HomeHeroVisualComponent,
    HomeProofVisualComponent,
    RevealOnScrollDirective,
    SevenDayDemoComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly home: HomePageContent = siteContent.home;
  readonly trust: TrustContent = siteContent.trust;
}
