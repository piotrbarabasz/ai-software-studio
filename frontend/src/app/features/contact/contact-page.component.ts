import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { siteContent } from '../../core/content/site.pl';
import type { ContactPageContent } from '../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { ContactFormComponent } from './contact-form.component';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ContactFormComponent, RevealOnScrollDirective],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
})
export class ContactPageComponent {
  readonly content: ContactPageContent = siteContent.contact;
}
