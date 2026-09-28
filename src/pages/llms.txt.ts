import type { APIRoute } from 'astro';
import { getAllDatasets } from '../lib/catalog';
import { config } from '../../portal.config';

export const GET: APIRoute = async () => {
  const datasets = getAllDatasets();

  const lines: string[] = [
    `# ${config.site.title}`,
    `> ${config.site.description}`,
    ``,
    `Este archivo expone el catálogo federado de datos abiertos de Bolivia conforme al estándar llms.txt. Permite a modelos de lenguaje (LLM) y agentes de IA descubrir datos estructurados sin alucinaciones.`,
    ``,
    `## Información y Fundamentos del Proyecto`,
    `- [Whitepaper Oficial en Zenodo](${config.whitepaper.doiUrl}): ${config.whitepaper.title}. Por ${config.whitepaper.author}. DOI: ${config.whitepaper.doi}`,
    `- [Descarga PDF del Whitepaper](${config.whitepaper.pdfUrl}): Documento técnico completo.`,
    `- [Repositorio de Charlas Comunitarias](${config.community.talks[0].repoUrl}): Presentaciones, diapositivas y código fuente.`,
    `- [Grabación en Video de la Primera Charla](${config.community.talks[0].videoUrl}): Conferencia comunitaria del 2025-08-12.`,
    `- [Especificación ODKF v0.2](/raw/docs/especificacion_knowledge.md): Estándar normativo para nodos de datos abiertos federados.`,
    ``,
    `## Catálogo de Datasets Federados (Open Knowledge Format v0.2)`,
    `A continuación se listan los nodos de datos disponibles con sus enlaces a los documentos Markdown originales:`
  ];

  for (const d of datasets) {
    const rawUrl = `/raw/nodes/${d.slug}/index.md`;
    const resourcesDesc = d.datapackage?.resources
      ? d.datapackage.resources.map(r => r.name).join(', ')
      : 'Recursos tabulares';
    lines.push(`- [${d.title}](${rawUrl}): ${d.description} (Categoría: ${d.category}. Recursos: ${resourcesDesc})`);
  }

  lines.push(``);
  lines.push(`## Enlaces Adicionales`);
  lines.push(`- [Compendio Completo llms-full.txt](/llms-full.txt): Todos los metadatos y esquemas concatenados para contexto largo.`);
  lines.push(`- [Explorador Web](/datasets): Interfaz interactiva de búsqueda.`);

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
