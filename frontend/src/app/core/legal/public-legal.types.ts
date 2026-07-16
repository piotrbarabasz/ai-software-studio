export interface PublicLegalConfiguration {
  readonly administrator: {
    readonly name: string;
    readonly correspondenceAddress: string;
    readonly privacyContact: string;
  };
  readonly processing: {
    readonly purposes: readonly string[];
    readonly legalBases: readonly string[];
    readonly retention: readonly string[];
    readonly recipients: readonly string[];
    readonly infrastructureProviders: readonly string[];
    readonly emailProviders: readonly string[];
    readonly dataSubjectRights: readonly string[];
  };
  readonly updatedAt: string;
}
