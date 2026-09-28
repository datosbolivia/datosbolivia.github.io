#!/usr/bin/env node

/**
 * Validador Oficial OKF & ODKF v0.2 para DataMesh Bolivia
 * Conforme a la especificación normativa de datamesh-sdk y okf-knowledge-base
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = process.cwd();

// Colores ANSI para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const VALID_OKF_TYPES = new Set([
  'dataset',
  'catalog',
  'concept',
  'decision',
  'normative',
  'guide',
  'playbook',
  'service',
  'indicator',
  'document',
  'page',
  'blog'
]);

const VALID_FRICTIONLESS_TYPES = new Set([
  'string',
  'number',
  'integer',
  'boolean',
  'object',
  'array',
  'date',
  'time',
  'datetime',
  'year',
  'yearmonth',
  'duration',
  'geopoint',
  'geojson',
  'any'
]);

const VALID_POLICIES = new Set(['allow_all', 'zero_microdata', 'deny']);

let totalAudited = 0;
let errorsCount = 0;
let warningsCount = 0;
const findings = [];

function recordFinding(file, type, message) {
  if (type === 'ERROR') errorsCount++;
  if (type === 'WARN') warningsCount++;
  findings.push({ file: path.relative(rootDir, file), type, message });
}

function parseFrontmatter(content, filePath) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) {
    return null;
  }
  const endIndex = trimmed.indexOf('\n---', 3);
  if (endIndex === -1) {
    return null;
  }
  const rawYaml = trimmed.slice(3, endIndex).trim();
  try {
    const parsed = yaml.load(rawYaml);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (e) {
    recordFinding(filePath, 'ERROR', `Error al analizar YAML Frontmatter: ${e.message}`);
    return null;
  }
}

/**
 * 1. Audita un archivo Markdown
 */
function auditMarkdownFile(filePath) {
  totalAudited++;
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Regla OKF: index.md y log.md son reservados
  const isReserved = filename === 'index.md' || filename === 'log.md';

  const fm = parseFrontmatter(content, filePath);

  if (!isReserved) {
    if (!fm) {
      recordFinding(filePath, 'ERROR', 'Falta el bloque Frontmatter YAML delimitado por ---');
      return;
    }

    if (!fm.type || typeof fm.type !== 'string' || !fm.type.trim()) {
      recordFinding(filePath, 'ERROR', 'El campo "type" es obligatorio en el Frontmatter (OKF v0.2)');
    } else if (!VALID_OKF_TYPES.has(fm.type.toLowerCase())) {
      recordFinding(filePath, 'WARN', `Tipo no estándar "${fm.type}". Se recomienda usar tipos normativos.`);
    }

    if (!fm.title) {
      recordFinding(filePath, 'WARN', 'Se recomienda incluir el campo "title" en el Frontmatter');
    }

    // Validación específica para datasets ODKF
    if (fm.type === 'dataset') {
      if (!fm.contracts || !Array.isArray(fm.contracts) || fm.contracts.length === 0) {
        recordFinding(filePath, 'WARN', 'Un dataset ODKF debería declarar al menos un contrato en "contracts"');
      } else {
        for (const c of fm.contracts) {
          const cPath = typeof c === 'string' ? c : c.path;
          if (cPath) {
            const resolvedPath = path.resolve(path.dirname(filePath), cPath);
            if (!fs.existsSync(resolvedPath)) {
              recordFinding(filePath, 'ERROR', `El contrato referenciado no existe en disco: ${cPath}`);
            }
          }
        }
      }
    }

    // Validación específica para ADRs
    if (fm.type === 'decision') {
      if (!fm.status) {
        recordFinding(filePath, 'WARN', 'Un ADR debería incluir el campo "status" (Aceptado, Propuesto, etc.)');
      }
    }
  }

  // Comprobar enlaces locales
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    if (
      url.startsWith('http://') || 
      url.startsWith('https://') || 
      url.startsWith('file://') || 
      url.startsWith('#') || 
      url.startsWith('mailto:') ||
      url === '...' ||
      url.includes('${')
    ) {
      continue;
    }
    // Enlace relativo
    const targetPath = url.split('#')[0];
    if (targetPath.startsWith('/nodes/')) continue;
    const targetFile = path.resolve(path.dirname(filePath), targetPath);
    if (targetFile.startsWith(rootDir) && !fs.existsSync(targetFile)) {
      recordFinding(filePath, 'WARN', `Enlace relativo roto hacia: ${url}`);
    }
  }
}

/**
 * 2. Audita un archivo DataPackage Frictionless
 */
function auditDatapackageFile(filePath) {
  totalAudited++;
  let dp;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (filePath.endsWith('.json')) {
      dp = JSON.parse(content);
    } else {
      dp = yaml.load(content);
    }
  } catch (e) {
    recordFinding(filePath, 'ERROR', `Error de sintaxis en DataPackage: ${e.message}`);
    return;
  }

  if (!dp || typeof dp !== 'object') {
    recordFinding(filePath, 'ERROR', 'DataPackage inválido o vacío');
    return;
  }

  if (!dp.resources || !Array.isArray(dp.resources) || dp.resources.length === 0) {
    recordFinding(filePath, 'ERROR', 'DataPackage debe contener un arreglo no vacío de "resources"');
    return;
  }

  for (let idx = 0; idx < dp.resources.length; idx++) {
    const res = dp.resources[idx];
    const resLabel = res.name || `recurso #${idx + 1}`;

    if (!res.name) {
      recordFinding(filePath, 'WARN', `El recurso #${idx + 1} no tiene nombre asignado ("name")`);
    }

    if (!res.path && !res.data) {
      recordFinding(filePath, 'ERROR', `El recurso "${resLabel}" no define ni "path" ni "data"`);
    }

    if (res.policy && !VALID_POLICIES.has(res.policy)) {
      recordFinding(filePath, 'WARN', `Política desconocida "${res.policy}" en "${resLabel}". Válidas: allow_all, zero_microdata, deny`);
    }

    if (res.schema && res.schema.fields) {
      if (!Array.isArray(res.schema.fields)) {
        recordFinding(filePath, 'ERROR', `schema.fields debe ser una lista en "${resLabel}"`);
      } else {
        for (const field of res.schema.fields) {
          if (!field.name) {
            recordFinding(filePath, 'ERROR', `Campo sin nombre en "${resLabel}"`);
          }
          if (field.type && !VALID_FRICTIONLESS_TYPES.has(field.type.toLowerCase())) {
            recordFinding(filePath, 'WARN', `Tipo Frictionless no estándar "${field.type}" en columna "${field.name}" de "${resLabel}"`);
          }
        }
      }
    }
  }
}

/**
 * Escaneo recursivo de directorios
 */
function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.astro' || entry.name === '.venv') {
        continue;
      }
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.md')) {
        auditMarkdownFile(fullPath);
      } else if (entry.name.startsWith('datapackage.') && (entry.name.endsWith('.json') || entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
        auditDatapackageFile(fullPath);
      }
    }
  }
}

// ============================================================================
// Ejecución Principal
// ============================================================================

console.log(`${colors.bold}${colors.cyan}====================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Linter Normativo OKF & ODKF v0.2 — DataMesh Bolivia              ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================================${colors.reset}\n`);

// Auditar carpetas del ecosistema
const auditDirs = [
  path.join(rootDir, 'knowledge'),
  path.join(rootDir, 'docs'),
  path.join(rootDir, 'content')
];

for (const d of auditDirs) {
  scanDirectory(d);
}

// Imprimir Hallazgos
if (findings.length > 0) {
  console.log(`${colors.bold}Hallazgos de Auditoría:${colors.reset}\n`);
  for (const f of findings) {
    const color = f.type === 'ERROR' ? colors.red : colors.yellow;
    console.log(`  [${color}${f.type}${colors.reset}] ${colors.bold}${f.file}${colors.reset}`);
    console.log(`         ${f.message}\n`);
  }
}

// Resumen Final
console.log(`${colors.cyan}--------------------------------------------------------------------${colors.reset}`);
console.log(`Archivos Auditados: ${colors.bold}${totalAudited}${colors.reset}`);
console.log(`Errores:           ${errorsCount > 0 ? colors.red : colors.green}${colors.bold}${errorsCount}${colors.reset}`);
console.log(`Advertencias:      ${warningsCount > 0 ? colors.yellow : colors.green}${colors.bold}${warningsCount}${colors.reset}`);
console.log(`${colors.cyan}--------------------------------------------------------------------${colors.reset}\n`);

if (errorsCount > 0) {
  console.log(`${colors.red}${colors.bold}✖ Falló la validación ODKF v0.2. Corrige los errores antes de publicar.${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}✔ Todos los bundles y contratos cumplen con OKF & ODKF v0.2.${colors.reset}\n`);
  process.exit(0);
}
