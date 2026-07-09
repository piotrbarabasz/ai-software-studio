# Infrastructure

The MVP keeps infrastructure implementation out of the main product scope.

Current deployment assets live under [`infra/gcp/`](gcp/).

Boundaries:

- No Terraform or Pulumi
- No production secrets committed to the repository
- No database, authentication, CMS, admin panel, payment flow, queue, or persistent storage
- No hidden deployment resources outside documented GCP files
