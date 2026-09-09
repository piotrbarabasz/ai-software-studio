import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// Presentational view for a future authenticated operator tool. No route currently renders it.
// Mapping to the backend and publication review are required before exposing real run data.
export interface CrmRunView {
  readonly origin: 'local-test' | 'sandbox-run';
  readonly channel: 'email' | 'whatsapp';
  readonly message: string;
  readonly revision: number;
  readonly customer: string | null;
  readonly summary: string | null;
  readonly owner: string | null;
  readonly approvedBy: string | null;
  readonly result:
    | {
        readonly stage:
          'needs_fields' | 'pending_approval' | 'approved' | 'writing' | 'uncertain' | 'rejected';
      }
    | { readonly stage: 'succeeded'; readonly recordId: string };
}

@Component({
  selector: 'app-crm-run-result',
  templateUrl: './crm-run-result.component.html',
  styleUrl: './crm-run-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrmRunResultComponent {
  @Input({ required: true }) run!: CrmRunView;

  get statusText(): string {
    const labels = {
      needs_fields: 'Uzupełnij brakujące pola przed sprawdzeniem propozycji.',
      pending_approval: 'Propozycja czeka na zatwierdzenie tej wersji. Nie wykonano zapisu.',
      approved: 'Ta wersja jest zatwierdzona. Nie ma jeszcze potwierdzonego wyniku zapisu.',
      writing: 'Trwa zapis. Poczekaj na potwierdzenie wyniku.',
      uncertain:
        'Nie wiadomo, czy zapis został wykonany. Sprawdź istniejący rekord przed kolejną próbą.',
      rejected: 'Propozycja została odrzucona. Nie wykonano zapisu.',
      succeeded:
        this.run.origin === 'local-test'
          ? 'Adapter testowy zwrócił wynik. To nie potwierdza zapisu w CRM.'
          : 'Adapter zwrócił potwierdzenie zapisu. Porównaj dane z rekordem w sandboxie.',
    };
    return labels[this.run.result.stage];
  }
}
