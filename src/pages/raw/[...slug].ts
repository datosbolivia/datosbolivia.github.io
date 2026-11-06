import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

function getFilesRecursively(dir: string, baseDir: string = dir): Array<{ slug: string; fullPath: string }> {
  let results: Array<{ slug: string; fullPath: string }> = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath);
      results.push({ slug: relPath, fullPath });
    }
  }
  return results;
}

export function getStaticPaths() {
  const rootDir = process.cwd();
  const knowledgeDir = path.join(rootDir, 'knowledge');
  const docsDir = path.join(rootDir, 'docs');

  const baseFiles = getFilesRecursively(knowledgeDir);
  const aliasFiles: Array<{ slug: string; fullPath: string }> = [];

  for (const f of baseFiles) {
    if (f.slug.endsWith('/datapackage.yml')) {
      aliasFiles.push({ slug: f.slug.replace(/\/datapackage\.yml$/, '/datapackage.yaml'), fullPath: f.fullPath });
    } else if (f.slug.endsWith('/datapackage.yaml')) {
      aliasFiles.push({ slug: f.slug.replace(/\/datapackage\.yaml$/, '/datapackage.yml'), fullPath: f.fullPath });
    }
  }

  const knowledgeFiles = [...baseFiles, ...aliasFiles].map(f => ({
    params: { slug: f.slug },
    props: { fullPath: f.fullPath }
  }));

  const docsFiles = getFilesRecursively(docsDir).map(f => ({
    params: { slug: `docs/${f.slug}` },
    props: { fullPath: f.fullPath }
  }));

  return [...knowledgeFiles, ...docsFiles];
}

export const GET: APIRoute = async ({ props }) => {
  const fullPath = (props as any).fullPath;
  if (!fullPath || !fs.existsSync(fullPath)) {
    return new Response('Not Found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(fullPath);
  let contentType = 'text/plain; charset=utf-8';
  if (fullPath.endsWith('.md')) contentType = 'text/markdown; charset=utf-8';
  else if (fullPath.endsWith('.json')) contentType = 'application/json; charset=utf-8';
  else if (fullPath.endsWith('.yaml') || fullPath.endsWith('.yml')) contentType = 'text/yaml; charset=utf-8';
  else if (fullPath.endsWith('.csv')) contentType = 'text/csv; charset=utf-8';
  else if (fullPath.endsWith('.tsv')) contentType = 'text/tab-separated-values; charset=utf-8';
  else if (fullPath.endsWith('.parquet')) contentType = 'application/vnd.apache.parquet';
  else if (fullPath.endsWith('.zip')) contentType = 'application/zip';

  return new Response(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
