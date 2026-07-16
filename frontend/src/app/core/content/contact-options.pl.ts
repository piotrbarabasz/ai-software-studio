import type { BudgetRange, ProjectType } from '../../services/contact-api.types';
import type { SelectOption } from './site-content.types';

export const projectTypeOptions = [
  { value: 'mvp_prototype', label: 'Demo lub sprawdzenie pomysłu' },
  { value: 'custom_web_app', label: 'Aplikacja webowa albo panel' },
  { value: 'business_process_automation', label: 'Automatyzacja procesu' },
  { value: 'rag_chatbot_demo', label: 'Asystent AI lub RAG' },
  { value: 'backend_api', label: 'Backend, API albo integracja' },
  { value: 'external_integration', label: 'Konsultacja techniczna' },
  { value: 'other', label: 'Inny temat' },
] satisfies readonly SelectOption<ProjectType>[];

export const budgetRangeOptions = [
  { value: 'under_10k_pln', label: 'poniżej 10 tys. PLN' },
  { value: '10k_25k_pln', label: '10-25 tys. PLN' },
  { value: '25k_50k_pln', label: '25-50 tys. PLN' },
  { value: '50k_100k_pln', label: '50-100 tys. PLN' },
  { value: 'over_100k_pln', label: 'powyżej 100 tys. PLN' },
  { value: 'not_sure', label: 'Jeszcze nie wiem' },
] satisfies readonly SelectOption<BudgetRange>[];
