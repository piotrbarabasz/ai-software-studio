import { siteContent } from '../../../core/content/site.pl';
import type { KnowledgeDemoScenario } from '../../../core/content/site-content.types';
import { matchDemoScenario, normalizeDemoQuestion } from './knowledge-demo.matcher';

describe('knowledge-demo.matcher', () => {
  const scenarios = siteContent.demo.interactiveDemo.scenarios;

  function scenarioById(id: string): KnowledgeDemoScenario {
    const scenario = scenarios.find((item) => item.id === id);
    if (!scenario) {
      throw new Error(`missing scenario: ${id}`);
    }

    return scenario;
  }

  function makeScenario(
    id: string,
    question: string,
    keywords: readonly string[],
    aliases: readonly string[] = [],
  ): KnowledgeDemoScenario {
    return {
      id,
      categoryId: 'oferta',
      question,
      aliases,
      keywords,
      answer: `${id} answer`,
      sources: [`${id} source`],
      confidence: 'wysoka',
      status: 'answered',
    };
  }

  it('normalizes trim, case, diacritics, punctuation and spacing', () => {
    expect(normalizeDemoQuestion('  Ile kosztuje chatbot?  ')).toBe('ile kosztuje chatbot');
    expect(normalizeDemoQuestion('ILE KOSZTUJE CHATBOT!!!')).toBe('ile kosztuje chatbot');
    expect(normalizeDemoQuestion('Ile kosztuje chátbot')).toBe('ile kosztuje chatbot');
    expect(normalizeDemoQuestion('Ile,   kosztuje...   chatbot')).toBe('ile kosztuje chatbot');
  });

  it('matches an exact scenario question', () => {
    expect(matchDemoScenario('Ile kosztuje wdrożenie chatbota?', scenarios)).toBe(
      scenarioById('oferta-koszt-chatbota'),
    );
  });

  it('matches an exact alias', () => {
    expect(matchDemoScenario('jaka jest cena chatbota', scenarios)).toBe(
      scenarioById('oferta-koszt-chatbota'),
    );
  });

  it('matches a diacritic-insensitive alias', () => {
    expect(matchDemoScenario('ILE KOSZTUJE CHATBOT!!!', scenarios)).toBe(
      scenarioById('oferta-koszt-chatbota'),
    );
  });

  it('matches a question with punctuation and extra spaces', () => {
    expect(matchDemoScenario('  ile,  kosztuje...  chatbot  ', scenarios)).toBe(
      scenarioById('oferta-koszt-chatbota'),
    );
  });

  it('matches a scenario by at least two keywords', () => {
    expect(matchDemoScenario('potrzebuję koszt i wycena wdrożenia', scenarios)).toBe(
      scenarioById('oferta-koszt-chatbota'),
    );
  });

  it('matches a long phrase embedded in a longer question', () => {
    expect(
      matchDemoScenario(
        'Dzień dobry, chcę umówić bezpłatną prezentację dla zespołu sprzedaży.',
        scenarios,
      ),
    ).toBe(scenarioById('prezentacja-bezplatna'));
  });

  it('rejects ambiguous ties between two scenarios', () => {
    const tiedScenarios = [
      makeScenario('first', 'Pierwszy scenariusz', ['alpha', 'beta']),
      makeScenario('second', 'Drugi scenariusz', ['alpha', 'beta']),
    ] as const;

    expect(matchDemoScenario('alpha beta', tiedScenarios)).toBeUndefined();
  });

  it('returns undefined for empty, foreign and weather questions', () => {
    expect(matchDemoScenario('', scenarios)).toBeUndefined();
    expect(matchDemoScenario('napisz mi wiersz', scenarios)).toBeUndefined();
    expect(matchDemoScenario('jaka jutro pogoda', scenarios)).toBeUndefined();
  });

  it('matches the CRM scenario for a HubSpot question', () => {
    expect(matchDemoScenario('czy moze polaczyc sie z hubspot crm', scenarios)).toBe(
      scenarioById('obsluga-crm'),
    );
  });

  it('matches the CRM scenario for the HubSpot CRM alias phrase', () => {
    expect(matchDemoScenario('hubspot crm', scenarios)).toBe(scenarioById('obsluga-crm'));
  });

  it('matches the cost scenario for a pricing question', () => {
    expect(matchDemoScenario('ile kosztuje chatbot', scenarios)).toBe(
      scenarioById('oferta-koszt-chatbota'),
    );
  });

  it('matches the human handoff scenario', () => {
    expect(matchDemoScenario('przekazanie do człowieka', scenarios)).toBe(
      scenarioById('obsluga-handoff'),
    );
  });
});
