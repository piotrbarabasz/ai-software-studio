#!/usr/bin/env node
// Cross-platform Protolume workflow: explicit account/project, no global gcloud config changes.
// The local .env is never uploaded intentionally, and secrets belong in GCP Secret Manager.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = join(ROOT, '.env');
const APPROVAL = 'PUBLISH_PROTOLUME_V3_LIVE';

const PROJECT_PATTERN = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
const ACCOUNT_PATTERN = /^[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const REGION_PATTERN = /^[a-z]+-[a-z]+[0-9]$/;
const CHANNEL_PATTERN = /^[a-z][a-z0-9-]{0,62}$/;
const FORMSPREE_PATTERN = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/;

export function parseEnv(source) {
  const config = {};
  for (const [index, original] of source.replace(/^\uFEFF/, '').split(/\r?\n/).entries()) {
    const line = original.trim();
    if (!line || line.startsWith('#')) continue;

    const match = /^([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) throw new Error('Nieprawidłowa linia ' + (index + 1) + ' w .env.');
    const key = match[1];
    if (Object.hasOwn(config, key)) throw new Error('Powtórzona zmienna w .env: ' + key);

    let value = match[2].trim();
    if (value.startsWith('"') || value.startsWith("'")) {
      const quote = value[0];
      if (value.length < 2 || !value.endsWith(quote)) {
        throw new Error('Niedomknięty cudzysłów dla ' + key);
      }
      value = value.slice(1, -1);
    }
    if (/[\r\n\0]/.test(value)) throw new Error('Niedozwolony znak w ' + key);
    config[key] = value;
  }
  return config;
}

export function validateConfig(config, { release = false } = {}) {
  const errors = [];
  if (!PROJECT_PATTERN.test(config.GCP_PROJECT_ID || '')) {
    errors.push('GCP_PROJECT_ID musi być poprawnym identyfikatorem projektu GCP.');
  }
  if (!ACCOUNT_PATTERN.test(config.GCP_ACCOUNT || '')) {
    errors.push('GCP_ACCOUNT musi być adresem e-mail konta zalogowanego w gcloud.');
  }
  if (!REGION_PATTERN.test(config.GCP_REGION || '')) {
    errors.push('GCP_REGION musi mieć format regionu GCP, np. europe-central2.');
  }
  if (!CHANNEL_PATTERN.test(config.FIREBASE_PREVIEW_CHANNEL || '')) {
    errors.push('FIREBASE_PREVIEW_CHANNEL musi być bezpieczną nazwą kanału preview.');
  }
  if (config.FORM_ENDPOINT && !FORMSPREE_PATTERN.test(config.FORM_ENDPOINT)) {
    errors.push('FORM_ENDPOINT musi mieć postać https://formspree.io/f/ID.');
  }
  if (release && !config.FORM_ENDPOINT) {
    errors.push('Release wymaga prawdziwego FORM_ENDPOINT w .env.');
  }
  return errors;
}

export function buildGcloudArgs(command, config) {
  const errors = validateConfig(config, { release: command === 'release' });
  if (errors.length) throw new Error(errors.join('\n'));

  const common = [
    'builds', 'submit', '.',
    '--project=' + config.GCP_PROJECT_ID,
    '--account=' + config.GCP_ACCOUNT,
  ];

  if (command === 'preview') {
    return [
      ...common,
      '--config=infra/gcp/cloudbuild.landing-preview.yaml',
      '--substitutions=_PROJECT_ID=' + config.GCP_PROJECT_ID +
        ',_CHANNEL_ID=' + config.FIREBASE_PREVIEW_CHANNEL,
    ];
  }
  if (command === 'release') {
    return [
      ...common,
      '--config=infra/gcp/cloudbuild.landing-release.yaml',
      '--substitutions=_PROJECT_ID=' + config.GCP_PROJECT_ID +
        ',_FORM_ENDPOINT=' + config.FORM_ENDPOINT +
        ',_RELEASE_APPROVAL=' + APPROVAL,
    ];
  }
  throw new Error('Nieobsługiwana komenda Cloud Build: ' + command);
}

function loadEnv() {
  if (!existsSync(ENV_PATH)) {
    throw new Error('Brak pliku .env. Uruchom: Copy-Item .env.example .env (PowerShell) lub cp .env.example .env (Bash).');
  }
  return parseEnv(readFileSync(ENV_PATH, 'utf8'));
}

function run(executable, args, { env = process.env } = {}) {
  // On Windows "gcloud" is a .cmd shim, which requires the shell. Every value
  // inserted into gcloud arguments is validated above to avoid shell metacharacters.
  const isGcloud = executable === 'gcloud';
  const child = spawnSync(executable, args, {
    cwd: ROOT,
    env,
    stdio: 'inherit',
    shell: isGcloud && process.platform === 'win32',
  });
  if (child.error) throw new Error('Nie można uruchomić ' + executable + ': ' + child.error.message);
  if (child.status !== 0) throw new Error(executable + ' zakończył się błędem (kod ' + String(child.status) + ').');
}

function check() {
  run(process.execPath, [
    '--test', 'landing/build.test.mjs', 'landing/deployment.test.mjs', 'scripts/protolume.test.mjs',
  ]);
}

function previewLocal() {
  run(process.execPath, ['landing/build.mjs', '--preview']);
  run(process.execPath, ['landing/verify-dist.mjs', '--preview']);
  console.log('Podgląd lokalny gotowy w landing/dist. Brak zmian w GCP.');
}

function printHelp() {
  console.log([
    'Protolume v3 — .env + Makefile',
    '  make help             pokaż dostępne komendy',
    '  make doctor           sprawdź GCP i uprawnienia do bucketu Cloud Build',
    '  make check            testy statycznej strony i konfiguracji',
    '  make preview-local    zbuduj lokalny podgląd, bez GCP',
    '  make preview          wyślij build na tymczasowy Firebase Preview',
    '  make build-production lokalny build produkcyjny, bez publikacji',
    '  make release          RĘCZNE wydanie live, wymaga wpisania potwierdzenia',
    '',
    'Bez GNU Make: node scripts/protolume.mjs <komenda>',
    'Konfiguracja: .env (skopiuj z .env.example, plik jest ignorowany przez Git).',
  ].join('\n'));
}

async function confirmRelease() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Release musi być potwierdzony ręcznie w interaktywnym terminalu.');
  }
  console.log('UWAGA: ta operacja publikuje na kanale LIVE Firebase Hosting.');
  console.log('Nie przełącza automatycznie DNS protolume.pl, ale może zmienić stronę');
  console.log('na domenach już podłączonych do Firebase Hosting.');
  const reader = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await reader.question('Wpisz dokładnie ' + APPROVAL + ', aby kontynuować: ');
    if (answer !== APPROVAL) throw new Error('Release anulowany: brak wymaganego potwierdzenia.');
  } finally {
    reader.close();
  }
}

export async function main(command) {
  if (!command || command === 'help') {
    printHelp();
    return;
  }

  if (command === 'check') {
    check();
    return;
  }
  if (command === 'preview-local') {
    previewLocal();
    return;
  }

  const config = loadEnv();
  const errors = validateConfig(config, { release: command === 'release' });
  if (errors.length) throw new Error(errors.join('\n'));

  console.log('Projekt GCP: ' + config.GCP_PROJECT_ID);
  console.log('Konto gcloud: ' + config.GCP_ACCOUNT);
  console.log('Region Cloud Run: ' + config.GCP_REGION);

  if (command === 'doctor') {
    console.log('\nSprawdzam dostęp do projektu...');
    run('gcloud', [
      'projects', 'describe', config.GCP_PROJECT_ID,
      '--project=' + config.GCP_PROJECT_ID,
      '--account=' + config.GCP_ACCOUNT,
      '--format=value(projectId)',
    ]);
    console.log('Sprawdzam dostęp do bucketu Cloud Build...');
    run('gcloud', [
      'storage', 'buckets', 'describe', 'gs://' + config.GCP_PROJECT_ID + '_cloudbuild',
      '--project=' + config.GCP_PROJECT_ID,
      '--account=' + config.GCP_ACCOUNT,
    ]);
    console.log('Weryfikacja dostępu zakończona; uprawnienia do przesłania builda mogą wymagać dalszych kontroli.');
    return;
  }

  if (command === 'build-production') {
    if (!config.FORM_ENDPOINT) throw new Error('Brak FORM_ENDPOINT w .env.');
    if (!config.PUBLIC_LEGAL_CONFIG_PATH) throw new Error('Brak PUBLIC_LEGAL_CONFIG_PATH w .env.');
    const legalPath = isAbsolute(config.PUBLIC_LEGAL_CONFIG_PATH)
      ? config.PUBLIC_LEGAL_CONFIG_PATH : resolve(ROOT, config.PUBLIC_LEGAL_CONFIG_PATH);
    run(process.execPath, ['landing/build.mjs', '--production'], {
      env: {
        ...process.env,
        FORM_ENDPOINT: config.FORM_ENDPOINT,
        PUBLIC_LEGAL_CONFIG_PATH: legalPath,
      },
    });
    run(process.execPath, ['landing/verify-dist.mjs', '--production']);
    console.log('Artefakt produkcyjny zbudowany lokalnie. Nic nie zostało opublikowane.');
    return;
  }

  if (command === 'preview') {
    check();
    previewLocal();
    console.log('Uruchamiam wyłącznie Firebase Preview (' + config.FIREBASE_PREVIEW_CHANNEL + ').');
    run('gcloud', buildGcloudArgs('preview', config));
    return;
  }

  if (command === 'release') {
    check();
    await confirmRelease();
    run('gcloud', buildGcloudArgs('release', config));
    return;
  }

  throw new Error('Nieznana komenda: ' + command + '. Użyj: make help.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv[2]).catch((error) => {
    console.error('Błąd Protolume: ' + error.message);
    if (/gcloud zakończył się błędem/.test(error.message)) {
      console.error('Uwaga: .env ustawia kontekst, ale nie nadaje uprawnień IAM ani dostępu do bucketu Cloud Build.');
    }
    process.exitCode = 1;
  });
}
