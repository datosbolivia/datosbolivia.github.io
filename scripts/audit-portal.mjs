#!/usr/bin/env node

/**
 * Script de Auditoría Integral DataMesh Bolivia
 * Valida:
 *  1. Cumplimiento normativo OKF / ODKF v0.2
 *  2. Política estricta "No Tags / No Badges" en templates
 *  3. Neutralidad institucional (sin nombres propios ni referencias sesgadas)
 *  4. Topología exacta de 5 rutas canónicas
 *  5. Contratos de diseño para explorador Obsidian (zero scroll, button resets)
 *  6. Paridad y cobertura i18n (ES / EN)
 *  7. Exposición de contexto para LLMs (llms.txt, llms-full.txt)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let errorsCount = 0;
let warningsCount = 0;
const results = [];

function check(name, pass, message) {
  if (pass) {
    results.push({ status: 'PASS', name, message: message || 'OK' });
  } else {
    errorsCount++;
    results.push({ status: 'FAIL', name, message });
  }
}

function warn(name, message) {
  warningsCount++;
  results.push({ status: 'WARN', name, message });
}

console.log(`${colors.bold}${colors.cyan}====================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Auditoría Integral del Portal DataMesh Bolivia                    ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================================${colors.reset}\n`);

// 1. Verificación de Linter OKF/ODKF
try {
  const linterOutput = execSync('node scripts/lint-okf.mjs', { cwd: rootDir, encoding: 'utf-8' });
  check('Linter OKF & ODKF v0.2', !linterOutput.includes('Falló la validación'), 'Todos los bundles, contratos y schemas son conformes');
} catch (e) {
  check('Linter OKF & ODKF v0.2', false, `Falla en linter normativo: ${e.message}`);
}

// 2. Verificación de 5 Rutas Canónicas
const canonicalRoutes = [
  { path: '/', file: 'src/pages/index.astro' },
  { path: '/datasets', file: 'src/pages/datasets/index.astro' },
  { path: '/datasets/[slug]', file: 'src/pages/datasets/[slug].astro' },
  { path: '/about', file: 'src/pages/about.astro' },
  { path: '/docs', file: 'src/pages/docs/index.astro' },
  { path: '/download', file: 'src/pages/download.astro' }
];

for (const r of canonicalRoutes) {
  const exists = fs.existsSync(path.join(rootDir, r.file));
  check(`Ruta canónica: ${r.path}`, exists, exists ? `Presente en ${r.file}` : `Falta archivo ${r.file}`);
}

// 3. Verificación de Política "No Tags / No Badges" en templates
const astroFiles = [];
function findAstroFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) findAstroFiles(p);
    else if (item.name.endsWith('.astro')) astroFiles.push(p);
  }
}
findAstroFiles(path.join(rootDir, 'src'));

let badgeViolations = [];
for (const file of astroFiles) {
  const relPath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf-8');
  // Buscar clases o patrones que intenten renderizar tags tipo cápsula
  if (content.includes('class="badge"') || content.includes("class='badge'") || content.includes('class="tag"') || content.includes("class='tag'")) {
    badgeViolations.push(relPath);
  }
  if (content.match(/tags\.map\s*\(/)) {
    badgeViolations.push(`${relPath} (itera y renderiza tags frontmatter)`);
  }
}
check(
  'Política Estricta No-Tags / No-Badges',
  badgeViolations.length === 0,
  badgeViolations.length === 0 
    ? 'Ningún template renderiza etiquetas, badges o cápsulas decorativas' 
    : `Encontradas violaciones en: ${badgeViolations.join(', ')}`
);

// 4. Verificación de Neutralidad Institucional
const sensitivePatterns = [
  /zenodo\.22986311/i,
  /datamesh-charla20250812/i,
  /facebook\.com\/share\/v\/1GSaKvkyGn/i,
  /Andres Chirinos/i
];

const filesToInspectForNeutrality = [
  'portal.config.ts',
  'src/pages/index.astro',
  'src/pages/about.astro',
  'src/pages/download.astro',
  'src/pages/llms.txt.ts',
  'src/pages/llms-full.txt.ts',
  'content/pages/about.md',
  'content/pages/home.md'
];

let neutralityViolations = [];
for (const rel of filesToInspectForNeutrality) {
  const full = path.join(rootDir, rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf-8');
  for (const pattern of sensitivePatterns) {
    if (pattern.test(content)) {
      neutralityViolations.push(`${rel} contiene coincidencia con ${pattern}`);
    }
  }
}
check(
  'Neutralidad Institucional',
  neutralityViolations.length === 0,
  neutralityViolations.length === 0
    ? 'Configuración y páginas libres de nombres propios, whitepapers o charlas personales'
    : `Infracciones de neutralidad: ${neutralityViolations.join(', ')}`
);

// 5. Contratos de Diseño para Explorador Obsidian
const datasetSlugFile = path.join(rootDir, 'src/pages/datasets/[slug].astro');
const themeCssFile = path.join(rootDir, 'src/styles/theme.css');

if (fs.existsSync(datasetSlugFile) && fs.existsSync(themeCssFile)) {
  const datasetContent = fs.readFileSync(datasetSlugFile, 'utf-8');
  const cssContent = fs.readFileSync(themeCssFile, 'utf-8');

  // Comprobar clase layout obsidian
  const hasObsidianLayout = datasetContent.includes('obsidian-layout') && cssContent.includes('.obsidian-layout');
  check('Explorador Obsidian: Contenedor .obsidian-layout', hasObsidianLayout, 'Estructura de explorador condensado declarada');

  // Comprobar reseteo de estilos nativos de botones
  const hasButtonReset = cssContent.includes('all: unset;') && cssContent.includes('obsidian-file-item');
  check('Explorador Obsidian: Reseteo de Botones Nativos', hasButtonReset, 'Regla "all: unset;" previene estilo gris/3D nativo del SO');

  // Comprobar que no duplique el título del dataset sobre el markdown
  const hasDuplicateHeader = datasetContent.includes('<div class="dataset-header">') && datasetContent.includes('<h1>{dataset.title}</h1>');
  check('Explorador Obsidian: Cero Títulos Duplicados', !hasDuplicateHeader, 'Contexto e index.md suministran el título principal');

  // Comprobar altura acotada zero-scroll
  const hasZeroScrollConstraint = cssContent.includes('calc(100vh - var(--header-height)');
  check('Explorador Obsidian: Viewport Bounded (Zero Scroll)', hasZeroScrollConstraint, 'Layout restringe scroll a los paneles internos');
} else {
  check('Explorador Obsidian: Archivos Requeridos', false, 'Faltan archivos para validar explorador Obsidian');
}

// 6. Paridad y Cobertura i18n
const i18nFile = path.join(rootDir, 'src/lib/i18n.ts');
if (fs.existsSync(i18nFile)) {
  const content = fs.readFileSync(i18nFile, 'utf-8');
  // Extraer claves de translations ES y EN
  const esMatch = content.match(/es:\s*\{([\s\S]*?)\n\s*\},/);
  const enMatch = content.match(/en:\s*\{([\s\S]*?)\n\s*\}/);

  if (esMatch && enMatch) {
    const extractKeys = (block) => {
      const keys = [];
      const regex = /'([^']+)'\s*:/g;
      let m;
      while ((m = regex.exec(block)) !== null) {
        keys.push(m[1]);
      }
      return keys;
    };

    const esKeys = extractKeys(esMatch[1]);
    const enKeys = extractKeys(enMatch[1]);

    const missingInEn = esKeys.filter(k => !enKeys.includes(k));
    const missingInEs = enKeys.filter(k => !esKeys.includes(k));

    const i18nParity = missingInEn.length === 0 && missingInEs.length === 0;
    const details = i18nParity 
      ? `Paridad completa (${esKeys.length} claves verificadas en ES y EN)`
      : `Faltan en EN: [${missingInEn.join(', ')}], Faltan en ES: [${missingInEs.join(', ')}]`;

    check('Paridad de Internacionalización i18n', i18nParity, details);
  } else {
    warn('Paridad i18n', 'No se pudieron extraer bloques ES y EN para comparar claves');
  }
} else {
  check('Paridad i18n: src/lib/i18n.ts', false, 'No existe src/lib/i18n.ts');
}

// 7. Contexto para LLMs (llms.txt)
const llmsTxt = fs.existsSync(path.join(rootDir, 'src/pages/llms.txt.ts'));
const llmsFullTxt = fs.existsSync(path.join(rootDir, 'src/pages/llms-full.txt.ts'));
check('Exposición LLM: llms.txt & llms-full.txt', llmsTxt && llmsFullTxt, 'Endpoints estáticos listos para indexación por agentes LLM');

// Resumen de Resultados
console.log(`${colors.bold}Resultados de la Auditoría:${colors.reset}\n`);
for (const r of results) {
  let symbol, color;
  if (r.status === 'PASS') {
    symbol = '✔';
    color = colors.green;
  } else if (r.status === 'FAIL') {
    symbol = '✖';
    color = colors.red;
  } else {
    symbol = '⚠';
    color = colors.yellow;
  }
  console.log(`  [${color}${symbol} ${r.status}${colors.reset}] ${colors.bold}${r.name}${colors.reset}`);
  console.log(`         ${r.message}`);
}

console.log(`\n${colors.cyan}--------------------------------------------------------------------${colors.reset}`);
console.log(`Total Pruebas: ${colors.bold}${results.length}${colors.reset}`);
console.log(`Errores:       ${errorsCount > 0 ? colors.red : colors.green}${colors.bold}${errorsCount}${colors.reset}`);
console.log(`Advertencias:  ${warningsCount > 0 ? colors.yellow : colors.green}${colors.bold}${warningsCount}${colors.reset}`);
console.log(`${colors.cyan}--------------------------------------------------------------------${colors.reset}\n`);

if (errorsCount > 0) {
  console.log(`${colors.red}${colors.bold}✖ Auditoría fallida. Se deben corregir las discrepancias.${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}✔ Todas las auditorías pasaron satisfactoriamente.${colors.reset}\n`);
  process.exit(0);
}
