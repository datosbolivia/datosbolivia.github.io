import type { APIRoute } from 'astro';
import { getAllDatasets } from '../lib/catalog';
import { config } from '../../portal.config';

export const GET: APIRoute = async () => {
  const datasets = getAllDatasets();

  const lines: string[] = [
    `# Compendio Exhaustivo DataMesh Bolivia (llms-full.txt)`,
    `Organización: ${config.organization.name}`,
    `URL: ${config.site.url}`,
    `Fecha: ${new Date().toISOString()}`,
    ``,
    `=== ESPECIFICACIÓN NORMATIVA Y GOBERNANZA ===`,
    `Estándar: Open Knowledge Format (OKF v0.2) / Frictionless DataPackage`,
    `Política: Zero-Microdata y Soberanía Orientada al Dominio`,
    ``,
    `=== CATÁLOGO DE DATASETS (${datasets.length} NODOS FEDERADOS) ===`,
    ``
  ];

  for (const d of datasets) {
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`DATASET: ${d.title} (slug: ${d.slug})`);
    lines.push(`Dominio: ${d.category}`);
    lines.push(`Descripción: ${d.description}`);
    if (d.dimensions.length > 0) {
      lines.push(`Dimensiones: ${d.dimensions.join(', ')}`);
    }

    if (d.datapackage?.resources) {
      lines.push(`Recursos (${d.datapackage.resources.length}):`);
      for (const r of d.datapackage.resources) {
        lines.push(`  - Recurso: ${r.name}`);
        lines.push(`    Path: ${r.path}`);
        if (r.policy) lines.push(`    Política: ${r.policy}`);
        if (r.schema?.fields && r.schema.fields.length > 0) {
          lines.push(`    Columnas (${r.schema.fields.length}):`);
          for (const f of r.schema.fields) {
            lines.push(`      * ${f.name} (${f.type}): ${f.description || 'sin descripción'}`);
          }
        }
      }
    }

    if (d.concepts.length > 0) {
      lines.push(`Conceptos Semánticos SKOS:`);
      for (const c of d.concepts) {
        lines.push(`  - ${c.title}: ${c.content.replace(/\n+/g, ' ')}`);
      }
    }
    lines.push(``);
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
