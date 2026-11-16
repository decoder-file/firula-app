#!/usr/bin/env node
/**
 * Checagem antes de gerar a versão de loja (yarn release:check).
 *
 * Toda variável EXPO_PUBLIC_* do .env.production vai embutida no app publicado — qualquer um
 * pode extrair. Este script falha se houver algo que pareça segredo nelas, e confere a versão.
 * Não mostra os valores, só os nomes das variáveis.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const problems = [];
const warnings = [];

function parseEnv(path) {
  if (!existsSync(path)) return null;
  const vars = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) vars[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return vars;
}

// Prefixos de chaves secretas conhecidas (não podem ir para o app).
const SECRET_PATTERNS = [
  { re: /^phx_/, what: "chave pessoal do PostHog (phx_)" },
  { re: /^sk_(live|test)_/, what: "chave secreta (sk_)" },
  { re: /^-----BEGIN/, what: "chave privada" },
  { re: /^re_[A-Za-z0-9]{8,}/, what: "chave do Resend" },
  { re: /^\$aact_/, what: "chave do Asaas" },
];

const env = parseEnv(resolve(root, ".env.production"));
if (!env) {
  problems.push(".env.production não encontrado.");
} else {
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith("EXPO_PUBLIC_")) continue;
    const secret = SECRET_PATTERNS.find((pattern) => pattern.re.test(value));
    if (secret) problems.push(`${name} contém uma ${secret.what}. Ela iria embutida no app — troque pelo valor público.`);
  }
  const posthog = env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!posthog) warnings.push("EXPO_PUBLIC_POSTHOG_KEY vazio: o app sai sem analytics.");
  else if (!posthog.startsWith("phc_")) problems.push("EXPO_PUBLIC_POSTHOG_KEY precisa ser o token do projeto (phc_...), em PostHog → Settings → Project → Project token.");
  for (const required of ["EXPO_PUBLIC_API_URL", "EXPO_PUBLIC_WEBSITE_URL"]) {
    if (!env[required]) problems.push(`${required} vazio.`);
  }
}

const app = JSON.parse(readFileSync(resolve(root, "app.json"), "utf8")).expo;
const notes = readdirSync(resolve(root, "release-notes")).filter((file) => file.endsWith(".md"));
if (!notes.includes(`${app.version}.md`)) warnings.push(`Sem release-notes/${app.version}.md para a versão ${app.version}.`);

console.log(`Firula app ${app.version} — iOS build ${app.ios?.buildNumber}, Android versionCode ${app.android?.versionCode}`);
for (const warning of warnings) console.log(`  aviso: ${warning}`);
if (problems.length) {
  console.error("\nNão gere a versão ainda:");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log("  ✓ variáveis públicas sem segredos");
