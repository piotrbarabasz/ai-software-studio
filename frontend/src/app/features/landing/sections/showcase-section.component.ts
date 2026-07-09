import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { ProductShowcase } from '../../../core/content/landing-content.types';
import { RevealOnScrollDirective } from '../../../shared/reveal/reveal-on-scroll.directive';
import { AgentPanelPreviewComponent } from '../visuals/agent-panel-preview.component';
import { EmailPipelineVisualComponent } from '../visuals/email-pipeline-visual.component';
import { RagWorkflowVisualComponent } from '../visuals/rag-workflow-visual.component';
import { VoiceWaveformVisualComponent } from '../visuals/voice-waveform-visual.component';
import { WebsiteSeoVisualComponent } from '../visuals/website-seo-visual.component';
import { WhatsappControlVisualComponent } from '../visuals/whatsapp-control-visual.component';

@Component({
  selector: 'app-showcase-section',
  standalone: true,
  imports: [
    CommonModule,
    RevealOnScrollDirective,
    AgentPanelPreviewComponent,
    EmailPipelineVisualComponent,
    RagWorkflowVisualComponent,
    VoiceWaveformVisualComponent,
    WebsiteSeoVisualComponent,
    WhatsappControlVisualComponent,
  ],
  templateUrl: './showcase-section.component.html',
  styleUrl: './showcase-section.component.scss',
})
export class ShowcaseSectionComponent {
  @Input({ required: true }) showcase!: ProductShowcase;
}
