import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';
import {
  type DataPackage as SdkDataPackage,
  type DataResource as SdkDataResource,
  type ResourceField as SdkResourceField,
  type Contract,
  type PolicySpec,
  type ResourceNature,
  type AuthenticityStatus,
  OKF_IMPLICIT_CONTEXT,
  normalizeW3CFrontmatter,
  parseDataPackageManifest,
  normalizeManifestResources,
  splitConceptDocument
} from '@datosbolivia/datamesh-client';

export interface ResourceField extends SdkResourceField {
  valueLabels?: Record<string, string>;
  unit?: string;
  rdf_type?: string;
  aggregation_behavior?: string;
}

export interface DataResource extends Omit<SdkDataResource, 'schema' | 'policy' | 'resources'> {
  schema?: {
    fields?: ResourceField[];
  };
  policy?: string | PolicySpec | Record<string, any>;
  bytes?: number;
  hash?: string;
  resources?: DataResource[];
}

export interface DataPackage extends Omit<SdkDataPackage, 'resources'> {
  resources: DataResource[];
  policy?: string | PolicySpec | Record<string, any>;
  policies?: PolicySpec[];
  nature?: ResourceNature | string;
  _extras?: Record<string, Record<string, any>>;
  custom?: Record<string, any>;
}

export interface DatasetContract extends Contract {
  type: string;
  path?: string;
  ref?: string;
  binary?: string;
  subcommand?: string;
  action?: string;
  inputs?: Array<Record<string, any>>;
  outputs?: Record<string, any>;
  inline?: Record<string, any>;
  [key: string]: any;
}

export type { Contract, PolicySpec, ResourceNature, AuthenticityStatus };
export {
  OKF_IMPLICIT_CONTEXT,
  normalizeW3CFrontmatter,
  toCanonicalTriad,
  parseCanonicalUri,
  normalizeManifestResources,
  translateManifest,
  translateManifestSync
} from '@datosbolivia/datamesh-client';

export interface ResolvedResourceMetadata {
  catalog: string;
  dataset: string;
  resourceName: string;
  cleanIdentifier: string;
  displayName: string;
  triad: string;
  sqlTable: string;
  dnsTriad: string;
  okfUri: string;
  downloadUrl: string;
  downloadFilename: string;
  containerUrl?: string;
  isContainer: boolean;
  format: string;
  pattern?: string;
  files?: string[];
}

/**
 * Normaliza nombres o identificadores de recursos a identificadores canónicos válidos (snake_case).
 */
export function cleanResourceIdentifier(name: string): string {
  if (!name) return 'recurso';
  let cleaned = name.trim();
  if (cleaned.startsWith('Fuente de Linaje (')) {
    cleaned = cleaned.replace(/^Fuente de Linaje \((.*?)\)$/, '$1');
  }
  // Remover extensiones comunes si están presentes al final
  cleaned = cleaned.replace(/\.(csv|parquet|tsv|json|zip)$/i, '');
  // Normalizar acentos, espacios y caracteres especiales a snake_case
  cleaned = cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s\-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return cleaned || 'recurso';
}

/**
 * Resuelve metadatos completos y canónicos para un recurso de datos:
 * - Tríada SQL canónica (bolivia:dataset:recurso)
 * - DNS Soberano (dataset.recurso@bolivia)
 * - URI OKF (okf://bolivia/dataset/recurso)
 * - Enlaces físicos de descarga directa y de contenedores ZIP
 */
export function resolveResourceMetadata(
  datasetSlug: string,
  res: DataResource,
  catalogSlug: string = 'bolivia'
): ResolvedResourceMetadata {
  const cleanId = cleanResourceIdentifier(res.name);
  const displayName = (res as any).title || res.name || cleanId;
  const triad = `${catalogSlug}:${datasetSlug}:${cleanId}`;
  const sqlTable = triad;
  const dnsTriad = `${datasetSlug}.${cleanId}@${catalogSlug}`;
  const okfUri = `okf://${catalogSlug}/${datasetSlug}/${cleanId}`;

  let rawPath = (res.path || '').trim();
  let pattern = (res as any).pattern;
  let files = (res as any).files;

  // Normalizar comodines a la partición concreta más reciente
  if (rawPath.includes('*')) {
    pattern = pattern || rawPath;
    if (rawPath.includes('data/*.csv')) {
      rawPath = rawPath.replace('data/*.csv', 'data/202631.csv');
    } else if (rawPath.includes('data_abastecimiento/*.csv')) {
      rawPath = rawPath.replace('data_abastecimiento/*.csv', 'data_abastecimiento/202639.csv');
    } else if (rawPath.includes('data_discrete/*.csv')) {
      rawPath = rawPath.replace('data_discrete/*.csv', 'data_discrete/202639.csv');
    } else if (rawPath.includes('data_ypfb/despachos/*.csv')) {
      rawPath = rawPath.replace('data_ypfb/despachos/*.csv', 'data_ypfb/despachos/202639.csv');
    } else if (rawPath.includes('data_ypfb/programacion/*.csv')) {
      rawPath = rawPath.replace('data_ypfb/programacion/*.csv', 'data_ypfb/programacion/202639.csv');
    } else if (rawPath.includes('data_ypfb/resumen/*.csv')) {
      rawPath = rawPath.replace('data_ypfb/resumen/*.csv', 'data_ypfb/resumen/202639.csv');
    }
  }

  if (rawPath.includes('github.com') && rawPath.includes('/blob/')) {
    rawPath = rawPath.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  let rawContainer = (res.container_path || '').trim();
  if (rawContainer.includes('github.com') && rawContainer.includes('/blob/')) {
    rawContainer = rawContainer.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  const isContainer = Boolean(rawContainer);
  const containerUrl = isContainer
    ? (rawContainer.startsWith('http://') || rawContainer.startsWith('https://')
        ? rawContainer
        : `/raw/nodes/${datasetSlug}/${rawContainer.replace(/^\.?\//, '')}`)
    : undefined;

  let downloadUrl = '';
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    downloadUrl = rawPath;
  } else if (isContainer) {
    downloadUrl = containerUrl || rawPath;
  } else if (rawPath) {
    downloadUrl = `/raw/nodes/${datasetSlug}/${rawPath.replace(/^\.?\//, '')}`;
  }

  const format = (res.format || (res.path ? res.path.split('.').pop() : 'csv') || 'csv').toLowerCase();

  let downloadFilename = '';
  if (downloadUrl) {
    const segments = downloadUrl.split('?')[0].split('/');
    downloadFilename = segments[segments.length - 1] || `${cleanId}.${format}`;
  } else {
    downloadFilename = `${cleanId}.${format}`;
  }

  return {
    catalog: catalogSlug,
    dataset: datasetSlug,
    resourceName: res.name,
    cleanIdentifier: cleanId,
    displayName,
    triad,
    sqlTable,
    dnsTriad,
    okfUri,
    downloadUrl,
    downloadFilename,
    containerUrl,
    isContainer,
    format,
    pattern,
    files
  };
}

/**
 * Helper unificado para leer y parsear manifiestos de contratos sintácticos
 * delegando la deserialización y normalización al SDK.
 */
export function readManifest(content: string, filePath?: string): DataPackage | null {
  const parsed = parseDataPackageManifest(content, {
    filePath,
    yamlParser: (text) => yaml.load(text)
  });
  if (!parsed) return null;
  let rawExtra: Record<string, any> | null = null;
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || filePath?.endsWith('.json')) {
      rawExtra = JSON.parse(trimmed);
    } else {
      const loaded = yaml.load(trimmed);
      if (loaded && typeof loaded === 'object') {
        rawExtra = loaded as Record<string, any>;
      }
    }
  } catch {
    // Ignore secondary metadata parse errors; parseDataPackageManifest already succeeded
  }
  const normExtra = rawExtra ? normalizeW3CFrontmatter(rawExtra) : {};
  return {
    ...parsed,
    resources: parsed.resources as DataResource[],
    ...(normExtra.policy !== undefined ? { policy: normExtra.policy } : {}),
    ...(Array.isArray(normExtra.policies) ? { policies: normExtra.policies } : {}),
    ...(normExtra.nature ? { nature: normExtra.nature } : {}),
    ...(normExtra._extras && typeof normExtra._extras === 'object' ? { _extras: normExtra._extras } : {}),
    ...(normExtra.custom && typeof normExtra.custom === 'object' ? { custom: normExtra.custom } : {})
  };
}

export interface SkosConcept {
  id: string;
  title: string;
  prefLabel?: string;
  altLabel?: string[];
  exactMatch?: string;
  broader?: string;
  content: string;
  rawMarkdown: string;
}

export interface NodeReferenceDoc {
  datasetSlug: string;
  relativePath: string; // ej. "concepts/digital_citizenship.md"
  cleanPath: string;    // ej. "concepts/digital_citizenship"
  title: string;
  type: string;
  frontmatter: Record<string, any>;
  bodyMarkdown: string;
  rawMarkdown: string;
}

export interface DatasetNode {
  slug: string;
  title: string;
  description: string;
  type: string;
  nature?: ResourceNature | string;
  license?: string;
  resource?: string;
  category: string;
  status: 'active' | 'federated';
  lifecycleStatus?: string;
  stale_after?: string;
  dimensions: string[];
  skos?: string[];
  exact_match?: string[];
  close_match?: string[];
  broader?: string[];
  contracts: DatasetContract[];
  policy?: string | PolicySpec | Record<string, any>;
  policies?: PolicySpec[];
  sources?: any[];
  generated?: Record<string, any>;
  verified?: Array<Record<string, any>> | Record<string, any>;
  signatures?: Array<Record<string, any>>;
  authenticity_status?: AuthenticityStatus | string;
  _extras?: Record<string, Record<string, any>>;
  custom_fields?: Record<string, any>;
  spatial?: any;
  temporal?: any;
  quality?: any;
  lineage?: {
    source?: Array<{ url: string; title?: string }>;
    sources?: any[];
    transformations?: Array<Record<string, any>>;
    version?: string;
    updated_at?: string;
  };
  tags: string[];
  timestamp?: string;
  datapackage?: DataPackage;
  allResources: DataResource[];
  concepts: SkosConcept[];
  referenceDocs: NodeReferenceDoc[];
  chartConfig?: any;
  rawMarkdown: string;
  bodyMarkdown: string;
  remoteUrl?: string;
}

export interface CategoryGroup {
  name: string;
  slug: string;
  datasets: DatasetNode[];
}

export interface DocItem {
  slug: string;
  title: string;
  type: string;
  description?: string;
  timestamp?: string;
  status?: string;
  rawMarkdown: string;
  bodyMarkdown: string;
  category: 'especificacion' | 'decision' | 'guia' | 'blog';
}

const KNOWN_FRONTMATTER_KEYS = new Set([
  'type', 'title', 'description', 'resource', 'license', 'tags', 'dimensions',
  'skos', 'exact_match', 'close_match', 'broader', 'nature', 'status',
  'supersedes', 'superseded_by', 'stale_after', 'sources', 'relations',
  'generated', 'verified', 'freshness', 'contracts', 'policy', 'policies',
  'semantic_fields', 'spatial', 'temporal', 'quality', 'lineage', 'emitter',
  'attester', 'signatures', 'authenticity_status', '_extras', 'custom_fields',
  'resources', 'timestamp', 'category', 'author', 'date'
]);

function extractCustomFields(fm: Record<string, any>): Record<string, any> | undefined {
  const custom: Record<string, any> =
    fm.custom_fields && typeof fm.custom_fields === 'object' ? { ...fm.custom_fields } : {};
  for (const [k, v] of Object.entries(fm)) {
    if (!KNOWN_FRONTMATTER_KEYS.has(k) && v !== undefined) {
      custom[k] = v;
    }
  }
  return Object.keys(custom).length > 0 ? custom : undefined;
}

function mergeExtrasMaps(
  ...maps: Array<Record<string, Record<string, any>> | undefined>
): Record<string, Record<string, any>> | undefined {
  const merged: Record<string, Record<string, any>> = {};
  for (const m of maps) {
    if (!m || typeof m !== 'object') continue;
    for (const [ns, kv] of Object.entries(m)) {
      if (kv && typeof kv === 'object' && !Array.isArray(kv) && Object.keys(kv).length > 0) {
        merged[ns] = { ...(merged[ns] || {}), ...kv };
      }
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function parseContractsList(rawContracts: any, fallbackDefault: boolean = true): DatasetContract[] {
  const contracts: DatasetContract[] = [];
  if (Array.isArray(rawContracts)) {
    for (const c of rawContracts) {
      if (typeof c === 'string') {
        contracts.push({ type: 'datapackage', path: c });
      } else if (typeof c === 'object' && c !== null) {
        contracts.push({
          ...c,
          type: String(c.type || 'datapackage'),
          ...(c.path !== undefined ? { path: c.path } : {}),
          ...(c.ref !== undefined ? { ref: c.ref } : {}),
          ...(c.binary !== undefined ? { binary: c.binary } : {})
        });
      }
    }
  } else if (fallbackDefault) {
    contracts.push({ type: 'datapackage', path: './datapackage.yaml' });
  }
  return contracts;
}

const BASE58_BTC_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function decodeBase58BTC(input: string): Buffer | null {
  if (!input) return null;
  let num = 0n;
  for (let i = 0; i < input.length; i++) {
    const idx = BASE58_BTC_ALPHABET.indexOf(input[i]);
    if (idx === -1) return null;
    num = num * 58n + BigInt(idx);
  }
  let leadingZeros = 0;
  while (leadingZeros < input.length && input[leadingZeros] === '1') {
    leadingZeros++;
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.push(Number(num % 256n));
    num /= 256n;
  }
  bytes.reverse();
  return Buffer.concat([Buffer.alloc(leadingZeros), Buffer.from(bytes)]);
}

function parseOpenSSHEd25519PubKey(rawLine: string): Buffer | null {
  const fields = rawLine.trim().split(/\s+/);
  const blobB64 = fields[0] === 'ssh-ed25519' ? fields[1] : fields[0];
  if (!blobB64) return null;
  try {
    const buf = Buffer.from(blobB64, 'base64');
    if (buf.length < 4) return null;
    const typeLen = buf.readUInt32BE(0);
    if (buf.length < 4 + typeLen + 4) return null;
    const keyType = buf.subarray(4, 4 + typeLen).toString('utf8');
    if (keyType !== 'ssh-ed25519') return null;
    const keyLen = buf.readUInt32BE(4 + typeLen);
    const keyStart = 4 + typeLen + 4;
    if (keyLen !== 32 || buf.length < keyStart + 32) return null;
    return buf.subarray(keyStart, keyStart + 32);
  } catch {
    return null;
  }
}

function resolveEd25519PublicKey(sig: Record<string, any>): Buffer | null {
  const candidates = [String(sig?.public_key || '').trim(), String(sig?.key_id || '').trim()].filter(Boolean);
  for (const cand of candidates) {
    if (cand.startsWith('did:key:z')) {
      const clean = cand.split('#')[0].slice('did:key:z'.length);
      const decoded = decodeBase58BTC(clean);
      if (decoded && decoded.length === 34 && decoded[0] === 0xed && decoded[1] === 0x01) {
        return decoded.subarray(2);
      }
      return null;
    }
    if (cand.startsWith('ssh-ed25519 ')) {
      return parseOpenSSHEd25519PubKey(cand);
    }
    if (/^[0-9a-fA-F]{64}$/.test(cand)) {
      return Buffer.from(cand, 'hex');
    }
    try {
      const raw = Buffer.from(cand, 'base64');
      if (raw.length === 32) return raw;
      const sshParsed = parseOpenSSHEd25519PubKey(`ssh-ed25519 ${cand}`);
      if (sshParsed) return sshParsed;
    } catch {
      // Ignore invalid base64 candidate
    }
  }
  return null;
}

function decodeEd25519Signature(rawSig: string): Buffer | null {
  const clean = (rawSig || '').trim();
  if (!clean) return null;
  if (/^[0-9a-fA-F]{128}$/.test(clean)) {
    return Buffer.from(clean, 'hex');
  }
  for (const enc of ['base64', 'base64url'] as const) {
    try {
      const b = Buffer.from(clean, enc);
      if (b.length === 64) return b;
      if (b.length === 4 + 11 + 4 + 64 && b.subarray(4, 15).toString('utf8') === 'ssh-ed25519') {
        const sigLen = b.readUInt32BE(15);
        if (sigLen === 64) return b.subarray(19);
      }
    } catch {
      // Continue trying encodings
    }
  }
  return null;
}

function canonicalizeJCS(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (value instanceof Date) return JSON.stringify(value.toISOString().replace(/\.000Z$/, 'Z'));
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('JCS forbids NaN or Infinity');
    return Object.is(value, -0) ? '0' : String(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJCS(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const parts = keys.map((k) => `${JSON.stringify(k)}:${canonicalizeJCS(value[k])}`);
    return `{${parts.join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Evaluates runtime cryptographic authenticity status per OKF v0.3 §7 / §14.2
 * (`unsigned | self-signed | trusted-signer | invalid`) over SHA-256(JCS(frontmatter without 'signatures') + '\n' + raw body).
 * Never trusts persisted `authenticity_status` claims in frontmatter.
 */
export function evaluateAuthenticityStatus(
  rawContent: string,
  signatures?: any[],
  trustedKeys?: string[]
): AuthenticityStatus {
  if (!Array.isArray(signatures) || signatures.length === 0) {
    return 'unsigned';
  }
  const split = splitConceptDocument(rawContent);
  if (!split.hasFrontmatter) {
    return 'invalid';
  }
  try {
    const parsedFm = yaml.load(split.frontmatter);
    const fmMap: Record<string, any> =
      parsedFm && typeof parsedFm === 'object' && !Array.isArray(parsedFm)
        ? { ...(parsedFm as Record<string, any>) }
        : {};
    delete fmMap.signatures;

    const jcsStr = canonicalizeJCS(fmMap);
    const payload = Buffer.concat([
      Buffer.from(jcsStr, 'utf8'),
      Buffer.from('\n', 'utf8'),
      Buffer.from(split.body, 'utf8')
    ]);
    const digest = crypto.createHash('sha256').update(payload).digest();

    const envTrusted = (process.env.OKF_TRUSTED_KEYS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const trustedHex = new Set<string>();
    for (const tk of [...(trustedKeys || []), ...envTrusted]) {
      const resolved = resolveEd25519PublicKey({ public_key: tk });
      if (resolved) trustedHex.add(resolved.toString('hex').toLowerCase());
    }

    let matchedTrusted = false;
    for (const sig of signatures) {
      if (!sig || typeof sig !== 'object') return 'invalid';
      const alg = String(sig.algorithm || '').trim().toLowerCase();
      if (alg && alg !== 'ed25519' && alg !== 'ssh-ed25519' && alg !== 'eddsa-jcs-2022') {
        return 'invalid';
      }
      const pubBytes = resolveEd25519PublicKey(sig);
      const sigBytes = decodeEd25519Signature(String(sig.signature || ''));
      if (!pubBytes || !sigBytes) return 'invalid';

      const keyObj = crypto.createPublicKey({
        key: Buffer.concat([ED25519_SPKI_PREFIX, pubBytes]),
        format: 'der',
        type: 'spki'
      });
      if (!crypto.verify(null, digest, keyObj, sigBytes)) {
        return 'invalid';
      }
      if (trustedHex.has(pubBytes.toString('hex').toLowerCase())) {
        matchedTrusted = true;
      }
    }

    return matchedTrusted ? 'trusted-signer' : 'self-signed';
  } catch {
    return 'invalid';
  }
}

function mapConceptDoc(d: NodeReferenceDoc): SkosConcept {
  const skosRaw = d.frontmatter.skos;
  const skosObj = skosRaw && typeof skosRaw === 'object' && !Array.isArray(skosRaw) ? skosRaw : {};
  const skosArr = Array.isArray(skosRaw) ? skosRaw : [];
  const exactMatchVal = skosObj.exactMatch ?? d.frontmatter.exact_match;
  const broaderVal = skosObj.broader ?? d.frontmatter.broader;
  return {
    id: d.cleanPath.replace('concepts/', ''),
    title: d.title,
    prefLabel: skosObj.prefLabel || d.frontmatter.pref_label || d.frontmatter['skos:prefLabel'],
    altLabel: skosObj.altLabel || d.frontmatter.alt_labels || d.frontmatter['skos:altLabel'],
    exactMatch: Array.isArray(exactMatchVal) ? exactMatchVal[0] : (exactMatchVal || skosArr[0]),
    broader: Array.isArray(broaderVal) ? broaderVal[0] : broaderVal,
    content: d.bodyMarkdown,
    rawMarkdown: d.rawMarkdown
  };
}

/**
 * Parser de YAML Frontmatter seguro con normalización W3C YAML-LD (OKF/ODKF v0.3)
 */
export function parseFrontmatter(markdownText: string): { frontmatter: Record<string, any>; body: string } {
  const trimmed = markdownText.trimStart();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: markdownText };
  }

  const endIndex = trimmed.indexOf('\n---', 3);
  if (endIndex === -1) {
    return { frontmatter: {}, body: markdownText };
  }

  const rawYaml = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 4).trim();
  let frontmatter: Record<string, any> = {};

  try {
    const parsed = yaml.load(rawYaml);
    if (parsed && typeof parsed === 'object') {
      frontmatter = normalizeW3CFrontmatter(parsed as Record<string, any>);
    }
  } catch (e) {
    console.warn('Error al parsear frontmatter con js-yaml:', e);
  }

  return { frontmatter, body };
}

/**
 * Escanea recursivamente archivos markdown de referencia dentro de un nodo
 */
function scanNodeReferenceDocs(nodePath: string, datasetSlug: string): NodeReferenceDoc[] {
  const docs: NodeReferenceDoc[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile() && entry.name.endsWith('.md')) {
        const rel = path.relative(nodePath, fullPath);
        // Excluir el propio index.md raíz del nodo
        if (rel === 'index.md') continue;

        const rawMarkdown = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(rawMarkdown);

        const cleanPath = rel.replace(/\.md$/, '');
        const title = frontmatter.title || path.basename(rel, '.md').replace(/[_-]/g, ' ');

        docs.push({
          datasetSlug,
          relativePath: rel,
          cleanPath,
          title,
          type: frontmatter.type || 'concept',
          frontmatter,
          bodyMarkdown: body,
          rawMarkdown
        });
      }
    }
  }

  walk(nodePath);
  return docs;
}

/**
 * Lee y estructura todos los datasets de knowledge/
 */
export function getAllDatasets(): DatasetNode[] {
  const rootDir = process.cwd();
  const nodesDir = path.join(rootDir, 'knowledge', 'nodes');
  const indexFile = path.join(rootDir, 'knowledge', 'index.md');

  // Mapear categorías desde knowledge/index.md
  const categoryMap = new Map<string, string>();
  if (fs.existsSync(indexFile)) {
    const indexContent = fs.readFileSync(indexFile, 'utf-8');
    let currentCategory = 'General';
    for (const line of indexContent.split('\n')) {
      if (line.startsWith('### ')) {
        currentCategory = line.replace('### ', '').trim();
      } else if (line.includes('/nodes/')) {
        const match = line.match(/\/nodes\/([^/]+)\//);
        if (match && match[1]) {
          categoryMap.set(match[1], currentCategory);
        }
      }
    }
  }

  if (!fs.existsSync(nodesDir)) {
    return [];
  }

  const entries = fs.readdirSync(nodesDir, { withFileTypes: true });
  const datasets: DatasetNode[] = [];

  for (const entry of entries) {
    const slug = entry.name;
    const nodePath = path.join(nodesDir, slug);
    try {
      if (!fs.statSync(nodePath).isDirectory()) continue;
    } catch {
      continue;
    }
    const indexPath = path.join(nodePath, 'index.md');

    if (!fs.existsSync(indexPath)) continue;

    const rawMarkdown = fs.readFileSync(indexPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(rawMarkdown);

    // 1. Parsear contratos declarados en frontmatter (datapackage, okf-cli, owl-cli, openapi, cwl, dcat)
    const contracts = parseContractsList(frontmatter.contracts, true);

    // 2. Descubrir recursos a partir de contratos/estándares referenciados en frontmatter
    let datapackage: DataPackage | undefined;
    const candidatesToCheck: string[] = [];

    // Priorizar los contratos declarados que apuntan a estándares locales de datos (datapackage, frictionless, etc.)
    for (const contract of contracts) {
      if (
        contract.path &&
        !/^https?:\/\//i.test(contract.path) &&
        (!contract.type || ['datapackage', 'frictionless', 'json_schema'].includes(contract.type.toLowerCase()))
      ) {
        candidatesToCheck.push(path.resolve(nodePath, contract.path));
      }
    }

    // Fallbacks convencionales si el contrato no apunta a un archivo directo o no existe
    candidatesToCheck.push(
      path.join(nodePath, 'datapackage.json'),
      path.join(nodePath, 'datapackage.yaml'),
      path.join(nodePath, 'datapackage.yml')
    );

    for (const dpPath of candidatesToCheck) {
      if (fs.existsSync(dpPath)) {
        try {
          const content = fs.readFileSync(dpPath, 'utf-8');
          const parsed = readManifest(content, dpPath);
          if (parsed && Array.isArray(parsed.resources)) {
            datapackage = parsed;
            break;
          }
        } catch (e) {
          console.warn(`Error al parsear estándar en ${dpPath}:`, e);
        }
      }
    }

    // 3. Consolidar TODOS los recursos (desempaquetando zips y contenedores internos)
    const allResources: DataResource[] = [];
    if (datapackage?.resources && Array.isArray(datapackage.resources)) {
      datapackage.resources = normalizeManifestResources(datapackage.resources) as DataResource[];
      allResources.push(...datapackage.resources);
    }
    if (Array.isArray(frontmatter.resources)) {
      const normFm = normalizeManifestResources(frontmatter.resources) as DataResource[];
      for (const res of normFm) {
        if (!allResources.some(r => r.name === res.name)) {
          allResources.push(res);
        }
      }
    }

    // 4. Leer todos los documentos Markdown de referencia
    const referenceDocs = scanNodeReferenceDocs(nodePath, slug);

    // Conceptos SKOS extraídos (soporta objeto skos heredado y v0.3 top-level)
    const concepts: SkosConcept[] = referenceDocs
      .filter(d => d.relativePath.startsWith('concepts/'))
      .map(mapConceptDoc);

    // Extraer gráficos declarativos si existen
    let chartConfig: any = null;
    const chartMatch = body.match(/```chart\s*([\s\S]*?)```/);
    if (chartMatch && chartMatch[1]) {
      try {
        chartConfig = JSON.parse(chartMatch[1].trim());
      } catch {
        // ignorar fallo de parseo JSON
      }
    }

    const category = categoryMap.get(slug) || 'General';
    const dimensions: string[] = Array.isArray(frontmatter.dimensions) ? frontmatter.dimensions : [];
    const title = frontmatter.title || slug.replace(/-/g, ' ').toUpperCase();
    const description = frontmatter.description || extractFirstParagraph(body);

    datasets.push({
      slug,
      title,
      description,
      type: String(frontmatter.type || 'dataset'),
      nature: frontmatter.nature || datapackage?.nature,
      license: frontmatter.license,
      resource: frontmatter.resource,
      category,
      status: 'active',
      lifecycleStatus: frontmatter.status,
      stale_after: frontmatter.stale_after,
      dimensions,
      skos: Array.isArray(frontmatter.skos) ? frontmatter.skos : undefined,
      exact_match: Array.isArray(frontmatter.exact_match) ? frontmatter.exact_match : undefined,
      close_match: Array.isArray(frontmatter.close_match) ? frontmatter.close_match : undefined,
      broader: Array.isArray(frontmatter.broader) ? frontmatter.broader : undefined,
      contracts,
      policy: frontmatter.policy !== undefined ? frontmatter.policy : datapackage?.policy,
      policies: Array.isArray(frontmatter.policies) ? frontmatter.policies : datapackage?.policies,
      sources: Array.isArray(frontmatter.sources) ? frontmatter.sources : undefined,
      generated: frontmatter.generated,
      verified: frontmatter.verified,
      signatures: Array.isArray(frontmatter.signatures) ? frontmatter.signatures : undefined,
      authenticity_status: evaluateAuthenticityStatus(rawMarkdown, frontmatter.signatures),
      _extras: mergeExtrasMaps(frontmatter._extras, datapackage?._extras, datapackage?.custom?._extras),
      custom_fields: extractCustomFields(frontmatter),
      spatial: frontmatter.spatial || datapackage?.spatial,
      temporal: frontmatter.temporal || datapackage?.temporal,
      quality: frontmatter.quality || datapackage?.quality,
      lineage: frontmatter.lineage,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      timestamp: frontmatter.timestamp,
      datapackage,
      allResources,
      concepts,
      referenceDocs,
      chartConfig,
      rawMarkdown,
      bodyMarkdown: body
    });
  }

  // Descubrir e indexar nodos remotos / federados declarados en knowledge/index.md
  if (fs.existsSync(indexFile)) {
    const indexContent = fs.readFileSync(indexFile, 'utf-8');
    let currentCategory = 'General';
    const lines = indexContent.split('\n');

    for (const line of lines) {
      if (line.startsWith('### ')) {
        currentCategory = line.replace('### ', '').trim();
        continue;
      }
      const remoteMatch = line.match(/^-\s*\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
      if (remoteMatch) {
        const linkTitle = remoteMatch[1].trim();
        const remoteUrl = remoteMatch[2].trim();

        // Derivar slug del repositorio o ruta URL
        let derivedSlug = '';
        const githubMatch = remoteUrl.match(/githubusercontent\.com\/[^/]+\/([^/]+)/);
        if (githubMatch && githubMatch[1]) {
          derivedSlug = githubMatch[1];
        } else {
          const parts = remoteUrl.replace(/\/index\.md$/, '').split('/');
          derivedSlug = parts[parts.length - 1] || 'remote-dataset';
        }

        // Si ya está indexado localmente, omitir
        if (datasets.some(d => d.slug === derivedSlug)) continue;

        // Descubrimiento dinámico de metadatos y recursos del nodo federado
        let fedDatapackage: DataPackage | undefined;
        let fedResources: DataResource[] = [];
        let fedTitle = linkTitle;
        let fedDescription = `Nodo federado soberano. Datos distribuidos desde ${remoteUrl}.`;
        let fedBody = `# ${linkTitle}\n\n${fedDescription}\n\n### Enlace Normativo Externo\n- [Repositorio / Manifiesto Oficial OKF](${remoteUrl})\n\n### Recursos Distribuidos\nEste nodo se encuentra federado externamente bajo la red soberana DataMesh.`;
        let fedDimensions: string[] = [];
        let fedContracts: DatasetContract[] = [{ type: 'datapackage', ref: remoteUrl, path: remoteUrl }];
        let fedTags: string[] = ['federado'];
        let fedReferenceDocs: NodeReferenceDoc[] = [];
        let parsedFrontmatter: Record<string, any> = {};
        let fedRawIndexMarkdown = '';

        // 1. Intentar descubrir desde repositorio hermano local (ej. ../bo-combustible/knowledge o ../sismos)
        const siblingBaseDir = path.resolve(rootDir, '..', derivedSlug);
        const siblingKnowledgeDir = path.join(siblingBaseDir, 'knowledge');
        const siblingEffectiveDir = fs.existsSync(siblingKnowledgeDir) ? siblingKnowledgeDir : siblingBaseDir;
        const siblingIndexPath = path.join(siblingEffectiveDir, 'index.md');
        let siblingDpPath = path.join(siblingEffectiveDir, 'datapackage.yaml');
        if (!fs.existsSync(siblingDpPath) && fs.existsSync(path.join(siblingEffectiveDir, 'datapackage.yml'))) {
          siblingDpPath = path.join(siblingEffectiveDir, 'datapackage.yml');
        }

        if (fs.existsSync(siblingEffectiveDir)) {
          if (fs.existsSync(siblingIndexPath)) {
            const rawIndex = fs.readFileSync(siblingIndexPath, 'utf-8');
            fedRawIndexMarkdown = rawIndex;
            const parsed = parseFrontmatter(rawIndex);
            parsedFrontmatter = parsed.frontmatter || {};
            if (parsed.frontmatter.title) fedTitle = parsed.frontmatter.title;
            if (Array.isArray(parsed.frontmatter.dimensions)) fedDimensions = parsed.frontmatter.dimensions;
            if (Array.isArray(parsed.frontmatter.tags)) fedTags = parsed.frontmatter.tags;
            if (parsed.body) {
              fedBody = parsed.body;
              fedDescription = parsed.frontmatter.description || extractFirstParagraph(parsed.body) || fedDescription;
            }
          }

          if (fs.existsSync(siblingDpPath)) {
            try {
              const rawDp = fs.readFileSync(siblingDpPath, 'utf-8');
              const parsedDp = readManifest(rawDp, siblingDpPath);
              if (parsedDp && Array.isArray(parsedDp.resources)) {
                // Reconciliar rutas relativas a URLs remotas públicas del repositorio
                const rawBaseUrl = remoteUrl.replace(/\/index\.md$/, '').replace(/\/knowledge$/, '');
                const isKnowledgeDir = siblingDpPath.includes(`${path.sep}knowledge${path.sep}`);
                fedResources = parsedDp.resources.map(r => {
                  let resPath = r.path || '';
                  let originalPattern = '';
                  let resolvedFiles: string[] = [];

                  if (resPath && !resPath.startsWith('http://') && !resPath.startsWith('https://')) {
                    // Si contiene comodín, resolver la partición más reciente inspeccionando el directorio
                    if (resPath.includes('*')) {
                      originalPattern = resPath;
                      const localDir = path.resolve(path.dirname(siblingDpPath), path.dirname(resPath));
                      if (fs.existsSync(localDir)) {
                        const ext = path.extname(resPath);
                        const filesInDir = fs.readdirSync(localDir)
                          .filter(f => !ext || f.endsWith(ext))
                          .sort();
                        if (filesInDir.length > 0) {
                          const latestFile = filesInDir[filesInDir.length - 1];
                          const relDir = path.dirname(resPath);
                          resPath = path.posix.join(relDir, latestFile);
                          const isKnowledgeDir = siblingDpPath.includes(`${path.sep}knowledge${path.sep}`);
                          resolvedFiles = filesInDir.map(f => {
                            const p = isKnowledgeDir
                              ? path.posix.normalize(path.posix.join('knowledge', relDir, f))
                              : path.posix.normalize(path.posix.join(relDir, f));
                            return `${rawBaseUrl}/${p}`;
                          });
                        }
                      }
                    }

                    const isKnowledgeDir = siblingDpPath.includes(`${path.sep}knowledge${path.sep}`);
                    const normPath = isKnowledgeDir
                      ? path.posix.normalize(path.posix.join('knowledge', resPath))
                      : path.posix.normalize(resPath);
                    resPath = `${rawBaseUrl}/${normPath}`;
                  } else if (resPath && resPath.includes('*')) {
                    originalPattern = resPath;
                    if (resPath.includes('data/*.csv')) {
                      resPath = resPath.replace('data/*.csv', 'data/202631.csv');
                    } else if (resPath.includes('data_abastecimiento/*.csv')) {
                      resPath = resPath.replace('data_abastecimiento/*.csv', 'data_abastecimiento/202639.csv');
                    }
                  }

                  return {
                    ...r,
                    path: resPath,
                    pattern: originalPattern || undefined,
                    files: resolvedFiles.length > 0 ? resolvedFiles : undefined,
                    format: r.format || 'csv',
                    policy: r.policy || 'allow_all'
                  };
                });
                fedDatapackage = {
                  name: parsedDp.name || derivedSlug,
                  title: parsedDp.title || fedTitle,
                  description: parsedDp.description || fedDescription,
                  resources: fedResources,
                  spatial: parsedDp.spatial,
                  temporal: parsedDp.temporal,
                  quality: parsedDp.quality,
                  ...(parsedDp.policy !== undefined ? { policy: parsedDp.policy } : {}),
                  ...(parsedDp.policies ? { policies: parsedDp.policies } : {}),
                  ...(parsedDp.nature ? { nature: parsedDp.nature } : {}),
                  ...(parsedDp._extras ? { _extras: parsedDp._extras } : {}),
                  ...(parsedDp.custom ? { custom: parsedDp.custom } : {})
                };
              }
            } catch (e) {
              console.warn(`Error al leer datapackage en nodo hermano ${siblingDpPath}:`, e);
            }
          }

          fedReferenceDocs = scanNodeReferenceDocs(siblingEffectiveDir, derivedSlug);
          if (fedReferenceDocs.length === 0 && siblingEffectiveDir !== siblingBaseDir) {
            fedReferenceDocs = scanNodeReferenceDocs(siblingBaseDir, derivedSlug);
          }
        } else {
          // Descubrimiento remoto en tiempo de compilación (ej. GitHub Actions / Despliegue en producción)
          try {
            // 1. Obtener index.md remoto
            const fetchRemoteText = (url: string): string => {
              try {
                return execSync(`curl -sL --max-time 10 "${url}"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
              } catch {
                return '';
              }
            };

            const remoteIndexText = fetchRemoteText(remoteUrl);
            if (remoteIndexText && remoteIndexText.trim().startsWith('---')) {
              fedRawIndexMarkdown = remoteIndexText;
              const parsed = parseFrontmatter(remoteIndexText);
              parsedFrontmatter = parsed.frontmatter || {};
              if (parsed.frontmatter.title) fedTitle = parsed.frontmatter.title;
              if (Array.isArray(parsed.frontmatter.dimensions)) fedDimensions = parsed.frontmatter.dimensions;
              if (Array.isArray(parsed.frontmatter.tags)) fedTags = parsed.frontmatter.tags;
              if (parsed.body) {
                fedBody = parsed.body;
                fedDescription = parsed.frontmatter.description || extractFirstParagraph(parsed.body) || fedDescription;
              }
            }

            // 2. Obtener datapackage.yaml o datapackage.json remoto
            const rawBaseUrl = remoteUrl.replace(/\/index\.md$/, '').replace(/\/knowledge$/, '');
            const remoteDpCandidates = [
              `${rawBaseUrl}/knowledge/datapackage.yaml`,
              `${rawBaseUrl}/knowledge/datapackage.yml`,
              `${rawBaseUrl}/datapackage.yaml`,
              `${rawBaseUrl}/datapackage.yml`,
              `${rawBaseUrl}/datapackage.json`
            ];

            for (const candUrl of remoteDpCandidates) {
              const dpText = fetchRemoteText(candUrl);
              if (dpText && dpText.trim()) {
                const parsedDp = readManifest(dpText, candUrl);
                if (parsedDp && Array.isArray(parsedDp.resources) && parsedDp.resources.length > 0) {
                  const isKnowledgeCand = candUrl.includes('/knowledge/');
                  const normResources = normalizeManifestResources(parsedDp.resources);
                  fedResources = normResources.map(r => {
                    let resPath = r.path || '';
                    if (resPath && !resPath.startsWith('http://') && !resPath.startsWith('https://')) {
                      const normPath = isKnowledgeCand
                        ? path.posix.normalize(path.posix.join('knowledge', resPath))
                        : path.posix.normalize(resPath);
                      resPath = `${rawBaseUrl}/${normPath}`;
                    }
                    let containerPath = r.container_path;
                    if (containerPath && !containerPath.startsWith('http://') && !containerPath.startsWith('https://')) {
                      const normContPath = isKnowledgeCand
                        ? path.posix.normalize(path.posix.join('knowledge', containerPath))
                        : path.posix.normalize(containerPath);
                      containerPath = `${rawBaseUrl}/${normContPath}`;
                    }
                    return {
                      ...r,
                      path: resPath,
                      container_path: containerPath,
                      format: r.format || 'csv',
                      policy: r.policy || 'allow_all'
                    };
                  });
                  fedDatapackage = {
                    name: parsedDp.name || derivedSlug,
                    title: parsedDp.title || fedTitle,
                    description: parsedDp.description || fedDescription,
                    resources: fedResources,
                    spatial: parsedDp.spatial,
                    temporal: parsedDp.temporal,
                    quality: parsedDp.quality,
                    ...(parsedDp.policy !== undefined ? { policy: parsedDp.policy } : {}),
                    ...(parsedDp.policies ? { policies: parsedDp.policies } : {}),
                    ...(parsedDp.nature ? { nature: parsedDp.nature } : {}),
                    ...(parsedDp._extras ? { _extras: parsedDp._extras } : {}),
                    ...(parsedDp.custom ? { custom: parsedDp.custom } : {})
                  };
                  break;
                }
              }
            }
          } catch (remErr) {
            console.warn(`Error al obtener manifiesto remoto para ${remoteUrl}:`, remErr);
          }

          if (fedResources.length === 0) {
            // Fallback genérico si no hubo respuesta de red
            fedResources = [
              {
                name: 'raw_manifest',
                path: remoteUrl,
                format: 'md',
                policy: 'allow_all',
                description: 'Manifiesto remoto OKF/ODKF v0.3'
              }
            ];
            fedDatapackage = {
              name: derivedSlug,
              title: fedTitle,
              description: fedDescription,
              resources: fedResources
            };
          }
        }

        // Si no se encontraron dimensiones en frontmatter, inferir del slug o categoría
        if (fedDimensions.length === 0) {
          fedDimensions = [derivedSlug.replace(/[^a-zA-Z0-9]+/g, '_')];
        }
        if (Array.isArray(parsedFrontmatter.contracts) && parsedFrontmatter.contracts.length > 0) {
          fedContracts = parseContractsList(parsedFrontmatter.contracts, false);
        }

        datasets.push({
          slug: derivedSlug,
          title: fedTitle,
          description: fedDescription,
          type: String(parsedFrontmatter.type || 'dataset'),
          nature: parsedFrontmatter.nature || fedDatapackage?.nature,
          license: parsedFrontmatter.license,
          resource: parsedFrontmatter.resource || remoteUrl,
          category: currentCategory,
          status: 'federated',
          lifecycleStatus: parsedFrontmatter.status,
          stale_after: parsedFrontmatter.stale_after,
          dimensions: fedDimensions,
          skos: Array.isArray(parsedFrontmatter.skos) ? parsedFrontmatter.skos : undefined,
          exact_match: Array.isArray(parsedFrontmatter.exact_match) ? parsedFrontmatter.exact_match : undefined,
          close_match: Array.isArray(parsedFrontmatter.close_match) ? parsedFrontmatter.close_match : undefined,
          broader: Array.isArray(parsedFrontmatter.broader) ? parsedFrontmatter.broader : undefined,
          contracts: fedContracts,
          policy: parsedFrontmatter.policy !== undefined ? parsedFrontmatter.policy : fedDatapackage?.policy,
          policies: Array.isArray(parsedFrontmatter.policies) ? parsedFrontmatter.policies : fedDatapackage?.policies,
          sources: Array.isArray(parsedFrontmatter.sources) ? parsedFrontmatter.sources : undefined,
          generated: parsedFrontmatter.generated,
          verified: parsedFrontmatter.verified,
          signatures: Array.isArray(parsedFrontmatter.signatures) ? parsedFrontmatter.signatures : undefined,
          authenticity_status: evaluateAuthenticityStatus(
            fedRawIndexMarkdown || `---\ntype: ${parsedFrontmatter.type || 'dataset'}\ntitle: "${fedTitle}"\nstatus: federated\n---\n\n${fedBody}`,
            parsedFrontmatter.signatures
          ),
          _extras: mergeExtrasMaps(parsedFrontmatter._extras, fedDatapackage?._extras, fedDatapackage?.custom?._extras),
          custom_fields: extractCustomFields(parsedFrontmatter),
          spatial: parsedFrontmatter.spatial || fedDatapackage?.spatial,
          temporal: parsedFrontmatter.temporal || fedDatapackage?.temporal,
          quality: parsedFrontmatter.quality || fedDatapackage?.quality,
          lineage: parsedFrontmatter.lineage,
          tags: fedTags,
          datapackage: fedDatapackage,
          allResources: fedResources,
          concepts: fedReferenceDocs
            .filter(d => d.relativePath.startsWith('concepts/'))
            .map(mapConceptDoc),
          referenceDocs: fedReferenceDocs,
          rawMarkdown: `---\ntype: ${parsedFrontmatter.type || 'dataset'}\ntitle: "${fedTitle}"\nstatus: federated\n---\n\n${fedBody}`,
          bodyMarkdown: fedBody,
          remoteUrl
        });
      }
    }
  }

  return datasets.sort((a, b) => a.title.localeCompare(b.title));
}

export function getDatasetBySlug(slug: string): DatasetNode | undefined {
  const all = getAllDatasets();
  return all.find(d => d.slug === slug);
}

export function getAllDatasetReferenceDocs(): Array<{ datasetSlug: string; subpath: string; doc: NodeReferenceDoc; dataset: DatasetNode }> {
  const datasets = getAllDatasets();
  const results: Array<{ datasetSlug: string; subpath: string; doc: NodeReferenceDoc; dataset: DatasetNode }> = [];

  for (const ds of datasets) {
    for (const doc of ds.referenceDocs) {
      results.push({
        datasetSlug: ds.slug,
        subpath: doc.cleanPath,
        doc,
        dataset: ds
      });
    }
  }

  return results;
}

export function getDatasetsByCategory(): CategoryGroup[] {
  const datasets = getAllDatasets();
  const groups = new Map<string, DatasetNode[]>();

  for (const d of datasets) {
    const list = groups.get(d.category) || [];
    list.push(d);
    groups.set(d.category, list);
  }

  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    datasets: items
  }));
}

export function getAllDocs(): DocItem[] {
  const rootDir = process.cwd();
  const docsDir = path.join(rootDir, 'docs');
  const docs: DocItem[] = [];

  if (!fs.existsSync(docsDir)) return docs;

  const rootEntries = fs.readdirSync(docsDir, { withFileTypes: true });
  for (const entry of rootEntries) {
    const filePath = path.join(docsDir, entry.name);
    let isMdFile = false;
    try {
      isMdFile = fs.statSync(filePath).isFile() && entry.name.endsWith('.md');
    } catch {
      isMdFile = false;
    }
    if (isMdFile) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(raw);
      const slug = entry.name.replace('.md', '');
      docs.push({
        slug,
        title: frontmatter.title || entry.name.replace('.md', ''),
        type: frontmatter.type || 'normative',
        description: frontmatter.description || extractFirstParagraph(body),
        timestamp: frontmatter.timestamp,
        status: frontmatter.status || 'Activo',
        rawMarkdown: raw,
        bodyMarkdown: body,
        category: (frontmatter.category as any) || (entry.name.toLowerCase().includes('guia') ? 'guia' : 'especificacion')
      });
    }
  }

  const decisionsDir = path.join(docsDir, 'decisiones');
  if (fs.existsSync(decisionsDir)) {
    const dEntries = fs.readdirSync(decisionsDir);
    for (const file of dEntries) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(decisionsDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(raw);
      const slug = `decisiones-${file.replace('.md', '')}`;
      docs.push({
        slug,
        title: frontmatter.title || file.replace('.md', ''),
        type: frontmatter.type || 'decision',
        description: frontmatter.description || extractFirstParagraph(body),
        timestamp: frontmatter.timestamp,
        status: frontmatter.status || 'Aceptado',
        rawMarkdown: raw,
        bodyMarkdown: body,
        category: 'decision'
      });
    }
  }

  const blogDir = path.join(docsDir, 'blog');
  if (fs.existsSync(blogDir)) {
    const bEntries = fs.readdirSync(blogDir);
    for (const file of bEntries) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(blogDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(raw);
      const slug = `blog-${file.replace('.md', '')}`;
      docs.push({
        slug,
        title: frontmatter.title || file.replace('.md', ''),
        type: frontmatter.type || 'blog',
        description: frontmatter.description || extractFirstParagraph(body),
        timestamp: frontmatter.timestamp || frontmatter.date,
        status: frontmatter.status || 'Publicado',
        rawMarkdown: raw,
        bodyMarkdown: body,
        category: 'blog'
      });
    }
  }

  return docs;
}

export function getBlogPosts(): DocItem[] {
  return getAllDocs()
    .filter(d => d.category === 'blog')
    .sort((a, b) => ((b.timestamp || '') > (a.timestamp || '') ? 1 : -1));
}

export function getEditorialPage(pageName: string): { title: string; description?: string; body: string } {
  const rootDir = process.cwd();
  const filePath = path.join(rootDir, 'content', 'pages', `${pageName}.md`);
  if (!fs.existsSync(filePath)) {
    return { title: pageName, body: '' };
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(raw);
  return {
    title: frontmatter.title || pageName,
    description: frontmatter.description || frontmatter.tagline,
    body
  };
}

function extractFirstParagraph(markdown: string): string {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('```') && !trimmed.startsWith('---')) {
      return trimmed.replace(/[*_`]/g, '');
    }
  }
  return '';
}

function normalizeDcatType(rawType?: string): string {
  const trimmed = (rawType || '').trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || lower === 'dataset' || lower === 'dcat:dataset') return 'dcat:Dataset';
  if (lower === 'service' || lower === 'dcat:dataservice') return 'dcat:DataService';
  if (lower === 'catalog' || lower === 'dcat:catalog') return 'dcat:Catalog';
  if (lower === 'dcat:catalogrecord') return 'dcat:CatalogRecord';
  if (trimmed.includes(':')) return trimmed;
  return 'dcat:Dataset';
}

/**
 * Generates a W3C DCAT v3 JSON-LD representation of a DatasetNode,
 * preserving ODRL policies, contracts, nature, authenticity_status, and _extras.
 */
export function toDcatJsonLd(
  dataset: DatasetNode,
  siteUrl: string = 'https://datos-bolivia.github.io'
): Record<string, any> {
  const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
  const dcatType = normalizeDcatType(dataset.type);
  const keywords = dataset.tags?.length
    ? dataset.tags
    : (dataset.dimensions?.length ? dataset.dimensions : undefined);
  const conceptAnchors = dataset.concepts
    ?.map((c) => c.exactMatch)
    .filter((u): u is string => Boolean(u && /^https?:\/\//i.test(u)));
  const theme = dataset.skos?.length
    ? dataset.skos
    : (conceptAnchors?.length ? conceptAnchors : (dataset.dimensions?.length ? dataset.dimensions : undefined));
  const derivedFrom = dataset.sources?.length
    ? dataset.sources
    : (dataset.lineage?.sources?.length ? dataset.lineage.sources : dataset.lineage?.source);

  const out: Record<string, any> = {
    '@context': 'https://www.w3.org/ns/dcat.jsonld',
    '@type': dcatType,
    '@id': dataset.resource || `${cleanSiteUrl}/datasets/${dataset.slug}`,
    'dct:title': dataset.title,
    'dct:description': dataset.description || undefined,
    'dct:license': dataset.license || undefined,
    'dct:modified': dataset.lineage?.updated_at || dataset.timestamp || undefined,
    'owl:versionInfo': dataset.lineage?.version || undefined,
    'dcat:keyword': keywords,
    'dcat:theme': theme,
    'skos:exactMatch': dataset.exact_match?.length ? dataset.exact_match : undefined,
    'skos:closeMatch': dataset.close_match?.length ? dataset.close_match : undefined,
    'skos:broader': dataset.broader?.length ? dataset.broader : undefined,
    'dcat:conformsTo': dataset.contracts?.length ? dataset.contracts : undefined,
    'prov:wasDerivedFrom': derivedFrom,
    'prov:qualifiedGeneration': dataset.generated,
    'prov:wasAttributedTo': dataset.verified,
    'odrl:hasPolicy': dataset.policy,
    'okf:policies': dataset.policies?.length ? dataset.policies : undefined,
    'okf:nature': dataset.nature,
    'okf:authenticityStatus': dataset.authenticity_status,
    'okf:status': dataset.lifecycleStatus || dataset.status,
    'okf:staleAfter': dataset.stale_after,
    'okf:dimensions': dataset.dimensions?.length ? dataset.dimensions : undefined,
    'dct:spatial': dataset.spatial,
    'dct:temporal': dataset.temporal,
    'dqv:hasQualityMeasurement': dataset.quality,
    'prov:wasGeneratedByActivity': dataset.lineage?.transformations?.length
      ? dataset.lineage.transformations
      : undefined,
    'okf:signatures': dataset.signatures?.length ? dataset.signatures : undefined,
    'okf:customFields': dataset.custom_fields
  };

  if (dataset.allResources?.length) {
    out['dcat:distribution'] = dataset.allResources.map((r) => {
      const meta = resolveResourceMetadata(dataset.slug, r);
      const accessUrl = meta.downloadUrl
        ? (meta.downloadUrl.startsWith('/') ? `${cleanSiteUrl}${meta.downloadUrl}` : meta.downloadUrl)
        : undefined;
      const dist: Record<string, any> = {
        '@type': 'dcat:Distribution',
        'dcterms:title': r.name
      };
      if (r.description) dist['dcterms:description'] = r.description;
      if (meta.format) dist['dct:format'] = meta.format;
      if (r.mediatype) dist['dcat:mediaType'] = r.mediatype;
      if (accessUrl) dist['dcat:accessURL'] = accessUrl;
      if (r.bytes !== undefined) dist['dcat:byteSize'] = r.bytes;
      if (r.hash) dist['spdx:checksum'] = r.hash;
      if (r.policy !== undefined) dist['odrl:hasPolicy'] = r.policy;
      return dist;
    });
  }

  if (dataset._extras?.dcat) {
    for (const [k, v] of Object.entries(dataset._extras.dcat)) {
      if (out[k] === undefined) {
        out[k] = v;
      }
    }
  }

  const remainingExtras: Record<string, Record<string, any>> = {};
  if (dataset._extras) {
    for (const [ns, kv] of Object.entries(dataset._extras)) {
      if (ns !== 'dcat' && kv && Object.keys(kv).length > 0) {
        remainingExtras[ns] = kv;
      }
    }
  }
  if (Object.keys(remainingExtras).length > 0) {
    out._extras = remainingExtras;
  }

  for (const k of Object.keys(out)) {
    if (out[k] === undefined) {
      delete out[k];
    }
  }

  return out;
}
