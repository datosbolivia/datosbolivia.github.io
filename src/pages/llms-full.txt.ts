import type { APIRoute } from 'astro';
import { getAllDatasets } from '../lib/catalog';
import { config } from '../../portal.config';

export const GET: APIRoute = async () => {
  const datasets = getAllDatasets();

  const lines: string[] = [
    `# Compendio Exhaustivo DataMesh Bolivia (llms-full.txt)`,
    `Organización: ${config.organization.name}`,
    `URL: ${config.site.url}`,
    `Descubrimiento: /.well-known/okf.json (fallback /.well-known/datamesh.json)`,
    `Fecha: ${new Date().toISOString()}`,
    ``,
    `=== ESPECIFICACIÓN NORMATIVA Y GOBERNANZA ===`,
    `Estándar: Open Knowledge Format (OKF/ODKF v0.3) / W3C DCAT v3 JSON-LD / Frictionless DataPackage`,
    `Contexto JSON-LD: https://openknowledgeformat.org/ns/v0.3.jsonld`,
    `Interoperabilidad: Traducción biyectiva con preservación _extras y contratos okf-cli / openapi`,
    `Política: Zero-Microdata (W3C ODRL 2.2 / DPV) y Soberanía Orientada al Dominio`,
    ``,
    `=== CATÁLOGO DE DATASETS (${datasets.length} NODOS FEDERADOS) ===`,
    ``
  ];

  for (const d of datasets) {
    lines.push(`--------------------------------------------------------------------------------`);
    lines.push(`DATASET: ${d.title} (slug: ${d.slug})`);
    lines.push(`Tipo: ${d.type}${d.nature ? ` | Modalidad: ${d.nature}` : ''}${d.authenticity_status ? ` | Autenticidad: ${d.authenticity_status}` : ''}`);
    lines.push(`Dominio: ${d.category}`);
    lines.push(`Descripción: ${d.description}`);
    if (d.dimensions.length > 0) {
      lines.push(`Dimensiones: ${d.dimensions.join(', ')}`);
    }
    if (d.policy !== undefined) {
      const policyText = typeof d.policy === 'string' ? d.policy : JSON.stringify(d.policy);
      lines.push(`Política de Dataset: ${policyText}`);
    }
    if (d.contracts.length > 0) {
      const contractsDesc = d.contracts
        .map((c) => `${c.type}(${c.path || c.ref || c.binary || 'inline'})`)
        .join(', ');
      lines.push(`Contratos: ${contractsDesc}`);
    }
    if (d._extras && Object.keys(d._extras).length > 0) {
      lines.push(`Extensiones _extras: ${Object.keys(d._extras).join(', ')}`);
    }

    if (d.datapackage?.resources) {
      lines.push(`Recursos (${d.datapackage.resources.length}):`);
      for (const r of d.datapackage.resources) {
        lines.push(`  - Recurso: ${r.name}`);
        lines.push(`    Path: ${r.path}`);
        if (r.policy) {
          const rPolicy = typeof r.policy === 'string' ? r.policy : JSON.stringify(r.policy);
          lines.push(`    Política: ${rPolicy}`);
        }
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
