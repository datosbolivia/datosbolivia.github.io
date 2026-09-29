---
name: datamesh-review
description: Comprehensive audit and review skill for DataMesh Bolivia sovereign portal template. Verifies OKF/ODKF v0.2 specification, 5 canonical routes, strict no-badges policy, neutrality, Obsidian-style zero-scroll dataset layout, i18n parity, and static Astro build.
---

# DataMesh Review & Quality Assurance Skill

This skill provides an exhaustive audit and review protocol for the DataMesh Bolivia sovereign data portal and catalog template. It enforces strict compliance with open knowledge federation standards (OKF/ODKF v0.2), minimalist UI architectural rules, and neutral public data governance.

## When to Run This Skill

- Before submitting pull requests or publishing updates to the portal.
- After adding or modifying datasets in `knowledge/nodes/` or contracts in `knowledge/contracts/`.
- After modifying Astro templates, pages, or components in `src/`.
- After updating design tokens, typography, or layout rules in `src/styles/theme.css` or [`DESIGN.md`](file:///home/andreschirinos/Proyectos/catalogo-datamesh/DESIGN.md).
- Whenever an AI agent completes a design edit or structural refactor.

---

## Quick Execution

Run the automated portal auditor and linter suite:

```bash
# 1. Run complete portal audit (15 verification rules)
npm run audit

# 2. Run OKF & ODKF v0.2 normative linter
npm run lint:okf

# 3. Verify static Astro compilation
npm run build
```

---

## Core Review Criteria

### 1. OKF & ODKF v0.2 Normative Compliance
- **YAML Frontmatter:** Every non-reserved markdown file (`.md`) in `knowledge/`, `docs/`, and `content/` must contain valid YAML frontmatter bounded by `---` and include a valid `type` (e.g., `dataset`, `decision`, `normative`, `guide`, `page`, `blog`).
- **Reserved Files:** `index.md` and `log.md` are reserved names in OKF v0.2; frontmatter is optional for them.
- **Contract Integrity:** Datasets declaring `contracts:` must point to existing JSON Schema or Frictionless contracts on disk.
- **DataPackages:** Every `datapackage.json` or `datapackage.yaml` must define a non-empty `resources` array with valid field types, file paths, and explicit access policies (`allow_all`, `zero_microdata`, or `deny`).

### 2. Strict "No Badges / No Tags" Policy
- **Absolute Prohibition:** Badges, pills, capsules, and chip elements are strictly prohibited in the UI.
- **Why:** In dense open data catalogs, pill-shaped badges create visual noise and clutter the screen.
- **Enforcement:**
  - Templates must NOT render `<span class="badge">`, `<div class="tag">`, or similar styling.
  - Frontmatter `tags:` must never be iterated to render pill components.
  - Metadata (formats, licenses, statuses) must be presented with clean, unadorned typography: monospace font (`var(--font-mono)`), subtle colors (`var(--color-text-muted)`), and simple textual separators (`/` or `•`).

### 3. Institutional Neutrality
- The portal must serve as a sovereign, reproducible template for any public or private entity in Bolivia.
- **Forbidden Content:**
  - No personal names or contributor credits in page templates, heroes, footers, or [`portal.config.ts`](file:///home/andreschirinos/Proyectos/catalogo-datamesh/portal.config.ts).
  - No hardcoded links to personal whitepapers (e.g., specific Zenodo DOIs) or private recorded talks (e.g., Facebook video shares).
  - All institutional copy must remain strictly neutral, objective, and focused on open data, interoperability, and sovereignty.

### 4. Canonical 5-Route Topology
The portal must strictly maintain exactly 5 primary public routes:
1. **`/` (Home):** Executive summary, key metrics, latest datasets, and technical blog highlights.
2. **`/datasets`:** Searchable catalog of sovereign nodes with instant client-side filtering.
3. **`/datasets/[slug]`:** Node inspection interface powered by the Obsidian-style condensed file explorer.
4. **`/about`:** Architectural overview, data mesh principles, and sovereign federation manifesto.
5. **`/docs`:** Technical documentation, Architectural Decision Records (ADRs in `docs/decisions/`), and engineering articles.
6. **`/download`:** Deployment guides and binary packages (Electron Desktop, PWA, Go SDK CLI).

### 5. Obsidian-Style File Explorer Contracts
The dataset viewer (`src/pages/datasets/[slug].astro`) must behave like a condensed desktop IDE:
- **Zero Scroll:** The layout container (`.obsidian-layout`) must have a bounded height (`calc(100vh - var(--header-height) - 3rem)`) with `overflow: hidden`. The browser window itself must never scroll down; only the internal document viewport scrolls.
- **Sidebar Architecture:** Fixed-width navigation (290px), collapsible folder groups (`.obsidian-folder-group`), monospace file labels, and SVG vector icons (no emojis).
- **CSS Reset on Interactive Elements:** All file buttons (`button.obsidian-file-item`) must include `all: unset;` with explicit cursor and layout definitions to avoid user-agent buttonface/3D border rendering.
- **Context First:** The template must NOT render an artificial duplicate `<h1>` header banner above the markdown document. The dataset's `index.md` provides the primary headline and technical context directly.

### 6. Internationalization (i18n) Parity
- **Bilingual Coverage:** All UI strings in [`src/lib/i18n.ts`](file:///home/andreschirinos/Proyectos/catalogo-datamesh/src/lib/i18n.ts) must exist with exact key parity across Spanish (`es`) and English (`en`).
- **Header Toggle:** The header switch `[ EN / ES ]` must toggle the active locale and persist the choice in browser `localStorage`.

### 7. AI & LLM Readiness (`llms.txt`)
- The portal must expose standard, parseable text endpoints for agentic tools:
  - `/llms.txt`: Curated markdown index of all catalog nodes and documentation.
  - `/llms-full.txt`: Full raw concatenation of all node descriptions, contracts, and decisions for autonomous processing.

---

## Agent Checklist

Before completing any task, execute this verification checklist:

- [ ] Ran `npm run audit` and received `0 Errores`.
- [ ] Ran `npm run lint:okf` and received `0 Errores`.
- [ ] Ran `npm run build` and static files compiled successfully in `dist/`.
- [ ] Checked for accidental introduction of badges/pills or decorative tags.
- [ ] Confirmed that design modifications adhere to tokens declared in [`DESIGN.md`](file:///home/andreschirinos/Proyectos/catalogo-datamesh/DESIGN.md) and [`src/styles/theme.css`](file:///home/andreschirinos/Proyectos/catalogo-datamesh/src/styles/theme.css).
