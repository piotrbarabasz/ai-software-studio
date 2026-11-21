# Polityka prywatności — konfiguracja techniczna

Ten dokument opisuje techniczny kontrakt. Administrator samodzielnie zatwierdza treść prawno-organizacyjną.

Konfiguracja prawna w Google Secret Manager: `aisoftware-studio-public-legal-config`. W produkcji Cloud Build pobiera ją tylko podczas budowania `landing/dist/polityka-prywatnosci/index.html`; źródłowy plik JSON jest tymczasowy, wykluczony z Git i obrazu Docker.

Za walidację odpowiada `landing/scripts/validate-public-legal-config.cjs`. Odrzuca puste lub przykładowe dane i wymaga dokładnie:

```json
{
  "administrator": { "name": "<zatwierdzona pełna nazwa>", "correspondenceAddress": "<zatwierdzony adres>" },
  "processing": {
    "purposes": ["<cel>"], "legalBases": ["<podstawa>"],
    "retention": ["<okres>"], "recipients": ["<odbiorcy>"],
    "infrastructureProviders": ["<dostawcy>"], "emailProviders": ["<poczta>"],
    "dataSubjectRights": ["<prawa>" ]
  },
  "updatedAt": "2026-11-21"
}
```

Znaczniki `<...>` w powyższym przykładzie **muszą zostać zastąpione** rzeczywistymi zatwierdzonymi danymi. Walidator nie przyjmie ich do produkcji.

Formularz działa przez własne FastAPI (bez Formspree). Hasło SMTP pozostaje sekretem backendu (`aisoftware-studio-smtp-password`) i nie trafia do frontendu.
