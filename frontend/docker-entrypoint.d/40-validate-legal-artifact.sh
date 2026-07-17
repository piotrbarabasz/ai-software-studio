#!/bin/sh
set -eu

artifact_root=/usr/share/nginx/html
privacy_document="$artifact_root/polityka-prywatnosci/index.html"
validation_marker="$artifact_root/.legal-config-validated"

if [ ! -s "$privacy_document" ]; then
  echo "Błąd: brak prerenderowanej polityki prywatności w obrazie produkcyjnym." >&2
  exit 1
fi

if [ ! -s "$validation_marker" ]; then
  echo "Błąd: obraz nie zawiera potwierdzenia walidacji publicznej konfiguracji prawnej." >&2
  exit 1
fi

if grep -Eiq 'Testowa[[:space:]]+5|ai\.korepetycje3@gmail\.com|LEGAL_REQUIRED|(^|[^[:alnum:]_])(example|sample|dummy|fixture|configured|placeholder)([^[:alnum:]_]|$)|(^|[^[:alnum:]_])testow(a|y|e|ego|ej|emu|ym|ych|ymi|ą)([^[:alnum:]_]|$)' "$privacy_document"; then
  echo "Błąd: prerenderowana polityka prywatności zawiera zabronione dane testowe lub placeholder." >&2
  exit 1
fi

if grep -Eq '(^|[^[:alnum:]_])WPISZ([^[:alnum:]_]|$)' "$privacy_document"; then
  echo "Błąd: prerenderowana polityka prywatności zawiera placeholder WPISZ." >&2
  exit 1
fi

echo "Artefakt publicznej konfiguracji prawnej zweryfikowany przy starcie kontenera."
