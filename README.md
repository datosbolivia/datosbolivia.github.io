# Catálogo Federado DataMesh Bolivia (`datos-bolivia`)

[![Zenodo DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22986311.svg)](https://doi.org/10.5281/zenodo.22986311)
[![OKF v0.2](https://img.shields.io/badge/standard-OKF%20%2F%20ODKF%20v0.2-blue)](docs/especificacion_knowledge.md)
[![PWA Ready](https://img.shields.io/badge/PWA-offline--ready-green)](public/manifest.webmanifest)
[![Astro](https://img.shields.io/badge/built%20with-Astro-ff5d01.svg)](https://astro.build)

Bienvenido al Registro Central y Portal de Datos Abiertos de la red **DataMesh Bolivia**, administrado por la comunidad **`datos-bolivia`**. 

Este repositorio actúa como el índice principal de descubrimiento para que investigadores, analistas ciudadanos y **Agentes de Inteligencia Artificial (LLMs)** puedan encontrar, verificar y consultar conjuntos de datos públicos soberanos bajo los estándares abiertos **Open Knowledge Format (OKF v0.2)** y **Frictionless DataPackage**.

---

## Estructura de Navegación del Portal

La aplicación web está estructurada bajo 5 rutas consolidadas y amigables:

1. **`/` (Inicio)**: Resumen del ecosistema, métricas de nodos federados y acceso directo a los datasets destacados.
2. **`/datasets`**: Explorador y buscador en tiempo real del catálogo, con fichas detalladas por dataset en `/datasets/[slug]` (esquemas tabulares, columnas, tipos de datos, conceptos SKOS y enlaces de descarga).
3. **`/about`**: Fundamentos del proyecto, enlace formal al **Whitepaper oficial en Zenodo** ([DOI: 10.5281/zenodo.22986311](https://doi.org/10.5281/zenodo.22986311)), información sobre la **Primera Charla Comunitaria** y principios de la organización `datos-bolivia`.
4. **`/docs`**: Especificación técnica normativa ODKF v0.2, guías de gobernanza y Registros de Decisión de Arquitectura (**ADRs**).
5. **`/download`**: Centro de distribución multiplataforma: instalación directa como **Progressive Web App (PWA)** y descarga de la **Aplicación de Escritorio (Electron)** con capacidades extendidas de cómputo local.

### Rutas para Agentes de Inteligencia Artificial
- **`/llms.txt`**: Manifiesto canónico según el estándar [llmstxt.org](https://llmstxt.org) para descubrimiento semántico por LLMs.
- **`/llms-full.txt`**: Compendio exhaustivo con todos los esquemas y metadatos concatenados para prompts de contexto largo.
- **`/raw/[...slug]`**: Endpoint que expone los archivos Markdown originales intactos con `Content-Type: text/markdown; charset=utf-8`.

---

## Arquitectura Desacoplada y Plantilla Forkeable

Este repositorio está diseñado para que cualquier gobierno local, universidad o colectivo ciudadano pueda crear su propio portal de datos abiertos haciendo un simple fork:

- **Contenido 100% en Markdown**: Los textos editoriales de las páginas se editan directamente en `content/pages/` (`home.md`, `about.md`, `download.md`) sin tocar código Astro.
- **Tokens de Diseño Centralizados**: Modifica la paleta institucional, fuentes y espaciados editando únicamente `src/styles/theme.css`.
- **Configuración Global**: Modifica el nombre de la entidad, logos y enlaces en `portal.config.ts`.
- *Consulta la guía paso a paso en:* [`docs/GUIAS_FORK_Y_DESPLIEGUE.md`](docs/GUIAS_FORK_Y_DESPLIEGUE.md).

---

## Comandos Rápidos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:8001
make dev

# Auditar conformidad OKF y contratos Frictionless
make lint

# Compilar sitio web estático y PWA hacia dist/
make build

# Previsualizar el build estático
make preview

# Ejecutar como aplicación de escritorio (Electron)
make electron-dev

# Empaquetar instaladores de escritorio (Linux AppImage/deb, Windows zip/exe)
make electron-build
```

---

## ¿Cómo agregar un nuevo Nodo a la red federada?

Para federar tu institución o repositorio de datos:
1. Publica una carpeta en `knowledge/nodes/<mi-nodo>/` con su archivo `index.md` (metadatos OKF) y `datapackage.yaml` (contrato Frictionless con columnas tipadas).
2. Valida la conformidad:
   ```bash
   npm run lint:okf
   ```
3. Registra tu enlace en `knowledge/index.md` y envía un **Pull Request**.

Consulta la especificación completa en [`docs/especificacion_knowledge.md`](docs/especificacion_knowledge.md).

---

## Licencia y Cita
- **Publicación:** *DataMesh Bolivia: Hacia un Ecosistema de Datos Colaborativo y Abierto*. Chirinos Lizondo, Andrés Humberto (2025). [DOI: 10.5281/zenodo.22986311](https://doi.org/10.5281/zenodo.22986311).
- **Código y Catálogo:** Publicado bajo estándares de Conocimiento Abierto para el bien público.
