import { isPlatformBrowser } from '@angular/common';
import type { AfterViewInit, ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  NgZone,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { MotionPreferencesService } from '../../../core/motion/motion-preferences.service';
import { WorkflowConnectorComponent } from '../../../shared/workflow/workflow-connector/workflow-connector.component';
import { WorkflowNodeComponent } from '../../../shared/workflow/workflow-node/workflow-node.component';
import type { WorkflowNodeModel } from '../../../shared/workflow/workflow.types';

@Component({
  selector: 'app-home-hero-visual',
  imports: [WorkflowConnectorComponent, WorkflowNodeComponent],
  templateUrl: './home-hero-visual.component.html',
  styleUrl: './home-hero-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroVisualComponent implements AfterViewInit {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly motionPreferences = inject(MotionPreferencesService);
  protected readonly isInView = signal(false);

  protected readonly emailNode: WorkflowNodeModel = {
    id: 'new-email',
    label: 'New email',
    kind: 'source',
    status: 'success',
    description: 'Acme Sp. z o.o.',
  };

  protected readonly aiNode: WorkflowNodeModel = {
    id: 'ai-extracting',
    label: 'AI extracting',
    kind: 'ai',
    status: 'active',
    description: 'Classification + extraction',
  };

  protected readonly humanNode: WorkflowNodeModel = {
    id: 'human-review',
    label: 'Human review',
    kind: 'human',
    status: 'warning',
    description: 'Decision remains under control',
  };

  protected readonly crmNode: WorkflowNodeModel = {
    id: 'crm-updated',
    label: 'CRM updated',
    kind: 'system',
    status: 'success',
  };

  protected readonly doneNode: WorkflowNodeModel = {
    id: 'done',
    label: 'Done',
    kind: 'result',
    status: 'success',
  };

  @ViewChild('workflowFrame', { static: true })
  private readonly workflowFrame?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const frame = this.workflowFrame?.nativeElement;
    const Observer = this.document.defaultView?.IntersectionObserver as
      typeof IntersectionObserver | undefined;

    if (!this.isBrowser || !frame || !Observer || this.motionPreferences.reducedMotion()) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const observer = new Observer(
        (entries) => {
          const nextValue = entries.some((entry) => entry.isIntersecting);
          if (nextValue === this.isInView()) {
            return;
          }

          this.ngZone.run(() => this.isInView.set(nextValue));
        },
        { rootMargin: '10% 0px', threshold: 0.2 },
      );

      observer.observe(frame);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
