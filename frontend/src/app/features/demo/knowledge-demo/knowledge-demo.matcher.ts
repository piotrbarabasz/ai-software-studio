import type { KnowledgeDemoScenario } from '../../../core/content/site-content.types';

const LONG_PHRASE_MIN_LENGTH = 10;
const MIN_KEYWORD_HITS = 2;

export function normalizeDemoQuestion(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchDemoScenario(
  question: string,
  scenarios: readonly KnowledgeDemoScenario[],
): KnowledgeDemoScenario | undefined {
  const normalizedQuestion = normalizeDemoQuestion(question);
  if (!normalizedQuestion) {
    return undefined;
  }

  const exactScenario = findExactScenario(normalizedQuestion, scenarios);
  if (exactScenario) {
    return exactScenario;
  }

  const phraseScenario = findBestPhraseScenario(normalizedQuestion, scenarios);
  if (phraseScenario) {
    return phraseScenario;
  }

  return findBestKeywordScenario(normalizedQuestion, scenarios);
}

function findExactScenario(
  normalizedQuestion: string,
  scenarios: readonly KnowledgeDemoScenario[],
): KnowledgeDemoScenario | undefined {
  for (const scenario of scenarios) {
    if (normalizeDemoQuestion(scenario.question) === normalizedQuestion) {
      return scenario;
    }

    for (const alias of scenario.aliases) {
      if (normalizeDemoQuestion(alias) === normalizedQuestion) {
        return scenario;
      }
    }
  }

  return undefined;
}

function findBestPhraseScenario(
  normalizedQuestion: string,
  scenarios: readonly KnowledgeDemoScenario[],
): KnowledgeDemoScenario | undefined {
  let bestScenario: KnowledgeDemoScenario | undefined;
  let bestScore = 0;
  let bestCount = 0;

  for (const scenario of scenarios) {
    const score = countPhraseMatches(normalizedQuestion, scenario);
    if (score === 0) {
      continue;
    }

    if (score > bestScore) {
      bestScenario = scenario;
      bestScore = score;
      bestCount = 1;
      continue;
    }

    if (score === bestScore) {
      bestCount += 1;
    }
  }

  return bestCount === 1 ? bestScenario : undefined;
}

function countPhraseMatches(normalizedQuestion: string, scenario: KnowledgeDemoScenario): number {
  const phrases = new Set<string>();
  const candidates = [scenario.question, ...scenario.aliases];

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeDemoQuestion(candidate);
    if (normalizedCandidate.length < LONG_PHRASE_MIN_LENGTH) {
      continue;
    }

    if (containsPhrase(normalizedQuestion, normalizedCandidate)) {
      phrases.add(normalizedCandidate);
    }
  }

  return phrases.size;
}

function findBestKeywordScenario(
  normalizedQuestion: string,
  scenarios: readonly KnowledgeDemoScenario[],
): KnowledgeDemoScenario | undefined {
  let bestScenario: KnowledgeDemoScenario | undefined;
  let bestScore = 0;
  let bestCount = 0;

  for (const scenario of scenarios) {
    const score = countKeywordHits(normalizedQuestion, scenario.keywords);
    if (score < MIN_KEYWORD_HITS) {
      continue;
    }

    if (score > bestScore) {
      bestScenario = scenario;
      bestScore = score;
      bestCount = 1;
      continue;
    }

    if (score === bestScore) {
      bestCount += 1;
    }
  }

  return bestCount === 1 ? bestScenario : undefined;
}

function countKeywordHits(normalizedQuestion: string, keywords: readonly string[]): number {
  const hits = new Set<string>();

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeDemoQuestion(keyword);
    if (!normalizedKeyword) {
      continue;
    }

    if (containsPhrase(normalizedQuestion, normalizedKeyword)) {
      hits.add(normalizedKeyword);
    }
  }

  return hits.size;
}

function containsPhrase(haystack: string, needle: string): boolean {
  return ` ${haystack} `.includes(` ${needle} `);
}
