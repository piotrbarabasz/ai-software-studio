import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HomeSevenDayDemo } from '../../../core/content/site-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-seven-day-demo',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './seven-day-demo.component.html',
  styleUrl: './seven-day-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SevenDayDemoComponent {
  @Input({ required: true }) demo!: HomeSevenDayDemo;
}
