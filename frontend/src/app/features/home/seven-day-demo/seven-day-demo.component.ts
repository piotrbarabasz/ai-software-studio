import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HomeSevenDayDemo } from '../../../core/content/site-content.types';
import { FirstStageTermsComponent } from '../../../shared/first-stage-terms.component';

@Component({
  selector: 'app-seven-day-demo',
  standalone: true,
  imports: [RouterLink, FirstStageTermsComponent],
  templateUrl: './seven-day-demo.component.html',
  styleUrl: './seven-day-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SevenDayDemoComponent {
  @Input({ required: true }) demo!: HomeSevenDayDemo;
}
