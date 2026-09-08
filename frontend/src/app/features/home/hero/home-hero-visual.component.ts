import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-hero-visual',
  templateUrl: './home-hero-visual.component.html',
  styleUrl: './home-hero-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroVisualComponent {}
