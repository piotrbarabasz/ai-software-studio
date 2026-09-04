import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { HomeUseCase } from '../../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';
import { AutomationBentoVisualComponent } from './automation-bento-visual.component';

@Component({
  selector: 'app-automation-bento',
  standalone: true,
  imports: [RevealOnScrollDirective, AutomationBentoVisualComponent],
  templateUrl: './automation-bento.component.html',
  styleUrl: './automation-bento.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomationBentoComponent {
  @Input({ required: true }) items!: readonly HomeUseCase[];
}
