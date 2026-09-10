import { ChangeDetectionStrategy, Component } from '@angular/core';
import { engineeringArtifact } from '../core/content/engineering-artifact.pl';
import { publishedEvidence } from '../core/content/evidence.pl';
import { EvidenceLabelComponent } from './evidence-label.component';

@Component({
  selector: 'app-engineering-artifact',
  imports: [EvidenceLabelComponent],
  templateUrl: './engineering-artifact.component.html',
  styleUrl: './engineering-artifact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineeringArtifactComponent {
  readonly artifact = engineeringArtifact;
  readonly evidence = publishedEvidence.find((item) => item.id === 'studio-application')!;
}
