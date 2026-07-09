import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { FaqItem } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
})
export class FaqSectionComponent {
  @Input({ required: true }) items!: readonly FaqItem[];

  openId: string | null = null;

  toggle(item: FaqItem): void {
    this.openId = this.openId === item.id ? null : item.id;
  }

  isOpen(item: FaqItem): boolean {
    return this.openId === item.id;
  }
}
