import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { HomeUseCase } from '../../../core/content/site-content.types';

@Component({
  selector: 'app-automation-bento-visual',
  standalone: true,
  templateUrl: './automation-bento-visual.component.html',
  styleUrl: './automation-bento-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomationBentoVisualComponent {
  @Input({ required: true }) visualKind!: HomeUseCase['visualKind'];
}
