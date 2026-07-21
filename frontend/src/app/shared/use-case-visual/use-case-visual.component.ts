import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { HomeUseCase } from '../../core/content/site-content.types';

@Component({
  selector: 'app-use-case-visual',
  standalone: true,
  templateUrl: './use-case-visual.component.html',
  styleUrl: './use-case-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCaseVisualComponent {
  @Input({ required: true }) visualKind!: HomeUseCase['visualKind'];
}
