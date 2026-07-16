import type { PublicLegalConfiguration } from './public-legal.types';

const required = (field: string): string => `__LEGAL_REQUIRED__:${field}`;

/**
 * Public, non-secret privacy data. Replace every __LEGAL_REQUIRED__ value before production.
 * The production build validates this module and fails with the missing field paths.
 */
export const publicLegalConfig = {
  administrator: {
    name: required('administrator.name'),
    correspondenceAddress: required('administrator.correspondenceAddress'),
    privacyContact: required('administrator.privacyContact'),
  },
  processing: {
    purposes: [required('processing.purposes')],
    legalBases: [required('processing.legalBases')],
    retention: [required('processing.retention')],
    recipients: [required('processing.recipients')],
    infrastructureProviders: ['Google Cloud Platform (Cloud Run)'],
    emailProviders: [required('processing.emailProviders')],
    dataSubjectRights: [required('processing.dataSubjectRights')],
  },
  updatedAt: required('updatedAt'),
} as const satisfies PublicLegalConfiguration;
