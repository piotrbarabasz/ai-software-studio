import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import type { HomeProofVisualKind } from '../../../core/content/site-content.types';

@Component({
  selector: 'app-home-proof-visual',
  templateUrl: './home-proof-visual.component.html',
  styleUrl: './home-proof-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProofVisualComponent {
  @Input({ required: true }) visualKind!: HomeProofVisualKind;
}
