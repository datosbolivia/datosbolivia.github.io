/**
 * Capa de Internacionalización (i18n) para DataMesh Bolivia
 * Soporta Español (es) e Inglés (en) de forma ultraligera sin dependencias externas.
 */

export type Lang = 'es' | 'en';

export const translations = {
  es: {
    // Navegación
    'nav.home': 'Inicio',
    'nav.datasets': 'Datos',
    'nav.about': 'Acerca de',
    'nav.docs': 'Documentación',
    'nav.download': 'Descargas',

    'hero.eyebrow': 'Iniciativa de la Sociedad Civil • Datos Abiertos',
    'hero.title': 'Información Pública y Verificable',
    'hero.subtitle': 'Catálogo federado de datos abiertos para la ciudadanía, investigadores y Agentes de IA.',
    'hero.search_placeholder': '¿Qué datos deseas consultar? (ej. inflación, aire, combustible...)',
    'hero.topics_label': 'Tematicas:',
    'hero.explore': 'Explorar Datasets',
    'hero.about': 'Acerca de',
    'hero.install': 'Descargar',
    'stats.datasets': 'Datasets',
    'stats.resources': 'Recursos',
    'stats.domains': 'Dominios',

    // Pilares de Sociedad Civil
    'pillars.transparency_title': 'Transparencia Directa',
    'pillars.transparency_desc': 'Datos de fuentes públicas legítimas, auditados bajo especificación OKF v0.2.',
    'pillars.validation_title': 'Validación Rigurosa',
    'pillars.validation_desc': 'Contratos sintácticos a nivel de columna para analistas, periodistas y ciudadanos.',
    'pillars.interop_title': 'Interoperabilidad e IA',
    'pillars.interop_desc': 'Estructurado para herramientas analíticas comunitarias y agentes autónomos.',

    // Página Principal
    'home.featured': 'Datasets Destacados',
    'home.featured_sub': 'Conjuntos de datos gubernamentales, estadísticos y científicos.',
    'home.view_all': 'Ver catálogo completo',
    'home.blog_title': 'Novedades y Notas Técnicas',
    'home.blog_sub': 'Actualizaciones recientes sobre el catálogo y los estándares.',
    'home.read_more': 'Leer artículo',

    // Buscador y Filtros
    'search.placeholder': 'Buscar por nombre, entidad, columna o dominio...',
    'search.all': 'Todos',
    'search.no_results': 'No se encontraron datasets para esta búsqueda.',
    'search.reset': 'Limpiar filtros',
    'view.grid': 'Vista en cuadrícula',
    'view.list': 'Vista en lista',

    // Tarjeta de Dataset
    'card.explore': 'Explorar',
    'card.resources': 'recurso(s)',

    // Explorador de Dataset (Estilo Obsidian)
    'explorer.files': 'Archivos',
    'explorer.context': 'Contexto',
    'explorer.resources': 'Recursos',
    'explorer.concepts': 'Conceptos',
    'explorer.contracts': 'Contratos',
    'explorer.raw': 'Ver Raw',
    'explorer.download': 'Descargar',
    'explorer.source': 'Fuente',
    'explorer.table_schema': 'Esquema de Columnas',
    'explorer.field_name': 'Columna',
    'explorer.field_type': 'Tipo',
    'explorer.field_desc': 'Descripción',
    'explorer.field_constraints': 'Restricciones',

    // Documentación
    'docs.title': 'Centro Documental',
    'docs.subtitle': 'Especificaciones normativas, notas técnicas y decisiones de diseño.',
    'docs.specs': 'Especificaciones Normativas',
    'docs.adrs': 'Decisiones de Arquitectura (ADRs)',
    'docs.blog': 'Blog y Novedades',
    'docs.read': 'Leer documento',

    // Descargas
    'download.title': 'Instalación y Descargas',
    'download.pwa_title': 'Progressive Web App (PWA)',
    'download.desktop_title': 'Aplicación Desktop (Electron)',

    // Acciones Generales
    'action.theme': 'Cambiar tema',
    'action.lang': 'EN'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.datasets': 'Datasets',
    'nav.about': 'About',
    'nav.docs': 'Documentation',
    'nav.download': 'Download',

    // Hero and Stats
    'hero.eyebrow': 'Civil Society Initiative • Open Data',
    'hero.title': 'Public & Verifiable Information',
    'hero.subtitle': 'Federated open data ecosystem for citizens, researchers, and AI Agents.',
    'hero.search_placeholder': 'What data do you want to explore? (e.g. inflation, air, fuel...)',
    'hero.topics_label': 'Tematics',
    'hero.explore': 'Explore Datasets',
    'hero.about': 'About',
    'hero.install': 'Download',
    'stats.datasets': 'Datasets',
    'stats.resources': 'Resources',
    'stats.domains': 'Domains',

    // Civil Society Pillars
    'pillars.transparency_title': 'Direct Transparency',
    'pillars.transparency_desc': 'Data from legitimate public sources, audited against OKF v0.2 specification.',
    'pillars.validation_title': 'Rigorous Validation',
    'pillars.validation_desc': 'Column-level syntactic contracts for analysts, investigative journalists, and citizens.',
    'pillars.interop_title': 'Interoperability & AI',
    'pillars.interop_desc': 'Structured for community analytical tooling and autonomous research agents.',

    // Home Page
    'home.featured': 'Featured Datasets',
    'home.featured_sub': 'Government, statistical, and scientific datasets.',
    'home.view_all': 'View all datasets',
    'home.blog_title': 'News & Technical Notes',
    'home.blog_sub': 'Recent updates on the catalog and open standards.',
    'home.read_more': 'Read article',

    // Search and Filters
    'search.placeholder': 'Search by name, entity, column, or domain...',
    'search.all': 'All',
    'search.no_results': 'No datasets found matching your search.',
    'search.reset': 'Clear filters',
    'view.grid': 'Grid view',
    'view.list': 'List view',

    // Dataset Card
    'card.explore': 'Explore',
    'card.resources': 'resource(s)',

    // Dataset Explorer (Obsidian-Style)
    'explorer.files': 'Files',
    'explorer.context': 'Context',
    'explorer.resources': 'Resources',
    'explorer.concepts': 'Concepts',
    'explorer.contracts': 'Contracts',
    'explorer.raw': 'View Raw',
    'explorer.download': 'Download',
    'explorer.source': 'Source',
    'explorer.table_schema': 'Column Schema',
    'explorer.field_name': 'Column',
    'explorer.field_type': 'Type',
    'explorer.field_desc': 'Description',
    'explorer.field_constraints': 'Constraints',

    // Documentation
    'docs.title': 'Documentation Center',
    'docs.subtitle': 'Normative specifications, technical notes, and architecture decisions.',
    'docs.specs': 'Normative Specifications',
    'docs.adrs': 'Architecture Decisions (ADRs)',
    'docs.blog': 'Blog & Updates',
    'docs.read': 'Read document',

    // Downloads
    'download.title': 'Installation & Downloads',
    'download.pwa_title': 'Progressive Web App (PWA)',
    'download.desktop_title': 'Desktop Application (Electron)',

    // General Actions
    'action.theme': 'Toggle theme',
    'action.lang': 'ES'
  }
} as const;

export type TranslationKey = keyof typeof translations['es'];

export function t(key: TranslationKey, lang: Lang = 'es'): string {
  return translations[lang]?.[key] || translations['es'][key] || key;
}
