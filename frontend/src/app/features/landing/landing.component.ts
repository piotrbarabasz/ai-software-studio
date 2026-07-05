import { CommonModule, DOCUMENT } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { plContent } from '../../core/content/pl';
import { ContactFormComponent } from '../contact/contact-form.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ContactFormComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  readonly content = plContent;

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
