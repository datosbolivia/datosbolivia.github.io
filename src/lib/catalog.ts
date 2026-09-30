import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

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

export interface ResourceField {
  name: string;
  type: string;
  description?: string;
  format?: string;
  constraints?: Record<string, any>;
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
  description?: string;
}

export interface DataPackage {
  name?: string;
  title?: string;
  description?: string;
  resources: DataResource[];
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
  category: string;
  status: 'active' | 'federated';
  dimensions: string[];
  contracts: Array<{ type: string; path: string }>;
  lineage?: {
    source?: Array<{ url: string; title?: string }>;
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

/**
 * Parser de YAML Frontmatter seguro
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
      frontmatter = parsed as Record<string, any>;
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
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
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
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const nodePath = path.join(nodesDir, slug);
    const indexPath = path.join(nodePath, 'index.md');

    if (!fs.existsSync(indexPath)) continue;

    const rawMarkdown = fs.readFileSync(indexPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(rawMarkdown);

    // 1. Parsear contratos declarados en frontmatter (referencia de concepto a estándar)
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

    // 2. Descubrir recursos a partir de contratos/estándares referenciados en frontmatter
    let datapackage: DataPackage | undefined;
    const candidatesToCheck: string[] = [];

    // Priorizar los contratos declarados que apuntan a estándares de datos (datapackage, frictionless, etc.)
    for (const contract of contracts) {
      if (contract.path) {
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
          if (dpPath.endsWith('.json')) {
            datapackage = JSON.parse(content);
          } else {
            datapackage = yaml.load(content) as DataPackage;
          }
          if (datapackage && Array.isArray(datapackage.resources)) {
            break;
          }
        } catch (e) {
          console.warn(`Error al parsear estándar en ${dpPath}:`, e);
        }
      }
    }

    // 3. Consolidar TODOS los recursos
    const allResources: DataResource[] = [];
    if (datapackage?.resources && Array.isArray(datapackage.resources)) {
      allResources.push(...datapackage.resources);
    }
    if (Array.isArray(frontmatter.resources)) {
      for (const res of frontmatter.resources) {
        if (!allResources.some(r => r.name === res.name)) {
          allResources.push(res);
        }
      }
    }

    // 3. Leer todos los documentos Markdown de referencia
    const referenceDocs = scanNodeReferenceDocs(nodePath, slug);

    // Conceptos SKOS extraídos
    const concepts: SkosConcept[] = referenceDocs
      .filter(d => d.relativePath.startsWith('concepts/'))
      .map(d => ({
        id: d.cleanPath.replace('concepts/', ''),
        title: d.title,
        prefLabel: d.frontmatter.skos?.prefLabel,
        altLabel: d.frontmatter.skos?.altLabel,
        exactMatch: d.frontmatter.skos?.exactMatch,
        broader: d.frontmatter.skos?.broader,
        content: d.bodyMarkdown,
        rawMarkdown: d.rawMarkdown
      }));

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

    // Parsear dimensiones
    let dimensions: string[] = [];
    if (Array.isArray(frontmatter.dimensions)) {
      dimensions = frontmatter.dimensions;
    }



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
      allResources,
      concepts,
      referenceDocs,
      chartConfig,
      rawMarkdown,
      bodyMarkdown: body
    });
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
