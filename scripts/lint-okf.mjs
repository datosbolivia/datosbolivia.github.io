#!/usr/bin/env node

/**
 * Validador Oficial OKF & ODKF v0.3 para DataMesh Bolivia
 * Conforme a la especificación normativa de open-knowledge-format (SPEC.md v0.3) y datamesh-sdk
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
  'blog',
  'metric',
  'reference',
  'attested computation',
  'attested_computation',
  // W3C CURIEs & IRIs (OKF/ODKF v0.3)
  'dcat:dataset',
  'dcat:dataservice',
  'dcat:catalog',
  'dcat:catalogrecord',
  'dcat:distribution',
  'skos:concept',
  'skos:conceptscheme',
  'prov:entity',
  'prov:activity',
  'schema:dataset',
  'http://www.w3.org/ns/dcat#dataset',
  'http://www.w3.org/ns/dcat#dataservice',
  'http://www.w3.org/ns/dcat#catalog',
  'http://www.w3.org/ns/dcat#catalogrecord',
  'http://www.w3.org/2004/02/skos/core#concept'
]);

const DATASET_OR_SERVICE_TYPES = new Set([
  'dataset',
  'service',
  'dcat:dataset',
  'dcat:dataservice',
  'http://www.w3.org/ns/dcat#dataset',
  'http://www.w3.org/ns/dcat#dataservice'
]);

const VALID_NATURES = new Set([
  'tabular',
  'multidimensional',
  'geospatial',
  'document',
  'graph',
  'service_api',
  'model'
]);

const VALID_CONTRACT_TYPES = new Set([
  'datapackage',
  'sdmx',
  'ddi',
  'json_schema',
  'avro',
  'parquet',
  'dcat',
  'iso19115',
  'stac',
  'openapi',
  'asyncapi',
  'graphql',
  'grpc',
  'flight_sql',
  'sparql',
  'cwl',
  'owl-cli',
  'okf-cli',
  'cli_tool',
  'dbt'
]);

const CLI_CONTRACT_TYPES = new Set(['okf-cli', 'owl-cli', 'cli_tool']);

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
const VALID_POLICY_ENGINES = new Set(['okf_builtin', 'odrl', 'dpv', 'opa', 'rego', 'xacml']);

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

function validateUrlScheme(rawRef, filePath, label, allowSovereignTriad = false) {
  if (typeof rawRef !== 'string' || !rawRef.trim()) return;
  const trimmed = rawRef.trim();
  const match = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.\-]*):/);
  if (!match) return;
  const scheme = match[1].toLowerCase();
  const hasAuthority = trimmed.includes('://');
  const alwaysExplicit = new Set(['javascript', 'data', 'mailto', 'file', 'gopher', 'ftp']);
  if (!hasAuthority && !alwaysExplicit.has(scheme)) return;
  if (scheme === 'http' || scheme === 'https') return;
  if (allowSovereignTriad && (scheme === 'okf' || scheme === 'odkf' || scheme === 'datamesh')) return;
  recordFinding(filePath, 'ERROR', `OE6-INVALID-SCHEME en ${label}: esquema '${scheme}:' no permitido (solo http:// o https://)`);
}

function validateLocalPathContainment(relPath, baseDir, filePath, label) {
  const resolved = path.resolve(baseDir, relPath);
  const rootPrefix = rootDir.endsWith(path.sep) ? rootDir : `${rootDir}${path.sep}`;
  if (resolved !== rootDir && !resolved.startsWith(rootPrefix)) {
    recordFinding(filePath, 'ERROR', `OE7-PATH-TRAVERSAL en ${label}: ruta '${relPath}' escapa la raíz del repositorio`);
    return null;
  }
  return resolved;
}

function validateExtras(extrasVal, filePath) {
  if (extrasVal === undefined) return;
  if (!extrasVal || typeof extrasVal !== 'object' || Array.isArray(extrasVal)) {
    recordFinding(filePath, 'ERROR', 'El bloque "_extras" debe ser un mapeo objeto de espacios de nombres');
    return;
  }
  for (const [ns, kv] of Object.entries(extrasVal)) {
    if (!kv || typeof kv !== 'object' || Array.isArray(kv)) {
      recordFinding(filePath, 'ERROR', `El espacio de nombres "_extras.${ns}" debe ser un objeto clave-valor`);
    }
  }
}

function validatePolicyEntry(policyVal, contextLabel, filePath, baseDir) {
  if (policyVal === undefined || policyVal === null) return;
  if (typeof policyVal === 'string') {
    const norm = policyVal.trim().toLowerCase();
    if (norm.startsWith('{')) {
      try {
        validatePolicyEntry(JSON.parse(policyVal), contextLabel, filePath, baseDir);
        return;
      } catch {
        recordFinding(filePath, 'ERROR', `JSON inválido en política de ${contextLabel}`);
        return;
      }
    }
    if (!VALID_POLICIES.has(norm)) {
      recordFinding(filePath, 'WARN', `Política desconocida "${policyVal}" en ${contextLabel}. Válidas: allow_all, zero_microdata, deny`);
    }
    return;
  }

  if (typeof policyVal === 'object' && !Array.isArray(policyVal)) {
    if (policyVal.profile !== undefined) {
      if (typeof policyVal.profile !== 'string' || !VALID_POLICIES.has(policyVal.profile.trim().toLowerCase())) {
        recordFinding(filePath, 'WARN', `Perfil de política desconocido "${policyVal.profile}" en ${contextLabel}`);
      }
    }
    if (policyVal.min_group_size !== undefined) {
      if (typeof policyVal.min_group_size !== 'number' || policyVal.min_group_size < 1) {
        recordFinding(filePath, 'ERROR', `"min_group_size" debe ser un entero positivo en ${contextLabel}`);
      } else if (
        String(policyVal.profile || '').toLowerCase() === 'zero_microdata' &&
        policyVal.min_group_size < 5
      ) {
        recordFinding(filePath, 'WARN', `"min_group_size" (${policyVal.min_group_size}) es menor al mínimo recomendado (5) para zero_microdata en ${contextLabel}`);
      }
    }
    if (policyVal.type !== undefined) {
      const pType = String(policyVal.type).trim().toLowerCase();
      if (!VALID_POLICY_ENGINES.has(pType)) {
        recordFinding(filePath, 'WARN', `Motor de política no estándar "${policyVal.type}" en ${contextLabel}`);
      }
    }
    if (policyVal.ref !== undefined) {
      validateUrlScheme(policyVal.ref, filePath, `${contextLabel}.ref`, false);
    }
    if (policyVal.path !== undefined && typeof policyVal.path === 'string') {
      if (/^https?:\/\//i.test(policyVal.path)) {
        recordFinding(filePath, 'WARN', `PE4-REMOTE-IN-PATH en ${contextLabel}.path: usa "ref" para URLs remotas`);
      } else {
        validateLocalPathContainment(policyVal.path, baseDir, filePath, `${contextLabel}.path`);
      }
    }
    if (policyVal.rules !== undefined && !Array.isArray(policyVal.rules)) {
      recordFinding(filePath, 'ERROR', `"policy.rules" debe ser una lista en ${contextLabel}`);
    }
    const hasRecognizedStructure =
      policyVal.profile !== undefined ||
      policyVal.type !== undefined ||
      policyVal.ref !== undefined ||
      policyVal.path !== undefined ||
      policyVal.inline !== undefined ||
      policyVal.rules !== undefined ||
      policyVal.permission !== undefined ||
      policyVal.prohibition !== undefined ||
      policyVal['odrl:permission'] !== undefined ||
      policyVal['odrl:prohibition'] !== undefined ||
      policyVal['@graph'] !== undefined ||
      policyVal['@type'] !== undefined;
    if (!hasRecognizedStructure) {
      recordFinding(filePath, 'WARN', `Objeto de política sin campos ODRL/PolicySpec reconocidos en ${contextLabel}`);
    }
    return;
  }

  recordFinding(filePath, 'ERROR', `Política inválida en ${contextLabel}: se esperaba cadena o objeto ODRL/PolicySpec`);
}

function validateContractEntry(c, filePath, baseDir) {
  if (typeof c === 'string') {
    if (/^https?:\/\//i.test(c)) {
      recordFinding(filePath, 'WARN', `PE4-REMOTE-IN-PATH: contrato remoto declarado como cadena directa "${c}"`);
      return;
    }
    const resolved = validateLocalPathContainment(c, baseDir, filePath, 'contracts[]');
    if (resolved && !fs.existsSync(resolved)) {
      recordFinding(filePath, 'ERROR', `El contrato referenciado no existe en disco: ${c}`);
    }
    return;
  }

  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    recordFinding(filePath, 'ERROR', 'Entrada inválida en "contracts": se esperaba ruta o descriptor de contrato');
    return;
  }

  const cType = typeof c.type === 'string' ? c.type.trim().toLowerCase() : '';
  if (!cType) {
    recordFinding(filePath, 'ERROR', 'Cada contrato en "contracts" debe declarar un campo "type" no vacío');
  } else if (!VALID_CONTRACT_TYPES.has(cType)) {
    recordFinding(filePath, 'WARN', `Tipo de contrato no estándar "${c.type}" en "contracts"`);
  }

  if (c.ref !== undefined) {
    validateUrlScheme(c.ref, filePath, `contracts[${c.type || '?'}].ref`, true);
  }

  if (c.path !== undefined && typeof c.path === 'string' && c.path.trim()) {
    if (/^https?:\/\//i.test(c.path)) {
      recordFinding(filePath, 'WARN', `PE4-REMOTE-IN-PATH: usa "ref" en lugar de "path" para URI remota "${c.path}"`);
    } else {
      const resolvedPath = validateLocalPathContainment(c.path, baseDir, filePath, `contracts[${c.type || '?'}].path`);
      if (resolvedPath && !fs.existsSync(resolvedPath)) {
        recordFinding(filePath, 'ERROR', `El contrato referenciado no existe en disco: ${c.path}`);
      }
    }
  }

  if (CLI_CONTRACT_TYPES.has(cType)) {
    if ((!c.binary || typeof c.binary !== 'string' || !c.binary.trim()) && !c.path && !c.ref) {
      recordFinding(filePath, 'ERROR', `El contrato CLI "${c.type}" requiere "binary" (o "path"/"ref")`);
    } else if (typeof c.binary === 'string' && (c.binary.includes('/') || c.binary.includes('\\'))) {
      validateLocalPathContainment(c.binary, baseDir, filePath, `contracts[${c.type}].binary`);
    }
    if (c.inputs !== undefined && !Array.isArray(c.inputs)) {
      recordFinding(filePath, 'ERROR', `El campo "inputs" en contrato "${c.type}" debe ser una lista`);
    }
  } else if (!c.path && !c.ref && !c.inline && !c.binary) {
    recordFinding(filePath, 'WARN', `El contrato "${c.type || 'desconocido'}" debería declarar "path", "ref" o "inline"`);
  }
}

/**
 * 1. Audita un archivo Markdown
 */
function auditMarkdownFile(filePath) {
  totalAudited++;
  const filename = path.basename(filePath);
  const baseDir = path.dirname(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Regla OKF: index.md y log.md son reservados
  const isReserved = filename === 'index.md' || filename === 'log.md';

  const fm = parseFrontmatter(content, filePath);

  if (!isReserved) {
    if (!fm) {
      recordFinding(filePath, 'ERROR', 'Falta el bloque Frontmatter YAML delimitado por ---');
      return;
    }

    const rawType = fm.type || fm['@type'];
    if (!rawType || typeof rawType !== 'string' || !rawType.trim()) {
      recordFinding(filePath, 'ERROR', 'El campo "type" (o "@type") es obligatorio en el Frontmatter (OKF/ODKF v0.3)');
    } else if (!VALID_OKF_TYPES.has(rawType.trim().toLowerCase())) {
      recordFinding(filePath, 'WARN', `Tipo no estándar "${rawType}". Se recomienda usar tipos normativos o CURIEs W3C.`);
    }

    const rawTitle = fm.title || fm['dcterms:title'] || fm['dct:title'];
    if (!rawTitle) {
      recordFinding(filePath, 'WARN', 'Se recomienda incluir el campo "title" (o "dcterms:title") en el Frontmatter');
    }

    const rawNature = fm.nature || fm['okf:nature'];
    if (rawNature !== undefined) {
      if (typeof rawNature !== 'string' || !VALID_NATURES.has(rawNature.trim().toLowerCase())) {
        recordFinding(filePath, 'WARN', `Modalidad "nature" no estándar "${rawNature}". Esperadas: ${Array.from(VALID_NATURES).join(', ')}`);
      }
    }

    validateExtras(fm._extras, filePath);

    const rawPolicy = fm.policy !== undefined ? fm.policy : fm['odrl:hasPolicy'];
    if (rawPolicy !== undefined) {
      validatePolicyEntry(rawPolicy, 'frontmatter.policy', filePath, baseDir);
    }
    const rawPolicies = fm.policies || fm['okf:policies'];
    if (Array.isArray(rawPolicies)) {
      rawPolicies.forEach((p, idx) => validatePolicyEntry(p, `frontmatter.policies[${idx}]`, filePath, baseDir));
    } else if (rawPolicies !== undefined) {
      recordFinding(filePath, 'ERROR', 'El campo "policies" debe ser un arreglo de PolicySpec/ODRL');
    }

    if (fm.status === 'superseded' && !fm.superseded_by) {
      recordFinding(filePath, 'ERROR', 'RULE-10: Un concepto con status "superseded" requiere "superseded_by"');
    }

    if (fm.lineage && Array.isArray(fm.lineage.transformations)) {
      for (const tr of fm.lineage.transformations) {
        if (tr && typeof tr === 'object' && tr.hash && !/^sha256:[a-fA-F0-9]{64}$/.test(String(tr.hash))) {
          recordFinding(filePath, 'ERROR', `PE5 / RULE-05: Hash de transformación inválido "${tr.hash}" (formato requerido: sha256:<64 hex>)`);
        }
      }
    }

    // Validación específica para datasets / servicios ODKF v0.3
    const normType = typeof rawType === 'string' ? rawType.trim().toLowerCase() : '';
    if (DATASET_OR_SERVICE_TYPES.has(normType)) {
      const rawContracts = fm.contracts || fm['dcat:conformsTo'];
      if (!rawContracts || !Array.isArray(rawContracts) || rawContracts.length === 0) {
        recordFinding(filePath, 'WARN', 'Un dataset o servicio ODKF debería declarar al menos un contrato en "contracts"');
      } else {
        for (const c of rawContracts) {
          validateContractEntry(c, filePath, baseDir);
        }
      }
    }

    // Validación específica para ADRs
    if (normType === 'decision') {
      if (!fm.status) {
        recordFinding(filePath, 'WARN', 'Un ADR debería incluir el campo "status" (Aceptado, Propuesto, etc.)');
      }
    }
  } else if (fm) {
    // Validar extensiones v0.3 si el archivo reservado incluye frontmatter
    validateExtras(fm._extras, filePath);
    const rawPolicy = fm.policy !== undefined ? fm.policy : fm['odrl:hasPolicy'];
    if (rawPolicy !== undefined) {
      validatePolicyEntry(rawPolicy, 'frontmatter.policy', filePath, baseDir);
    }
    const rawPolicies = fm.policies || fm['okf:policies'];
    if (Array.isArray(rawPolicies)) {
      rawPolicies.forEach((p, idx) => validatePolicyEntry(p, `frontmatter.policies[${idx}]`, filePath, baseDir));
    }
    const rawContracts = fm.contracts || fm['dcat:conformsTo'];
    if (Array.isArray(rawContracts)) {
      for (const c of rawContracts) {
        validateContractEntry(c, filePath, baseDir);
      }
    }
  }

  // Comprobar enlaces locales (excluyendo bloques de código de ejemplo)
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(contentWithoutCode)) !== null) {
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
    const targetPath = url.split('#')[0];
    if (targetPath.startsWith('/nodes/')) continue;
    const targetFile = path.resolve(baseDir, targetPath);
    if (targetFile.startsWith(rootDir) && !fs.existsSync(targetFile)) {
      recordFinding(filePath, 'WARN', `Enlace relativo roto hacia: ${url}`);
    }
  }
}

/**
 * 2. Audita un archivo DataPackage Frictionless (con extensiones OKF/ODKF v0.3)
 */
function auditDatapackageFile(filePath) {
  totalAudited++;
  const baseDir = path.dirname(filePath);
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

  validateExtras(dp._extras, filePath);
  if (dp.policy !== undefined) {
    validatePolicyEntry(dp.policy, 'datapackage.policy', filePath, baseDir);
  }
  if (Array.isArray(dp.policies)) {
    dp.policies.forEach((p, idx) => validatePolicyEntry(p, `datapackage.policies[${idx}]`, filePath, baseDir));
  }

  if (!dp.resources || !Array.isArray(dp.resources) || dp.resources.length === 0) {
    recordFinding(filePath, 'ERROR', 'DataPackage debe contener un arreglo no vacío de "resources"');
    return;
  }

  if (dp.spatial && typeof dp.spatial === 'object') {
    if (dp.spatial.bbox && (!Array.isArray(dp.spatial.bbox) || dp.spatial.bbox.length !== 4)) {
      recordFinding(filePath, 'WARN', 'El campo "spatial.bbox" debe ser un arreglo de 4 números [minX, minY, maxX, maxY]');
    }
  }

  if (dp.temporal && typeof dp.temporal === 'object') {
    if (dp.temporal.start && isNaN(Date.parse(dp.temporal.start))) {
      recordFinding(filePath, 'WARN', `Fecha temporal.start no es formato ISO 8601 válido: "${dp.temporal.start}"`);
    }
    if (dp.temporal.end && isNaN(Date.parse(dp.temporal.end))) {
      recordFinding(filePath, 'WARN', `Fecha temporal.end no es formato ISO 8601 válido: "${dp.temporal.end}"`);
    }
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

    if (res.policy !== undefined) {
      validatePolicyEntry(res.policy, resLabel, filePath, baseDir);
    }
    if (Array.isArray(res.policies)) {
      res.policies.forEach((p, pIdx) => validatePolicyEntry(p, `${resLabel}.policies[${pIdx}]`, filePath, baseDir));
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
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.astro' || entry.name === '.venv') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile()) {
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
console.log(`${colors.bold}${colors.cyan}  Linter Normativo OKF & ODKF v0.3 — DataMesh Bolivia              ${colors.reset}`);
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
  console.log(`${colors.red}${colors.bold}✖ Falló la validación OKF/ODKF v0.3. Corrige los errores antes de publicar.${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}✔ Todos los bundles y contratos cumplen con OKF & ODKF v0.3.${colors.reset}\n`);
  process.exit(0);
}
