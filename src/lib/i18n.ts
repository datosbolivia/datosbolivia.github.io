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
    'nav.llms_title': 'Especificación llms.txt para Agentes de IA',

    // Hero y Métricas
    'hero.eyebrow': 'Iniciativa de la Sociedad Civil • Datos Abiertos',
    'hero.title': 'Información Pública y Verificable',
    'hero.subtitle': 'Catálogo federado de datos abiertos para la ciudadanía, investigadores y Agentes de IA.',
    'hero.search_placeholder': '¿Qué datos deseas consultar? (ej. inflación, aire, combustible...)',
    'hero.topics_label': 'Temáticas:',
    'hero.explore': 'Explorar Datasets',
    'hero.about': 'Acerca del Proyecto',
    'hero.install': 'Descargar',
    'stats.datasets': 'Datasets',
    'stats.resources': 'Recursos',
    'stats.domains': 'Dominios',

    // Temáticas Cívicas (Topics)
    'topics.economy': 'Economía',
    'topics.environment': 'Calidad del Aire',
    'topics.energy': 'Combustibles',
    'topics.health': 'Salud Pública',
    'topics.government': 'Trámites',

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

    // Catálogo de Datasets y Filtros
    'datasets.title': 'Catálogo de Datasets',
    'datasets.subtitle': 'Explora recursos, esquemas y conceptos federados.',
    'datasets.filter_by_domain': 'Dominios:',
    'dataset.back_to_dataset': 'Volver al Dataset',
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
    'explorer.title': 'Explorador de Archivos',
    'explorer.files': 'Archivos',
    'explorer.knowledge': 'Knowledge',
    'explorer.concepts': 'Concepts',
    'explorer.resources': 'Recursos',
    'explorer.contracts': 'Contratos',
    'explorer.resource_num': 'Recurso',
    'explorer.download_resource': 'Descargar Recurso',
    'explorer.raw_md': 'Ver Markdown Raw',
    'explorer.raw': 'Ver Raw',
    'explorer.download': 'Descargar',
    'explorer.source': 'Fuente',
    'explorer.table_schema': 'Esquema de Columnas',
    'explorer.field_name': 'Columna',
    'explorer.field_type': 'Tipo',
    'explorer.field_desc': 'Descripción',
    'explorer.field_constraints': 'Restricciones',
    'explorer.tab_schema': 'Esquema',
    'explorer.tab_preview': 'Explorar Datos',
    'explorer.tab_sql': 'Consulta SQL / CLI',
    'explorer.fullscreen': 'Pantalla completa',
    'explorer.exit_fullscreen': 'Salir de pantalla completa',
    'explorer.toggle_sidebar': 'Alternar explorador',
    'explorer.close_sidebar': 'Cerrar explorador',
    'explorer.search_placeholder': 'Filtrar registros en tiempo real...',
    'explorer.loading_data': 'Cargando y procesando registros...',
    'explorer.no_results': 'No se encontraron registros que coincidan.',
    'explorer.records_count': 'registros',
    'explorer.showing': 'Mostrando',
    'explorer.to': 'a',
    'explorer.of': 'de',
    'explorer.prev_page': 'Anterior',
    'explorer.next_page': 'Siguiente',
    'explorer.export_csv': 'Exportar CSV',
    'explorer.triad_label': 'Tríada Canónica:',
    'explorer.copy_cli': 'Copiar Comando CLI',
    'explorer.copy_python': 'Copiar Python SDK',
    'explorer.copied': '¡Copiado!',
    'explorer.cors_notice': 'Muestra verificada disponible en modo offline/portal.',

    // Tabla de Esquemas
    'schema.field': 'Campo (Columna)',
    'schema.type': 'Tipo',
    'schema.description': 'Descripción',
    'schema.no_fields': 'No hay campos detallados en el schema de este recurso.',

    // Metadatos Ontológicos & SKOS
    'skos.title': 'Metadatos Ontológicos & SKOS',
    'skos.pref_label': 'Etiqueta Preferida (prefLabel):',
    'skos.exact_match': 'URI Ontológica (exactMatch):',
    'skos.broader': 'Término Más Amplio (broader):',

    // Documentación
    'docs.title': 'Centro Documental',
    'docs.subtitle': 'Especificaciones normativas, notas técnicas y registros de arquitectura.',
    'docs.specs': 'Especificaciones Normativas',
    'docs.adrs': 'Decisiones de Arquitectura (ADRs)',
    'docs.decisions_count': 'decisiones',
    'docs.status_label': 'Estado:',
    'docs.type_label': 'Tipo:',
    'docs.blog': 'Blog y Novedades',
    'docs.read': 'Leer artículo',
    'docs.read_spec': 'Leer Especificación',
    'docs.view_adr': 'Ver ADR',
    'docs.view_raw': 'Ver Raw (.md)',

    // Descargas e Instalación
    'download.title': 'Instalación y Descargas',
    'download.subtitle': 'Accede al catálogo de forma offline y desbloquea procesamiento local con PWA y Desktop.',
    'download.browser': 'Navegador',
    'download.pwa_title': 'Progressive Web App (PWA)',
    'download.pwa_desc': 'Instala la aplicación directamente en tu navegador móvil o de escritorio. Navega el catálogo completo sin conexión.',
    'download.pwa_btn': 'Instalar PWA',
    'download.desktop_native': 'Desktop Native',
    'download.desktop_title': 'Aplicación Desktop (Electron)',
    'download.desktop_desc': 'Aplicación de escritorio con ranura para el binario compilado en Go del SDK, consultas analíticas y validación de nodos en vivo.',
    'download.desktop_btn': 'Ver Releases',
    'download.engine_active': 'Entorno Desktop Activo',
    'download.engine_type': 'Motor de Cómputo:',
    'download.detecting': 'Detectando...',
    'download.pwa_manual_hint': 'Para instalar la PWA, utiliza el menú de tu navegador: "Instalar aplicación" o "Agregar a la pantalla de inicio".',

    // Componente PWA Prompt
    'pwa.prompt_title': 'Instalar DataMesh Bolivia',
    'pwa.prompt_desc': 'Accede al catálogo y esquemas 100% offline desde tu dispositivo.',
    'pwa.install_btn': 'Instalar',

    // Pie de Página
    'footer.install': 'Instalar',

    // Acciones Generales y Accesibilidad
    'action.skip_link': 'Saltar al contenido principal',
    'action.close': 'Cerrar',
    'action.menu': 'Menú de navegación',
    'action.theme': 'Cambiar tema',
    'action.lang': 'EN',
    'action.lang_title': 'Cambiar idioma (ES / EN)'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.datasets': 'Datasets',
    'nav.about': 'About',
    'nav.docs': 'Documentation',
    'nav.download': 'Download',
    'nav.llms_title': 'llms.txt specification for AI Agents',

    // Hero and Stats
    'hero.eyebrow': 'Civil Society Initiative • Open Data',
    'hero.title': 'Public & Verifiable Information',
    'hero.subtitle': 'Federated open data ecosystem for citizens, researchers, and AI Agents.',
    'hero.search_placeholder': 'What data do you want to explore? (e.g. inflation, air, fuel...)',
    'hero.topics_label': 'Topics:',
    'hero.explore': 'Explore Datasets',
    'hero.about': 'About the Project',
    'hero.install': 'Download',
    'stats.datasets': 'Datasets',
    'stats.resources': 'Resources',
    'stats.domains': 'Domains',

    // Civic Topics
    'topics.economy': 'Economy',
    'topics.environment': 'Air Quality',
    'topics.energy': 'Fuels & Energy',
    'topics.health': 'Public Health',
    'topics.government': 'Procedures',

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

    // Dataset Catalog and Filters
    'datasets.title': 'Dataset Catalog',
    'datasets.subtitle': 'Explore federated resources, schemas, and concepts.',
    'datasets.filter_by_domain': 'Domains:',
    'dataset.back_to_dataset': 'Back to Dataset',
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
    'explorer.title': 'File Explorer',
    'explorer.files': 'Files',
    'explorer.knowledge': 'Knowledge',
    'explorer.concepts': 'Concepts',
    'explorer.resources': 'Resources',
    'explorer.contracts': 'Contracts',
    'explorer.resource_num': 'Resource',
    'explorer.download_resource': 'Download Resource',
    'explorer.raw_md': 'View Raw Markdown',
    'explorer.raw': 'View Raw',
    'explorer.download': 'Download',
    'explorer.source': 'Source',
    'explorer.table_schema': 'Column Schema',
    'explorer.field_name': 'Column',
    'explorer.field_type': 'Type',
    'explorer.field_desc': 'Description',
    'explorer.field_constraints': 'Constraints',
    'explorer.tab_schema': 'Schema',
    'explorer.tab_preview': 'Explore Data',
    'explorer.tab_sql': 'SQL / CLI Query',
    'explorer.fullscreen': 'Full screen',
    'explorer.exit_fullscreen': 'Exit full screen',
    'explorer.toggle_sidebar': 'Toggle explorer',
    'explorer.close_sidebar': 'Close explorer',
    'explorer.search_placeholder': 'Filter records in real-time...',
    'explorer.loading_data': 'Loading and processing records...',
    'explorer.no_results': 'No matching records found.',
    'explorer.records_count': 'records',
    'explorer.showing': 'Showing',
    'explorer.to': 'to',
    'explorer.of': 'of',
    'explorer.prev_page': 'Previous',
    'explorer.next_page': 'Next',
    'explorer.export_csv': 'Export CSV',
    'explorer.triad_label': 'Canonical Triad:',
    'explorer.copy_cli': 'Copy CLI Command',
    'explorer.copy_python': 'Copy Python SDK',
    'explorer.copied': 'Copied!',
    'explorer.cors_notice': 'Verified sample available in offline/portal mode.',

    // Schema Table
    'schema.field': 'Field (Column)',
    'schema.type': 'Type',
    'schema.description': 'Description',
    'schema.no_fields': 'No schema fields detailed for this resource.',

    // Ontological & SKOS Metadata
    'skos.title': 'Ontological Metadata & SKOS',
    'skos.pref_label': 'Preferred Label (prefLabel):',
    'skos.exact_match': 'Ontological URI (exactMatch):',
    'skos.broader': 'Broader Term (broader):',

    // Documentation
    'docs.title': 'Documentation Center',
    'docs.subtitle': 'Normative specifications, technical notes, and architecture decisions.',
    'docs.specs': 'Normative Specifications',
    'docs.adrs': 'Architecture Decisions (ADRs)',
    'docs.decisions_count': 'decisions',
    'docs.status_label': 'Status:',
    'docs.type_label': 'Type:',
    'docs.blog': 'Blog & Updates',
    'docs.read': 'Read article',
    'docs.read_spec': 'Read Specification',
    'docs.view_adr': 'View ADR',
    'docs.view_raw': 'View Raw (.md)',

    // Downloads & Installation
    'download.title': 'Installation & Downloads',
    'download.subtitle': 'Access catalog offline and unlock local compute capabilities with PWA and Desktop.',
    'download.browser': 'Browser',
    'download.pwa_title': 'Progressive Web App (PWA)',
    'download.pwa_desc': 'Install the app directly in your desktop or mobile browser. Browse the entire catalog offline.',
    'download.pwa_btn': 'Install PWA',
    'download.desktop_native': 'Desktop Native',
    'download.desktop_title': 'Desktop Application (Electron)',
    'download.desktop_desc': 'Desktop app with slot for the compiled Go SDK binary, analytical queries, and live node validation.',
    'download.desktop_btn': 'View Releases',
    'download.engine_active': 'Desktop Engine Active',
    'download.engine_type': 'Compute Engine:',
    'download.detecting': 'Detecting...',
    'download.pwa_manual_hint': 'To install the PWA, use your browser menu: "Install app" or "Add to Home screen".',

    // PWA Prompt Component
    'pwa.prompt_title': 'Install DataMesh Bolivia',
    'pwa.prompt_desc': 'Access catalog and schemas 100% offline from your device.',
    'pwa.install_btn': 'Install',

    // Footer
    'footer.install': 'Install',

    // General Actions and Accessibility
    'action.skip_link': 'Skip to main content',
    'action.close': 'Close',
    'action.menu': 'Navigation menu',
    'action.theme': 'Toggle theme',
    'action.lang': 'ES',
    'action.lang_title': 'Change language (ES / EN)'
  }
} as const;

export type TranslationKey = keyof typeof translations['es'];

export function t(key: TranslationKey, lang: Lang = 'es'): string {
  return translations[lang]?.[key] || translations['es'][key] || key;
}
