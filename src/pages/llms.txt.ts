import type { APIRoute } from 'astro';
import { getAllDatasets } from '../lib/catalog';
import { config } from '../../portal.config';

export const GET: APIRoute = async () => {
  const datasets = getAllDatasets();

  const lines: string[] = [
    `# ${config.site.title}`,
    `> ${config.site.description}`,
    ``,
    `Este archivo expone el catálogo federado de datos abiertos conforme al estándar llms.txt y OKF/ODKF v0.3 (W3C DCAT JSON-LD + envolvente _extras). Permite a modelos de lenguaje (LLM) y agentes de IA descubrir datos estructurados, contratos declarativos y políticas ODRL sin alucinaciones.`,
    ``,
    `## Descubrimiento Semántico y Estándares (OKF/ODKF v0.3)`,
    `- [Manifiesto Well-Known OKF v0.3](/.well-known/okf.json): Descubrimiento RFC 8615 (@context v0.3.jsonld, capacidades w3c_translation y tool_contracts).`,
    `- [Alias Well-Known DataMesh](/.well-known/datamesh.json): Endpoint de compatibilidad RFC 8615.`,
    `- [Especificación OKF/ODKF v0.3](/raw/docs/especificacion_knowledge.md): Estándar normativo con W3C DCAT JSON-LD, traducción biyectiva _extras y contratos okf-cli/OpenAPI.`,
    `- [Guía de Fork y Despliegue](/raw/docs/GUIAS_FORK_Y_DESPLIEGUE.md): Instrucciones para replicar y desplegar instancias institucionales del portal.`,
    `- [Centro Documental y ADRs](/docs): Registros formales de decisiones de arquitectura.`,
    ``,
    `## Catálogo de Datasets Federados (Open Knowledge Format v0.3)`,
    `Cada ficha web en /datasets/<slug> incrusta W3C DCAT v3 JSON-LD (<script type="application/ld+json">) preservando _extras. A continuación se listan los nodos de datos disponibles:`
  ];

  for (const d of datasets) {
    const rawUrl = d.remoteUrl || `/raw/nodes/${d.slug}/index.md`;
    const resourcesDesc = d.datapackage?.resources
      ? d.datapackage.resources.map(r => r.name).join(', ')
      : 'Recursos tabulares';
    lines.push(`- [${d.title}](${rawUrl}): ${d.description} (Dominio: ${d.category}. Recursos: ${resourcesDesc})`);
  }

  lines.push(``);
  lines.push(`## Enlaces Adicionales`);
  lines.push(`- [Compendio Completo llms-full.txt](/llms-full.txt): Todos los metadatos, contratos, políticas ODRL y esquemas concatenados para contexto largo.`);
  lines.push(`- [Explorador Web](/datasets): Interfaz interactiva de búsqueda.`);

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
