import { CommonModule, DOCUMENT } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { plContent } from '../../core/content/pl';
import type { ProductizedOffer } from '../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { ContactCtaSectionComponent } from './sections/contact-cta-section.component';
import { DemoPromiseSectionComponent } from './sections/demo-promise-section.component';
import { DemoSprintSectionComponent } from './sections/demo-sprint-section.component';
import { FaqSectionComponent } from './sections/faq-section.component';
import { HeroSectionComponent } from './sections/hero-section.component';
import { PricingSectionComponent } from './sections/pricing-section.component';
import { ProductOffersSectionComponent } from './sections/product-offers-section.component';
import { ShowcaseSectionComponent } from './sections/showcase-section.component';
import { TrustSectionComponent } from './sections/trust-section.component';
import { WebsitesSeoSectionComponent } from './sections/websites-seo-section/websites-seo-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    ContactCtaSectionComponent,
    DemoPromiseSectionComponent,
    DemoSprintSectionComponent,
    FaqSectionComponent,
    HeroSectionComponent,
    PricingSectionComponent,
    ProductOffersSectionComponent,
    RevealOnScrollDirective,
    ShowcaseSectionComponent,
    TrustSectionComponent,
    WebsitesSeoSectionComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  readonly content = plContent;
  readonly showcaseSections = this.content.showcases.filter(
    (showcase) => showcase.visualKind !== 'websiteSeo',
  );
  readonly websitesSeoShowcase = this.content.showcases.find(
    (showcase) => showcase.visualKind === 'websiteSeo',
  )!;
  readonly websitesSeoOffer: ProductizedOffer = {
    id: 'website_seo_support',
    title: 'Strony internetowe + SEO',
    shortLabel: 'WWW + SEO',
    summary:
      'Wsparcie dla AI landing pages, demo pages i stron walidacyjnych, które mają prowadzić do kontaktu.',
    businessOutcome:
      'Firma dostaje czytelny landing i prostą ścieżkę komunikacji wspierającą walidację pomysłu.',
    useCases: ['AI landing pages', 'demo pages', 'product validation pages'],
    demoArtifact:
      'Sekcja lub prototyp strony z hierarchią treści, CTA i rekomendacjami dalszych kroków.',
    scopeBoundary:
      'Wsparcie dla landingów i walidacji. Produkcyjny CMS, publikację i szerszą strategię contentową planujemy później.',
    visualKind: 'websiteSeo',
    ctaLabel: 'Zapytaj o WWW + SEO',
  };

  ngOnInit(): void {
    const seo = this.content.seo;
    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ property: 'og:title', content: seo.openGraphTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: seo.openGraphDescription,
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.setCanonical(seo.canonicalPath);
  }

  private setCanonical(canonicalPath: string): void {
    const origin = this.document.location?.origin ?? '';
    const href = `${origin}${canonicalPath}`;
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', href);
  }
}
