import type { BudgetRange, ProjectType } from '../../services/contact-api.types';
import type { SelectOption } from './site-content.types';

export type VisibleProjectType = Extract<
  ProjectType,
  | 'mvp_prototype'
  | 'custom_web_app'
  | 'backend_api'
  | 'business_process_automation'
  | 'rag_chatbot_demo'
  | 'other'
>;

export const projectTypeOptions = [
  { value: 'mvp_prototype', label: 'Demo lub sprawdzenie pomysłu' },
  { value: 'custom_web_app', label: 'Aplikacja albo panel' },
  { value: 'backend_api', label: 'Integracja lub API' },
  { value: 'business_process_automation', label: 'Automatyzacja procesu' },
  { value: 'rag_chatbot_demo', label: 'Asystent AI lub RAG' },
  { value: 'other', label: 'Nie wiem / inny temat' },
] satisfies readonly SelectOption<VisibleProjectType>[];

const projectTypeQueryMap: Readonly<Record<ProjectType, VisibleProjectType>> = {
  mvp_prototype: 'mvp_prototype',
  custom_web_app: 'custom_web_app',
  backend_api: 'backend_api',
  business_process_automation: 'business_process_automation',
  rag_chatbot_demo: 'rag_chatbot_demo',
  other: 'other',
  ai_automation: 'business_process_automation',
  email_automation: 'business_process_automation',
  voice_agent_demo: 'rag_chatbot_demo',
  whatsapp_agent_management: 'rag_chatbot_demo',
  agent_management_panel: 'custom_web_app',
  dashboard_internal_tool: 'custom_web_app',
  external_integration: 'backend_api',
  website_seo: 'other',
};

export function projectTypeFromQuery(value: string | null): VisibleProjectType | null {
  if (value === null) {
    return null;
  }

  return projectTypeQueryMap[value as ProjectType] ?? 'other';
}

export const budgetRangeOptions = [
  { value: 'under_10k_pln', label: 'poniżej 10 tys. PLN' },
  { value: '10k_25k_pln', label: '10-25 tys. PLN' },
  { value: '25k_50k_pln', label: '25-50 tys. PLN' },
  { value: '50k_100k_pln', label: '50-100 tys. PLN' },
  { value: 'over_100k_pln', label: 'powyżej 100 tys. PLN' },
  { value: 'not_sure', label: 'Jeszcze nie wiem' },
] satisfies readonly SelectOption<BudgetRange>[];
