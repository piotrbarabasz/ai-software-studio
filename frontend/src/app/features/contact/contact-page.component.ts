import { Component, ChangeDetectionStrategy } from '@angular/core';

import { siteContent } from '../../core/content/site.pl';
import type { ContactPageContent } from '../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { ContactFormComponent } from './contact-form.component';

@Component({
  selector: 'app-contact-page',
  imports: [ContactFormComponent, RevealOnScrollDirective],
  templateUrl: './contact-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact-page.component.scss',
})
export class ContactPageComponent {
  readonly content: ContactPageContent = siteContent.contact;
}
