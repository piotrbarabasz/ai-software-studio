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

  readonly flows: Record<HomeUseCase['visualKind'], readonly string[]> = {
    'knowledge-assistant': [
      'Dokumenty',
      'Wyszukanie',
      'Odpowiedź ze źródłem',
      'Człowiek przy braku danych',
    ],
    'message-workflow': ['Wiadomość', 'Klasyfikacja', 'Dane', 'Kolejny krok'],
    'process-panel': ['Sprawy', 'Status', 'Odpowiedzialny', 'Następny krok'],
    'agent-system': ['Cel', 'Agenci / etapy', 'Kontrola', 'Wynik'],
    'channel-integrations': ['WhatsApp / e-mail', 'Integracja', 'Proces', 'CRM / panel'],
  };

  get flowLabels(): readonly string[] {
    return this.flows[this.visualKind] ?? [];
  }

  get flowClass(): string {
    return `${this.visualKind}-flow`;
  }
}
