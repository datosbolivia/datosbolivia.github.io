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
    `## Información y Documentación del Proyecto`,
    `- [Especificación ODKF v0.2](/raw/docs/especificacion_knowledge.md): Estándar normativo para nodos de datos abiertos federados.`,
    `- [Guía de Fork y Despliegue](/raw/docs/GUIAS_FORK_Y_DESPLIEGUE.md): Instrucciones para replicar y desplegar instancias institucionales del portal.`,
    `- [Centro Documental y ADRs](/docs): Registros formales de decisiones de arquitectura.`,
    ``,
    `## Catálogo de Datasets Federados (Open Knowledge Format v0.2)`,
    `A continuación se listan los nodos de datos disponibles con sus enlaces a los documentos Markdown originales:`
  ];

  for (const d of datasets) {
    const rawUrl = `/raw/nodes/${d.slug}/index.md`;
    const resourcesDesc = d.datapackage?.resources
      ? d.datapackage.resources.map(r => r.name).join(', ')
      : 'Recursos tabulares';
    lines.push(`- [${d.title}](${rawUrl}): ${d.description} (Dominio: ${d.category}. Recursos: ${resourcesDesc})`);
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
