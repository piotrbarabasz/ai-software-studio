import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-business-flow-visual',
  standalone: true,
  templateUrl: './business-flow-visual.component.html',
  styleUrl: './business-flow-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessFlowVisualComponent {
  @Input({ required: true }) activeStep = 0;

  protected isComplete(step: number): boolean {
    return step < this.activeStep;
  }
}
