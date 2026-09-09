import observation from '../../../assets/evidence/retrieval-9bbe8d5/observation.json';

const sourceCases = observation.results.filter((item) => item.expectedFirst !== null);
const outsideCases = observation.results.filter((item) => item.expectedFirst === null);
const directory = '/assets/evidence/retrieval-9bbe8d5';

export const researchExperiment = {
  observation,
  sourceCases: sourceCases.length,
  sourceMatches: sourceCases.filter((item) => item.matchedExpectation).length,
  outsideCases: outsideCases.length,
  outsideMatches: outsideCases.filter((item) => item.matchedExpectation).length,
  failures: observation.results.filter((item) => !item.matchedExpectation),
  date: observation.recordedAt.slice(0, 10),
  report: directory + '/observation.json',
  instructions: directory + '/README.md',
  archive: directory + '/lexical-experiment.zip',
  manifest: directory + '/manifest.json',
} as const;
