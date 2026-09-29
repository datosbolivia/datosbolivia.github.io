---
name: DataMesh Bolivia Catalog
version: "1.0.0"
mode: "agent-design-edit"
description: "Visual identity, design tokens, and architectural UI guidelines for DataMesh Bolivia sovereign portal template."
colors:
  light:
    primary: "#2563eb"
    primary-hover: "#1d4ed8"
    primary-subtle: "#eff6ff"
    secondary: "#0b243f"
    secondary-subtle: "#163659"
    accent: "#d97706"
    accent-subtle: "#fef3c7"
    bg: "#fafafa"
    surface: "#ffffff"
    surface-hover: "#f4f4f5"
    border: "#e4e4e7"
    border-subtle: "#f4f4f5"
    text: "#09090b"
    text-muted: "#52525b"
    text-light: "#a1a1aa"
  dark:
    primary: "#3b82f6"
    primary-hover: "#60a5fa"
    primary-subtle: "#1e293b"
    secondary: "#0b243f"
    secondary-subtle: "#1e293b"
    accent: "#f59e0b"
    accent-subtle: "#451a03"
    bg: "#09090b"
    surface: "#18181b"
    surface-hover: "#27272a"
    border: "#27272a"
    border-subtle: "#1f1f23"
    text: "#f4f4f5"
    text-muted: "#a1a1aa"
    text-light: "#71717a"
typography:
  fonts:
    serif: "'Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria', serif"
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace"
  headings:
    h1:
      fontFamily: "{typography.fonts.serif}"
      fontSize: "2.25rem"
      fontWeight: 700
      letterSpacing: "-0.02em"
      lineHeight: "1.2"
    h2:
      fontFamily: "{typography.fonts.serif}"
      fontSize: "1.5rem"
      fontWeight: 700
      letterSpacing: "-0.01em"
      lineHeight: "1.25"
    h3:
      fontFamily: "{typography.fonts.serif}"
      fontSize: "1.2rem"
      fontWeight: 600
      lineHeight: "1.3"
  body:
    fontFamily: "{typography.fonts.sans}"
    fontSize: "1rem"
    lineHeight: "1.6"
  code:
    fontFamily: "{typography.fonts.mono}"
    fontSize: "0.875rem"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
layout:
  max-width: "1060px"
  header-height: "64px"
  obsidian-sidebar-width: "290px"
  obsidian-viewport-height: "calc(100vh - var(--header-height) - 3rem)"
components:
  header:
    background: "{colors.surface}"
    borderBottom: "1px solid {colors.border}"
    logoSize: "32px"
    fontTitle: "{typography.fonts.serif}"
  search-box:
    background: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    fontSize: "0.95rem"
  dataset-card:
    background: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    hoverBorder: "{colors.primary}"
  obsidian-explorer:
    containerBorder: "1px solid {colors.border}"
    containerRounded: "{rounded.md}"
    sidebarWidth: "{layout.obsidian-sidebar-width}"
    itemReset: "all: unset"
    itemHoverBg: "{colors.surface-hover}"
    itemActiveBorder: "2px solid {colors.primary}"
---

# DataMesh Design Specification & Agent Guide (`DESIGN.md`)

This document is the official architectural and visual design standard for the **DataMesh Bolivia** sovereign data catalog. It is specifically structured for **Agent Design Edits**—enabling autonomous AI coding agents to understand visual hierarchy, inspect machine-readable tokens, and execute targeted aesthetic or layout modifications without regressions.

---

## 1. Visual Philosophy & Identity

The portal adopts an editorial and institutional aesthetic that combines:
- **Journalistic Gravitas:** High typographic elegance inspired by reference data outlets (*Our World in Data*, *ProPublica*, *The Economist*). Headings use editorial serif typography to convey institutional permanence.
- **Swiss Modernism:** Minimalist grids, asymmetric clarity, high content density, and absolute elimination of decorative fluff.
- **Zero Decorative Clutter:** No generic gradient backgrounds, no rounded badge pills, no decorative emoji icons, no unnecessary card shadows.

---

## 2. Inviolable Design Constraints

Any human or AI agent modifying this project must uphold these core rules:

### A. The Strict "No Badges / No Tags" Policy
- **No pill containers or badge capsules:** Never render metadata (formats, licenses, tags, versions) as rounded pill chips (`.badge`, `.tag`).
- **Typography as Interface:** Express metadata through clean monospace text (`var(--font-mono)`), muted colors (`var(--color-text-muted)`), and subtle separators (`/` or `•`).
- **No Frontmatter Tags in UI:** Even if dataset frontmatter contains `tags: [...]`, the UI must not render them as badges.

### B. Institutional Neutrality
- The portal is a generic, sovereign template for public and private organizations.
- Never hardcode personal names, specific whitepaper DOIs, or private conference/social media recordings in templates, footers, or `portal.config.ts`.
- Content must remain strictly institutional, objective, and reproducible.

### C. Obsidian-Style File Explorer (Zero Scroll Viewport)
The dataset viewer (`/datasets/[slug]`) must function as a desktop-grade knowledge IDE:
1. **Bounded Viewport:** Height must match `calc(100vh - var(--header-height) - 3rem)`. The browser window must **never** scroll; only internal panels scroll independently.
2. **Native Button Resets:** `button.obsidian-file-item` must always declare `all: unset;` to prevent browser user-agent `buttonface` styling, 3D borders, or blue outline boxes.
3. **No Redundant Headers:** The template must **not** render a duplicate `<h1>` title banner above the markdown content. The document's own `index.md` provides the primary title and context.
4. **Iconography:** Monospace text and vector SVGs only. No colorful emojis.

---

## 3. Design Tokens Reference

All design tokens are mirrored between the YAML frontmatter above and `src/styles/theme.css`:

| Token Category | CSS Variable | Value (Light) | Value (Dark) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `--color-primary` | `#2563eb` | `#3b82f6` | Interactive accent, active file indicator, links |
| **Hover** | `--color-primary-hover` | `#1d4ed8` | `#60a5fa` | Primary interaction hover state |
| **Subtle** | `--color-primary-subtle` | `#eff6ff` | `#1e293b` | Focus rings and subtle highlights |
| **Background** | `--color-bg` | `#fafafa` | `#09090b` | Base application background |
| **Surface** | `--color-surface` | `#ffffff` | `#18181b` | Cards, header, explorer sidebar, inputs |
| **Surface Hover**| `--color-surface-hover` | `#f4f4f5` | `#27272a` | File explorer item hover, table header |
| **Border** | `--color-border` | `#e4e4e7` | `#27272a` | Layout dividers, card outlines, table borders |
| **Text** | `--color-text` | `#09090b` | `#f4f4f5` | High-contrast body text and headings |
| **Muted Text** | `--color-text-muted` | `#52525b` | `#a1a1aa` | Metadata, breadcrumbs, descriptions |
| **Typography Serif** | `--font-serif` | Charter / Cambria | Charter / Cambria | Editorial headings (H1, H2, H3, Hero) |
| **Typography Sans** | `--font-sans` | Inter / System | Inter / System | Standard interface and body text |
| **Typography Mono** | `--font-mono` | JetBrains Mono / Fira | JetBrains Mono / Fira | File explorer, schemas, code, indicators |
| **Radius MD** | `--radius-md` | `8px` | `8px` | Standard button and input corner radius |
| **Radius LG** | `--radius-lg` | `12px` | `12px` | Card and explorer container radius |
| **Max Width** | `--max-width` | `1060px` | `1060px` | Content reading column limit |

---

## 4. Agent Design Edit Protocol

When an AI coding agent is tasked with adjusting themes, styling, or layouts:

1. **Token First:** Modify values in the `colors` or `typography` sections of `DESIGN.md` and replicate them in `src/styles/theme.css`.
2. **Never Inject Inline Styles for Colors:** Always use CSS variables (`var(--color-...)`) rather than hardcoded hex codes in `.astro` files.
3. **Verify Dark Mode Parity:** When introducing a new color variable, define both light mode `:root` and dark mode `[data-theme="dark"]` values.
4. **Preserve Button Resets:** When styling custom clickable items in the sidebar or tree view, ensure `all: unset; box-sizing: border-box; display: flex; width: 100%;` are applied.
5. **Run Verification:** After any design change, execute:
   ```bash
   npm run audit
   npm run build
   ```

---

## 5. Route Architecture & Component Specifications

The application is strictly limited to 5 canonical routes:

```mermaid
flowchart TD
  Home["/ (Home)"] --> Datasets["/datasets (Catalog)"]
  Home --> About["/about (Manifesto)"]
  Home --> Docs["/docs (Documentation & ADRs)"]
  Home --> Download["/download (Desktop, PWA, CLI)"]
  Datasets --> NodeDetail["/datasets/[slug] (Obsidian Explorer)"]
  Docs --> DecisionRecord["/docs/decisions/*"]
  Docs --> BlogRecord["/docs/blog/*"]
```

### Route Design Directives
- **`/` (Home):** Editorial hero, monospace stats, recent datasets grid, recent blog posts. Minimalist, uncluttered presentation.
- **`/datasets`:** Instant search input, category filters (minimal text buttons, not badges), responsive dataset cards featuring title, description, and metadata row.
- **`/datasets/[slug]`:** Obsidian IDE explorer:
  - Left pane: 290px fixed tree view, collapsible folders (`01_CONTEXT`, `02_DATA`, `03_CONTRACTS`), SVG icons.
  - Right pane: Action bar with raw file links, breadcrumbs, and zero-scroll internal viewport.
- **`/about`:** Long-form prose detailing the 4 data mesh principles (Domain Ownership, Data as a Product, Self-serve Infrastructure, Federated Governance).
- **`/docs`:** Architecture Decision Records (ADRs) table, normative guides, and technical blog index.
- **`/download`:** Technical instructions for Electron binary builds, PWA installation, and Go SDK CLI compilation.
