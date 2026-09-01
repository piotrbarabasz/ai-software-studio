import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HomeUseCase } from '../../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';
import { AutomationBentoVisualComponent } from './automation-bento-visual.component';

@Component({
  selector: 'app-automation-bento',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective, AutomationBentoVisualComponent],
  templateUrl: './automation-bento.component.html',
  styleUrl: './automation-bento.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomationBentoComponent {
  @Input({ required: true }) items!: readonly HomeUseCase[];

  readonly categoryByVisualKind: Record<HomeUseCase['visualKind'], string> = {
    'knowledge-assistant': 'Wiedza i odpowiedzi',
    'message-workflow': 'Rozmowy i zgłoszenia',
    'process-panel': 'Dokumenty i dane',
    'agent-system': 'Orkiestracja procesu',
    'channel-integrations': 'Kanały i integracje',
  };
}
