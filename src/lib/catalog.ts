import fs from 'node:fs';
import path from 'node:path';

export interface SkosConcept {
  id: string;
  title: string;
  prefLabel?: string;
  altLabel?: string[];
  exactMatch?: string;
  broader?: string;
  content: string;
}

export interface ResourceField {
  name: string;
  type: string;
  description?: string;
  format?: string;
}

export interface DataResource {
  name: string;
  path: string;
  format?: string;
  mediatype?: string;
  schema?: {
    fields?: ResourceField[];
  };
  policy?: string;
}

export interface DataPackage {
  name?: string;
  title?: string;
  description?: string;
  resources: DataResource[];
}

export interface DatasetNode {
  slug: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: 'active' | 'federated';
  dimensions: string[];
  contracts: Array<{ type: string; path: string }>;
  lineage?: {
    source?: Array<{ url: string }>;
    version?: string;
    updated_at?: string;
  };
  tags: string[];
  timestamp?: string;
  datapackage?: DataPackage;
  concepts: SkosConcept[];
  chartConfig?: any;
  rawMarkdown: string;
  bodyMarkdown: string;
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
  category: 'especificacion' | 'decision' | 'guia';
}

/**
 * Parser de YAML Frontmatter seguro y autónomo
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
  const frontmatter: Record<string, any> = {};

  // Parser simple línea por línea con soporte para escalares, listas y bloques anidados
  const lines = rawYaml.split('\n');
  let currentKey = '';
  let inList = false;
  let inNestedObj = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    const isListItem = line.trim().startsWith('-');

    if (isListItem && currentKey) {
      const val = line.trim().substring(1).trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey] = [];
      }
      frontmatter[currentKey].push(val);
      continue;
    }

    if (colonIndex !== -1 && !line.startsWith(' ') && !line.startsWith('\t')) {
      currentKey = line.substring(0, colonIndex).trim();
      const valStr = line.substring(colonIndex + 1).trim();

      if (valStr === '') {
        frontmatter[currentKey] = [];
      } else if (valStr.startsWith('[') && valStr.endsWith(']')) {
        frontmatter[currentKey] = valStr
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else {
        frontmatter[currentKey] = valStr.replace(/^["']|["']$/g, '');
      }
    }
  }

  return { frontmatter, body };
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
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const nodePath = path.join(nodesDir, slug);
    const indexPath = path.join(nodePath, 'index.md');

    if (!fs.existsSync(indexPath)) continue;

    const rawMarkdown = fs.readFileSync(indexPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(rawMarkdown);

    // Intentar leer DataPackage
    let datapackage: DataPackage | undefined;
    const dpFiles = ['datapackage.json', 'datapackage.yaml', 'datapackage.yml'];
    for (const dpName of dpFiles) {
      const dpPath = path.join(nodePath, dpName);
      if (fs.existsSync(dpPath)) {
        try {
          const content = fs.readFileSync(dpPath, 'utf-8');
          if (dpName.endsWith('.json')) {
            datapackage = JSON.parse(content);
          } else {
            // Parser básico para datapackage YAML
            datapackage = parseSimpleYamlDatapackage(content);
          }
          break;
        } catch (e) {
          console.warn(`Error al parsear ${dpPath}:`, e);
        }
      }
    }

    // Leer conceptos SKOS
    const concepts: SkosConcept[] = [];
    const conceptsDir = path.join(nodePath, 'concepts');
    if (fs.existsSync(conceptsDir)) {
      const cFiles = fs.readdirSync(conceptsDir);
      for (const cf of cFiles) {
        if (!cf.endsWith('.md')) continue;
        const cContent = fs.readFileSync(path.join(conceptsDir, cf), 'utf-8');
        const cParsed = parseFrontmatter(cContent);
        concepts.push({
          id: cf.replace('.md', ''),
          title: cParsed.frontmatter.title || cf.replace('.md', ''),
          content: cParsed.body
        });
      }
    }

    // Extraer gráficos declarativos si existen
    let chartConfig: any = null;
    const chartMatch = body.match(/```chart\s*([\s\S]*?)```/);
    if (chartMatch && chartMatch[1]) {
      try {
        chartConfig = JSON.parse(chartMatch[1].trim());
      } catch {
        // ignorar fallo de parseo JSON de chart
      }
    }

    // Determinar categoría
    const category = categoryMap.get(slug) || 'General';

    // Parsear dimensiones
    let dimensions: string[] = [];
    if (Array.isArray(frontmatter.dimensions)) {
      dimensions = frontmatter.dimensions;
    }

    // Parsear contratos
    const contracts: Array<{ type: string; path: string }> = [];
    if (Array.isArray(frontmatter.contracts)) {
      for (const c of frontmatter.contracts) {
        if (typeof c === 'string') {
          contracts.push({ type: 'datapackage', path: c });
        } else if (typeof c === 'object' && c !== null) {
          contracts.push({ type: c.type || 'datapackage', path: c.path || '' });
        }
      }
    } else {
      contracts.push({ type: 'datapackage', path: './datapackage.yaml' });
    }

    // Título y descripción
    const title = frontmatter.title || slug.replace(/-/g, ' ').toUpperCase();
    const description = frontmatter.description || extractFirstParagraph(body);

    datasets.push({
      slug,
      title,
      description,
      type: frontmatter.type || 'dataset',
      category,
      status: 'active',
      dimensions,
      contracts,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      timestamp: frontmatter.timestamp,
      datapackage,
      concepts,
      chartConfig,
      rawMarkdown,
      bodyMarkdown: body
    });
  }

  // Ordenar alfabéticamente por título
  return datasets.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Obtiene un dataset específico por su slug
 */
export function getDatasetBySlug(slug: string): DatasetNode | undefined {
  const all = getAllDatasets();
  return all.find(d => d.slug === slug);
}

/**
 * Agrupa datasets por categoría
 */
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

/**
 * Obtiene todos los documentos de docs/ (Especificaciones y ADRs)
 */
export function getAllDocs(): DocItem[] {
  const rootDir = process.cwd();
  const docsDir = path.join(rootDir, 'docs');
  const docs: DocItem[] = [];

  if (!fs.existsSync(docsDir)) return docs;

  // 1. Especificaciones en la raíz de docs
  const rootEntries = fs.readdirSync(docsDir, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const filePath = path.join(docsDir, entry.name);
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
        category: 'especificacion'
      });
    }
  }

  // 2. Decisiones (ADRs) en docs/decisiones
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

  return docs;
}

/**
 * Lee una página editorial de content/pages/
 */
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

// Auxiliares
function extractFirstParagraph(markdown: string): string {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('```')) {
      return trimmed.replace(/[*_`]/g, '');
    }
  }
  return '';
}

function parseSimpleYamlDatapackage(yamlContent: string): DataPackage {
  const resources: DataResource[] = [];
  const lines = yamlContent.split('\n');

  let currentResource: Partial<DataResource> | null = null;
  let inFields = false;
  let currentField: Partial<ResourceField> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- name:') && !inFields) {
      if (currentResource && currentResource.name && currentResource.path) {
        resources.push(currentResource as DataResource);
      }
      currentResource = {
        name: trimmed.replace('- name:', '').trim().replace(/['"]/g, ''),
        path: '',
        schema: { fields: [] }
      };
      inFields = false;
    } else if (trimmed.startsWith('path:') && currentResource) {
      currentResource.path = trimmed.replace('path:', '').trim().replace(/['"]/g, '');
    } else if (trimmed.startsWith('format:') && currentResource) {
      currentResource.format = trimmed.replace('format:', '').trim().replace(/['"]/g, '');
    } else if (trimmed.startsWith('fields:')) {
      inFields = true;
    } else if (inFields && trimmed.startsWith('- name:') && currentResource) {
      if (currentField && currentField.name) {
        currentResource.schema?.fields?.push(currentField as ResourceField);
      }
      currentField = {
        name: trimmed.replace('- name:', '').trim().replace(/['"]/g, ''),
        type: 'string'
      };
    } else if (inFields && trimmed.startsWith('type:') && currentField) {
      currentField.type = trimmed.replace('type:', '').trim().replace(/['"]/g, '');
    } else if (inFields && trimmed.startsWith('description:') && currentField) {
      currentField.description = trimmed.replace('description:', '').trim().replace(/['"]/g, '');
    }
  }

  if (currentField && currentField.name && currentResource) {
    currentResource.schema?.fields?.push(currentField as ResourceField);
  }
  if (currentResource && currentResource.name && currentResource.path) {
    resources.push(currentResource as DataResource);
  }

  return { resources };
}
