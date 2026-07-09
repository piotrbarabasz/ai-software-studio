import { Component, Input } from '@angular/core';

import type { ContactContent } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';
import { ContactFormComponent } from '../../contact/contact-form.component';

@Component({
  selector: 'app-contact-cta-section',
  standalone: true,
  imports: [ContactFormComponent, RevealOnScrollDirective],
  templateUrl: './contact-cta-section.component.html',
  styleUrl: './contact-cta-section.component.scss',
})
export class ContactCtaSectionComponent {
  @Input({ required: true }) content!: ContactContent;
}
