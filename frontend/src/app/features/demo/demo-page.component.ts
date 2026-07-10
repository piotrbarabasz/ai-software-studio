import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { plContent } from '../../core/content/pl';
import { siteContent } from '../../core/content/site.pl';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { ContactCtaSectionComponent } from '../landing/sections/contact-cta-section.component';
import { DemoPromiseSectionComponent } from '../landing/sections/demo-promise-section.component';
import { DemoSprintSectionComponent } from '../landing/sections/demo-sprint-section.component';
import { FaqSectionComponent } from '../landing/sections/faq-section.component';
import { PricingSectionComponent } from '../landing/sections/pricing-section.component';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [
    CommonModule,
    ContactCtaSectionComponent,
    DemoPromiseSectionComponent,
    DemoSprintSectionComponent,
    FaqSectionComponent,
    PricingSectionComponent,
    RevealOnScrollDirective,
    RouterLink,
  ],
  templateUrl: './demo-page.component.html',
  styleUrl: './demo-page.component.scss',
})
export class DemoPageComponent {
  readonly content = plContent;
  readonly routeContent = siteContent.demo;
}
