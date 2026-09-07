import type { ProjectType } from '../../services/contact-api.types';
import type { StaticRoutePath } from './site-content.types';

interface ServiceEntry {
  readonly id: string;
  readonly path: StaticRoutePath;
  readonly label: string;
  readonly problem: string;
  readonly result: string;
  readonly projectType: ProjectType;
  readonly legacyAnchor: string;
}

export const serviceCatalog = [
  {
    id: 'automation',
    path: '/rozwiazania/automatyzacja-procesow',
    label: 'Wiadomości i dokumenty',
    problem: 'Przepisujesz dane z wiadomości do systemu.',
    result: 'Dane i propozycja zmiany gotowe do sprawdzenia przed zapisem.',
    projectType: 'business_process_automation',
    legacyAnchor: 'automatyzacja-wiadomosci-i-dokumentow',
  },
  {
    id: 'rag',
    path: '/rozwiazania/chatbot-ai-dla-firm',
    label: 'Wiedza firmy',
    problem: 'Szukasz odpowiedzi w rozproszonych materiałach.',
    result: 'Odpowiedź ze źródłem, które można sprawdzić.',
    projectType: 'rag_chatbot_demo',
    legacyAnchor: 'asystent-wiedzy',
  },
  {
    id: 'voice',
    path: '/rozwiazania/voice-ai-dla-firm',
    label: 'Obsługa telefonów / Voice AI',
    problem: 'Powtarzalne rozmowy zajmują czas zespołu.',
    result: 'Zebrana sprawa i następne zadanie dla pracownika.',
    projectType: 'voice_agent_demo',
    legacyAnchor: 'voice-ai',
  },
  {
    id: 'whatsapp',
    path: '/rozwiazania/integracje-whatsapp-crm',
    label: 'Rozmowy w CRM',
    problem: 'Konwersacja kończy się bez właściciela i statusu sprawy.',
    result: 'Wiadomość powiązana z rekordem i odpowiedzialną osobą.',
    projectType: 'whatsapp_agent_management',
    legacyAnchor: 'integracje-kanalow',
  },
  {
    id: 'agents',
    path: '/rozwiazania/systemy-agentowe',
    label: 'Zadania wieloetapowe',
    problem: 'Zadanie wymaga danych i działań w kilku systemach.',
    result: 'Wynik z przebiegiem kroków i akceptacją ważnej decyzji.',
    projectType: 'ai_automation',
    legacyAnchor: 'system-agentowy',
  },
] as const satisfies readonly ServiceEntry[];

export type ServiceContext = (typeof serviceCatalog)[number]['id'];

export function serviceFromQuery(value: string | null) {
  return serviceCatalog.find((service) => service.id === value);
}
