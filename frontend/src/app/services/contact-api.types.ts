export type ProjectType =
  | 'rag_chatbot_demo'
  | 'website_seo'
  | 'voice_agent_demo'
  | 'whatsapp_agent_management'
  | 'email_automation'
  | 'agent_management_panel'
  | 'custom_web_app'
  | 'ai_automation'
  | 'backend_api'
  | 'business_process_automation'
  | 'external_integration'
  | 'dashboard_internal_tool'
  | 'mvp_prototype'
  | 'other';

export type BudgetRange =
  'under_10k_pln' | '10k_25k_pln' | '25k_50k_pln' | '50k_100k_pln' | 'over_100k_pln' | 'not_sure';

export interface ContactInquiryRequest {
  readonly name: string;
  readonly email: string;
  readonly company: string | null;
  readonly projectType: ProjectType;
  readonly budgetRange: BudgetRange;
  readonly message: string;
  readonly consent: true;
  readonly website?: string;
}

export interface ContactInquiryAccepted {
  readonly status: 'accepted';
  readonly message: string;
}

export interface ApiErrorResponse {
  readonly code: string;
  readonly message: string;
}
