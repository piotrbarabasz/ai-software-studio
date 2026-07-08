import type { BudgetRange, ProjectType } from '../../services/contact-api.types';
import type { SelectOption } from './landing-content.types';

export const projectTypeOptions = [
  { value: 'rag_chatbot_demo', label: 'Chatbot RAG z bazą wiedzy' },
  { value: 'website_seo', label: 'Strona internetowa + SEO' },
  { value: 'voice_agent_demo', label: 'Voice agent - demo rozmowy' },
  { value: 'whatsapp_agent_management', label: 'Zarządzanie agentami przez WhatsApp' },
  { value: 'email_automation', label: 'Automatyzacja e-mail' },
  { value: 'agent_management_panel', label: 'Panel zarządzania agentami' },
  { value: 'custom_web_app', label: 'Aplikacja webowa' },
  { value: 'ai_automation', label: 'Demo AI, automatyzacja lub asystent' },
  { value: 'backend_api', label: 'Backend lub API' },
  { value: 'business_process_automation', label: 'Automatyzacja procesu' },
  { value: 'external_integration', label: 'Integracja z systemem' },
  { value: 'dashboard_internal_tool', label: 'Dashboard lub narzędzie wewnętrzne' },
  { value: 'mvp_prototype', label: 'MVP lub prototyp' },
  { value: 'other', label: 'Inny temat' },
] satisfies readonly SelectOption<ProjectType>[];

export const budgetRangeOptions = [
  { value: 'under_10k_pln', label: 'poniżej 10 tys. PLN' },
  { value: '10k_25k_pln', label: '10-25 tys. PLN' },
  { value: '25k_50k_pln', label: '25-50 tys. PLN' },
  { value: '50k_100k_pln', label: '50-100 tys. PLN' },
  { value: 'over_100k_pln', label: 'powyżej 100 tys. PLN' },
  { value: 'not_sure', label: 'nie wiem jeszcze' },
] satisfies readonly SelectOption<BudgetRange>[];
