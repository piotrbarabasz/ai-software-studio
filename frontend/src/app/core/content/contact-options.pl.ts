import type { BudgetRange, ProjectType } from '../../services/contact-api.types';
import type { ContactIntentOption, SelectOption } from './site-content.types';

export const projectTypeOptions = [
  { value: 'rag_chatbot_demo', label: 'Chatbot / asystent wiedzy' },
  { value: 'website_seo', label: 'Demo produktu / landing' },
  { value: 'voice_agent_demo', label: 'Voice agent' },
  { value: 'whatsapp_agent_management', label: 'WhatsApp / obsługa rozmów' },
  { value: 'email_automation', label: 'Automatyzacja komunikacji: e-mail' },
  { value: 'agent_management_panel', label: 'Panel lub dashboard' },
  { value: 'custom_web_app', label: 'Aplikacja lub proces do rozwoju' },
  { value: 'ai_automation', label: 'Automatyzacja komunikacji' },
  { value: 'backend_api', label: 'Konsultacja zakresu wdrożenia' },
  { value: 'business_process_automation', label: 'Inny proces do automatyzacji' },
  { value: 'external_integration', label: 'Proces z użyciem obecnych narzędzi' },
  { value: 'dashboard_internal_tool', label: 'Panel lub dashboard' },
  { value: 'mvp_prototype', label: 'Demo produktu / prototyp' },
  { value: 'other', label: 'Inny proces do automatyzacji' },
] satisfies readonly SelectOption<ProjectType>[];

export const contactInterestOptions = [
  { id: 'demo-rag', label: 'demo chatbota / asystenta wiedzy', projectType: 'rag_chatbot_demo' },
  { id: 'voice-agent', label: 'demo voice agenta', projectType: 'voice_agent_demo' },
  { id: 'automation', label: 'automatyzacja procesu', projectType: 'ai_automation' },
  { id: 'web-app', label: 'strona lub aplikacja webowa', projectType: 'custom_web_app' },
  { id: 'development', label: 'development rozwiązania', projectType: 'custom_web_app' },
  { id: 'research', label: 'rozmowa o R&D', projectType: 'backend_api' },
  { id: 'general', label: 'ogólne zapytanie', projectType: 'other' },
] as const satisfies readonly {
  readonly id: string;
  readonly label: string;
  readonly projectType: ProjectType;
}[];

export type ContactInterest = (typeof contactInterestOptions)[number]['id'];

export const contactIntentOptions = [
  {
    id: 'quick-validation',
    label: 'Demo / szybka walidacja',
    description: 'Demo lub PoC dla jednego, ograniczonego scenariusza.',
    projectType: 'mvp_prototype',
    allowedQueryValues: ['mvp_prototype'],
  },
  {
    id: 'mvp',
    label: 'Zbuduj MVP',
    description: 'Pierwsza wersja produktu po potwierdzeniu sensu rozwiązania.',
    projectType: 'mvp_prototype',
    allowedQueryValues: ['mvp_prototype'],
  },
  {
    id: 'full-development',
    label: 'Pełne wdrożenie',
    description: 'Pełne wdrożenie aplikacji, backendu i integracji.',
    projectType: 'custom_web_app',
    allowedQueryValues: ['custom_web_app'],
  },
  {
    id: 'ai-automation',
    label: 'AI / automatyzacja',
    description: 'Asystent AI, automatyzacja procesu albo narzędzie wewnętrzne.',
    projectType: 'ai_automation',
    allowedQueryValues: ['ai_automation'],
  },
  {
    id: 'technology-consultation',
    label: 'Konsultacja techniczna',
    description: 'Dobór architektury, API, integracji lub kolejnego kroku.',
    projectType: 'backend_api',
    allowedQueryValues: ['backend_api'],
  },
] satisfies readonly ContactIntentOption[];

export const budgetRangeOptions = [
  { value: 'under_10k_pln', label: 'poniżej 10 tys. PLN' },
  { value: '10k_25k_pln', label: '10-25 tys. PLN' },
  { value: '25k_50k_pln', label: '25-50 tys. PLN' },
  { value: '50k_100k_pln', label: '50-100 tys. PLN' },
  { value: 'over_100k_pln', label: 'powyżej 100 tys. PLN' },
  { value: 'not_sure', label: 'nie wiem jeszcze' },
] satisfies readonly SelectOption<BudgetRange>[];
