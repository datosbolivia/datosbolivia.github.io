# Contribution and Coding Standards Guide

This document defines the style, conventions, and architectural standards for DataMesh Bolivia.
All contributions must follow these rules to preserve institutional neutrality, data contract integrity, and accessibility.

---

## 1. General Code Style

- **Clarity Over Brevity:** Favor clear, readable code over overly terse one-liners.
- **Single Responsibility:** Keep components, helper functions, and scripts focused on a single task.
- **Avoid Duplication:** Centralize shared logic in `src/lib/` (e.g., `catalog.ts`, `markdown.ts`, `i18n.ts`).
- **Dead Code Removal:** Do not commit unused imports, dead CSS classes, commented-out blocks, or temporary files.
- **Static Generation:** All portal content must compile statically (`output: "static"` in Astro) with 0 client-server lock-in.

---

## 2. Naming Conventions

Use descriptive, standard names across languages and formats:

| Item | Convention | Example |
|------|------------|---------|
| Variables & Functions | `camelCase` | `getAllDatasets()`, `selectedCategories` |
| Types & Interfaces | `PascalCase` | `DatasetNode`, `DataResource`, `Lang` |
| Constants | `UPPER_SNAKE_CASE` | `SUPPORTED_LOCALES`, `MAX_RETRIES` |
| Astro Components | `PascalCase.astro` | `DatasetCard.astro`, `SchemaTable.astro` |
| TypeScript/JS Modules | `kebab-case.ts` / `camelCase.ts` | `catalog.ts`, `audit-portal.mjs` |
| CSS Classes | `kebab-case` | `.obsidian-layout`, `.dataset-card` |
| i18n Keys | `domain.action_or_item` | `datasets.filter_by_domain`, `explorer.raw_md` |
| Data Package Slugs | `kebab-case` or `snake_case` | `elecciones-bolivia`, `air_quality` |

---

## 3. Formatting Rules

- **Indentation:** **2 spaces** across Astro, TypeScript, JavaScript, JSON, YAML, and CSS.
- **Line Length:** Maximum 100-120 characters per line.
- **Quotes:** Use single quotes `'` for JavaScript/TypeScript; double quotes `"` for HTML attributes and JSON.
- **Encoding:** UTF-8 without BOM.
- **Line Endings:** LF (`\n`), no CRLF.
- **Spacing:**
  - One space after keywords: `if (condition) { ... }`, `for (const item of items)`
  - Space before and after binary operators: `a + b`, `resCount > 0`
  - Space inside curly braces in imports/objects: `{ getAllDatasets }`

---

## 4. Architectural & Portal-Specific Standards

### A. Strict No-Badges / No-Tags Policy
- **Absolute Rule:** Badges, tags, chips, and decorative pills are strictly prohibited anywhere in the UI.
- All categorization must be represented through structured textual metadata, headings, or dedicated navigation filters (e.g., domain checkboxes/buttons).

### B. Institutional Neutrality
- The portal is a civil society open data catalog.
- Never add personal names, subjective opinion pieces, promotional whitepapers, or conference talks.
- All documentation in `docs/` must focus on normative specifications, technical architecture records (ADRs), or community updates.

### C. 5 Canonical Routes
- The application architecture strictly guarantees 5 canonical routes:
  1. `/` (`src/pages/index.astro`)
  2. `/datasets` (`src/pages/datasets/index.astro`)
  3. `/about` (`src/pages/about.astro`)
  4. `/docs` (`src/pages/docs/index.astro`)
  5. `/download` (`src/pages/download.astro`)
- Dataset detail routes branch hierarchically under `/datasets/[slug]` and `/datasets/[slug]/[...doc]`.

### D. Comprehensive Internationalization (i18n)
- **1:1 Parity:** Every user-facing string must exist in `translations.es` and `translations.en` within `src/lib/i18n.ts`.
- **Preserving SVGs:** Never place `data-i18n` on an element that contains an inline SVG or icon. Wrap the text in an inner `<span>` and apply `data-i18n` to that `<span>`:
  ```html
  <!-- CORRECT -->
  <a href="/docs" class="btn">
    <span data-i18n="docs.read">Leer</span>
    <svg ...></svg>
  </a>

  <!-- INCORRECT - will overwrite SVG during translation -->
  <a href="/docs" class="btn" data-i18n="docs.read">
    Leer <svg ...></svg>
  </a>
  ```
- **Tooltips & Aria Attributes:** Use `data-i18n-title="key"` for buttons with icons to dynamically localize `title` and `aria-label`.

### E. Obsidian-Style Zero-Scroll Layout
- The dataset viewer (`/datasets/[slug]`) must use `.obsidian-layout` with a bounded viewport (`height: calc(100vh - ...)`).
- Document tabs switch instantly in the client without page reload or layout shift.
- Context (`index.md`) is always displayed first, followed by reference docs and data tables.

### F. OKF / ODKF v0.2 Specification
- Every dataset bundle under `knowledge/nodes/<slug>/` must include a valid `datapackage.yaml` or `datapackage.json`.
- Table schemas must declare explicit field types, names, and descriptions.

---

## 5. Comments & Documentation

- Explain **why** rather than **what**. If code is self-describing, avoid redundant comments.
- Keep comments up-to-date with code changes.
- Document complex regular expressions and data transformers in `src/lib/`.
- Standard tags:
  ```text
  TODO: Planned enhancement or missing feature
  FIXME: Bug or edge-case to resolve
  NOTE: Critical context or architectural design decision
  ```

---

## 6. Error Handling & Validation

- Handle missing data defensively (e.g., fallback resource counts, optional SKOS fields).
- Ensure safe Markdown parsing without throwing unhandled exceptions in static generators.
- Every commit must pass the project's audit scripts:
  - `scripts/lint-okf.mjs`: Validates all bundles and contracts against OKF/ODKF specifications.
  - `scripts/audit-portal.mjs`: Runs 15 automated compliance checks across routes, no-badge policy, neutrality, i18n parity, and Obsidian layouts.

---

## 7. Commit & Pull Request Practices

### Commits
- Use clear, descriptive commit messages adhering to conventional commits:
  ```text
  feat(datasets): add multi-select domain filter and view toggle
  fix(i18n): isolate SVG icons with inner span wrappers
  docs(adr): document static distribution via Astro
  ```
- Separate logical concerns into individual commits.

### Pull Requests
- Provide a summary of changes, rationale, and screenshots for visual updates.
- Ensure the verification suite passes locally before opening a pull request.
- Test both light and dark themes, as well as responsive mobile viewpoints (< 680px).

---

## 8. Verification & Enforcement

Before submitting any contribution, run:

```bash
# 1. Run full portal audit suite (all 15 checks must pass)
npm run audit

# 2. Validate OKF & ODKF v0.2 schemas and bundles
npm run lint:okf

# 3. Verify static Astro compilation
npm run build
```

---

## 9. Changes to This Guide

Standards evolve alongside project requirements.
To propose changes or additions to these guidelines, submit a PR updating this document along with any corresponding audit test in `scripts/audit-portal.mjs`.
